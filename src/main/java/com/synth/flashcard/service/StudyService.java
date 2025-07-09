package com.synth.flashcard.service;

import com.synth.flashcard.entity.Card;
import com.synth.flashcard.entity.Deck;
import com.synth.flashcard.entity.StudyProgress;
import com.synth.flashcard.entity.StudySession;
import com.synth.flashcard.entity.User;
import com.synth.flashcard.repository.CardRepository;
import com.synth.flashcard.repository.DeckRepository;
import com.synth.flashcard.repository.StudyProgressRepository;
import com.synth.flashcard.repository.StudySessionRepository;
import com.synth.flashcard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudyService {

    @Autowired
    private ClaudeService claudeService;
    
    @Autowired
    private GeminiService geminiService;

    @Autowired
    private SpacedRepetitionService spacedRepetitionService;

    @Autowired
    private StudySessionRepository studySessionRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private StudyProgressRepository studyProgressRepository;

    @Autowired
    private DeckRepository deckRepository;

    @Autowired
    private UserRepository userRepository;

    public StudySession submitAnswer(User user, Card card, String userAnswer) {
        // Use Gemini to grade the answer (switched from Claude for cost efficiency)
        GeminiService.GradingResult gradingResult = geminiService.gradeAnswer(
            card.getQuestion(),
            card.getAnswer(),
            userAnswer
        );

        // Create study session record
        StudySession session = new StudySession(
            user,
            card,
            userAnswer,
            gradingResult.getScore(),
            gradingResult.getConfidence(),
            gradingResult.getFeedback()
        );

        studySessionRepository.save(session);

        // Update card difficulty based on performance
        List<StudySession> allSessions = studySessionRepository
            .findByCardIdAndUserIdOrderByStudiedAtDesc(card.getId(), user.getId());
        
        Card.Difficulty newDifficulty = spacedRepetitionService.calculateNewDifficulty(
            card, 
            gradingResult.getScore(), 
            allSessions.size()
        );
        
        if (newDifficulty != card.getDifficulty()) {
            card.setDifficulty(newDifficulty);
            cardRepository.save(card);
        }

        return session;
    }

    public List<Card> getCardsForStudy(Long deckId, Long userId) {
        try {
            System.out.println("=== STUDY SERVICE DEBUG ===");
            System.out.println("Deck ID: " + deckId);
            System.out.println("User ID: " + userId);
            
            List<Card> allCards = cardRepository.findByDeckId(deckId);
            System.out.println("Found " + allCards.size() + " cards in deck");
            
            // Create simple card objects without deck relationship to avoid JSON serialization issues
            List<Card> simpleCards = allCards.stream()
                .map(card -> {
                    Card simpleCard = new Card();
                    simpleCard.setId(card.getId());
                    simpleCard.setQuestion(card.getQuestion());
                    simpleCard.setAnswer(card.getAnswer());
                    simpleCard.setDifficulty(card.getDifficulty());
                    // Don't set deck or studySessions to avoid lazy loading issues
                    return simpleCard;
                })
                .toList();
            
            System.out.println("Returning " + simpleCards.size() + " simple cards for study");
            return simpleCards;
            
        } catch (Exception e) {
            System.err.println("Error in getCardsForStudy: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public StudyProgress saveStudyProgress(Long userId, Long deckId, Integer currentCardIndex, 
                                         Integer totalCards, Integer cardsCompleted, Boolean isCompleted) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Deck deck = deckRepository.findById(deckId)
            .orElseThrow(() -> new RuntimeException("Deck not found"));

        // Find existing progress or create new one
        StudyProgress progress = studyProgressRepository
            .findActiveProgressByUserAndDeck(userId, deckId)
            .orElse(new StudyProgress(user, deck, totalCards));

        progress.setCurrentCardIndex(currentCardIndex);
        progress.setTotalCards(totalCards);
        progress.setCardsCompleted(cardsCompleted);
        progress.setIsCompleted(isCompleted);

        return studyProgressRepository.save(progress);
    }
}
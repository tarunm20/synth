package com.synth.flashcard.controller;

import com.synth.flashcard.entity.Card;
import com.synth.flashcard.entity.StudyProgress;
import com.synth.flashcard.entity.StudySession;
import com.synth.flashcard.entity.User;
import com.synth.flashcard.repository.CardRepository;
import com.synth.flashcard.repository.StudyProgressRepository;
import com.synth.flashcard.repository.StudySessionRepository;
import com.synth.flashcard.service.StudyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/study")
public class StudyController {

    @Autowired
    private StudyService studyService;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private StudySessionRepository studySessionRepository;

    @Autowired
    private StudyProgressRepository studyProgressRepository;

    @GetMapping("/deck/{deckId}")
    public ResponseEntity<List<Card>> getCardsForStudy(
            @PathVariable Long deckId,
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Card> cards = studyService.getCardsForStudy(deckId, user.getId());
        return ResponseEntity.ok(cards);
    }

    @PostMapping("/answer")
    public ResponseEntity<?> submitAnswer(
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            Long cardId = Long.valueOf(request.get("cardId").toString());
            String userAnswer = request.get("answer").toString();

            Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

            StudySession session = studyService.submitAnswer(user, card, userAnswer);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<StudySession>> getStudySessions(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<StudySession> sessions = studySessionRepository
            .findByUserIdOrderByStudiedAtDesc(user.getId());
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(Authentication auth) {
        User user = (User) auth.getPrincipal();
        
        // Get user sessions
        List<StudySession> allSessions = studySessionRepository
            .findByUserIdOrderByStudiedAtDesc(user.getId());
        
        // Get average score for the last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        double avgScore = allSessions.stream()
            .filter(s -> s.getStudiedAt().isAfter(thirtyDaysAgo))
            .mapToDouble(StudySession::getScore)
            .average()
            .orElse(0.0);
        
        Map<String, Object> analytics = Map.of(
            "averageScore", avgScore,
            "totalSessions", allSessions.size(),
            "sessionsLast30Days", allSessions.stream()
                .filter(s -> s.getStudiedAt().isAfter(thirtyDaysAgo))
                .count()
        );
        
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/progress/{deckId}")
    public ResponseEntity<StudyProgress> getStudyProgress(
            @PathVariable Long deckId,
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        return studyProgressRepository.findActiveProgressByUserAndDeck(user.getId(), deckId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/progress/{deckId}")
    public ResponseEntity<StudyProgress> saveStudyProgress(
            @PathVariable Long deckId,
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            Integer currentCardIndex = Integer.valueOf(request.get("currentCardIndex").toString());
            Integer totalCards = Integer.valueOf(request.get("totalCards").toString());
            Integer cardsCompleted = Integer.valueOf(request.get("cardsCompleted").toString());
            Boolean isCompleted = Boolean.valueOf(request.get("isCompleted").toString());

            StudyProgress progress = studyService.saveStudyProgress(
                user.getId(), deckId, currentCardIndex, totalCards, cardsCompleted, isCompleted);
            
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/progress")
    public ResponseEntity<List<StudyProgress>> getActiveProgress(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<StudyProgress> activeProgress = studyProgressRepository.findActiveProgressByUser(user.getId());
        return ResponseEntity.ok(activeProgress);
    }

    @DeleteMapping("/progress/{deckId}")
    public ResponseEntity<Void> clearStudyProgress(
            @PathVariable Long deckId,
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        studyProgressRepository.findActiveProgressByUserAndDeck(user.getId(), deckId)
            .ifPresent(studyProgressRepository::delete);
        return ResponseEntity.ok().build();
    }
}
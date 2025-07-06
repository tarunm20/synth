package com.synth.flashcard.service;

import com.synth.flashcard.entity.Card;
import com.synth.flashcard.entity.StudySession;
import com.synth.flashcard.repository.StudySessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SpacedRepetitionService {

    @Autowired
    private StudySessionRepository studySessionRepository;

    public boolean isCardDueForReview(Card card, Long userId) {
        List<StudySession> sessions = studySessionRepository
                .findByCardIdAndUserIdOrderByStudiedAtDesc(card.getId(), userId);
        
        if (sessions.isEmpty()) {
            return true; // New card, due for first review
        }
        
        StudySession lastSession = sessions.get(0);
        LocalDateTime nextDueDate = calculateNextDueDate(lastSession, sessions.size());
        
        return LocalDateTime.now().isAfter(nextDueDate);
    }

    public LocalDateTime calculateNextDueDate(StudySession lastSession, int reviewCount) {
        double score = lastSession.getScore();
        LocalDateTime lastStudied = lastSession.getStudiedAt();
        
        // Simple spaced repetition algorithm based on SM-2
        int interval = calculateInterval(reviewCount, score);
        return lastStudied.plusDays(interval);
    }

    private int calculateInterval(int reviewCount, double score) {
        // Base intervals for different review counts
        int[] baseIntervals = {1, 3, 7, 14, 30, 60, 120};
        
        // Determine base interval
        int baseInterval;
        if (reviewCount <= baseIntervals.length) {
            baseInterval = baseIntervals[Math.min(reviewCount - 1, baseIntervals.length - 1)];
        } else {
            // For reviews beyond the base array, use exponential growth
            baseInterval = baseIntervals[baseIntervals.length - 1] * 
                          (int) Math.pow(2, reviewCount - baseIntervals.length);
        }
        
        // Modify interval based on performance
        double multiplier = calculateMultiplier(score);
        int adjustedInterval = (int) (baseInterval * multiplier);
        
        // Ensure minimum interval of 1 day
        return Math.max(1, adjustedInterval);
    }

    private double calculateMultiplier(double score) {
        // Score-based multiplier for interval adjustment
        if (score >= 0.9) return 1.3;      // Excellent - increase interval
        else if (score >= 0.8) return 1.1; // Good - slight increase
        else if (score >= 0.6) return 1.0; // Average - maintain interval
        else if (score >= 0.4) return 0.7; // Poor - reduce interval
        else return 0.5;                    // Very poor - significantly reduce
    }

    public Card.Difficulty calculateNewDifficulty(Card card, double score, int reviewCount) {
        Card.Difficulty currentDifficulty = card.getDifficulty();
        
        // Adjust difficulty based on performance and review count
        if (reviewCount >= 3) { // Only adjust after multiple reviews
            if (score >= 0.8 && currentDifficulty == Card.Difficulty.HARD) {
                return Card.Difficulty.MEDIUM;
            } else if (score >= 0.9 && currentDifficulty == Card.Difficulty.MEDIUM) {
                return Card.Difficulty.EASY;
            } else if (score < 0.5) {
                if (currentDifficulty == Card.Difficulty.EASY) {
                    return Card.Difficulty.MEDIUM;
                } else if (currentDifficulty == Card.Difficulty.MEDIUM) {
                    return Card.Difficulty.HARD;
                }
            }
        }
        
        return currentDifficulty; // No change
    }

    public int getPriorityScore(Card card, Long userId) {
        List<StudySession> sessions = studySessionRepository
                .findByCardIdAndUserIdOrderByStudiedAtDesc(card.getId(), userId);
        
        if (sessions.isEmpty()) {
            return 100; // Highest priority for new cards
        }
        
        StudySession lastSession = sessions.get(0);
        LocalDateTime nextDue = calculateNextDueDate(lastSession, sessions.size());
        LocalDateTime now = LocalDateTime.now();
        
        if (now.isAfter(nextDue)) {
            // Overdue cards get higher priority
            long hoursOverdue = java.time.Duration.between(nextDue, now).toHours();
            return Math.min(100, 50 + (int) hoursOverdue);
        } else {
            // Future cards get lower priority
            long hoursUntilDue = java.time.Duration.between(now, nextDue).toHours();
            return Math.max(1, 50 - (int) (hoursUntilDue / 24));
        }
    }
}
package com.synth.flashcard.repository;

import com.synth.flashcard.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByUserIdOrderByStudiedAtDesc(Long userId);
    
    List<StudySession> findByCardIdAndUserIdOrderByStudiedAtDesc(Long cardId, Long userId);
    
    List<StudySession> findByCardIdOrderByStudiedAtDesc(Long cardId);
    
    @Query("SELECT AVG(ss.score) FROM StudySession ss WHERE ss.user.id = :userId " +
           "AND ss.studiedAt >= :since")
    Double getAverageScoreForUser(@Param("userId") Long userId, @Param("since") LocalDateTime since);
    
    @Query("SELECT ss FROM StudySession ss " +
           "WHERE ss.card.deck.id = :deckId AND ss.user.id = :userId " +
           "ORDER BY ss.studiedAt DESC")
    List<StudySession> findRecentSessionsForDeck(@Param("deckId") Long deckId, @Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM StudySession ss WHERE ss.card.id IN :cardIds")
    void deleteByCardIdIn(@Param("cardIds") List<Long> cardIds);
}
package com.synth.flashcard.repository;

import com.synth.flashcard.entity.StudyProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyProgressRepository extends JpaRepository<StudyProgress, Long> {
    
    @Query("SELECT sp FROM StudyProgress sp WHERE sp.user.id = :userId AND sp.deck.id = :deckId AND sp.isCompleted = false")
    Optional<StudyProgress> findActiveProgressByUserAndDeck(@Param("userId") Long userId, @Param("deckId") Long deckId);
    
    @Query("SELECT sp FROM StudyProgress sp WHERE sp.user.id = :userId AND sp.isCompleted = false ORDER BY sp.lastStudiedAt DESC")
    List<StudyProgress> findActiveProgressByUser(@Param("userId") Long userId);
    
    @Query("SELECT sp FROM StudyProgress sp WHERE sp.user.id = :userId AND sp.isCompleted = true ORDER BY sp.lastStudiedAt DESC")
    List<StudyProgress> findCompletedProgressByUser(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM StudyProgress sp WHERE sp.deck.id = :deckId")
    void deleteByDeckId(@Param("deckId") Long deckId);
}
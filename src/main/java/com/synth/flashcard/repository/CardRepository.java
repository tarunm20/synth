package com.synth.flashcard.repository;

import com.synth.flashcard.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByDeckId(Long deckId);
    
    default List<Card> findCardsForStudy(Long deckId, Long userId) {
        return findByDeckId(deckId);
    }
}
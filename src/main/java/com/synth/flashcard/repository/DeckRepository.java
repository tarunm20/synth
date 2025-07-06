package com.synth.flashcard.repository;

import com.synth.flashcard.entity.Deck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeckRepository extends JpaRepository<Deck, Long> {
    List<Deck> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Deck> findAllByOrderByCreatedAtDesc();
}
package com.synth.flashcard.repository;

import com.synth.flashcard.entity.EmailConfirmationToken;
import com.synth.flashcard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailConfirmationTokenRepository extends JpaRepository<EmailConfirmationToken, Long> {
    
    Optional<EmailConfirmationToken> findByToken(String token);
    
    @Modifying
    @Transactional
    @Query("UPDATE EmailConfirmationToken e SET e.used = true WHERE e.user = :user AND e.used = false")
    void invalidateAllUserTokens(@Param("user") User user);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM EmailConfirmationToken e WHERE e.expiresAt < :now OR e.used = true")
    void deleteExpiredAndUsedTokens(@Param("now") LocalDateTime now);
    
    boolean existsByUserAndUsedFalse(User user);
}
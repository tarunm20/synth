package com.synth.flashcard.repository;

import com.synth.flashcard.entity.PasswordResetToken;
import com.synth.flashcard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByToken(String token);
    
    @Query("SELECT t FROM PasswordResetToken t WHERE t.user = :user AND t.used = false AND t.expiresAt > :now ORDER BY t.createdAt DESC")
    Optional<PasswordResetToken> findValidTokenByUser(@Param("user") User user, @Param("now") LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now OR t.used = true")
    void deleteExpiredAndUsedTokens(@Param("now") LocalDateTime now);
    
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.user = :user AND t.used = false")
    void invalidateAllUserTokens(@Param("user") User user);
}
package com.synth.flashcard.controller;

import com.synth.flashcard.dto.DeckStatsDto;
import com.synth.flashcard.entity.Deck;
import com.synth.flashcard.entity.User;
import com.synth.flashcard.service.FlashcardService;
import com.synth.flashcard.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/decks")
public class FlashcardController {

    @Autowired
    private FlashcardService flashcardService;

    @PostMapping("/upload")
    public ResponseEntity<?> createDeckFromFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            Authentication auth) {
        try {
            System.out.println("=== FILE UPLOAD START ===");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());
            System.out.println("Deck name: " + name);
            System.out.println("Description: " + description);
            
            User user = (User) auth.getPrincipal();
            System.out.println("User ID: " + user.getId());
            System.out.println("User email: " + user.getEmail());
            
            System.out.println("Calling flashcard service...");
            Deck deck = flashcardService.createDeckFromFile(user, name, description, file);
            System.out.println("Deck created with ID: " + deck.getId());
            
            // Return a simple response to avoid JSON serialization issues
            Map<String, Object> response = Map.of(
                "id", deck.getId(),
                "name", deck.getName(),
                "description", deck.getDescription() != null ? deck.getDescription() : "",
                "createdAt", deck.getCreatedAt(),
                "cardCount", deck.getCards() != null ? deck.getCards().size() : 0
            );
            
            System.out.println("Returning response: " + response);
            System.out.println("=== FILE UPLOAD SUCCESS ===");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            System.err.println("IO Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error processing file: " + e.getMessage());
        } catch (SubscriptionService.SubscriptionLimitException e) {
            System.err.println("Subscription Limit Error: " + e.getMessage());
            return ResponseEntity.status(402).body(Map.of(
                "error", "SUBSCRIPTION_LIMIT_EXCEEDED",
                "message", e.getMessage(),
                "upgradeRequired", true
            ));
        } catch (Exception e) {
            System.err.println("General Error: " + e.getMessage());
            e.printStackTrace();
            
            // Provide user-friendly error messages
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("overloaded")) {
                return ResponseEntity.status(503).body(Map.of(
                    "error", "SERVICE_TEMPORARILY_UNAVAILABLE",
                    "message", "AI service is temporarily overloaded. Please try again in a few minutes.",
                    "retryAfter", 300 // 5 minutes
                ));
            }
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "DECK_CREATION_FAILED",
                "message", "Failed to create deck. Please try again.",
                "details", errorMessage
            ));
        }
    }

    @PostMapping("/text")
    public ResponseEntity<?> createDeckFromText(
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            String name = request.get("name");
            String description = request.get("description");
            String content = request.get("content");
            
            if (name == null || content == null) {
                return ResponseEntity.badRequest().body("Name and content are required");
            }
            
            Deck deck = flashcardService.createDeckFromText(user, name, description, content);
            
            // Return a simple response to avoid JSON serialization issues
            Map<String, Object> response = Map.of(
                "id", deck.getId(),
                "name", deck.getName(),
                "description", deck.getDescription() != null ? deck.getDescription() : "",
                "createdAt", deck.getCreatedAt(),
                "cardCount", deck.getCards() != null ? deck.getCards().size() : 0
            );
            
            return ResponseEntity.ok(response);
        } catch (SubscriptionService.SubscriptionLimitException e) {
            return ResponseEntity.status(402).body(Map.of(
                "error", "SUBSCRIPTION_LIMIT_EXCEEDED",
                "message", e.getMessage(),
                "upgradeRequired", true
            ));
        } catch (Exception e) {
            System.err.println("General Error: " + e.getMessage());
            e.printStackTrace();
            
            // Provide user-friendly error messages
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("overloaded")) {
                return ResponseEntity.status(503).body(Map.of(
                    "error", "SERVICE_TEMPORARILY_UNAVAILABLE",
                    "message", "AI service is temporarily overloaded. Please try again in a few minutes.",
                    "retryAfter", 300 // 5 minutes
                ));
            }
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "DECK_CREATION_FAILED",
                "message", "Failed to create deck. Please try again.",
                "details", errorMessage
            ));
        }
    }

    @GetMapping
    public ResponseEntity<List<Deck>> getUserDecks(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Deck> decks = flashcardService.getUserDecks(user.getId());
        return ResponseEntity.ok(decks);
    }

    @GetMapping("/stats")
    public ResponseEntity<List<DeckStatsDto>> getUserDeckStats(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<DeckStatsDto> deckStats = flashcardService.getUserDeckStats(user.getId());
        return ResponseEntity.ok(deckStats);
    }

    @GetMapping("/{deckId}")
    public ResponseEntity<?> getDeck(@PathVariable Long deckId, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            Deck deck = flashcardService.getDeck(deckId, user.getId());
            return ResponseEntity.ok(deck);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{deckId}")
    public ResponseEntity<?> deleteDeck(@PathVariable Long deckId, Authentication auth) {
        try {
            User user = (User) auth.getPrincipal();
            flashcardService.deleteDeck(deckId, user.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
package com.synth.flashcard.controller;

import com.synth.flashcard.entity.User;
import com.synth.flashcard.repository.UserRepository;
import com.synth.flashcard.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SubscriptionService subscriptionService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSubscriptionStatus(Authentication auth) {
        User user = (User) auth.getPrincipal();
        User.SubscriptionTier tier = user.getSubscriptionTier();
        if (tier == null) {
            tier = User.SubscriptionTier.FREE;
        }
        
        SubscriptionService.SubscriptionLimits limits = subscriptionService.getLimitsForTier(tier);
        
        return ResponseEntity.ok(Map.of(
            "tier", tier.name(),
            "limits", Map.of(
                "maxDecks", limits.getMaxDecks() == Integer.MAX_VALUE ? -1 : limits.getMaxDecks(),
                "maxCardsPerDeck", limits.getMaxCardsPerDeck() == Integer.MAX_VALUE ? -1 : limits.getMaxCardsPerDeck(),
                "hasAdvancedFeatures", limits.hasAdvancedFeatures()
            ),
            "usage", Map.of(
                "currentDecks", userRepository.findById(user.getId()).get().getDecks().size()
            ),
            "canCreateDeck", subscriptionService.canCreateDeck(user)
        ));
    }

    @GetMapping("/can-create-deck")
    public ResponseEntity<Map<String, Object>> canCreateDeck(Authentication auth) {
        User user = (User) auth.getPrincipal();
        boolean canCreate = subscriptionService.canCreateDeck(user);
        
        if (!canCreate) {
            SubscriptionService.SubscriptionLimits limits = subscriptionService.getLimitsForTier(user.getSubscriptionTier());
            return ResponseEntity.ok(Map.of(
                "canCreate", false,
                "reason", "DECK_LIMIT_REACHED",
                "message", String.format("You've reached the limit of %d decks for your current plan.", 
                    limits.getMaxDecks()),
                "currentTier", user.getSubscriptionTier() != null ? user.getSubscriptionTier().name() : "FREE",
                "maxDecks", limits.getMaxDecks()
            ));
        }
        
        return ResponseEntity.ok(Map.of(
            "canCreate", true,
            "message", "You can create a new deck"
        ));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<Map<String, String>> upgradeSubscription(
            @RequestBody Map<String, String> request,
            Authentication auth) {
        
        User user = (User) auth.getPrincipal();
        String targetTier = request.get("tier");
        
        try {
            User.SubscriptionTier newTier = User.SubscriptionTier.valueOf(targetTier.toUpperCase());
            
            // In a real application, you would integrate with a payment processor here
            // For now, we'll just update the tier directly (demo purposes)
            user.setSubscriptionTier(newTier);
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Subscription upgraded successfully",
                "newTier", newTier.name()
            ));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid subscription tier: " + targetTier
            ));
        }
    }
    
    @GetMapping("/pricing")
    public ResponseEntity<Map<String, Object>> getPricingInfo() {
        return ResponseEntity.ok(Map.of(
            "tiers", Map.of(
                "FREE", Map.of(
                    "price", 0,
                    "maxDecks", 3,
                    "maxCardsPerDeck", 50,
                    "features", new String[]{"PDF & text upload", "AI grading", "Basic study tracking"}
                ),
                "BASIC", Map.of(
                    "price", 1,
                    "maxDecks", 10,
                    "maxCardsPerDeck", "unlimited",
                    "features", new String[]{"Everything in Free", "Progress tracking", "Export to PDF"}
                ),
                "PRO", Map.of(
                    "price", 5,
                    "maxDecks", "unlimited",
                    "maxCardsPerDeck", "unlimited",
                    "features", new String[]{"Everything in Basic", "Advanced analytics", "Priority support", "Custom study modes"}
                )
            )
        ));
    }
}
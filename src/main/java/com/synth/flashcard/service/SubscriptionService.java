package com.synth.flashcard.service;

import com.synth.flashcard.entity.User;
import com.synth.flashcard.repository.DeckRepository;
import com.synth.flashcard.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SubscriptionService {

    @Autowired
    private DeckRepository deckRepository;
    
    @Autowired
    private CardRepository cardRepository;

    public static class SubscriptionLimits {
        private final int maxDecks;
        private final int maxCardsPerDeck;
        private final boolean hasAdvancedFeatures;

        public SubscriptionLimits(int maxDecks, int maxCardsPerDeck, boolean hasAdvancedFeatures) {
            this.maxDecks = maxDecks;
            this.maxCardsPerDeck = maxCardsPerDeck;
            this.hasAdvancedFeatures = hasAdvancedFeatures;
        }

        public int getMaxDecks() { return maxDecks; }
        public int getMaxCardsPerDeck() { return maxCardsPerDeck; }
        public boolean hasAdvancedFeatures() { return hasAdvancedFeatures; }
    }

    public SubscriptionLimits getLimitsForTier(User.SubscriptionTier tier) {
        // Handle null tier (new users without subscription tier set)
        if (tier == null) {
            return new SubscriptionLimits(3, 50, false); // Default to FREE tier limits
        }
        
        switch (tier) {
            case FREE:
                return new SubscriptionLimits(3, 50, false);
            case BASIC:
                return new SubscriptionLimits(10, Integer.MAX_VALUE, false);
            case PRO:
                return new SubscriptionLimits(Integer.MAX_VALUE, Integer.MAX_VALUE, true);
            default:
                return new SubscriptionLimits(3, 50, false);
        }
    }

    public boolean canCreateDeck(User user) {
        SubscriptionLimits limits = getLimitsForTier(user.getSubscriptionTier());
        int currentDeckCount = deckRepository.countByUserId(user.getId());
        return currentDeckCount < limits.getMaxDecks();
    }

    public boolean canAddCardsToNewDeck(User user, int requestedCardCount) {
        SubscriptionLimits limits = getLimitsForTier(user.getSubscriptionTier());
        return requestedCardCount <= limits.getMaxCardsPerDeck();
    }

    public void validateDeckCreation(User user, int estimatedCardCount) {
        if (!canCreateDeck(user)) {
            SubscriptionLimits limits = getLimitsForTier(user.getSubscriptionTier());
            String tierName = user.getSubscriptionTier() != null ? user.getSubscriptionTier().name() : "FREE";
            throw new SubscriptionLimitException(
                String.format("Deck limit reached. %s tier allows maximum %d decks. Please upgrade your subscription.", 
                    tierName, limits.getMaxDecks())
            );
        }

        if (!canAddCardsToNewDeck(user, estimatedCardCount)) {
            SubscriptionLimits limits = getLimitsForTier(user.getSubscriptionTier());
            String tierName = user.getSubscriptionTier() != null ? user.getSubscriptionTier().name() : "FREE";
            throw new SubscriptionLimitException(
                String.format("Card limit exceeded. %s tier allows maximum %d cards per deck. Please upgrade your subscription.", 
                    tierName, limits.getMaxCardsPerDeck())
            );
        }
    }

    public static class SubscriptionLimitException extends RuntimeException {
        public SubscriptionLimitException(String message) {
            super(message);
        }
    }
}
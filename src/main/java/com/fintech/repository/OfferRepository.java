package com.fintech.repository;

import com.fintech.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

        // Find active offers available to all users
        List<Offer> findByTargetTypeAndValidUntilAfterOrderByValidUntilAsc(Offer.OfferTargetType targetType,
                        LocalDateTime now);

        // Find active offers for a specific user
        @Query("SELECT o FROM Offer o WHERE (o.targetType = 'ALL_USERS' OR " +
                        "(o.targetType = 'SELECTED_USERS' AND :userId IN (SELECT u.id FROM o.targetUsers u))) " +
                        "AND o.validFrom <= :now AND o.validUntil > :now " +
                        "AND o.active = true " + // Add active status check to query
                        "ORDER BY o.validUntil ASC")
        List<Offer> findActiveOffersForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);

        // Count active offers
        long countByActiveTrue();

        // Find by category
        List<Offer> findByCategory(String category);
}
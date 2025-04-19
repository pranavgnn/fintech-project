package com.project.controller;

import com.project.entity.Offer;
import com.project.service.OfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private static final Logger logger = Logger.getLogger(OfferController.class.getName());

    @Autowired
    private OfferService offerService;

    @GetMapping
    public ResponseEntity<List<Offer>> getAllOffers() {
        return ResponseEntity.ok(offerService.getAllOffers());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Offer>> getActiveOffers() {
        return ResponseEntity.ok(offerService.getActiveOffers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Offer> getOfferById(@PathVariable Long id) {
        Optional<Offer> offer = offerService.getOfferById(id);
        return offer.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOffer(@RequestBody Offer offer) {
        try {
            logger.info("Received request to create offer: " + offer.getOfferType());

            // Validate the date format
            if (offer.getValidTill() == null) {
                logger.warning("validTill date is null");
            }

            Offer createdOffer = offerService.createOffer(offer);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOffer);
        } catch (Exception e) {
            logger.severe("Error creating offer: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create offer: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOffer(@PathVariable Long id) {
        offerService.deleteOffer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{offerId}/assign/{customerId}")
    public ResponseEntity<String> assignOfferToCustomer(
            @PathVariable Long offerId,
            @PathVariable Long customerId) {
        try {
            boolean success = offerService.assignOfferToCustomer(offerId, customerId);

            if (success) {
                return ResponseEntity.ok("Offer successfully assigned to customer");
            } else {
                return ResponseEntity.badRequest()
                        .body("Failed to assign offer to customer: Customer or offer not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error assigning offer: " + e.getMessage());
        }
    }

    @DeleteMapping("/{offerId}/remove/{customerId}")
    public ResponseEntity<String> removeOfferFromCustomer(
            @PathVariable Long offerId,
            @PathVariable Long customerId) {
        try {
            boolean success = offerService.removeOfferFromCustomer(offerId, customerId);

            if (success) {
                return ResponseEntity.ok("Offer successfully removed from customer");
            } else {
                return ResponseEntity.badRequest()
                        .body("Failed to remove offer from customer: Customer or offer not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error removing offer: " + e.getMessage());
        }
    }
}

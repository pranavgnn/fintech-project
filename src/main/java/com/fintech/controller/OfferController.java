package com.fintech.controller;

import com.fintech.dto.OfferRequest;
import com.fintech.dto.response.OfferResponse;
import com.fintech.exception.BadRequestException;
import com.fintech.security.UserPrincipal;
import com.fintech.service.OfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @GetMapping("/api/offers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OfferResponse>> getActiveOffers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            Long userId = ((UserPrincipal) auth.getPrincipal()).getId();
            return ResponseEntity.ok(offerService.getActiveOffersForUser(userId));
        }
        return ResponseEntity.ok(List.of());
    }

    // Admin endpoints
    @GetMapping("/api/admin/offers")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<OfferResponse>> getAllOffers() {
        return ResponseEntity.ok(offerService.getAllOffers());
    }

    @GetMapping("/api/admin/offers/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<OfferResponse> getOfferById(@PathVariable Long id) {
        return ResponseEntity.ok(offerService.getOfferById(id));
    }

    @PostMapping("/api/admin/offers")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<OfferResponse> createOffer(@Valid @RequestBody OfferRequest request) {
        log.info("Creating offer with request: {}", request);
        try {
            OfferResponse response = offerService.createOffer(request);
            log.info("Offer created successfully with ID: {}", response.getId());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error creating offer: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to create offer: " + e.getMessage());
        }
    }

    @PutMapping("/api/admin/offers/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<OfferResponse> updateOffer(
            @PathVariable Long id,
            @Valid @RequestBody OfferRequest request) {
        log.info("Updating offer ID: {} with request: {}", id, request);
        try {
            OfferResponse response = offerService.updateOffer(id, request);
            log.info("Offer updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating offer: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to update offer: " + e.getMessage());
        }
    }

    @DeleteMapping("/api/admin/offers/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteOffer(@PathVariable Long id) {
        offerService.deleteOffer(id);
        return ResponseEntity.noContent().build();
    }
}

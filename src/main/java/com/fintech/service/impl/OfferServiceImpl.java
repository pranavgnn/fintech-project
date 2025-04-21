package com.fintech.service.impl;

import com.fintech.dto.OfferRequest;
import com.fintech.dto.response.OfferResponse;
import com.fintech.dto.response.UserSummaryResponse;
import com.fintech.entity.Offer;
import com.fintech.entity.User;
import com.fintech.exception.ResourceNotFoundException;
import com.fintech.repository.OfferRepository;
import com.fintech.repository.UserRepository;
import com.fintech.service.OfferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OfferServiceImpl implements OfferService {

    private final OfferRepository offerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OfferResponse createOffer(OfferRequest request) {
        log.debug("Creating offer with validFrom: {}, validUntil: {}", request.getValidFrom(), request.getValidUntil());

        Offer offer = new Offer();
        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setCategory(request.getCategory());
        offer.setValidFrom(request.getValidFrom());
        offer.setValidUntil(request.getValidUntil());
        offer.setDiscount(request.getDiscount());
        offer.setTargetType(request.getTargetType());
        offer.setTargetCriteria(request.getTargetCriteria());
        offer.setActive(request.isActive() != null ? request.isActive() : true);

        if (request.getTargetType() == Offer.OfferTargetType.SELECTED_USERS &&
                request.getTargetUserIds() != null && !request.getTargetUserIds().isEmpty()) {
            List<User> targetUsers = userRepository.findAllById(request.getTargetUserIds());
            offer.getTargetUsers().addAll(targetUsers);
        }

        Offer savedOffer = offerRepository.save(offer);
        return convertToOfferResponse(savedOffer);
    }

    @Override
    @Transactional
    public OfferResponse updateOffer(Long offerId, OfferRequest request) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + offerId));

        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setCategory(request.getCategory());
        offer.setValidFrom(request.getValidFrom());
        offer.setValidUntil(request.getValidUntil());
        offer.setDiscount(request.getDiscount());
        offer.setTargetType(request.getTargetType());
        offer.setTargetCriteria(request.getTargetCriteria());

        if (request.isActive() != null) {
            offer.setActive(request.isActive());
        }

        if (request.getTargetType() == Offer.OfferTargetType.SELECTED_USERS &&
                request.getTargetUserIds() != null) {
            offer.getTargetUsers().clear();
            List<User> targetUsers = userRepository.findAllById(request.getTargetUserIds());
            offer.getTargetUsers().addAll(targetUsers);
        } else {
            offer.getTargetUsers().clear();
        }

        Offer updatedOffer = offerRepository.save(offer);
        log.debug("Updated offer: {}", updatedOffer);
        return convertToOfferResponse(updatedOffer);
    }

    @Override
    @Transactional(readOnly = true)
    public OfferResponse getOfferById(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + offerId));
        return convertToOfferResponse(offer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfferResponse> getAllOffers() {
        List<Offer> offers = offerRepository.findAll();
        log.debug("Found {} offers", offers.size());
        return offers.stream()
                .map(this::convertToOfferResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfferResponse> getActiveOffersForUser(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        return offerRepository.findActiveOffersForUser(userId, now).stream()
                .filter(offer -> offer.getActive()) // Only return active offers
                .map(this::convertToOfferResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteOffer(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with id: " + offerId));
        offerRepository.delete(offer);
    }

    @Transactional(readOnly = true)
    private OfferResponse convertToOfferResponse(Offer offer) {
        OfferResponse response = new OfferResponse();
        response.setId(offer.getId());
        response.setTitle(offer.getTitle());
        response.setDescription(offer.getDescription());
        response.setCategory(offer.getCategory());
        response.setValidFrom(offer.getValidFrom());
        response.setValidUntil(offer.getValidUntil());
        response.setDiscount(offer.getDiscount());
        response.setTargetType(offer.getTargetType());
        response.setTargetCriteria(offer.getTargetCriteria());
        response.setCreatedAt(offer.getCreatedAt());
        response.setUpdatedAt(offer.getUpdatedAt());
        response.setActive(offer.getActive());

        List<UserSummaryResponse> targetUserResponses = new ArrayList<>();

        if (offer.getTargetType() == Offer.OfferTargetType.SELECTED_USERS) {
            try {
                List<Long> targetUserIds = new ArrayList<>();
                if (offer.getTargetUsers() != null) {
                    targetUserIds = offer.getTargetUsers().stream()
                            .map(User::getId)
                            .collect(Collectors.toList());
                }

                if (!targetUserIds.isEmpty()) {
                    List<User> users = userRepository.findAllById(targetUserIds);

                    for (User user : users) {
                        UserSummaryResponse userSummary = new UserSummaryResponse();
                        userSummary.setId(user.getId());
                        userSummary.setName(user.getName());
                        userSummary.setEmail(user.getEmail());
                        targetUserResponses.add(userSummary);
                    }
                }
            } catch (Exception e) {
                log.error("Error fetching target users for offer {}: {}", offer.getId(), e.getMessage());
            }
        }

        response.setTargetUsers(targetUserResponses);

        return response;
    }
}

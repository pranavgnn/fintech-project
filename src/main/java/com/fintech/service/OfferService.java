package com.fintech.service;

import com.fintech.dto.OfferRequest;
import com.fintech.dto.response.OfferResponse;
import java.util.List;

public interface OfferService {
    OfferResponse createOffer(OfferRequest request);

    OfferResponse updateOffer(Long offerId, OfferRequest request);

    OfferResponse getOfferById(Long offerId);

    List<OfferResponse> getAllOffers();

    List<OfferResponse> getActiveOffersForUser(Long userId);

    void deleteOffer(Long offerId);
}

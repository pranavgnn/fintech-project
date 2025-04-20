package com.fintech.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fintech.entity.Offer.OfferTargetType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OfferResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private LocalDateTime validFrom;

    @JsonProperty("validUntil")
    private LocalDateTime validUntil;

    private String discount;
    private OfferTargetType targetType;
    private String targetCriteria;
    private List<UserSummaryResponse> targetUsers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean active;
}
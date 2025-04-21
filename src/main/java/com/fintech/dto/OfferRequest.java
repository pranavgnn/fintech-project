package com.fintech.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fintech.entity.Offer.OfferTargetType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OfferRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String category;

    @NotNull(message = "Valid from date is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime validFrom;

    @NotNull(message = "Valid until date is required")
    @FutureOrPresent(message = "Valid until date must be in the future")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime validUntil;

    private String discount;

    @NotNull(message = "Target type is required")
    private OfferTargetType targetType;
    private String targetCriteria;

    private List<Long> targetUserIds;

    private Boolean active;

    public Boolean isActive() {
        return active;
    }
}

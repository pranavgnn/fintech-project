package com.fintech.dto.response;

import com.fintech.entity.OfferType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OfferResponse {
    private Long id;
    private String description;
    private OfferType type;
    private LocalDateTime validFrom;
    private LocalDateTime validTill;
}
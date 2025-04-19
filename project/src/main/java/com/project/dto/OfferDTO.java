package com.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferDTO {
    private Long id;
    private String offerType;
    private String description;
    private LocalDateTime validTill;
}

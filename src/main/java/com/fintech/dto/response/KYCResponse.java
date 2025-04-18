package com.fintech.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class KYCResponse {
    private Long id;
    private LocalDate dateOfBirth;
    private String aadhaarNumber;
    private String panNumber;
    private AddressResponse address;
}
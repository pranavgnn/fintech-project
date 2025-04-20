package com.fintech.dto.response;

import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private KYCResponse kyc;
    private Set<AccountResponse> accounts = new HashSet<>();
    private Set<String> roles = new HashSet<>();
    private Set<OfferResponse> offers = new HashSet<>();
}
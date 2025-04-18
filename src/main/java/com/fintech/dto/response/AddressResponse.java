package com.fintech.dto.response;

import lombok.Data;

@Data
public class AddressResponse {
    private Long id;
    private String line1;
    private String line2;
    private String street;
    private String city;
    private String state;
    private String country;
    private String zipCode;
}
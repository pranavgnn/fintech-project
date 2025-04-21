package com.fintech.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
public class UserSummaryResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private Set<String> roles = new HashSet<>();
}

package com.fintech.service;

import com.fintech.dto.JwtAuthResponse;
import com.fintech.dto.LoginRequest;

public interface AuthService {
    JwtAuthResponse login(LoginRequest request);

    void validateToken(String token);
}
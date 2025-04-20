package com.fintech.service.impl;

import com.fintech.dto.JwtAuthResponse;
import com.fintech.dto.LoginRequest;
import com.fintech.exception.UnauthorizedException;
import com.fintech.security.JwtTokenProvider;
import com.fintech.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Override
    public JwtAuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        return new JwtAuthResponse(jwt, "Bearer");
    }

    @Override
    public void validateToken(String token) {
        if (!tokenProvider.validateToken(token)) {
            throw new UnauthorizedException("Invalid JWT token");
        }
    }
}
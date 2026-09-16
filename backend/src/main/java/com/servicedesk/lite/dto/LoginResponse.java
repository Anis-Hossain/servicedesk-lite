package com.servicedesk.lite.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        String fullName,
        String email,
        String role
) {}

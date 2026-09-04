package com.servicedesk.lite.dto;

public record LoginResponse(
        String token,
        String fullName,
        String email,
        String role
) {}

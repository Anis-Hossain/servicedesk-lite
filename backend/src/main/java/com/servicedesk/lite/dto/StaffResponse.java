package com.servicedesk.lite.dto;

public record StaffResponse(
        Long id,
        String fullName,
        String email,
        String role,
        long assignedOpenTickets
) {}

package com.servicedesk.lite.dto;

import java.time.Instant;

public record CustomerResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String company,
        Instant createdAt,
        long totalTickets,
        long openTickets
) {}

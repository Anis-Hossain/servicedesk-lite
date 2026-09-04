package com.servicedesk.lite.dto;

import java.time.Instant;

public record TicketCommentResponse(
        Long id,
        String authorName,
        String message,
        Instant createdAt
) {}

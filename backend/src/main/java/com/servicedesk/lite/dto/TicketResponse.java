package com.servicedesk.lite.dto;

import com.servicedesk.lite.enums.TicketPriority;
import com.servicedesk.lite.enums.TicketStatus;

import java.time.Instant;
import java.util.List;

public record TicketResponse(
        Long id,
        String subject,
        String description,
        TicketStatus status,
        TicketPriority priority,
        Long customerId,
        String customerName,
        String customerEmail,
        Long assignedToId,
        String assignedToName,
        Instant createdAt,
        Instant updatedAt,
        Instant resolvedAt,
        List<TicketCommentResponse> comments
) {}

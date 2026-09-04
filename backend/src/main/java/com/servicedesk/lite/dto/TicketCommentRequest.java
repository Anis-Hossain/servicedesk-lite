package com.servicedesk.lite.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketCommentRequest(
        @NotBlank(message = "Author name is required")
        String authorName,

        @NotBlank(message = "Message cannot be empty")
        String message
) {}

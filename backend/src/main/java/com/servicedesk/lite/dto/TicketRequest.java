package com.servicedesk.lite.dto;

import com.servicedesk.lite.enums.TicketPriority;
import com.servicedesk.lite.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketRequest(
        @NotBlank(message = "Subject is required")
        @Size(max = 200)
        String subject,

        @NotBlank(message = "Description is required")
        String description,

        @NotNull(message = "Priority is required")
        TicketPriority priority,

        TicketStatus status,

        @NotNull(message = "Customer is required")
        Long customerId,

        Long assignedToId
) {}

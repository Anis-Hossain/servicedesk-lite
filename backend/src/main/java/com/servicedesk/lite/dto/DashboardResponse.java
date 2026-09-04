package com.servicedesk.lite.dto;

import java.util.List;
import java.util.Map;

public record DashboardResponse(
        long totalTickets,
        long openTickets,
        long inProgressTickets,
        long waitingForCustomerTickets,
        long resolvedTickets,
        Map<String, Long> ticketsByPriority,
        List<TicketResponse> recentTickets
) {}

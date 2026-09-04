package com.servicedesk.lite.service;

import com.servicedesk.lite.dto.DashboardResponse;
import com.servicedesk.lite.entity.Ticket;
import com.servicedesk.lite.enums.TicketPriority;
import com.servicedesk.lite.enums.TicketStatus;
import com.servicedesk.lite.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final TicketService ticketService;

    public DashboardService(TicketRepository ticketRepository, TicketService ticketService) {
        this.ticketRepository = ticketRepository;
        this.ticketService = ticketService;
    }

    public DashboardResponse getSummary() {
        long total = ticketRepository.count();
        long open = ticketRepository.countByStatus(TicketStatus.OPEN);
        long inProgress = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
        long waiting = ticketRepository.countByStatus(TicketStatus.WAITING_FOR_CUSTOMER);
        long resolved = ticketRepository.countByStatus(TicketStatus.RESOLVED);

        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (TicketPriority p : TicketPriority.values()) {
            byPriority.put(p.name(), ticketRepository.countByPriority(p));
        }

        List<Ticket> recent = ticketRepository.findTop5ByOrderByCreatedAtDesc();

        return new DashboardResponse(total, open, inProgress, waiting, resolved, byPriority, ticketService.mapAll(recent));
    }
}

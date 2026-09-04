package com.servicedesk.lite.service;

import com.servicedesk.lite.dto.*;
import com.servicedesk.lite.entity.Customer;
import com.servicedesk.lite.entity.StaffUser;
import com.servicedesk.lite.entity.Ticket;
import com.servicedesk.lite.entity.TicketComment;
import com.servicedesk.lite.enums.TicketPriority;
import com.servicedesk.lite.enums.TicketStatus;
import com.servicedesk.lite.exception.ResourceNotFoundException;
import com.servicedesk.lite.repository.CustomerRepository;
import com.servicedesk.lite.repository.StaffUserRepository;
import com.servicedesk.lite.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CustomerRepository customerRepository;
    private final StaffUserRepository staffUserRepository;

    public TicketService(TicketRepository ticketRepository, CustomerRepository customerRepository,
                          StaffUserRepository staffUserRepository) {
        this.ticketRepository = ticketRepository;
        this.customerRepository = customerRepository;
        this.staffUserRepository = staffUserRepository;
    }

    public List<TicketResponse> list(TicketStatus status, TicketPriority priority, Long customerId, String search) {
        return ticketRepository.search(status, priority, customerId, search).stream()
                .map(this::toResponse)
                .toList();
    }

    public TicketResponse getById(Long id) {
        return toResponse(findTicketOrThrow(id));
    }

    public TicketResponse create(TicketRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + request.customerId()));

        StaffUser assignedTo = resolveAssignee(request.assignedToId());

        Ticket ticket = Ticket.builder()
                .subject(request.subject())
                .description(request.description())
                .priority(request.priority())
                .status(request.status() != null ? request.status() : TicketStatus.OPEN)
                .customer(customer)
                .assignedTo(assignedTo)
                .updatedAt(Instant.now())
                .build();

        return toResponse(ticketRepository.save(ticket));
    }

    public TicketResponse update(Long id, TicketRequest request) {
        Ticket ticket = findTicketOrThrow(id);

        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + request.customerId()));

        StaffUser assignedTo = resolveAssignee(request.assignedToId());

        ticket.setSubject(request.subject());
        ticket.setDescription(request.description());
        ticket.setPriority(request.priority());
        ticket.setCustomer(customer);
        ticket.setAssignedTo(assignedTo);

        applyStatus(ticket, request.status() != null ? request.status() : ticket.getStatus());

        return toResponse(ticketRepository.save(ticket));
    }

    public TicketResponse updateStatus(Long id, TicketStatus status) {
        Ticket ticket = findTicketOrThrow(id);
        applyStatus(ticket, status);
        return toResponse(ticketRepository.save(ticket));
    }

    public TicketResponse addComment(Long id, TicketCommentRequest request) {
        Ticket ticket = findTicketOrThrow(id);
        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .authorName(request.authorName())
                .message(request.message())
                .build();
        ticket.getComments().add(comment);
        return toResponse(ticketRepository.save(ticket));
    }

    public void delete(Long id) {
        Ticket ticket = findTicketOrThrow(id);
        ticketRepository.delete(ticket);
    }

    public List<TicketResponse> mapAll(List<Ticket> tickets) {
        return tickets.stream().map(this::toResponse).toList();
    }

    private void applyStatus(Ticket ticket, TicketStatus status) {
        ticket.setStatus(status);
        if (status == TicketStatus.RESOLVED && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(Instant.now());
        } else if (status != TicketStatus.RESOLVED) {
            ticket.setResolvedAt(null);
        }
    }

    private StaffUser resolveAssignee(Long assignedToId) {
        if (assignedToId == null) {
            return null;
        }
        return staffUserRepository.findById(assignedToId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found with id " + assignedToId));
    }

    private Ticket findTicketOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id " + id));
    }

    private TicketResponse toResponse(Ticket t) {
        List<TicketCommentResponse> comments = t.getComments().stream()
                .map(c -> new TicketCommentResponse(c.getId(), c.getAuthorName(), c.getMessage(), c.getCreatedAt()))
                .toList();

        return new TicketResponse(
                t.getId(),
                t.getSubject(),
                t.getDescription(),
                t.getStatus(),
                t.getPriority(),
                t.getCustomer().getId(),
                t.getCustomer().getFullName(),
                t.getCustomer().getEmail(),
                t.getAssignedTo() != null ? t.getAssignedTo().getId() : null,
                t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : null,
                t.getCreatedAt(),
                t.getUpdatedAt(),
                t.getResolvedAt(),
                comments
        );
    }
}

package com.servicedesk.lite.controller;

import com.servicedesk.lite.dto.TicketCommentRequest;
import com.servicedesk.lite.dto.TicketRequest;
import com.servicedesk.lite.dto.TicketResponse;
import com.servicedesk.lite.enums.TicketPriority;
import com.servicedesk.lite.enums.TicketStatus;
import com.servicedesk.lite.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@Tag(name = "Tickets", description = "Create, view, update, and manage support tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    @Operation(summary = "List tickets", description = "Returns tickets, optionally filtered by status, priority, customer, or free-text search")
    public ResponseEntity<List<TicketResponse>> list(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(ticketService.list(status, priority, customerId, search));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ticket details", description = "Returns full details for a single ticket, including comments")
    public ResponseEntity<TicketResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create ticket", description = "Creates a new support ticket for a customer")
    public ResponseEntity<TicketResponse> create(@Valid @RequestBody TicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update ticket", description = "Updates the details of an existing ticket")
    public ResponseEntity<TicketResponse> update(@PathVariable Long id, @Valid @RequestBody TicketRequest request) {
        return ResponseEntity.ok(ticketService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update ticket status", description = "Transitions a ticket to a new status (Open, In Progress, Waiting for Customer, Resolved)")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        TicketStatus status = TicketStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ticketService.updateStatus(id, status));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a comment", description = "Adds an internal note or update to the ticket's activity log")
    public ResponseEntity<TicketResponse> addComment(@PathVariable Long id, @Valid @RequestBody TicketCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addComment(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete ticket", description = "Permanently deletes a ticket")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ticketService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

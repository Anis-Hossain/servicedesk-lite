package com.servicedesk.lite.controller;

import com.servicedesk.lite.dto.CustomerRequest;
import com.servicedesk.lite.dto.CustomerResponse;
import com.servicedesk.lite.dto.TicketResponse;
import com.servicedesk.lite.service.CustomerService;
import com.servicedesk.lite.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customers", description = "Manage customers linked to support tickets")
public class CustomerController {

    private final CustomerService customerService;
    private final TicketService ticketService;

    public CustomerController(CustomerService customerService, TicketService ticketService) {
        this.customerService = customerService;
        this.ticketService = ticketService;
    }

    @GetMapping
    @Operation(summary = "List customers", description = "Returns customers, optionally filtered by a search term across name, email, or company")
    public ResponseEntity<List<CustomerResponse>> list(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(customerService.list(search));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer details", description = "Returns a single customer's profile")
    public ResponseEntity<CustomerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    @GetMapping("/{id}/tickets")
    @Operation(summary = "Get customer's tickets", description = "Returns the full support ticket history for a customer")
    public ResponseEntity<List<TicketResponse>> getTickets(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.list(null, null, id, null));
    }

    @PostMapping
    @Operation(summary = "Create customer", description = "Registers a new customer")
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer", description = "Updates an existing customer's profile")
    public ResponseEntity<CustomerResponse> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer", description = "Deletes a customer and their associated tickets")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

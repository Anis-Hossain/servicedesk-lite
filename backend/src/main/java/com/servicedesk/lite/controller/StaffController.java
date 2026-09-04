package com.servicedesk.lite.controller;

import com.servicedesk.lite.dto.StaffResponse;
import com.servicedesk.lite.entity.StaffUser;
import com.servicedesk.lite.enums.TicketStatus;
import com.servicedesk.lite.repository.StaffUserRepository;
import com.servicedesk.lite.repository.TicketRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@Tag(name = "Staff", description = "Support team overview, used for ticket assignment and the team report page")
public class StaffController {

    private final StaffUserRepository staffUserRepository;
    private final TicketRepository ticketRepository;

    public StaffController(StaffUserRepository staffUserRepository, TicketRepository ticketRepository) {
        this.staffUserRepository = staffUserRepository;
        this.ticketRepository = ticketRepository;
    }

    @GetMapping
    @Operation(summary = "List support staff", description = "Returns all support staff with their current open-ticket workload")
    public ResponseEntity<List<StaffResponse>> list() {
        List<StaffResponse> staff = staffUserRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(staff);
    }

    private StaffResponse toResponse(StaffUser user) {
        long openCount = ticketRepository.countByAssignedToIdAndStatusNot(user.getId(), TicketStatus.RESOLVED);
        return new StaffResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), openCount);
    }
}

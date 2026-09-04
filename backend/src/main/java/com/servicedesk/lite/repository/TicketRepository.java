package com.servicedesk.lite.repository;

import com.servicedesk.lite.entity.Ticket;
import com.servicedesk.lite.enums.TicketPriority;
import com.servicedesk.lite.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    long countByStatus(TicketStatus status);

    long countByPriority(TicketPriority priority);

    long countByAssignedToIdAndStatusNot(Long assignedToId, TicketStatus status);

    List<Ticket> findTop5ByOrderByCreatedAtDesc();

    @Query("""
        SELECT t FROM Ticket t
        JOIN t.customer c
        WHERE (:status IS NULL OR t.status = :status)
          AND (:priority IS NULL OR t.priority = :priority)
          AND (:customerId IS NULL OR c.id = :customerId)
          AND (:search IS NULL OR :search = '' OR
               LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY t.createdAt DESC
        """)
    List<Ticket> search(
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("customerId") Long customerId,
            @Param("search") String search
    );

    List<Ticket> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}

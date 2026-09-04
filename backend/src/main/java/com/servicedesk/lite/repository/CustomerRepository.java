package com.servicedesk.lite.repository;

import com.servicedesk.lite.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("""
        SELECT c FROM Customer c
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.company) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY c.fullName ASC
        """)
    List<Customer> search(@Param("search") String search);
}

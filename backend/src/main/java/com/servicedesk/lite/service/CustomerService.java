package com.servicedesk.lite.service;

import com.servicedesk.lite.dto.CustomerRequest;
import com.servicedesk.lite.dto.CustomerResponse;
import com.servicedesk.lite.entity.Customer;
import com.servicedesk.lite.enums.TicketStatus;
import com.servicedesk.lite.exception.DuplicateResourceException;
import com.servicedesk.lite.exception.ResourceNotFoundException;
import com.servicedesk.lite.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<CustomerResponse> list(String search) {
        return customerRepository.search(search).stream()
                .map(this::toResponse)
                .toList();
    }

    public CustomerResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    public CustomerResponse create(CustomerRequest request) {
        customerRepository.findAll().stream()
                .filter(c -> c.getEmail().equalsIgnoreCase(request.email()))
                .findFirst()
                .ifPresent(c -> {
                    throw new DuplicateResourceException("A customer with this email already exists");
                });

        Customer customer = Customer.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .company(request.company())
                .build();

        return toResponse(customerRepository.save(customer));
    }

    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = findOrThrow(id);
        customer.setFullName(request.fullName());
        customer.setEmail(request.email());
        customer.setPhone(request.phone());
        customer.setCompany(request.company());
        return toResponse(customerRepository.save(customer));
    }

    public void delete(Long id) {
        Customer customer = findOrThrow(id);
        customerRepository.delete(customer);
    }

    private Customer findOrThrow(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + id));
    }

    private CustomerResponse toResponse(Customer c) {
        long total = c.getTickets().size();
        long open = c.getTickets().stream()
                .filter(t -> t.getStatus() != TicketStatus.RESOLVED)
                .count();
        return new CustomerResponse(c.getId(), c.getFullName(), c.getEmail(), c.getPhone(),
                c.getCompany(), c.getCreatedAt(), total, open);
    }
}

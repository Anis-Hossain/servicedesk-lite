package com.servicedesk.lite.config;

import com.servicedesk.lite.entity.Customer;
import com.servicedesk.lite.entity.StaffUser;
import com.servicedesk.lite.entity.Ticket;
import com.servicedesk.lite.entity.TicketComment;
import com.servicedesk.lite.enums.StaffRole;
import com.servicedesk.lite.enums.TicketPriority;
import com.servicedesk.lite.enums.TicketStatus;
import com.servicedesk.lite.repository.CustomerRepository;
import com.servicedesk.lite.repository.StaffUserRepository;
import com.servicedesk.lite.repository.TicketRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Seeds realistic demo data on first startup so the application can be evaluated
 * immediately without any manual setup. Runs once — skipped if staff already exist.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final StaffUserRepository staffUserRepository;
    private final CustomerRepository customerRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(StaffUserRepository staffUserRepository, CustomerRepository customerRepository,
                       TicketRepository ticketRepository, PasswordEncoder passwordEncoder) {
        this.staffUserRepository = staffUserRepository;
        this.customerRepository = customerRepository;
        this.ticketRepository = ticketRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (staffUserRepository.count() > 0) {
            return;
        }

        StaffUser admin = staffUserRepository.save(StaffUser.builder()
                .fullName("Amelia Carter")
                .email("admin@servicedesk.local")
                .passwordHash(passwordEncoder.encode("Admin123!"))
                .role(StaffRole.ADMIN)
                .build());

        StaffUser agent1 = staffUserRepository.save(StaffUser.builder()
                .fullName("Daniel Reyes")
                .email("agent@servicedesk.local")
                .passwordHash(passwordEncoder.encode("Agent123!"))
                .role(StaffRole.AGENT)
                .build());

        StaffUser agent2 = staffUserRepository.save(StaffUser.builder()
                .fullName("Priya Nair")
                .email("priya@servicedesk.local")
                .passwordHash(passwordEncoder.encode("Agent123!"))
                .role(StaffRole.AGENT)
                .build());

        Customer c1 = customerRepository.save(Customer.builder()
                .fullName("Grace Okafor").email("grace.okafor@brightline.io")
                .phone("+1 415 555 0132").company("Brightline Retail").build());
        Customer c2 = customerRepository.save(Customer.builder()
                .fullName("Marcus Webb").email("marcus.webb@northpeak.com")
                .phone("+1 312 555 0198").company("Northpeak Logistics").build());
        Customer c3 = customerRepository.save(Customer.builder()
                .fullName("Sofia Alvarez").email("sofia.alvarez@lumenhealth.com")
                .phone("+1 617 555 0173").company("Lumen Health").build());
        Customer c4 = customerRepository.save(Customer.builder()
                .fullName("Tom Whitfield").email("tom.whitfield@harboredge.co")
                .phone("+44 20 7946 0958").company("Harbor Edge Ltd").build());
        Customer c5 = customerRepository.save(Customer.builder()
                .fullName("Nina Kowalski").email("nina.kowalski@quillstack.dev")
                .phone("+1 206 555 0110").company("QuillStack").build());
        Customer c6 = customerRepository.save(Customer.builder()
                .fullName("Ethan Park").email("ethan.park@brightline.io")
                .phone("+1 415 555 0177").company("Brightline Retail").build());

        seedTicket(c1, agent1, "Checkout page returns 500 error on mobile", TicketStatus.OPEN,
                TicketPriority.HIGH, 0, agent1, "Confirmed on iOS Safari, investigating payment gateway logs.");
        seedTicket(c2, agent2, "Unable to export shipment report to CSV", TicketStatus.IN_PROGRESS,
                TicketPriority.MEDIUM, 1, agent2, "Reproduced locally — likely a date-format bug in the export job.");
        seedTicket(c3, admin, "Request: add SSO login for enterprise plan", TicketStatus.WAITING_FOR_CUSTOMER,
                TicketPriority.LOW, 3, admin, "Sent questionnaire to customer to confirm their identity provider.");
        seedTicket(c4, agent1, "Invoice #4471 shows incorrect VAT amount", TicketStatus.OPEN,
                TicketPriority.HIGH, 0, null);
        seedTicket(c5, agent2, "Dashboard widgets fail to load after latest update", TicketStatus.IN_PROGRESS,
                TicketPriority.HIGH, 2, agent2, "Rolled back the affected widget bundle; monitoring.");
        seedTicket(c6, null, "How do I add a second team member to my account?", TicketStatus.OPEN,
                TicketPriority.LOW, 0, null);
        seedTicket(c1, admin, "Password reset email never arrives", TicketStatus.RESOLVED,
                TicketPriority.MEDIUM, 5, admin, "Found the emails in the customer's spam folder; whitelisted our domain.");
        seedTicket(c2, agent1, "API rate limit is too low for our integration", TicketStatus.RESOLVED,
                TicketPriority.MEDIUM, 6, agent1, "Bumped their account to the higher rate-limit tier.");
        seedTicket(c3, agent2, "Feature request: dark mode for the customer portal", TicketStatus.WAITING_FOR_CUSTOMER,
                TicketPriority.LOW, 4, null);
        seedTicket(c5, agent1, "Bulk delete accidentally removed active tickets", TicketStatus.RESOLVED,
                TicketPriority.HIGH, 7, agent1, "Restored the 12 affected tickets from the nightly backup.");
        seedTicket(c4, null, "Need clarification on data retention policy", TicketStatus.OPEN,
                TicketPriority.LOW, 1, null);
        seedTicket(c6, agent2, "Slow page load times on the reports tab", TicketStatus.IN_PROGRESS,
                TicketPriority.MEDIUM, 2, agent2, "Added indexes on the reporting query; re-testing performance.");
    }

    private void seedTicket(Customer customer, StaffUser assignedTo, String subject, TicketStatus status,
                             TicketPriority priority, int daysAgo, StaffUser commentAuthor, String... comments) {
        Instant created = Instant.now().minus(daysAgo, ChronoUnit.DAYS);

        Ticket ticket = Ticket.builder()
                .subject(subject)
                .description(subject + ". Reported by " + customer.getFullName() + " from " + customer.getCompany() + ".")
                .status(status)
                .priority(priority)
                .customer(customer)
                .assignedTo(assignedTo)
                .createdAt(created)
                .updatedAt(created)
                .resolvedAt(status == TicketStatus.RESOLVED ? created.plus(1, ChronoUnit.DAYS) : null)
                .build();

        if (comments.length > 0 && commentAuthor != null) {
            for (String message : comments) {
                ticket.getComments().add(TicketComment.builder()
                        .ticket(ticket)
                        .authorName(commentAuthor.getFullName())
                        .message(message)
                        .createdAt(created.plus(2, ChronoUnit.HOURS))
                        .build());
            }
        }

        ticketRepository.save(ticket);
    }
}

package com.servicedesk.lite.service;

import com.servicedesk.lite.config.JwtService;
import com.servicedesk.lite.dto.LoginRequest;
import com.servicedesk.lite.dto.LoginResponse;
import com.servicedesk.lite.entity.StaffUser;
import com.servicedesk.lite.exception.InvalidCredentialsException;
import com.servicedesk.lite.repository.StaffUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final StaffUserRepository staffUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(StaffUserRepository staffUserRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.staffUserRepository = staffUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        StaffUser user = staffUserRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, user.getFullName(), user.getEmail(), user.getRole().name());
    }
}

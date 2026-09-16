package com.servicedesk.lite.service;

import com.servicedesk.lite.config.JwtService;
import com.servicedesk.lite.dto.LoginRequest;
import com.servicedesk.lite.dto.LoginResponse;
import com.servicedesk.lite.dto.RefreshResponse;
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

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        return new LoginResponse(accessToken, refreshToken, user.getFullName(), user.getEmail(), user.getRole().name());
    }

    /**
     * Exchanges a valid, unexpired REFRESH token for a brand-new ACCESS token.
     * The refresh token itself is not rotated/reissued here - it stays valid until its
     * own (longer) expiry, keeping this exchange intentionally simple.
     */
    public RefreshResponse refresh(String refreshToken) {
        if (!jwtService.isValidRefreshToken(refreshToken)) {
            throw new InvalidCredentialsException("Refresh token is invalid or expired");
        }

        String email = jwtService.extractEmail(refreshToken);
        StaffUser user = staffUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new InvalidCredentialsException("Refresh token is invalid or expired"));

        String newAccessToken = jwtService.generateAccessToken(user.getEmail());
        return new RefreshResponse(newAccessToken);
    }
}

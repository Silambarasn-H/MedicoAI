package com.medicoai.controller;

import com.medicoai.dto.request.ForgotPasswordRequest;
import com.medicoai.dto.request.LoginRequest;
import com.medicoai.dto.request.RegisterRequest;
import com.medicoai.dto.request.ResetPasswordRequest;
import com.medicoai.dto.response.ApiResponse;
import com.medicoai.dto.response.AuthResponse;
import com.medicoai.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * All routes under /auth/** are public (no JWT required).
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, and password reset endpoints")
public class AuthController {

    private final AuthService authService;

    // ── POST /auth/register ──────────────────────────────────────────

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful",
                        authService.register(request)));
    }

    // ── POST /auth/login ─────────────────────────────────────────────

    @PostMapping("/login")
    @Operation(summary = "Login and receive a JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Login successful", authService.login(request)));
    }

    // ── POST /auth/forgot-password ───────────────────────────────────
    // Accepts only email. Sends reset link. Never reveals if email exists.

    @PostMapping("/forgot-password")
    @Operation(
        summary     = "Request a password reset email",
        description = "In dev mode, response.data.resetLink contains the link for testing."
    )
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        String resetLink = authService.forgotPassword(request);

        java.util.Map<String, String> data = new java.util.LinkedHashMap<>();
        if (resetLink != null) {
            data.put("resetLink", resetLink);
        }

        return ResponseEntity.ok(ApiResponse.success(
                "If an account with that email exists, a reset link has been sent.",
                data.isEmpty() ? null : data));
    }

    // ── POST /auth/reset-password ────────────────────────────────────
    // Accepts token (from email link) + newPassword + confirmPassword.

    @PostMapping("/reset-password")
    @Operation(
        summary     = "Reset password using the token from the email link",
        description = "Validates token expiry, encodes new password, clears the token."
    )
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Password reset successfully. You can now log in with your new password."));
    }

    // ── GET /auth/health ─────────────────────────────────────────────

    @GetMapping("/health")
    @Operation(summary = "Auth module health check")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Auth service is running", "OK"));
    }
}

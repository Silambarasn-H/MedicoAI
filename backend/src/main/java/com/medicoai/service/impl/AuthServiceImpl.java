package com.medicoai.service.impl;

import com.medicoai.dto.request.ForgotPasswordRequest;
import com.medicoai.dto.request.LoginRequest;
import com.medicoai.dto.request.RegisterRequest;
import com.medicoai.dto.request.ResetPasswordRequest;
import com.medicoai.dto.response.AuthResponse;
import com.medicoai.entity.User;
import com.medicoai.exception.BadRequestException;
import com.medicoai.repository.UserRepository;
import com.medicoai.security.JwtTokenProvider;
import com.medicoai.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.InternetAddress;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider      jwtTokenProvider;
    private final JavaMailSender        mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.dev-mode:false}")
    private boolean devMode;

    @Value("${app.reset-token.expiry-minutes:15}")
    private long resetTokenExpiryMinutes;

    @Value("${spring.mail.username:noreply@medicoai.com}")
    private String fromEmail;

    // ----------------------------------------------------------------
    // Register
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    "Email '" + request.getEmail() + "' is already registered.");
        }

        if (request.getPhone() != null && !request.getPhone().isBlank()
                && userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException(
                    "Phone number '" + request.getPhone() + "' is already registered.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user registered: {} [{}]", savedUser.getEmail(), savedUser.getRole());

        String token = jwtTokenProvider.generateTokenFromEmail(savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .userId(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .message("Registration successful")
                .build();
    }

    // ----------------------------------------------------------------
    // Login
    // ----------------------------------------------------------------

    @Override
    public AuthResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);
        User user = (User) authentication.getPrincipal();
        log.info("User logged in: {} [{}]", user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .message("Login successful")
                .build();
    }

    // ----------------------------------------------------------------
    // Forgot Password — generate token + send email
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {

        String email = request.getEmail().toLowerCase().trim();

        // Look up user — but NEVER reveal whether the email exists
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Generate a cryptographically secure UUID token
            String token  = UUID.randomUUID().toString();
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(resetTokenExpiryMinutes);

            user.setResetToken(token);
            user.setResetTokenExpiry(expiry);
            userRepository.save(user);

            // Build and send the reset email
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            sendResetEmail(user.getFullName(), email, resetLink);

            // In dev mode, return the link so the frontend can display it
            return devMode ? resetLink : null;
        } else {
            // Still log but don't throw — prevents email enumeration
            log.warn("Forgot-password requested for unknown email: {}", email);
            return null;
        }
    }

    // ----------------------------------------------------------------
    // Reset Password — validate token + update password
    // ----------------------------------------------------------------

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        // 1. Passwords must match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }

        // 2. Find user by token
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException(
                        "Invalid or expired reset link. Please request a new one."));

        // 3. Check token expiry
        if (user.getResetTokenExpiry() == null
                || LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            // Clear the expired token
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw new BadRequestException(
                    "Reset link has expired. Please request a new one.");
        }

        // 4. Encode and save new password, then clear the token
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        log.info("Password successfully reset for user: {}", user.getEmail());
    }

    // ----------------------------------------------------------------
    // Private helpers
    // ----------------------------------------------------------------

    private void sendResetEmail(String fullName, String toEmail, String resetLink) {

        // ── 1. Always print reset link to stdout BEFORE attempting email ──
        System.out.println("\n========================================");
        System.out.println("RESET_LINK=" + resetLink);
        System.out.println("TO=" + toEmail);
        System.out.println("FROM=" + fromEmail.trim());
        System.out.println("========================================\n");
        System.out.flush();
        log.info("RESET_LINK={}", resetLink);

        // ── 2. Build and send via MimeMessage ──
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, false, "UTF-8");

            // FROM must exactly match spring.mail.username for Gmail SMTP auth
            String from = fromEmail.trim();
            helper.setFrom(from);
            helper.setReplyTo(from);
            helper.setTo(toEmail.trim());
            helper.setSubject("MedicoAI Password Reset");
            helper.setText(
                "Hi " + fullName + ",\n\n"
                + "We received a request to reset your MedicoAI password.\n\n"
                + "Reset your password here:\n"
                + resetLink + "\n\n"
                + "This link expires in " + resetTokenExpiryMinutes + " minutes.\n\n"
                + "If you did not request this, ignore this email.\n\n"
                + "The MedicoAI Team",
                false   // false = plain text, not HTML
            );

            System.out.println("Attempting SMTP send to: " + toEmail + " via " + from);
            mailSender.send(mime);

            // ── 3. Only printed if send() succeeds ──
            System.out.println("EMAIL SENT OK to: " + toEmail);
            log.info("Reset email delivered successfully to: {}", toEmail);

        } catch (Exception e) {
            // ── 4. Full exception chain to stdout ──
            System.out.println("EMAIL SEND FAILED");
            System.out.println("  Type   : " + e.getClass().getName());
            System.out.println("  Message: " + e.getMessage());
            Throwable cause = e.getCause();
            int depth = 1;
            while (cause != null && depth <= 5) {
                System.out.println("  Cause[" + depth + "]: "
                        + cause.getClass().getName() + " - " + cause.getMessage());
                cause = cause.getCause();
                depth++;
            }
            e.printStackTrace(System.out);
            System.out.flush();
            log.error("SMTP failed for {}: {}", toEmail, e.getMessage(), e);
        }
    }
}

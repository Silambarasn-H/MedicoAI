package com.medicoai.service;

import com.medicoai.dto.request.ForgotPasswordRequest;
import com.medicoai.dto.request.LoginRequest;
import com.medicoai.dto.request.RegisterRequest;
import com.medicoai.dto.request.ResetPasswordRequest;
import com.medicoai.dto.response.AuthResponse;

/**
 * Contract for authentication operations.
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    /**
     * Generate a secure reset token, store it on the user, and send
     * a reset-link email. Always returns success to avoid email enumeration.
     * In dev mode, returns the reset link so it can be shown in the UI.
     *
     * @param request contains only the email address
     * @return resetLink in dev mode, null in production
     */
    String forgotPassword(ForgotPasswordRequest request);

    /**
     * Validate the reset token, check expiry, encode and save the new password,
     * then clear the token so it cannot be reused.
     *
     * @param request token + newPassword + confirmPassword
     */
    void resetPassword(ResetPasswordRequest request);
}

package com.medicoai;

import com.medicoai.dto.request.LoginRequest;
import com.medicoai.dto.request.RegisterRequest;
import com.medicoai.dto.response.AuthResponse;
import com.medicoai.entity.User;
import com.medicoai.enums.Role;
import com.medicoai.exception.BadRequestException;
import com.medicoai.repository.UserRepository;
import com.medicoai.security.JwtTokenProvider;
import com.medicoai.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository        userRepository;
    @Mock private PasswordEncoder       passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider      jwtTokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private LoginRequest    loginRequest;
    private User            mockUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("John Doe");
        registerRequest.setEmail("john@example.com");
        registerRequest.setPassword("Password@123");
        registerRequest.setPhone("9876543210");
        registerRequest.setRole(Role.PATIENT);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("john@example.com");
        loginRequest.setPassword("Password@123");

        mockUser = User.builder()
                .id(1L)
                .fullName("John Doe")
                .email("john@example.com")
                .password("$2a$12$encodedPassword")
                .role(Role.PATIENT)
                .isActive(true)
                .build();
    }

    // ----------------------------------------------------------------
    // Register tests
    // ----------------------------------------------------------------

    @Test
    @DisplayName("Register – success returns JWT and user info")
    void register_success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtTokenProvider.generateTokenFromEmail(anyString())).thenReturn("mock.jwt.token");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getEmail()).isEqualTo("john@example.com");
        assertThat(response.getRole()).isEqualTo(Role.PATIENT);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Register – duplicate email throws BadRequestException")
    void register_duplicateEmail_throwsBadRequest() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already registered");

        verify(userRepository, never()).save(any());
    }

    // ----------------------------------------------------------------
    // Login tests
    // ----------------------------------------------------------------

    @Test
    @DisplayName("Login – valid credentials return JWT")
    void login_success() {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(authToken);
        when(jwtTokenProvider.generateToken(any())).thenReturn("mock.jwt.token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response.getAccessToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getEmail()).isEqualTo("john@example.com");
    }

    @Test
    @DisplayName("Login – wrong password throws BadCredentialsException")
    void login_wrongPassword_throwsBadCredentials() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
    }
}

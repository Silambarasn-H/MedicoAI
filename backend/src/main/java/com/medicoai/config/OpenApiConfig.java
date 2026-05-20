package com.medicoai.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger UI configuration.
 *
 * <p>Adds a global Bearer token security scheme so every protected
 * endpoint can be tested directly from the Swagger UI.</p>
 *
 * <p>Access at: http://localhost:8080/api/swagger-ui.html</p>
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title       = "MedicoAI – Hospital Management API",
        version     = "1.0.0",
        description = "AI Powered Hospital & Patient Management System REST API",
        contact     = @Contact(name = "MedicoAI Team", email = "admin@medicoai.com")
    ),
    servers = @Server(url = "/api", description = "Local development server")
)
@SecurityScheme(
    name         = "bearerAuth",
    type         = SecuritySchemeType.HTTP,
    scheme       = "bearer",
    bearerFormat = "JWT",
    in           = SecuritySchemeIn.HEADER,
    description  = "Paste your JWT token here (without 'Bearer ' prefix)"
)
public class OpenApiConfig {
    // All configuration is done via annotations above.
}

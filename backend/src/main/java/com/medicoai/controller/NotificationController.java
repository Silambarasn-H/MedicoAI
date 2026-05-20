package com.medicoai.controller;

import com.medicoai.dto.response.ApiResponse;
import com.medicoai.entity.Notification;
import com.medicoai.entity.User;
import com.medicoai.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Notification endpoints.
 *
 * GET  /notifications           – get all for current user
 * PUT  /notifications/{id}/read – mark one as read
 * PUT  /notifications/read-all  – mark all as read
 */
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notification management")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get all notifications for the current user")
    public ResponseEntity<ApiResponse<List<Notification>>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = (User) userDetails;
        List<Notification> list = notificationService.getForUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", list));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Notification>> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = (User) userDetails;
        Notification updated = notificationService.markRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Marked as read", updated));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = (User) userDetails;
        notificationService.markAllRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}

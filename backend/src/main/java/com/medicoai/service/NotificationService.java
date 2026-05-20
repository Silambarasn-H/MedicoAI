package com.medicoai.service;

import com.medicoai.entity.Notification;
import java.util.List;

public interface NotificationService {
    List<Notification> getForUser(Long userId);
    Notification markRead(Long id, Long userId);
    void markAllRead(Long userId);
}

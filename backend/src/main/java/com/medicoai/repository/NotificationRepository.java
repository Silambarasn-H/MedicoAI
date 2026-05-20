package com.medicoai.repository;

import com.medicoai.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** All notifications for a user, newest first. */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Unread count for a user. */
    long countByUserIdAndIsReadFalse(Long userId);

    /** Mark all as read for a user. */
    List<Notification> findByUserIdAndIsReadFalse(Long userId);
}

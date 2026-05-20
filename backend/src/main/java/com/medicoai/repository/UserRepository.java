package com.medicoai.repository;

import com.medicoai.entity.User;
import com.medicoai.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA repository for the User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Find a user by email (used by Spring Security for authentication). */
    Optional<User> findByEmail(String email);

    /** Find a user by their password-reset token. */
    Optional<User> findByResetToken(String resetToken);

    /** Check whether an email is already registered. */
    boolean existsByEmail(String email);

    /** Check whether a phone number is already registered. */
    boolean existsByPhone(String phone);

    /** Fetch all users with a specific role. */
    List<User> findAllByRole(Role role);

    /** Fetch all active users. */
    List<User> findAllByIsActiveTrue();
}

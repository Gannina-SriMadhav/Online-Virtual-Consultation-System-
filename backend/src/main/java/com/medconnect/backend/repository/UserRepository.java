package com.medconnect.backend.repository;

import com.medconnect.backend.entity.User;
import com.medconnect.backend.entity.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    Optional<User> findByEmailOrPhoneNumber(String email, String phoneNumber);
    List<User> findByRole(RoleEnum role);
}

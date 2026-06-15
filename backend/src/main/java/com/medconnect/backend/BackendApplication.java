package com.medconnect.backend;

import com.medconnect.backend.entity.User;
import com.medconnect.backend.entity.RoleEnum;
import com.medconnect.backend.repository.UserRepository;
import com.medconnect.backend.service.DatabaseResetService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder, DatabaseResetService databaseResetService) {
		return args -> {
			String resetEnv = System.getenv("RESET_DATABASE");
			if ("true".equalsIgnoreCase(resetEnv) || "true".equalsIgnoreCase(System.getProperty("RESET_DATABASE"))) {
				System.out.println("RESET_DATABASE env var detected. Wiping and seeding clean demo data...");
				databaseResetService.resetAndSeed();
				System.out.println("Database successfully reset and seeded!");
			} else {
				if (userRepository.findByEmailOrPhoneNumber("admin@medconnect.com", "admin@medconnect.com").isEmpty()) {
					User admin = new User();
					admin.setName("System Admin");
					admin.setEmail("admin@medconnect.com");
					admin.setPassword(passwordEncoder.encode("admin123"));
					admin.setRole(RoleEnum.ADMIN);
					admin.setAge(35);
					admin.setPhoneNumber("1234567890");
					admin.setIsApproved(true);
					userRepository.save(admin);
					System.out.println("Seeded admin user: admin@medconnect.com / admin123");
				}
			}
		};
	}
}
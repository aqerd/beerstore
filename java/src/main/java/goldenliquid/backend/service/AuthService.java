package goldenliquid.backend.service;

import goldenliquid.backend.model.User;
import goldenliquid.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User register(String name, String email, String password, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        log.info("Login attempt for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", email);
                    return new IllegalArgumentException("User not found");
                });
        log.info("User found: {}, passwordHash: {}", user.getEmail(), user.getPasswordHash());
        boolean matches = passwordEncoder.matches(password, user.getPasswordHash());
        log.info("Password matches: {}", matches);
        if (!matches) {
            throw new IllegalArgumentException("Password does not match");
        }
        return user;
    }

    public String generatePasswordHash(String password) {
        return passwordEncoder.encode(password);
    }
}

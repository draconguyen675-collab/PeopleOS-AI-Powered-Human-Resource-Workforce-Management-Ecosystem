package com.peopleos.shared.config;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "peopleos.demo.enabled", havingValue = "true")
public class DemoSeed implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwords;
    private final String password;
    public DemoSeed(JdbcTemplate jdbc, PasswordEncoder passwords, @Value("${peopleos.demo.password}") String password) {
        this.jdbc = jdbc; this.passwords = passwords; this.password = password;
    }
    public static UUID id(String value) { return UUID.nameUUIDFromBytes(value.getBytes(StandardCharsets.UTF_8)); }
    @Override @Transactional public void run(ApplicationArguments args) {
        if (password.length() < 12 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("DEMO_PASSWORD must contain at least 12 characters and at most 72 UTF-8 bytes");
        }
        // Serialize concurrent development startup without modifying existing demo records.
        jdbc.execute("SELECT pg_advisory_xact_lock(720041)");
        seedTenant("novatech", "NovaTech Vietnam", 120);
        seedTenant("orbit", "Orbit Studio", 8);
    }
    private void seedTenant(String slug, String name, int count) {
        UUID tenant = id(slug);
        if (jdbc.queryForObject("SELECT count(*) FROM tenants WHERE id = ?", Integer.class, tenant) > 0) return;
        jdbc.update("INSERT INTO tenants(id, slug, name) VALUES (?, ?, ?)", tenant, slug, name);
        String hash = passwords.encode(password);
        String[] roles = {"OWNER", "HR_ADMIN", "VIEWER"};
        String[] names = {"Alex Nguyen", "Sam Tran", "Jamie Le"};
        String[] emails = {"owner@example.test", "hr@example.test", "viewer@example.test"};
        for (int index = 0; index < roles.length; index++) {
            jdbc.update("INSERT INTO users(id, tenant_id, email, display_name, password_hash, role_code) VALUES (?, ?, ?, ?, ?, ?)",
                id(slug + roles[index]), tenant, emails[index], names[index], hash, roles[index]);
        }
        String[] departments = {"Engineering", "Product", "Design", "Human Resources", "Finance", "Sales", "Marketing", "Operations", "Customer Support"};
        String[] positions = {"Software Engineer", "Product Manager", "Product Designer", "People Partner", "Financial Analyst", "Account Executive", "Marketing Specialist", "Operations Specialist", "Support Specialist"};
        for (String department : departments) {
            jdbc.update("INSERT INTO departments(id, tenant_id, name) VALUES (?, ?, ?)", id(slug + department), tenant, department);
        }
        String[] first = {"Linh", "Minh", "An", "Mai", "Khanh", "Duc", "Thao", "Huy", "Quynh", "Bao", "Vy", "Nam"};
        String[] last = {"Nguyen", "Tran", "Le", "Pham", "Hoang", "Vu", "Do", "Bui", "Dang", "Phan"};
        for (int index = 0; index < count; index++) {
            int department = index % departments.length;
            jdbc.update("""
                INSERT INTO employees(id, tenant_id, employee_number, name, work_email, department_id, position, location, status, started_on)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, id(slug + "employee" + index), tenant, "NT-" + String.format("%04d", index + 1),
                first[index % first.length] + " " + last[index / first.length % last.length],
                "employee" + (index + 1) + "@" + slug + ".example.test", id(slug + departments[department]),
                positions[department], index % 3 == 0 ? "Hanoi" : "Ho Chi Minh City",
                index < 7 ? "ONBOARDING" : index < 12 ? "ON_LEAVE" : "ACTIVE",
                LocalDate.of(2025, 10, 1).plusDays((index * 3L) % 360));
        }
        jdbc.update("""
            INSERT INTO audit_logs(id, tenant_id, action, resource_type, resource_id, summary)
            VALUES (?, ?, 'WORKSPACE_CREATED', 'COMPANY', ?, 'Created fictional demonstration workspace')
            """, id(slug + "audit-created"), tenant, tenant);
    }
}

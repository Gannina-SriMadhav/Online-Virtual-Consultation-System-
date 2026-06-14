package com.medconnect.backend.controller;

import com.medconnect.backend.entity.AuditLog;
import com.medconnect.backend.repository.AuditLogRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "*")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @PostMapping
    public AuditLog createLog(@RequestBody AuditLog log) {
        if (log.getTimestamp() == null) {
            log.setTimestamp(java.time.Instant.now());
        }
        return auditLogRepository.save(log);
    }
}

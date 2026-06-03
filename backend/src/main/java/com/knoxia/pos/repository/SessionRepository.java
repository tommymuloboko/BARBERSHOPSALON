package com.knoxia.pos.repository;

import com.knoxia.pos.entity.ServiceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionRepository extends JpaRepository<ServiceSession, Long> {
    List<ServiceSession> findByStatus(ServiceSession.SessionStatus status);
}

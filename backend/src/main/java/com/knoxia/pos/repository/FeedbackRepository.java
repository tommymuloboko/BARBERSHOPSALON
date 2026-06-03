package com.knoxia.pos.repository;

import com.knoxia.pos.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByBarberId(Long barberId);
}

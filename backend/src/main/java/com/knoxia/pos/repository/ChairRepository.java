package com.knoxia.pos.repository;

import com.knoxia.pos.entity.Chair;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChairRepository extends JpaRepository<Chair, Long> {
    List<Chair> findByStatus(Chair.ChairStatus status);
    List<Chair> findByActiveTrue();
}

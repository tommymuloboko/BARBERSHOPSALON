package com.knoxia.pos.repository;

import com.knoxia.pos.entity.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findByActiveTrue();
}

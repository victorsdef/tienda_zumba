package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.NewsletterSubscriberEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterSubscriberJpaRepository extends JpaRepository<NewsletterSubscriberEntity, Long> {
    boolean existsByEmailIgnoreCase(String email);
}

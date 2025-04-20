package com.fintech.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.AuditorAware;

import java.util.Optional;

@Configuration
@EnableJpaAuditing
public class AuditConfig {
    // Use a conditional bean to prevent conflicts with the default bean
    @Bean
    @ConditionalOnMissingBean(name = "springSecurityAuditorAware")
    public AuditorAware<String> auditorProvider() {
        return () -> Optional.of("system");
    }
}

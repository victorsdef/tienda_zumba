package com.tiendaropa.backend.infrastructure.config.database;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;

public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String dbUrl = environment.getProperty("DB_URL");
        if (dbUrl == null || dbUrl.isBlank() || !DatabaseUrlNormalizer.supports(dbUrl)) {
            return;
        }

        DatabaseConnectionData connectionData = DatabaseUrlNormalizer.normalize(dbUrl);
        System.setProperty("spring.datasource.url", connectionData.jdbcUrl());

        String dbUsername = environment.getProperty("DB_USERNAME");
        if (dbUsername == null || dbUsername.isBlank()) {
            System.setProperty("spring.datasource.username", connectionData.username());
        }

        String dbPassword = environment.getProperty("DB_PASSWORD");
        if (dbPassword == null || dbPassword.isBlank()) {
            System.setProperty("spring.datasource.password", connectionData.password());
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}

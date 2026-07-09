package com.tiendaropa.backend.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
        @Value("${app.cors.allowed-origins:}") String allowedOrigins,
        @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        CorsConfiguration configuration = new CorsConfiguration();

        Set<String> origins = new LinkedHashSet<>();

        if (StringUtils.hasText(allowedOrigins)) {
            Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .forEach(origins::add);
        }

        if (StringUtils.hasText(frontendUrl)) {
            origins.add(frontendUrl.trim());
        }

        origins.add("http://localhost");
        origins.add("http://127.0.0.1");
        origins.add("http://localhost:80");
        origins.add("http://127.0.0.1:80");
        origins.add("http://localhost:5173");
        origins.add("http://127.0.0.1:5173");
        origins.add("https://sofia-couture-frontend.onrender.com");

        configuration.setAllowedOrigins(List.copyOf(origins));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

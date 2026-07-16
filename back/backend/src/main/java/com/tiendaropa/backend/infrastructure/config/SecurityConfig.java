package com.tiendaropa.backend.infrastructure.config;

import com.tiendaropa.backend.infrastructure.adapters.output.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpStatus;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**", "/api/nueva-arquitectura/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST,
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/auth/refresh",
                    "/api/nueva-arquitectura/auth/login",
                    "/api/nueva-arquitectura/auth/register",
                    "/api/nueva-arquitectura/auth/refresh"
                ).permitAll()
                .requestMatchers(HttpMethod.GET,
                    "/api/auth/verificar",
                    "/api/nueva-arquitectura/auth/verificar"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/productos/**", "/api/nueva-arquitectura/productos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categorias/**", "/api/nueva-arquitectura/categorias/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/files/**", "/api/nueva-arquitectura/files/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/banners", "/api/banner", "/api/nueva-arquitectura/banner", "/api/nueva-arquitectura/banners").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/configuracion/retiro", "/api/nueva-arquitectura/configuracion/retiro").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/ordenes/invitado", "/api/nueva-arquitectura/orden/invitado", "/api/nueva-arquitectura/ordenes/invitado").permitAll()
                .requestMatchers("/api/ordenes/invitado", "/api/nueva-arquitectura/orden/invitado", "/api/nueva-arquitectura/ordenes/invitado").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/ordenes/codigo/*/pdf", "/api/nueva-arquitectura/ordenes/codigo/*/pdf", "/api/nueva-arquitectura/orden/codigo/*/pdf").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/pagos/confirmar", "/api/nueva-arquitectura/pagos/confirmar").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/pagos/preparar", "/api/nueva-arquitectura/pagos/preparar").permitAll()
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/api-docs/**", "/v3/api-docs", "/v3/api-docs/**", "/h2-console/**").permitAll()
                .requestMatchers("/api/admin/**", "/api/nueva-arquitectura/admin/**").hasAnyRole("ADMIN", "VENDEDOR", "BODEGUERO")
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            .headers(h -> h.frameOptions(f -> f.disable()))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

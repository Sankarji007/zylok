package com.zylo.authservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {


    @Autowired
    TenantFilter tenantFilter;

    @Autowired
    JwtAuthConverter authConverter;

    @Autowired
    CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource)) // Enable CORS
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/accounts/register").permitAll() // Public endpoint
                        .requestMatchers("/ws/**").permitAll() // Allow WebSocket endpoints
                        .anyRequest().authenticated() // All other endpoints require authentication
                )
                .addFilterAfter(tenantFilter, AuthenticationFilter.class)
                .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for stateless APIs
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // No sessions
                ).oauth2ResourceServer(oauth2->oauth2.jwt(jwtConfigurer -> {
                    jwtConfigurer.jwtAuthenticationConverter(authConverter);
                }));

        return http.build();
    }
}
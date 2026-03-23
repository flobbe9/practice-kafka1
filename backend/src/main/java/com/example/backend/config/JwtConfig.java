package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import jakarta.annotation.PostConstruct;
import lombok.extern.log4j.Log4j2;

@Configuration
@Log4j2
public class JwtConfig {


    @PostConstruct
    void init() {
        log.info("Initializing JwtConfig...");
    }

    
    @Bean
    JwtDecoder jwtDecoder(@Value("${spring.security.oauth2.client.provider.keycloak.issuer-uri}") String issuerUri) {
        log.debug("issuer uri {}", issuerUri);
        return NimbusJwtDecoder
            .withIssuerLocation(issuerUri)
            .build();
    }
}

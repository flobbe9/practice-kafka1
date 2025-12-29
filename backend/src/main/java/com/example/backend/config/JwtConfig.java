package com.example.backend.config;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.JwsAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class JwtConfig {

    @Autowired
    private RsaKeyService rsaKeyService;
    

    @PostConstruct
    void init() {
        log.info("Initializing JwtConfig...");
    }


    @Bean
    JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    JWKSource<SecurityContext> jwkSource() {
        RSAPublicKey publicKey = (RSAPublicKey) rsaKeyService.getKeyPair().getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) rsaKeyService.getKeyPair().getPrivate();

        RSAKey rsaKey = new RSAKey.Builder(publicKey)
            .privateKey(privateKey)
            .keyID(this.rsaKeyService.getKeyId())
            .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }
    
    @Bean
    JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder
            .withPublicKey((RSAPublicKey) this.rsaKeyService.getKeyPair().getPublic())
            .build();
    }

    @Bean
    JwsAlgorithm jwsAlgorithm() {
        return new JwsAlgorithm() {

            @Override
            public String getName() {
                return "RS256";
            }
            
        };
    }
}

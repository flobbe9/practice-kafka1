package com.example.backend.services;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jose.jws.JwsAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.backend.config.RsaKeyService;
import com.example.backend.dtos.JwkDto;
import com.example.backend.dtos.JwkDto.JwkSetDto;
import com.example.backend.dtos.JwtDto;
import com.example.backend.helpers.Utils;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;

@Service
public class JwtService {

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private RsaKeyService rsaKeyService;

    @Autowired
    private JwsAlgorithm jwsAlgorithm;

    @Value("${BASE_URL_DOCKER}")
    private String BASE_URL_DOCKER;
    

    public Jwt generateJwtAccessToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null)
            throw new ResponseStatusException(UNAUTHORIZED);

        // TODO: validate session somehow?
            // is logged in
            // is oauth2
            // openid claim?
            // permissions?
        
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer(this.BASE_URL_DOCKER)
            .issuedAt(now)
            .expiresAt(now.plusSeconds(86_400)) // 1 day
            .subject(authentication.getName())
            .audience(List.of("pandaproxy"))
            .claims((map) -> {
                if (map == null)
                    map = new HashMap<>();

                map.putAll(Map.of(
                    "scope", "openid", 
                    "azp", "pandaproxy", // TODO
                    "gty", "client-credentials"
                ));
            })
            .build();

        JwsHeader header = JwsHeader.with(this.jwsAlgorithm)
            .keyId(this.rsaKeyService.getKeyId())
            .type("JWT")
            .build();

        return this.jwtEncoder.encode(JwtEncoderParameters.from(header, claims));
    }

    //  TODO: continue here, align this with JWKSource
    public JwkSetDto getJwks() {
        String n = (String) getJwk().getRequiredParams().get("n");
        String e = (String) getJwk().getRequiredParams().get("e");
        return new JwkSetDto(List.of(new JwkDto(
            "RSA", 
            "RS256", 
            this.rsaKeyService.getKeyId(), 
            KeyUse.SIGNATURE.identifier(),
            n,
            e
        )));
    }

    public JWK getJwk() {
        return new RSAKey.Builder((RSAPublicKey) this.rsaKeyService.getKeyPair().getPublic())
            .privateKey((RSAPrivateKey) this.rsaKeyService.getKeyPair().getPrivate())
            .keyUse(KeyUse.SIGNATURE)
            .keyID(this.rsaKeyService.getKeyId())
            .issueTime(new Date())
            .build();
    }
}

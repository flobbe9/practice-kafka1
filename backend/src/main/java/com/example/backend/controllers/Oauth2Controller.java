package com.example.backend.controllers;

import java.text.ParseException;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.config.RsaKeyService;
import com.example.backend.dtos.JwkDto.JwkSetDto;
import com.example.backend.helpers.Utils;
import com.example.backend.services.JwtService;
import com.example.backend.services.Oauth2Service.WellKnownDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;



@RestController
@Slf4j
public class Oauth2Controller {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private RsaKeyService rsaService;

    @Autowired
    private JWKSource<SecurityContext> jwkSource;

    @Autowired
    private JwtDecoder jwtDecoder;

    @Autowired
    private WellKnownDto wellKnownDto;


    // TODO: endpoint name
    @GetMapping("/jwt")
    public Object jwtToken(@RequestParam("decode") Optional<Boolean> decode) throws JsonProcessingException {
        Jwt jwt = this.jwtService.generateJwtAccessToken();

        if (decode.orElse(false))
            return new Object() {
                public Map<String, Object> getHeaders() {
                    return jwt.getHeaders();
                }
                
                public Map<String, Object> getClaims() {
                    return jwt.getClaims();
                }
            };

        return jwt.getTokenValue();
    }

    @GetMapping("/.well-known/openid-configuration")
    public WellKnownDto wellKnown() {
        return this.wellKnownDto;
    }
    
    
    @GetMapping("/.well-known/jwks")
    public JwkSetDto wellKnownJwks() throws ParseException {
        return this.jwtService.getJwks();
    }
    
    @GetMapping("/login")
    public void loginOauth2(HttpServletResponse response) {
        Utils.redirect(response, "/oauth2/authorization/github");
    }

    @GetMapping("test")
    public Object tesObject() {
        return Map.of("test", "value");
    }
    
    
    @GetMapping("/principal")
    public Object principal() {
        return SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}

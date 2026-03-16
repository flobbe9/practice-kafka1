package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.example.backend.helpers.Utils;

import lombok.extern.log4j.Log4j2;
import reactor.core.publisher.Mono;

/**
 * Class handling login success. Implements {@link AuthenticationSuccessHandler} and is beeing used in {@link SecurityConfig}
 * 
 * @since 0.0.1
 */
@Component
@Log4j2
public class CustomAuthenticationSuccessHandler implements ServerAuthenticationSuccessHandler {

    /** The url query param key that is appended to the redirect url to start page. Also hard coded in "constatns.ts" */
    public static final String OAUTH2_LOGIN_ERROR_STATUS_URL_QUERY_PARAM = "oauth2-login-error";

    // @Autowired
    // private Oauth2Service oauth2Service;

    @Value("${BASE_URL}")
    private String BASE_URL;

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange, Authentication authentication) {
        // boolean isOauth2 = this.oauth2Service.isOauth2Session(authentication.getPrincipal());
        boolean isOauth2 = true;

        ServerHttpResponse response = webFilterExchange.getExchange().getResponse();

        if (isOauth2) {
            log.debug("Oauth login successful, redirect to {}", this.BASE_URL);
            Utils.redirect(response, this.BASE_URL);
        }

        return Mono.empty();
    }
}

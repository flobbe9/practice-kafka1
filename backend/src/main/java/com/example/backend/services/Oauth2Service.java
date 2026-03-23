package com.example.backend.services;

import static com.example.backend.helpers.Utils.assertArgsNotNullAndNotBlankOrThrow;

import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;

import jakarta.annotation.Nullable;
import lombok.extern.log4j.Log4j2;
import reactor.core.publisher.Mono;


/**
 * NOTE: dont inject {@code AppUserService} to prevent cycle. Don't make this session scoped, use {@code Oauth2ServiceProxy} for that.
 * 
 * @since 0.0.1
 */
@Service
@Log4j2
public class Oauth2Service {

    @Autowired
    private ReactiveOAuth2AuthorizedClientManager reactiveOAuth2AuthorizedClientManager;

    
    /**
     * Indicates whether the current session has been created using oauth2 (e.g. login with google)
     * 
     * @param principal from current security context
     * @return 
     */
    public boolean isOauth2Session(@Nullable Object principal) {
        log.debug(principal.getClass());
        return principal != null && principal instanceof OAuth2AuthenticationToken;
    }
    
    /**
     * Get an access token for the current oauth2 session. Will attempt to use the refresh token automatically.
     * 
     * @param exchange the current server exchange, needed to get authentication details
     * @return the access token of the current oauth2 session that is beeing retrieved after successful login
     * @throws IllegalArgumentException
     * @throws ResponseStatusException 401 if not logged in, 409 if logged in but not an oauth2 session
     */
    @NonNull
    public Mono<String> retrieveAccessToken(@NonNull ServerWebExchange exchange) {
        assertArgsNotNullAndNotBlankOrThrow(exchange);

        return getOauth2PrincipalOrThrow(exchange)
            .flatMap(principal -> Mono.just(
                OAuth2AuthorizeRequest
                    .withClientRegistrationId(principal.getAuthorizedClientRegistrationId())
                    .principal(principal)
                    .build()
            ))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED)))
            .flatMap(authorizedRequest -> {
                Mono<String> token = this.reactiveOAuth2AuthorizedClientManager
                    .authorize(authorizedRequest)
                        .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED))) // no refresh token
                    .map(client -> client.getAccessToken().getTokenValue());
                return token;
            });
    }

    /**
     * Get the current session's principal or throw if {@code exchange} has no active session or the session is not an oauth2 session.
     * 
     * @param exchange
     * @return the current principal
     * @throws IllegalArgumentException
     * @throws ResponseStatusException 401 if not logged in, 409 if logged in but not an oauth2 session
     */
    @NonNull
    private Mono<OAuth2AuthenticationToken> getOauth2PrincipalOrThrow(@NonNull ServerWebExchange exchange) {
        assertArgsNotNullAndNotBlankOrThrow(exchange);

        return exchange.getPrincipal()
            .filter(principal -> principal != null)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED)))
            .filter(principal -> principal instanceof OAuth2AuthenticationToken)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Not an oauth2 session")))
            .cast(OAuth2AuthenticationToken.class);
    }
}
package com.example.backend.config;

import static com.example.backend.helpers.Utils.LOGIN_PATH;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.example.backend.helpers.CustomExceptionFormat;
import com.example.backend.helpers.Utils;

import lombok.extern.log4j.Log4j2;
import reactor.core.publisher.Mono;

/**
 * Handle unauthenticated requests.
 * 
 * @since 0.0.1
 */
@Component
@Log4j2
public class CustomServerAuthenticationEntrypoint extends RedirectServerAuthenticationEntryPoint {

    @Value("${NON_FRONTEND_MAPPING}")
    private String NON_FRONTEND_MAPPING;

    public CustomServerAuthenticationEntrypoint() {
        super(LOGIN_PATH);
    }
    
    @Override
    public Mono<Void> commence(ServerWebExchange exchange, AuthenticationException ex) {
        String path = exchange.getRequest().getPath().value();

        log.trace("commence, path: {}", path);
        // return json response for api calls
        if (path.startsWith("/" + this.NON_FRONTEND_MAPPING)) {
            CustomExceptionFormat responseBody = new CustomExceptionFormat(401);
            responseBody.setPath(path);
            return Utils.writeStringToResponse(exchange.getResponse(), UNAUTHORIZED, responseBody);
        }

        // redirect to login page for frontend calls
        return super.commence(exchange, ex);
    }

}

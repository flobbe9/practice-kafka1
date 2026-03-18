package com.example.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;

import com.example.backend.helpers.CustomExceptionFormat;
import com.example.backend.services.Oauth2Service;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.log4j.Log4j2;
import reactor.core.publisher.Mono;

/**
 * NOTE: rest controllers take priority over gateway routes
 */
@RestController
@RequestMapping("/${NON_FRONTEND_MAPPING}/auth")
@Tag(name = "authentication", description = "Contains auth session related endpoints")
@Log4j2
public class AuthenticationController {

    private static final String PATH_ACCESS_TOKEN = "/access-token";

    @Autowired
    private Oauth2Service oauth2Service;

    /**
     * @param exchange the current server exchange
     * @return the access token of the current oauth2 session
     */
    @PostMapping(value = PATH_ACCESS_TOKEN, produces = MediaType.TEXT_PLAIN_VALUE)
    @Operation(
        operationId = "accessToken",
        summary = "Get the access token of the current oauth session",
        description = "Get the access token of the current oauth session...",
        tags = { "authentication" },
        responses = {
            @ApiResponse(responseCode = "200", description = "Got an access token", content = {
                @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)),
            }),
            @ApiResponse(responseCode = "401", description = "Not logged in", content = {
                @Content(mediaType = "application/json", schema = @Schema(implementation = CustomExceptionFormat.class))
            }),
            @ApiResponse(responseCode = "403", description = "Invalid csrf token", content = {
                @Content(mediaType = "application/json", schema = @Schema(implementation = CustomExceptionFormat.class))
            })
        }
    )
    public Mono<String> accessToken(ServerWebExchange exchange) {
        return this.oauth2Service.retrieveAccessToken(exchange);
    }
}

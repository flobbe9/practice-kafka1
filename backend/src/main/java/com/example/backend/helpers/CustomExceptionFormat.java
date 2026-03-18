package com.example.backend.helpers;

import java.time.LocalDateTime;

import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


/**
 * Class defining the exception format this api returns when catching any Exception.
 * 
 * @since 0.0.1
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CustomExceptionFormat {

    @Schema(
        example = "2026-03-18 15:00:00.00000",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NonNull
    private String timestamp;

    @Schema(
        example = "200",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private int statusCode;

    @Schema(
        description = "Might be an empty string or null", 
        example = "OK",
        requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    @Nullable
    private String message;

    @Schema(
        description = "Relative path of the request which caused the error",
        example = "/login",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Nullable
    private String path;

    
    public CustomExceptionFormat(int statusCode) {
        this.timestamp = Utils.formatLocalDateTimeDefault(LocalDateTime.now());
        this.statusCode = statusCode;
        this.message = HttpStatus.valueOf(statusCode).getReasonPhrase();
        this.path = Utils.getReqeustPath();             
    }

    public CustomExceptionFormat(int statusCode, String message) {
        this.timestamp = Utils.formatLocalDateTimeDefault(LocalDateTime.now());
        this.statusCode = statusCode;
        this.message = message;
        this.path = Utils.getReqeustPath();             
    }
}
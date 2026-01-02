package com.example.backend.helpers;

import java.time.LocalDateTime;

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

    private String timestamp;

    private int statusCode;

    private String message;

    private String path;

    
    public CustomExceptionFormat(int statusCode, String message) {

        this.timestamp = Utils.formatLocalDateTimeDefault(LocalDateTime.now());
        this.statusCode = statusCode;
        this.message = message;
        this.path = Utils.getReqeustPath();             
    }
}
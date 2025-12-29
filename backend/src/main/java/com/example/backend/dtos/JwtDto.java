package com.example.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class JwtDto {
    private String iss;

    private String sub;

    private String aud;

    /** Time in ms */
    private long iat;

    /** Time in ms */
    private long exp;

    private String azp;

    private String scope;

    private String gty;

    private JwtHeaderDto[] headers;


    @AllArgsConstructor
    @Getter
    public static class JwtHeaderDto {
        private String alg;

        private String typ;

        private String kid;
    }
}

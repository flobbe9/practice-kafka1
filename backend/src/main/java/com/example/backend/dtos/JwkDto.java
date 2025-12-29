package com.example.backend.dtos;

import static com.example.backend.helpers.Utils.assertArgsNotNullAndNotBlankOrThrow;

import java.util.ArrayList;
import java.util.List;

import org.jspecify.annotations.NonNull;

import com.example.backend.helpers.Utils;
import com.fasterxml.jackson.core.JsonProcessingException;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class JwkDto {
        
    private String kty;
    
    private String alg;
    
    private String kid;

    private String use;
    
    private String n;

    /** Public exponent */
    @NonNull
    private String e;


    public String json() throws JsonProcessingException, IllegalArgumentException {
        assertArgsNotNullAndNotBlankOrThrow(this.kty, this.alg, this.kid, this.n, this.e);

        return Utils.getDefaultObjectMapper().writeValueAsString(this);
    }

    
    @AllArgsConstructor
    @Getter
    public static class JwkSetDto {
        
        private List<JwkDto> keys;

        
        public String json() throws JsonProcessingException, IllegalArgumentException {
            if (this.keys == null)
                this.keys = new ArrayList<>();

            return Utils.getDefaultObjectMapper().writeValueAsString(this);
        }
    }
}

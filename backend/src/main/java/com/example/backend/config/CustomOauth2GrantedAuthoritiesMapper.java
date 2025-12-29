package com.example.backend.config;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.stereotype.Component;

import lombok.extern.log4j.Log4j2;


/**
 * Maps {@link AppUserRole}s as spring authorities to oauth2 users instead of using the default ones.
 * 
 * @since 0.0.2
 */
@Component
@Log4j2
public class CustomOauth2GrantedAuthoritiesMapper implements GrantedAuthoritiesMapper {
    
    // @Autowired
    // private AppUserService appUserService;


    @Override
    public Collection<? extends GrantedAuthority> mapAuthorities(Collection<? extends GrantedAuthority> authorities) {

        return new HashSet<>(Set.of(new SimpleGrantedAuthority("ROLE_USER")));
    }
}
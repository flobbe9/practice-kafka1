package com.example.backend.config;

import static com.example.backend.helpers.Utils.LOGIN_PATH;
import static com.example.backend.helpers.Utils.LOGOUT_PATH;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientProvider;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientProviderBuilder;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultReactiveOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizedClientRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher.MatchResult;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import jakarta.annotation.PostConstruct;
import lombok.extern.log4j.Log4j2;


/**
 * @since 0.0.1
 */
@Configuration
@EnableWebFluxSecurity
@Log4j2
public class SecurityConfig {

    @Value("${FRONTEND_BASE_URL}")
    private String FRONTEND_BASE_URL;

    @Value("${ENV}")
    private String ENV;
    
    @Value("${NON_FRONTEND_MAPPING}")
    private String NON_FRONTEND_MAPPING;

    @Autowired
    private CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler;
    // @Autowired
    // private CustomAuthenticationFailureHandler customAuthenticationFailureHandler;
    @Autowired
    private CustomServerAuthenticationEntrypoint customServerAuthenticationEntrypoint;


    @PostConstruct
    void init() {
        log.info("Configuring api security...");
    }

    /**
     * NOTE: RequestMatchers dont override each other. That's why order of calls matters.
     * 
     * @param http
     * @return
     * @throws Exception
     */
    @Bean
    SecurityWebFilterChain filterChain(ServerHttpSecurity http) throws Exception {
        if ("development".equals(this.ENV))
            http.csrf(csrf -> csrf.disable());
        
        else
            http.csrf(csrf -> csrf
                // store csrf token as cookie and make it accessible to client side script
                .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse()) 
                .csrfTokenRequestHandler((exchange, csrfToken) -> {
                    csrfToken.subscribe(); // make spring actually load the csrf token
                })
            );

        if ("development".equals(this.ENV))
            http.
                authorizeExchange(exchange -> exchange
                    .pathMatchers(getPermittedRoutes())
                        .permitAll()
                    .pathMatchers(getSwaggerPaths())
                        .permitAll()
                    .pathMatchers("/" + this.NON_FRONTEND_MAPPING + "/**")
                        .authenticated()
                    .anyExchange()
                        .permitAll()
                );
        else
            http.authorizeExchange(request -> request
                .pathMatchers(getPermittedRoutes())
                    .permitAll()
                .pathMatchers(getSwaggerPaths())
                    .permitAll()
                .matchers((exchange) -> {
                    ServerHttpRequest req = exchange.getRequest();
                    String path = req.getPath().value();
                    String resourceFileRegex = ".*(.js|.jsx|.ts|.tsx|.css|.html|.htm|.php|.jpg|.jpeg|.png|.webp|.svg|.txt|.ttf|.otf|.woff|.woff2).*";

                    boolean isMatch = path.matches(resourceFileRegex);
                    log.trace("match path {}, {}", path, isMatch);

                    return isMatch ? MatchResult.match() : MatchResult.notMatch();
                })
                    .permitAll()
                .anyExchange()
                    .authenticated()
            );

        http.oauth2Login(oauth2login -> oauth2login
            // prevents spring from generating a html template for login and logout page
            .loginPage(LOGIN_PATH) 
            .authenticationSuccessHandler(this.customAuthenticationSuccessHandler)
            // TODO: when does this even happen?
            // .authenticationFailureHandler(this.customAuthenticationFailureHandler)
        );

        http.exceptionHandling(exceptionHandler -> exceptionHandler
            .authenticationEntryPoint(this.customServerAuthenticationEntrypoint)
        );

        http.cors(cors -> cors
            .configurationSource(corsConfig()));

        return http.build();
    }

    /**
     * Defines how the authorized client manager makes requests to idp (?).<p>
     * 
     * Can be used to retrieve an access token while automatically renewing it with the refresh-token.
     */
    @Bean
    ReactiveOAuth2AuthorizedClientManager authorizedClientManager(ReactiveClientRegistrationRepository clientRegistrationRepository, ServerOAuth2AuthorizedClientRepository authorizedClientRepository) {
        // Provider that handles refresh token grant
        ReactiveOAuth2AuthorizedClientProvider authorizedClientProvider = ReactiveOAuth2AuthorizedClientProviderBuilder.builder()
            .authorizationCode()
            .refreshToken()
            .build();
        
        DefaultReactiveOAuth2AuthorizedClientManager manager = new DefaultReactiveOAuth2AuthorizedClientManager(clientRegistrationRepository, authorizedClientRepository);
        manager.setAuthorizedClientProvider(authorizedClientProvider);

        return manager;
    }

    /**
     * Application level cors config.<p>
     * 
     * Used in filter chain: <p>
     * {@code http.cors(cors -> cors.configurationSource(corsConfig()))}
     * 
     * @return
     */
    private CorsConfigurationSource corsConfig() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(this.FRONTEND_BASE_URL));
        configuration.setAllowedMethods(List.of("GET", "POST", "UPDATE", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * @return array of paths that a user should be able to access without having a valid session, e.g. "/api/userService/register"
     */
    private String[] getPermittedRoutes() {
        return new String[] {
            LOGIN_PATH,
            LOGOUT_PATH
        };
    }

    /**
     * Array of paths swagger uses. Assuming that no paths have been changed in properties file.
     * 
     * @return fixed size array of paths swagger uses
     */
    private String[] getSwaggerPaths() {
        return new String[] {
            "/" + this.NON_FRONTEND_MAPPING + "/swagger-ui.html",
            "/" + this.NON_FRONTEND_MAPPING + "/swagger-ui/**",
            "/" + this.NON_FRONTEND_MAPPING + "/v3/api-docs/**",
            "/" + this.NON_FRONTEND_MAPPING + "/configuration/ui",
            "/" + this.NON_FRONTEND_MAPPING + "/swagger-resources/**",
            "/" + this.NON_FRONTEND_MAPPING + "/configuration/security",
            "/" + this.NON_FRONTEND_MAPPING + "/webjars/**"
        };
    }
}
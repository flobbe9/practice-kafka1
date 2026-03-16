package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.config.WebFluxConfigurer;

import lombok.extern.log4j.Log4j2;


/**
 * Config for routing of all APIs.
 * 
 * @since 0.0.1
 */
@Configuration
@EnableWebFlux
@Log4j2
public class RouterConfig implements WebFluxConfigurer {

    @Value("${BASE_URL}")
    private String BASE_URL;

    @Value("${KAFKA_BASE_URL}")
    private String KAFKA_BASE_URL;
    @Value("${KAFKA_MAPPING}")
    private String KAFKA_MAPPING;

    @Value("${FRONTEND_BASE_URL}")
    private String FRONTEND_BASE_URL;


    /**
     * Handles routing of word light.<p>
     * 
     * @param builder
     * @return
     */
    @Bean
    RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("kafka", route -> route
                .path("/" + this.KAFKA_MAPPING + "/**")
                .filters(filter -> filter
                    .filter((exchange, chain) -> {
                        log.trace("Route to kafka service, request path: {}", exchange.getRequest().getPath());
                        return chain.filter(exchange);
                    })
                    .tokenRelay()
                )
                .uri(this.KAFKA_BASE_URL))

            .route("frontend", route -> route
                .path("/**")
                .filters(filter -> filter
                    .filter((exchange, chain) -> {
                        log.trace("Route to frontend service, request path: {}", exchange.getRequest().getPath());
                        return chain.filter(exchange);
                    })
                )
                .uri(this.FRONTEND_BASE_URL))
            .build();
    }
}
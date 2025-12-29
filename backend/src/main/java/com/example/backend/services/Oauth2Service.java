package com.example.backend.services;

import java.util.List;
import java.util.Map;

// import org.hibernate.grammars.hql.HqlParser.SecondContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

// import com.example.backend.abstracts.AppUserRole;
import com.example.backend.helpers.Utils;

import jakarta.annotation.Nullable;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;


/**
 * NOTE: dont inject {@code AppUserService} to prevent cycle. Don't make this session scoped, use {@code Oauth2ServiceProxy} for that.
 * 
 * @since 0.0.1
 */
@Service
public class Oauth2Service {
            
    @Autowired
    private OAuth2AuthorizedClientRepository oAuth2AuthorizedClientRepository;

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    @Value("${BASE_URL_DOCKER}")
    private String BASE_URL_DOCKER;


    @Autowired
    @Getter
    private Oauth2ServiceProxy oauth2ServiceProxy;
    

    public boolean isPrincipalGithubUser(@Nullable Object principal) {
        return isOauth2Session(principal) &&
               ((DefaultOAuth2User) principal).getAttributes().containsKey("gists_url");
    }

    /**
     * Indicates whether the current session has been created using oauth2 (e.g. login with google)
     * 
     * @param principal from current security context
     * @return 
     */
    public boolean isOauth2Session(@Nullable Object principal) {
        return principal != null && principal instanceof DefaultOAuth2User;
    }
    
    /**
     * Indicates whether the current session has been created using oauth2 (e.g. login with google)
     * 
     * @return 
     */
    public boolean isOauth2Session() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return isOauth2Session(principal);

        // propably no authentication obj in context yet, may happen on application startup
        } catch (NullPointerException e) {
            return false;
        }
    }

    /**
     * Indicates whether the given defaultOauth2User is missing an email value.
     * 
     * @param defaultOauth2User from current security context
     * @return
     */
    public boolean isOauth2UserMissingEmail(@Nullable DefaultOAuth2User defaultOauth2User) {
        return defaultOauth2User != null && Utils.isBlank(defaultOauth2User.getAttribute("email"));
    }

    /**
     * Get the access token of the current oauth2 session. Don't call this asynchronously as the current request is needed.
     * 
     * @param clientRegistrationId the name of the oauth2 provider as specified in "application.yml" under {@code spring.security.oauth2.client.registration.[clientRegistrationId]}. E.g. "google"
     * @return the access token of the current oauth2 session that is beeing retrieved after successful login
     * @throws IllegalArgumentException
     * @throws ResponseStatusException 401 if not logged in, 409 if logged in but {@code clientRegistrationId} does not match current oauth2 provider 
     */
    public String getCurrentOAuth2AccessToken(String clientRegistrationId) {
        if (Utils.isBlank(clientRegistrationId))
            throw new IllegalArgumentException("Failed to get current oauth2 access token. 'clientRegistrationId' cannot be blank");
        
        HttpServletRequest servletRequest = Utils.getCurrentRequest();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // case: not logged in
        if (authentication == null)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);

        // case: not logged in with oauth2
        if (this.oAuth2AuthorizedClientRepository == null)
            return null;

        OAuth2AuthorizedClient oAuth2AuthorizedClient = this.oAuth2AuthorizedClientRepository.loadAuthorizedClient(clientRegistrationId, authentication, servletRequest);
        
        // case: given client registration id does not match oauth2 provider
        if (oAuth2AuthorizedClient == null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Failed to get current oauth2 access token. Client registration id '" + clientRegistrationId + "' does not match current oauth2 provider");

        return oAuth2AuthorizedClient.getAccessToken().getTokenValue();
    }
        

    /**
     * Fetch github email user info for current session and if present, retrieve the email user info for 
     * the primary email address.
     * 
     * @return a email user info map (never {@code null}). Map keys are: <p>
     *         {@code String email, Boolean primary, Boolean verified, String visibility}
     * @throws ResponseStatusException 406 if response is formatted unexcpectedly or 'primary' value is never equal to {@code true}
     */
    public Map<String, Object> fetchPrimaryGithubEmailUserInfo() {

        return fetchGithubEmailsUserInfo()
            .stream()
            .filter(emailUserInfo -> {
                Object isPrimaryEmailUserInfo = emailUserInfo.get("primary");
                return isPrimaryEmailUserInfo != null && ((Boolean) isPrimaryEmailUserInfo);
            })
            .findAny()
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_ACCEPTABLE,
                    "Failed to retrieve primary github email user info. No 'primary' entry found"));
    }
    

    /**
     * Fetches emails of current github user. Needs a valid github session. 
     * 
     * @return a list of email wrappers of current user. Map keys are: <p>
     *         {@code String email, Boolean primary, Boolean verified, String visibility}
     * @throws ResponseStatusException 401 if not logged in, 500 if the session is not a github session
     * @throws IllegalStateException 
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchGithubEmailsUserInfo() {
        String oauth2AccessToken = getCurrentOAuth2AccessToken(Utils.OAUTH2_CLIENT_REGISTRATION_ID_GITHUB);

        return RestClient.create()
            .get()
            .uri("https://api.github.com/user/emails")
            .header("Authorization", "token " + oauth2AccessToken)
            .retrieve()
            .body(List.class);
    }

    public ClientRegistration getCurrentClientRegistration() {
        // TODO: null checks, rigstration id check
        OAuth2AuthenticationToken token = ((OAuth2AuthenticationToken) SecurityContextHolder.getContext().getAuthentication());
        return this.clientRegistrationRepository.findByRegistrationId(token.getAuthorizedClientRegistrationId());
    }

    @Bean
    WellKnownDto WellKnownDto() {
        return new WellKnownDto(
            this.BASE_URL_DOCKER,
            this.BASE_URL_DOCKER + "/.well-known/jwks",
            new String[] {"public"},
            new String[] {"id_token", "client-credentials"},
            new String[] {"sub", "iss", "exp", "iat", "aud", "azp", "gty", "iat"},
            this.BASE_URL_DOCKER + "/jwt",
            new String[] {"openid"},
            new String[] {"RS256"}
        );
    }

    @Getter
    @AllArgsConstructor
    public static class WellKnownDto {
        private String issuer;

        private String jwks_uri;

        private String[] subject_types_supported;

        private String[] response_types_supported;

        private String[] claims_supported;

        private String token_endpoint;

        private String[] scopes_supported;

        private String[] id_token_signing_alg_values_supported;
    }
}
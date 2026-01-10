import { RedpandaAuthConfig } from "./RedpandaAuthConfig";

/**
 * Extension to `RedpandaAuthConfig` for an authorization method which retrieves it's auth header value through some sort of promise.
 * 
 * @since 0.0.1
 */
export abstract class RedpandaRefetchableAuthConfig extends RedpandaAuthConfig {
    /**
     * Should refresh the auth header value if possible, such that `getAuthoriaztioniheaderValue()` will return an updated value.
     */
    public abstract refetchAuthorizationHeaderValue(): Promise<void>;
}
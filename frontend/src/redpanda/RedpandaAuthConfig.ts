/**
 * Provide auth configuration necessary to send http requests to redpanda.
 * 
 * @since 0.0.1
 */
export abstract class RedpandaAuthConfig {
    /**
     * Refetch the header value if falsy.
     * 
     * @return the `Authorization` header value for redpanda http requests (excluding the header key, so e.g. `Bearer dGVzdA==`
     * or `Basic dGVzdA==`)
     */
    public abstract getAuthorizationHeaderValue(): Promise<string>;
}
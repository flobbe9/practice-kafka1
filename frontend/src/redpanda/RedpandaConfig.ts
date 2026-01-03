import type { RedpandaAuthConfig } from "./RedpandaAuthConfig";

/**
 * Basic configuration for one redpanda instance.
 * 
 * @sinc 0.0.1
 */
export interface RedpandaConfig {
    /** Absolute base url of the redpanda proxy rest api. */
    baseUrl: string;

    /** 
     * The fallback timeout (ms) for kafka to wait before responding with an empty response to the consumer. 
     * 
     * Default is 1000
     */
    requestTimeout?: number;

    /**
     * Time (in ms) of inactivity after which a consumer is deleted automatically
     * 
     * Default is `REDPANDA_DEFAULT_CONSUMER_LIFE_TIME`
     */
    consumerInstanceTimeout?: number;

    /**
     * For authenticating with the redpanda `host`.
     */
    authConfig: RedpandaAuthConfig;
}
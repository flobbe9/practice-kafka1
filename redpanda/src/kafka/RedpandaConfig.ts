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
     * For authenticating with the redpanda `host`.
     */
    authConfig: RedpandaAuthConfig;
}
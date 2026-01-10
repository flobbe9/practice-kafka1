import { base64Encode } from "@/utils/projectUtils";
import { assertStrictlyFalsyAndThrow } from "@/utils/utils";
import { RedpandaAuthConfig } from "./RedpandaAuthConfig";

/**
 * For using basic auth with plain username and password for redpanda http requests.
 * 
 * @since 0.0.1
 */
export class RedpandaBasicAuthConfig extends RedpandaAuthConfig {
    
    /** The base64 encoded credentials, exluding the `"Basic"` phrase. */
    private base64Credentials: string;

    /**
     * See also `getInstance(username, password)`.
     */
    constructor(base64Credentials: string) {
        super();

        this.base64Credentials = base64Credentials;
    }

    /**
     * @param username 
     * @param password 
     * @returns base64 encoded string of `username:password`
     */
    public static getInstance(username: string, password: string): RedpandaBasicAuthConfig {
        assertStrictlyFalsyAndThrow(username, password);

        return new RedpandaBasicAuthConfig(base64Encode(`${username}:${password}`));
    }
    
    public getAuthorizationHeaderValue(): Promise<string> {
        return Promise.resolve(`Basic ${this.base64Credentials}`);
    }
}
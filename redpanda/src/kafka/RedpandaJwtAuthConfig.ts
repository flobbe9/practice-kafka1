import { assertStrictlyFalsyAndThrow } from "@/utils/utils";
import { RedpandaRefetchableAuthConfig } from "./RedpandaRefetchableAuthConfig";

/**
 * Use an jwt bearer token for authorization, e.g. generated from an oidc flow.
 * 
 * @since 0.0.1
 */
export class RedpandaJwtAuthConfig extends RedpandaRefetchableAuthConfig {
    
    /** The return value of `getJwtBearerToken()`. Used as fallback if present to minimize fetch calls */
    private jwtBearerToken: string;

    /**
     * @return the bearer token which is expected to be an encoded jwt token from the idp configured in redpanda instance
     */
    private getJwtBearerToken: () => Promise<string>;

    constructor(getJwtBearerToken: () => Promise<string>) {
        super();

        assertStrictlyFalsyAndThrow(getJwtBearerToken);
        
        this.getJwtBearerToken = getJwtBearerToken;
        this.jwtBearerToken = ''; // satisfy the compiler
    }

    public async getAuthorizationHeaderValue(): Promise<string> {
        if (!this.jwtBearerToken)
            await this.refetchAuthorizationHeaderValue();

        return `Bearer ${this.jwtBearerToken}`;
    }

    public async refetchAuthorizationHeaderValue(): Promise<void> {
        this.jwtBearerToken = await this.getJwtBearerToken();
    }
}
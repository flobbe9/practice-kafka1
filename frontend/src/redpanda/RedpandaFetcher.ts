import { hasOwnIgnoreCase, trim } from "@/utils/projectUtils";
import { assertStrictlyFalsyAndThrow, getTimeStamp, isHttpStatusCodeAlright, throwApiException } from "@/utils/utils";
import { CustomApiResponseFormat } from "../CustomApiResponseFormat";
import type { RedpandaConfig } from "./RedpandaConfig";

/**
 * Use this class for any fetch request to redpanda: 
 * 
 * ```
 * try {
 *  const responseBody = new RedpandaFetcher(redpandaConfig).fetch(`{yourPath}`);
 * } catch (e) {
 *  const apiResponseFormat = catchApiException(e);
 * }
 * ```
 * 
 * @since 0.0.1
 */
export class RedpandaFetcher {

    private redpandaConfig: RedpandaConfig;

    constructor(redpandaConfig: RedpandaConfig) {
        assertStrictlyFalsyAndThrow(redpandaConfig);

        this.redpandaConfig = redpandaConfig;
    }

    /**
     * Fetch `{redpandaConfig.baseUrl}/{path}`.
     * 
     * @param path may include query params. Does not care about starting or trailing slashes
     * @param fetchConfig 
     * @param refetchAuthIf401 indicates to refresh auth token and refetch if 401 status. Default is `true`
     * @returns json parsed response body 
     * @throws api response format, parsing redpanda error codes to http status codes. Use `catchApiException(e)` inside `catch` clause
     * 
     * May also throw a normal Error if an arg is strcitly falsy or for unhandled errors.
     */
    public async fetch(path: string, fetchConfig: RequestInit = {}, refetchAuthIf401 = true): Promise<any> {
        assertStrictlyFalsyAndThrow(path);

        // add auth headers
        fetchConfig.headers = await this.addFetchHeaders(fetchConfig.headers);
        
        path = trim(path, "/");
        const url = `${this.redpandaConfig.baseUrl}/${path}`;

        let response: Response | null = null;
        try {
            response = await globalThis.fetch(url, fetchConfig);

        // case: failed to fetch (503)
        } catch (e) {
            const error = e as Error;
            throwApiException({
                statusCode: 503,
                message: error.message,
                path: `/${path}`,
                timestamp: getTimeStamp()
            });
        }

        // try to get json body
        let responseBody = null;
        try {
            responseBody = await response.json();

        } catch (e) {
            responseBody = {
                statusCode: response.status,
                message: response.statusText,
                path: `/${path}`,
                timestamp: getTimeStamp()
            } as CustomApiResponseFormat
        }

        // case: bad status code
        if (!isHttpStatusCodeAlright(response.status)) {
            // case: auth token might be expired, refresh, then try again once
            if (response.status === 401 && refetchAuthIf401) {
                await this.redpandaConfig.authConfig.refetchAuthorizationHeaderValue();
                return this.fetch(path, fetchConfig, false);
            } 

            throwApiException({
                ...this.parseRedpandaErrorResponse(responseBody),
                path: `/${path}`
            });
        }
        
        return responseBody;
    }

    /**
     * @param responseBody error response body, expected to be parsed to json already
     * @returns api response format or throws
     */
    private parseRedpandaErrorResponse(responseBody: any): CustomApiResponseFormat | never {
        if (!this.isRedpandaErrorResponse(responseBody))
            throw new Error(`Unexpected redpanda error response format ${responseBody}`);

        const redpandaErrorCode = responseBody["code"] ?? responseBody["error_code"];
        return {
            statusCode: this.redpandaErrorCodeToHttpStatusCode(redpandaErrorCode),
            message: `${responseBody["message"]} (${redpandaErrorCode})`,
            timestamp: getTimeStamp()
        }
    }

    /**
     * Redpanda error codes are either 3 or 5 digits long where the first 3 digits will always represent the http status code.
     * E.g. `40101 = 401` or `40903 = 409`.
     * 
     * @param errorCode from an redpanda error response
     * @returns http status code or throws
     */
    private redpandaErrorCodeToHttpStatusCode(errorCode: number): number | never {
        assertStrictlyFalsyAndThrow(errorCode);

        const errorCodeDigits = String(errorCode).length;

        // case: already a clean http status code
        if (errorCodeDigits === 3)
            return errorCode;

        // case: got the expected 5 digits, only return the first 3
        if (errorCodeDigits === 5) 
            return Math.floor(errorCode / 100);

        // case: unexpected format
        throw new Error(`Unexpected redpanda errorCode format: ${errorCode}. Expected 3 or 5 digits`);
    }

    private isRedpandaErrorResponse(responseBody: any): boolean {
        return !!responseBody && 
            (Object.hasOwn(responseBody, "code") || Object.hasOwn(responseBody, "error_code")) &&
            Object.hasOwn(responseBody, "message");
    }

    /**
     * Add mandatory request headers to `existingFetchHeaders`. Will not override or replace headers.
     * 
     * @param existingFetchHeaders mandatory headers will be added to
     * @return modified `existingFetchHeaders`
     */
    private async addFetchHeaders(existingFetchHeaders: HeadersInit = {}): Promise<HeadersInit> {
        if (!hasOwnIgnoreCase(existingFetchHeaders, "Authorization")) {
            const authorizationHeaderValue = await this.redpandaConfig.authConfig.getAuthorizationHeaderValue();
            Object.assign(existingFetchHeaders, {"Authorization": authorizationHeaderValue});
        }

        return existingFetchHeaders;
    }
}
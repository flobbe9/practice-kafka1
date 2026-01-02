/**
 * @since 0.0.1
 */
export interface CustomApiResponseFormat {
    /** Http status */
    statusCode: number;

    timestamp?: string;

    message?: string;

    /** Of the http request */
    path?: string;
}

export function isCustomApiResponseFormat(customApiReresponseFormat: CustomApiResponseFormat): customApiReresponseFormat is CustomApiResponseFormat {
    return !!customApiReresponseFormat &&
        Object.hasOwn(customApiReresponseFormat, "statusCode");
}
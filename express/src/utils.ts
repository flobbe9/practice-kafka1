/**
 * @param statusCode http status code to check
 * @returns true if status code is informational (1xx), successful (2xx) or redirectional (3xx), else false
 */
export function isHttpStatusCodeAlright(statusCode: number): boolean {
    return statusCode <= 399;
}
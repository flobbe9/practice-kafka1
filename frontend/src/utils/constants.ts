export const MEDIA_TYPE_KAFKA_JSON = "application/vnd.kafka.v2+json";
export const MEDIA_TYPE_KAFKA_JSON_JSON = "application/vnd.kafka.json.v2+json";
export const MEDIA_TYPE_KAFKA_BINARY_JSON = "application/vnd.kafka.binary.v2+json";

/** In ms */
export const REDPANDA_DEFAULT_REQUEST_TIMEOUT = 1000;
/** In ms. Time of inactivity after which a consumer is automatically deleted */
export const REDPANDA_DEFAULT_CONSUMER_LIFE_TIME = 300_000;
export const REDPANDA_ERROR_CODES_HTTP_STATUS_MAPPING = {
    40101: 401, // invalid auth or missing
    40902: 409 // duplicate consumer
}

/** 
 * Seconds after which to retry a fetch request which has failed with status 503, 429 or 301
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After
 */
export const DEFAULT_FETCH_RETRY_AFTER = 2;
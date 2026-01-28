export const MEDIA_TYPE_KAFKA_JSON = "application/vnd.kafka.v2+json";
export const MEDIA_TYPE_KAFKA_JSON_JSON = "application/vnd.kafka.json.v2+json";
export const MEDIA_TYPE_KAFKA_BINARY_JSON = "application/vnd.kafka.binary.v2+json";

/** In ms */
export const REDPANDA_DEFAULT_REQUEST_TIMEOUT = 1000;
/** In ms. Time of inactivity after which a consumer is automatically deleted */
export const REDPANDA_DEFAULT_CONSUMER_LIFE_TIME = 300_000;
/** 
 * In ms. Time after which a consumer is beeing "removed" from their group. Notice that the consumer will 
 * still exist.
 * 
 * @see https://kafka.apache.org/34/configuration/consumer-configs/#consumerconfigs_session.timeout.ms
 */
export const REDPANDA_DEFAULT_CONSUMER_SESSION_TIMEOUT = 45_000;


export const AUTHORIIZATION_HEADER_KEY = "Authorization";
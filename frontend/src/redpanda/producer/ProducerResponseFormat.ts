import { ProducerOffsetFormat } from "./ProducerOffsetFormat";

/**
 * The json response expected from a producer request (successful or not).
 * 
 * @since 0.0.1 
 */
export interface ProducerResponseFormat {
    /** 
     * Not sure how the reponse is formatted exactly. Will return at least one offset for each partition, 
     * either with or without an `error_code` prop, where not having that prop indicates that the record was 
     * produced successfully.
     */
    offsets: ProducerOffsetFormat[]
}

export function isProducerResponseFormat(responseFormat: object): responseFormat is ProducerResponseFormat {
    return !!responseFormat && Object.hasOwn(responseFormat, "offsets");
}

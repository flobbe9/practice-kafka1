import { ProducerOffsetFormat } from "./ProducerOffsetFormat";

/**
 * The json response expected from a producer request (successful or not).
 * 
 * @since 0.0.1 
 */
export interface ProducerResponseFormat {
    /** 
     * Will return at least one offset for each partition, 
     */
    offsets: ProducerOffsetFormat[]
}

export function isProducerResponseFormat(responseFormat: object): responseFormat is ProducerResponseFormat {
    return !!responseFormat && Object.hasOwn(responseFormat, "offsets");
}

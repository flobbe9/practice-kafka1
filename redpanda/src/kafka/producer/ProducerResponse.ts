import { ProducerOffsetFormat } from "./ProducerOffsetFormat";
import { ProducerResponseFormat } from "./ProducerResponseFormat";

/**
 * Should always specify at least one offset.
 * 
 * @since 0.0.1
 */
export interface ProducerResponse extends ProducerResponseFormat {
    /** 
     * Contains one offset for the last successfully produced record and one for the
     * last unsuccessfullly produced record. 
     */
    offsets: ProducerOffsetFormat[],
    
    /**
     * `true` if at least one recored could not be produced.
     */
    hasErrors: boolean
}

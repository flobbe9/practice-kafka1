/**
 * Returned by a producer request. Describes one single record.
 * 
 * @since 0.0.1
 */
export interface ProducerOffsetFormat {
    /** 0-based. The partition number the record was (supposed to be) produced on. */
    partition: number;

    /**
     * 0-based. The position (index) of the produced record on the partion. 
     * Will be -1 if the record could not be produced. 
     */
    offset: number;

    /**
     * Present only when the record could not be produced. 
     * Error code description: https://github.com/redpanda-data/redpanda/blob/dev/src/v/kafka/protocol/errors.h
     */
    error_code?: number;
}   
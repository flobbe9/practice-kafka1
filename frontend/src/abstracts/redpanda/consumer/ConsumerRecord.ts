import { RedpandaRecordKeyValue } from "../RedpandaRecordKeyValueType";

/**
 * Describes a http response object returned when consuming a topic's records.
 * 
 * @since 0.0.1
 */
export interface ConsumerRecord {
    topic: string;

    /** See `RedpandaRecordKeyValueFormat` */
    key: RedpandaRecordKeyValue;

    /** See `RedpandaRecordKeyValueFormat` */
    value: RedpandaRecordKeyValue;

    /** 0-based number of the partition this record is stored on */
    partition: number;

    /** 0-based position of this record amongst the other records on the same partition. */
    offset: number;
}
import { RedpandaRecordKeyValueType } from "@/redpanda/RedpandaRecordKeyValueType";

interface AbstractConsumerRecord {
    topic: string;

    /** 0-based number of the partition this record is stored on */
    partition: number;

    /** 
     * 0-based position of this record amongst the other records on the same partition. 
     */
    offset: number;
}

/**
 * Describes a parsed http response or request object for consuming / producing a topic's records.
 * 
 * @since 0.0.1
 */
export interface ConsumerRecord extends AbstractConsumerRecord {
    /** 
     * See also `RedpandaRecordKeyValueFormat`
     * 
     * Not unique
     */
    key: RedpandaRecordKeyValueType;

    /** See also `RedpandaRecordKeyValueFormat` */
    value: RedpandaRecordKeyValueType;
}

/**
 * Describes a http response object returned when consuming a topic's records.
 * 
 * @since 0.0.1
 */
export interface ConsumerRecordResponseFormat extends AbstractConsumerRecord {
    /** 
     * See also `RedpandaRecordKeyValueFormat` 
     * 
     * Not unique
     */
    key: string | null;

    /** See also `RedpandaRecordKeyValueFormat` */
    value: string | null;
}
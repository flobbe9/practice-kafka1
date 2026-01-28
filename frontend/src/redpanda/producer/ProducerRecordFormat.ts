import { RedpandaRecordKeyValueType } from "../RedpandaRecordKeyValueType";

/**
 * Single record passed to the producer request body.
 * 
 * @since 0.0.1
 */
export interface ProducerRecordFormat {
    key: RedpandaRecordKeyValueType;

    value: RedpandaRecordKeyValueType;

    /** 0-based. The partition to save this record on. Omit this field to let redpanda decide */
    partition?: number
}

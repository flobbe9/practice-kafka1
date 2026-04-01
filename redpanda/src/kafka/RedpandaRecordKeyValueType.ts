/**
 * Possible formats of a record's key / value.
 * 
 * @since 0.0.1
 */
export type RedpandaRecordKeyValueFormat = "json" | "txt" | "base64" | null;

/**
 * Ts type of a record's key / value. 
 * 
 * @since 0.0.1
 * @see {@link RedpandaRecordKeyValueFormat}
 */
export type RedpandaRecordKeyValueType = any[] | Record<string, any> | string | null;
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
 */
export type RedpandaRecordKeyValue = Record<string, any> | string;
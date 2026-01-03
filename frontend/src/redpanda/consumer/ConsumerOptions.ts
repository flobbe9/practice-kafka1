/**
 * For configuring the consumption http request.
 * 
 * Name props exactly like their url query param names.
 * 
 * @since 0.0.1
 */
export interface ConsumerOptions {
    /** 
     * The time (in ms) kafaka is supposed to wait while consuming records before returning an empty response. 
     * 
     * Default is 1000
     */
    timeout?: number;

    /**
     * For restricting the size of the consumption response. The response may exceed this limit if one single record
     * is larger than `max_bytes`.
     * 
     * Default is `undefined` meaning unlimited bytes.
     */
    max_bytes?: number;
}
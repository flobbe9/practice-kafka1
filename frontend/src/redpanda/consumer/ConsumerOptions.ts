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
     * Default is `REDPANDA_DEFAULT_REQUEST_TIMEOUT`
     */
    timeout?: number;

    /**
     * For restricting the size of the response. The response size may exceed this limit to return at least one record
     * (and I think there should be a min_bytes value somewhere).
     * 
     * -1 will as well as `undefined` mean unlimited bytes.
     * 
     * Default is `-1`
     */
    max_bytes?: number;

    /**
     * Whether the `consume` function should return the plain json response instead of parsing the "key" and "value"
     * values of each record.
     * 
     * Default is `false`
     */
    dontDecodeKeyValues?: boolean;
}
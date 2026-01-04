import { ConsumerRecordResponseFormat } from "./ConsumerRecord";

/**
 * The redapnda response body format for consuming records.
 * 
 * @since 0.0.1
 */
export interface ConsumerResponseFormat {
    records: ConsumerRecordResponseFormat[]
}
import { ProducerRecordFormat } from "./ProducerRecordFormat";

/**
 * Request body for producer request.
 * 
 * @since 0.0.1
 */
export interface ProducerRecordsFormat {
    records: ProducerRecordFormat[];
}
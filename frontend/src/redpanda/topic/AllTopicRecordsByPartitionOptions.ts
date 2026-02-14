import { ConsumerOptions } from "../consumer/ConsumerOptions";

/**
 * Fetch options for fetching all records from one topic by partition. 
 * 
 * @see `Topic.allRecordsByPartition`
 * @since 0.0.1
 */
export interface AllTopicRecordsByPartitionOptions extends ConsumerOptions {
    /**
     * 0-based. The record position to start from. 
     * 
     * Default is 0
     */
    offset?: number;
}
/**
 * @since 0.0.1
 */
export interface RedpandaOffsetRequestBody {
    topic: string;

    /** 0-based */
    partition: number;
}
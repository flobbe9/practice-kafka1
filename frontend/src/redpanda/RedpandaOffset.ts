/**
 * Not sure what these do exactly...
 * 
 * @since 0.0.1
 */
export interface RedapndaOffset {
    topic: string;

    /** 0-based. The partition number this offset is associated with */
    partition: number;

    /** 0-based. Will be -1 if `partition` does not exist. */
    offset: number;

    /** Blank if no metadata */
    metadata: string;
}
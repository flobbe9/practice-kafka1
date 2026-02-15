import { MEDIA_TYPE_KAFKA_BINARY_JSON, MEDIA_TYPE_KAFKA_JSON, REDPANDA_DEFAULT_REQUEST_TIMEOUT, TOPIC_REGEX } from "@/utils/constants";
import { regexToString } from "@/utils/projectUtils";
import { assertStrictlyFalsyAndThrow, catchApiException, randomString } from "@/utils/utils";
import { Consumer } from "../consumer/Consumer";
import { ConsumerOptions } from "../consumer/ConsumerOptions";
import { ConsumerRecord } from "../consumer/ConsumerRecord";
import { RedpandaConfig } from "../RedpandaConfig";
import { RedpandaFetcher } from "../RedpandaFetcher";
import { AllTopicRecordsByPartitionOptions } from "./AllTopicRecordsByPartitionOptions";

/**
 * @since 0.0.1
 */
export class Topic {

    private topic: string;

    private redpandaFetcher: RedpandaFetcher;

    private redpandaConfig: RedpandaConfig;

    constructor(topic: string, redpandaConfig: RedpandaConfig,) {
        assertStrictlyFalsyAndThrow(topic, redpandaConfig);
        Topic.assertTopicRegexValid(topic);

        this.topic = topic;
        this.redpandaConfig = redpandaConfig;
        this.redpandaFetcher = new RedpandaFetcher(redpandaConfig);
    }

    /**
     * Fetch all records of {@link topic} by creating a temporary consumer and group and then deleting it right after.
     * 
     * @param options consumer options
     * @returns all records of {@link topic}
     * @throws 404 if {@link topic} does not exist
     */
    public async allRecords(options?: ConsumerOptions): Promise<ConsumerRecord[]> {
        const groupName = randomString();
        const consumerName = randomString();

        const consumer = new Consumer([this.topic], groupName, consumerName, this.redpandaConfig)
            .keepAlive(false);
        await consumer.init();

        try {
            return await consumer.consume(options);
            
        } finally {
            try {
                await consumer.delete();

            } catch (e) {
                const apiException = catchApiException(e);
                console.warn("Failed to delete temporary consumer. Consumer will be deleted automatically after a while.", apiException);
            }
        }
    }

    /**
     * Fetches all records for {@link topic} that are located on `partition`. Note that this does not necessarily return a complete list
     * of all records of {@link topic}. See {@link allRecords} for that.
     * 
     * @param partition 0-based. Will throw a 404 error if partition does not exist
     * @param options consumer options
     * @returns all records of `partition`, parsed unless specified otherwise
     * @throws 404 if {@link topic} or `partition` do not exist
     */
    public async allRecordsByPartition(partition: number, options: AllTopicRecordsByPartitionOptions = {}) {
        assertStrictlyFalsyAndThrow(partition);

        const { offset = 0, max_bytes = -1, timeout = REDPANDA_DEFAULT_REQUEST_TIMEOUT, dontDecodeKeyValues } = options;

        const path = `/topics/${this.topic}/partitions/${partition}/records${
        `?offset`}=${offset
        }&max_bytes=${max_bytes
        }&timeout=${timeout}`

        const response = await this.redpandaFetcher.fetch(path, {
            headers: {
                "Accept": MEDIA_TYPE_KAFKA_BINARY_JSON
            }
        });

        if (dontDecodeKeyValues)
            return response;

        return Consumer.parseConsumerResponse(response);
    }

    /**
     * Fetch all topics of the kafka instance. Note that this may include redpanda internal topics.
     * 
     * @param redpandaConfig for creating a {@link RedpandaFetcher}
     * @returns complete list of topic names. Empty array if no topics yet
     */
    public static async allTopics(redpandaConfig: RedpandaConfig): Promise<string[]> {
        assertStrictlyFalsyAndThrow(redpandaConfig);

        const redpandaFetcher = new RedpandaFetcher(redpandaConfig);
        const path = `/topics`;

        return await redpandaFetcher.fetch(path, {
            headers: {
                "Accept": MEDIA_TYPE_KAFKA_JSON
            }
        });
    }

    /**
     * Validate {@link topic} and throw if it's invalid
     * 
     * @param topic to validate
     * @throws if `topic` is invalid
     * @see {@link TOPIC_REGEX}
     */
    public static assertTopicRegexValid(topic: string): void | never {
        if (!topic)
            throw new Error(`topic is falsy: ${topic}`);

        if (topic.match(TOPIC_REGEX) === null)
            throw new Error(`topic '${topic}' has to match pattern: ${regexToString(TOPIC_REGEX)}`)
    }
}
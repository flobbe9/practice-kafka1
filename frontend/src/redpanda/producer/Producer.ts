import { MEDIA_TYPE_KAFKA_JSON_JSON } from "@/utils/constants";
import { assertStrictlyFalsyAndThrow, isBlank } from "@/utils/utils";
import { RedpandaConfig } from "../RedpandaConfig";
import { RedpandaFetcher } from "../RedpandaFetcher";
import { ProducerRecordsFormat } from "./ProducerRecordsFormat";
import { ProducerResponse } from "./ProducerResponse";
import { isProducerResponseFormat, ProducerResponseFormat } from "./ProducerResponseFormat";

/**
 * For producing records for one specific topic.
 * 
 * ``` 
 * const producer = new Producer("myTopic", redpandaConfig);
 * try {
 *      const response = await producer.produce({
 *      records: [
 *          {
 *              key: "foo",
 *              value: "bar"
 *          },
 *          {
 *              key: {name: "John"}
 *              value: {lastName: "Doe"}
 *          }
 *      ]
 *      });
 * 
 *      const hasErrors = !!response.hasErrors; // at least one record could not be produced
 *      const lastSuccessfullyProducedRecords = response.offsets.filter(offset => !Object.has(offset, "error_code"));
 * } catch (e) {
 *      const apiException = catchApiException(e);
 * }
 * ```
 * @since 0.0.1
 */
export class Producer {
    /** The topic to produce records for. */
    private topic: string;
    
    private redpandaFetcher: RedpandaFetcher;


    constructor(topic: string, redpandaConfig: RedpandaConfig) {
        assertStrictlyFalsyAndThrow(topic, redpandaConfig);

        if (isBlank(topic))
            throw new Error(`'topic' cannot be blank`);

        this.topic = topic;
        this.redpandaFetcher = new RedpandaFetcher(redpandaConfig);
    }

    /**
     * Will produce all valid records. Wont throw if one record could not be produced but continue with the next one. All
     * valid records will be produced.
     * 
     * No parsing or modification is done to `records`. The consumer config will decide how to format the record key values.
     * 
     * @param records `records` array may be empty 
     * @returns one offset for each partition. An `error_code` prop indicates that the record could not be produced. `null` if no records were produced and no error was thrown (e.g. when `records` is empty)
     * See {@link ProducerResponseFormat}
     * @throws if response status is not-alright or arg is strictly falsy. 
     * @see https://github.com/redpanda-data/redpanda/blob/dev/src/v/kafka/ for `error_code`s
     */
    public async produce(records: ProducerRecordsFormat): Promise<ProducerResponse | null> {
        assertStrictlyFalsyAndThrow(records);

        if (!records.records?.length)
            return null;

        const path = `/topics/${this.topic}`;

        const response = await this.redpandaFetcher.fetch(path, {
            method: "POST",
            body: JSON.stringify(records),
            headers: {
                "Content-Type": MEDIA_TYPE_KAFKA_JSON_JSON
            }
        });

        if (!isProducerResponseFormat(response))
            throw new Error(`Unexpected producer response format: ${JSON.stringify(response)}.`);

        const hasFaltyRecords = !!response.offsets
            .find(offset => Object.hasOwn(offset, "error_code"));

        return {
            offsets: response.offsets,
            hasErrors: hasFaltyRecords,
        };
    }
}
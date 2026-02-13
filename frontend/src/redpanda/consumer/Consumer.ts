import { type CustomApiResponseFormat } from "@/CustomApiResponseFormat";
import { base64Decode } from "@/utils/projectUtils";
import { assertStrictlyFalsyAndThrow, catchApiException, isStrictlyFalsy } from "@/utils/utils";
import { type RedpandaConfig } from "../RedpandaConfig";
import { RedpandaFetcher } from "../RedpandaFetcher";
import { RedpandaRecordKeyValueType } from "../RedpandaRecordKeyValueType";
import { MEDIA_TYPE_KAFKA_BINARY_JSON, MEDIA_TYPE_KAFKA_JSON, REDPANDA_DEFAULT_CONSUMER_LIFE_TIME, REDPANDA_DEFAULT_CONSUMER_SESSION_TIMEOUT, REDPANDA_DEFAULT_REQUEST_TIMEOUT } from './../../utils/constants';
import { ConsumerOptions } from "./ConsumerOptions";
import { ConsumerRecord, ConsumerRecordResponseFormat } from "./ConsumerRecord";

/**
 * For retrieving ("consuming") kafka records of certain topics.
 * 
 * Records are only consumed once per group. This means that `consume()` will only ever return the latest "unconsumed" records
 * which no other consumer in the same group has seen yet.
 * See `Topic` class in order to consume all records of a topic consistently.
 * 
 * Within a topic records with the same key are stored on the same partition. But within one consumer group there's only ever one consumer per partition. 
 * So in order to have multiple consumers in a group consume the same topic, there'd need to be at least as many partitions as consumers. 
 * If you don't want to be dealing with partitions, simply create every consumer in their own group, this will make sure that every consumer 
 * can consume each record.
 * 
 * ```
 * const consumer = new Consumer(["myTopic", "myOtherTopic"], "groupName", "consumerName", globalConfig);
 * // Optional configuration:
 * consumer
 *  .keepAlive(false)
 *  .maxBytes(5000)
 *  .minFetchBytes(5000)
 *  .consumerInstanceTimeout(200000)
 *  .requestTimeout(2000);
 * 
 * // Initialize once
 * await consumer.init();
 * 
 * // consume latest records:
 * try {
 *  const records = await consumer.consume();
 * } catch (e) {
 *  const apiException = catchApiException(e);
 *  // handle exception here
 * }
 * ```
 */
export class Consumer {
    private _topics: string[];

    private _groupName: string;

    private _name: string;

    private _keepAlive: boolean;

    private _requestTimeout: number;

    private _maxBytes: number;

    private _fetchMinBytes: number;

    private _consumerInstanceTimeout: number;

    private _sessionTimeout: number;

    private redpandaFetcher: RedpandaFetcher;

    /** Should be `undefined` while no keepAlive-interval is running */
    private keepAliveIntervalId?: NodeJS.Timeout;


    /**
     * @param topics topic names this group will subscribe to
     * @param groupName must be unique in kafka instance
     * @param name consumer id, also referred to as "instance" or "instance_id". Uniquely identifies the consumer within their group
     * @param redpandaConfig 
     */
    public constructor(topics: string[], groupName: string, name: string, redpandaConfig: RedpandaConfig) {
        assertStrictlyFalsyAndThrow(topics, groupName, name, redpandaConfig);

        this._topics = topics;
        this._groupName = groupName;
        this._name = name;
        this.redpandaFetcher = new RedpandaFetcher(redpandaConfig);
        
        // default values
        this._keepAlive = true;
        this._requestTimeout = REDPANDA_DEFAULT_REQUEST_TIMEOUT;
        this._maxBytes = -1;
        this._consumerInstanceTimeout = REDPANDA_DEFAULT_CONSUMER_LIFE_TIME;
        this._sessionTimeout = REDPANDA_DEFAULT_CONSUMER_SESSION_TIMEOUT;
        this._fetchMinBytes = -1;
    }

    /** 
     * Indicates to prevent the consumer from beeing deleted by redapnda automatically. 
     * 
     * Notice that consumers are deleted on redpanda restart regardless of `keepAlive`. 
     * 
     * Default is `true`.
     */
    public keepAlive(keepAlive: boolean): Consumer {
        this._keepAlive = keepAlive;

        return this;
    }
    
    /** 
     * The time (in ms) kafaka is supposed to wait while consuming records before returning an empty response. 
     * 
     * Default is `redpandaConfig.requestTimeout` or {@link REDPANDA_DEFAULT_REQUEST_TIMEOUT}
     */
    public requestTimeout(requestTimeout: number): Consumer {
        assertStrictlyFalsyAndThrow(requestTimeout);

        this._requestTimeout = requestTimeout;

        return this;
    }
    
    /**
     * For restricting the size of the consumption response. The response may exceed this limit if one single record
     * is larger than `max_bytes`.
     * 
     * Default is `undefined` meaning unlimited bytes. The same applies to negative value.
     */
    public maxBytes(maxBytes: number): Consumer {
        assertStrictlyFalsyAndThrow(maxBytes);

        this._maxBytes = maxBytes;

        return this;
    }
    
    /**
     * The minimum amount of data to consume in on request. If there's less data kafka will wait for more data 
     * (will wait for 'fetch.max.wait.ms', this cannot be configured with this library).
     */
    public fetchMinBytes(fetchMinBytes: number): Consumer {
        assertStrictlyFalsyAndThrow(fetchMinBytes);

        this._fetchMinBytes = fetchMinBytes;

        return this;
    }

    /**
     * Time (in ms) of inactivity after which a consumer is deleted automatically 
     * (`consumer_instance_timeout_ms` in "redpanda.yaml")
     * 
     * Default is `REDPANDA_DEFAULT_CONSUMER_LIFE_TIME`
     */
    public consumerInstanceTimeout(consumerInstanceTimeout: number): Consumer {
        this._consumerInstanceTimeout = consumerInstanceTimeout;

        return this;
    }

    /**
     * Time (in ms) of inactivity after which a consumer session becomes invalid (session.timeout.ms)
     * 
     * Default is `REDPANDA_DEFAULT_CONSUMER_SESSION_TIMEOUT`
     * 
     * @see https://kafka.apache.org/34/configuration/consumer-configs/#consumerconfigs_session.timeout.ms
     */
    public sessionTimeout(sessionTimeout: number): Consumer {
        this._sessionTimeout = sessionTimeout;

        return this;
    }

    /**
     * Creates this consumer (and the group if not exists) and subscribes the group to all topics. Also 
     * starts keepAlive interval unless disabled.
     */
    public async init(): Promise<void> {
        await this.create();

        await this.subscribe();

        if (this._keepAlive)
            this.startConsumerKeepAlive();
    } 

    /**
     * Fetch the latest records for all topics this consumer has subscribed to (`this._topics`). Records can only be consumed once per group
     * which means that repeated consuming will never return the same records.
     * 
     * `key` and `value` response values will always be base64 encoded but will be decoded and then possibly parsed to json in here. 
     * Set `consumerOptions.dontDecodeKeyValues` to `true` in order not to decode or parse them but simply return the raw response body.
     * 
     * @param consumerOptions fallback to consumer class fields
     * @returns clean, parsed records. Empty array if there are no new records or `this._topics` don't exist
     */
    public async consume(consumerOptions: ConsumerOptions = {}): Promise<ConsumerRecord[]> {
        const requestTimeout = consumerOptions.timeout ?? this._requestTimeout;
        const maxBytes = consumerOptions.max_bytes ?? this._maxBytes;
        const path = `/consumers/${this._groupName}/instances/${this._name}/records?timeout=${requestTimeout
            }&max_bytes=${maxBytes}`;

        const response = await this.redpandaFetcher.fetch(path, {
            headers: {
                "Accept": MEDIA_TYPE_KAFKA_BINARY_JSON
            }
        });

        if (consumerOptions.dontDecodeKeyValues)
            return response;

        return this.parseConsumerResponse(response);
    }

    /**
     * Will decode `key` and `value` values from base64 to plain text and then either return plainly or parse to json.
     * 
     * @param consumerResponse unmodified json response body returned by consumer request
     * @returns consumed records with parsed `key` and `value`
     */
    private parseConsumerResponse(consumerResponse: ConsumerRecordResponseFormat[]): ConsumerRecord[] {
        assertStrictlyFalsyAndThrow(consumerResponse);

        if (!consumerResponse.length)
            return [];

        const parsedRecords: ConsumerRecord[] = new Array(consumerResponse.length);

        consumerResponse
            .forEach((record, i) => {
                const { key, value, ...recordRest } = record;
                
                const decodedKey = key === null ? null : base64Decode(key);
                const decodedValue = value === null ? null : base64Decode(value);

                parsedRecords[i] = {
                    ...recordRest,
                    key: this.parseConsumerKeyValue(decodedKey),
                    value: this.parseConsumerKeyValue(decodedValue)
                }
            })

        return parsedRecords;
    }

    /**
     * Parse `keyValue` to json or return plain arg.
     * 
     * @param keyValue to be parsed
     * @returns parsed key value
     * @throws if json parse error or falsy arg
     */
    private parseConsumerKeyValue(keyValue: string | null): RedpandaRecordKeyValueType {
        if (keyValue === null)
            return null;

        if (keyValue.startsWith("{"))
            return JSON.parse(keyValue);

        return keyValue;
    }

    /**
     * Delete this consumer and stop keep alive interval.
     */
    public async delete(): Promise<void> {
        this.stopConsumerKeepAlive();

        const path = `/consumers/${this._groupName}/instances/${this._name}`;
        try {
            return await this.redpandaFetcher.fetch(path, {
                method: "DELETE",
                headers: {
                    "Content-Type": MEDIA_TYPE_KAFKA_JSON
                }
            });

        } catch (e) {
            const apiException = catchApiException(e);

            // case: consumer did not exist
            if (apiException.statusCode === 404)
                return Promise.resolve();

            throw e;
        }
    }

    /**
     * Creates a consumer instance with id `_name`. 
     * 
     * Configure the group with an initial offset of 0 for the first consumer to retrieve all records when consuming the first time.
     * 
     * Will not throw if consumer already exists.
     */
    private async create(): Promise<void> {
        const path = `/consumers/${this._groupName}`;
        const body = {
            "format": "binary",
            "name": this._name,
            "auto.offset.reset": "earliest",
            "auto.commit.enable": "false",
            "fetch.min.bytes": String(this._fetchMinBytes),
            "consumer.request.timeout.ms": String(this._requestTimeout)
        }

        try {
            return await this.redpandaFetcher.fetch(path, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": MEDIA_TYPE_KAFKA_JSON
                }
            });

        } catch (e) {
            const apiException = catchApiException(e);

            // case: consumer already exists, nothing else to do
            if (apiException.statusCode === 409)
                return Promise.resolve();

            throw e;
        }
    }

    /**
     * Subscribe `this._groupName` to `this._topics` to enable consumption.
     * 
     * Wont throw if topics don't exist.
     * 
     * @return response format with status 204 if no error
     */
    private async subscribe(): Promise<CustomApiResponseFormat> {
        const path = `/consumers/${this._groupName}/instances/${this._name}/subscription`;
        const body = {
            topics: this._topics
        };

        return await this.redpandaFetcher.fetch(path, {
            method: "POST",
            headers: {
                "Content-Type": MEDIA_TYPE_KAFKA_JSON,
            },
            body: JSON.stringify(body)
        });
    }

    /**
     * Makes a cheap http request at an interval which should prevent redpanda from auto deleting this consumer.
     * Interval is the smaller value of `this._sessionTimeout` and `this._consumerInstanceTimeout` minus 3000.
     */
    private startConsumerKeepAlive(): void {
        if (!isStrictlyFalsy(this.keepAliveIntervalId))
            return;

        // - 3000ms to take slow internet and other latency into account 
        const delay = Math.min(this._consumerInstanceTimeout ?? this._sessionTimeout) - 3000;
        if (delay <= 3000) {
            console.warn(`Not keeping consumer alive because either 'consumerInstanceTimeout' or 'sessionTimeout' is too low: ${delay}. In order to keep this consumer alive specify a timeout greater than 3000 ms.`);
            return;
        }

        this.keepAliveIntervalId = setInterval(async () => {
            try {
                await this.subscribe(); // cheap request 

            } catch (e) {
                console.warn(`Keep alive request failed: ${e}`);
            }
        }, delay);
    }

    /**
     * Clear {@link keepAliveIntervalId} stopping the consumer keep alive process.
     */
    private stopConsumerKeepAlive(): void {
        // case: already stopped the interval
        if (isStrictlyFalsy(this.keepAliveIntervalId))
            return;

        clearInterval(this.keepAliveIntervalId);
        this.keepAliveIntervalId = undefined;
    }
}
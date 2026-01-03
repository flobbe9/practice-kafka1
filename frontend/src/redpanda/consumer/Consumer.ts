import { CustomApiResponseFormat } from "@/CustomApiResponseFormat";
import { assertStrictlyFalsyAndThrow, catchApiException, isStrictlyFalsy } from "@/utils/utils";
import { RedpandaConfig } from "../RedpandaConfig";
import { RedpandaFetcher } from "../RedpandaFetcher";
import { RedapndaOffset } from "../RedpandaOffset";
import { RedpandaOffsetRequestBody } from "../RedpandaOffsetRequestBody";
import { MEDIA_TYPE_KAFKA_JSON, REDPANDA_DEFAULT_CONSUMER_LIFE_TIME, REDPANDA_DEFAULT_REQUEST_TIMEOUT } from './../../utils/constants';

// example
export class Consumer {
    private _topics: string[];

    private _groupName: string;

    private _name: string;

    private _keepAlive: boolean;

    private _requestTimeout: number;

    private _maxBytes?: number;

    private redpandaConfig: RedpandaConfig;

    private redpandaFetcher: RedpandaFetcher;

    /** Should be `undefined` while no keepAlive-interval is running */
    private keepAliveIntervalId?: NodeJS.Timeout;


    /**
     * @param topics Topic names this consumer has subscribed to.
     * @param groupName 
     * @param name Consumer id, also referred to as "instance" or "instance_id". Uniquely identifies the consumer within their group.
     * @param redpandaConfig 
     */
    public constructor(topics: string[], groupName: string, name: string, redpandaConfig: RedpandaConfig) {
        assertStrictlyFalsyAndThrow(topics, groupName, name, redpandaConfig);

        this._topics = topics;
        this._groupName = groupName;
        this._name = name;
        this.redpandaConfig = redpandaConfig;
        this.redpandaFetcher = new RedpandaFetcher(redpandaConfig);
        
        this._keepAlive = true;
        this._requestTimeout = redpandaConfig.requestTimeout ?? REDPANDA_DEFAULT_REQUEST_TIMEOUT;
        this.keepAliveIntervalId = undefined;
    }

    /** 
     * Indicates to prevent the consumer from beeing deleted by redapnda automatically. 
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
        this._maxBytes = maxBytes;

        return this;
    }

    public async init(): Promise<void> {
        await this.create();

        await this.subscribe();

        if (this._keepAlive)
            this.startConsumerKeepAlive();
    }

    public async delete(): Promise<void> {
        this.stopConsumerKeepAlive();
    }

    /**
     * Creates a consumer instance with id `_name`. 
     * 
     * Configure consumer with an initial offset of 0 for them to retrieve all records when consuming the first time. 
     */
    private async create(): Promise<void> {
        const path = `/consumers/${this._groupName}`;
        const body = {
            "format": "binary",
            "name": this._name,
            "auto.offset.reset": "earliest",
            // "auto.commit.enable": "false",
            // "fetch.min.bytes": "string",
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
     * Subscribe consumer to `this._topics` to enable consumption. TODO 
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
     * Interval is `this.redpandaConfig.consumerInstanceTimeout ?? REDPANDA_DEFAULT_CONSUMER_LIFE_TIME` minus 3000 ms.
     */
    private startConsumerKeepAlive(): void {
        if (!isStrictlyFalsy(this.keepAliveIntervalId))
            return;

        // - 3000ms to take slow internet and other latency into account 
        const delay = (this.redpandaConfig.consumerInstanceTimeout ?? REDPANDA_DEFAULT_CONSUMER_LIFE_TIME) - 3000;
        if (delay <= 3000) {
            console.warn(`Not keeping consumer alive because 'consumerInstanceTimeout' is too low: ${delay}. In order to keep this consumer alive specify a timeout greater than 3000 ms.`);
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

    /**
     * Not sure what these offsets mean exactly...
     * 
     * @param partitions to request the offsets for. If not specified, offsets are returned for all topics' 0-partition
     * @returns offsets that have been explicitly commited via post request
     */
    // NOTE: this is not possible at the moment because js fetch does not allow for get requests to have a request body
    public async getOffsets(partitions?: RedpandaOffsetRequestBody[]): Promise<RedapndaOffset[]> {
        const path = `/consumers/${this._groupName}/instances/${this._name}/offsets`;
        const body: {partitions: RedpandaOffsetRequestBody[]} = {
            // empty array is fine
            partitions: partitions ?? this._topics.map(topic => ({
                topic,
                partition: 0
            }))
        }

        return await this.redpandaFetcher.fetch(path, {
            body: JSON.stringify(body),
            headers: {
                "Content-Type": MEDIA_TYPE_KAFKA_JSON
            }
        });
    }
}
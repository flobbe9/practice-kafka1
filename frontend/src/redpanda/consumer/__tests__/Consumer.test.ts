import { RedpandaBasicAuthConfig } from "@/redpanda/RedpandaBasicAuthConfig";
import { RedpandaConfig } from "@/redpanda/RedpandaConfig";
import { REDPANDA_DEFAULT_CONSUMER_LIFE_TIME } from "@/utils/constants";
import { expectAsyncNotToThrow, expectAsyncToThrow, mockFetchJson } from "@/utils/testUtils";
import { Consumer } from "../Consumer";
import { base64Encode } from "@/utils/projectUtils";
import { ConsumerRecordResponseFormat } from "../ConsumerRecord";

const mockRedpandaConfig: RedpandaConfig = {
    baseUrl: "http://mockHost",
    authConfig: RedpandaBasicAuthConfig.getInstance("user", "password")
};


describe("startConsumerKeepAlive", () => {
    test("should not start interval if delay to low", async () => {
        mockFetchJson(undefined, {}, 200);
        console.warn = jest.fn((..._args: any[]) => {});

        const goodDelay = REDPANDA_DEFAULT_CONSUMER_LIFE_TIME - 3000;
        let expectedWarningMsg = `Not keeping consumer alive because 'consumerInstanceTimeout' is too low: ${goodDelay}. In order to keep this consumer alive specify a timeout greater than 3000 ms.`;

        // consumer timeout high enough (using default value of 300_000ms)
        let consumer = new Consumer(["test"], "group1", "consumer1", mockRedpandaConfig);
        await consumer.init();
        expect(console.warn).not.toHaveBeenCalledWith(expectedWarningMsg);

        const badDelay = 2000;
        consumer = new Consumer(["test"], "group1", "consumer1", mockRedpandaConfig);
        consumer.consumerInstanceTimeout(badDelay + 3000); // too low
        await consumer.init();

        expectedWarningMsg = expectedWarningMsg.replace(String(goodDelay), String(badDelay));
        expect(console.warn).toHaveBeenCalledWith(expectedWarningMsg);
    })
});

describe("delete", () => {
    test("should not throw on 404 status", async () => {
        const consumer = new Consumer(["test"], "group1", "consumer1", mockRedpandaConfig);

        mockFetchJson(
            undefined, 
            {
                error_code: 40403,
                message: "Consumer not found"
            }, 
            404
        );
        await expectAsyncNotToThrow(async () => consumer.delete());

        mockFetchJson(
            undefined, 
            {
                error_code: 40001,
                message: "Bad request"
            }, 
            400
        );
        await expectAsyncToThrow(async () => consumer.delete());
    })
});

describe("parseConsumerResponse", () => {
    test("falsy arg should throw", async () => {
        const consumer = new Consumer(["test"], "group1", "consumer1", mockRedpandaConfig);

        mockFetchJson(undefined, null, 200);

        await expectAsyncToThrow(async () => consumer.consume(), "Invalid arg at index 0");
    });

    test("empty response should return empty array", async () => {
        const consumer = new Consumer(["test"], "group1", "consumer1", mockRedpandaConfig);

        mockFetchJson(undefined, [] as ConsumerRecordResponseFormat[], 200);

        const response = await consumer.consume();

        expect(response.length).toBe(0);
    })

    test("should recognize key value formats properly", async () => {
        const consumer = new Consumer(["test"], "group1", "consumer1", mockRedpandaConfig);
        const mockConsumerResponse: ConsumerRecordResponseFormat[] =[
            {
                key: base64Encode("key1"),
                value: base64Encode("{\"foo\":\"bar\"}"),
                topic: "",
                partition: 0,
                offset: 0
            },
            {
                key: base64Encode("{\"foo\":\"bar\"}"),
                value: base64Encode("key1"),
                topic: "",
                partition: 0,
                offset: 0
            },
            {
                key: base64Encode("key2"),
                value: null,
                topic: "",
                partition: 0,
                offset: 0
            },
            {
                key: null,
                value: base64Encode("key2"),
                topic: "",
                partition: 0,
                offset: 0
            },
        ];

        mockFetchJson(
            undefined, 
            mockConsumerResponse,
            200
        );

        const records = await consumer.consume();

        expect(records.length).toBe(mockConsumerResponse.length);

        expect(typeof records[0].key).toBe("string");
        expect(records[0].key).toBe("key1");
        expect(typeof records[0].value).toBe("object");
        expect((records[0].value as object)).toHaveProperty("foo");
        expect((records[0].value as any)["foo"]).toBe("bar");

        expect(typeof records[1].key).toBe("object");
        expect(typeof records[1].value).toBe("string");

        expect(typeof records[2].key).toBe("string");
        expect(records[2].value).toBeNull();
        
        expect(records[3].key).toBeNull();
        expect(typeof records[3].value).toBe("string");
    });

    test("should not modify other props than key and value", async () => {
        const consumer = new Consumer(["test"], "group1", "consumer1", mockRedpandaConfig);
        const mockConsumerResponse: ConsumerRecordResponseFormat[] = [
            {
                key: base64Encode("key1"),
                value: base64Encode("{\"foo\":\"bar\"}"),
                topic: "topic0",
                partition: 0,
                offset: 0
            },
            {
                key: base64Encode("{\"foo\":\"bar\"}"),
                value: base64Encode("key1"),
                topic: "topic1",
                partition: 1,
                offset: 1
            },
            {
                key: base64Encode("key2"),
                value: null,
                topic: "topic2",
                partition: 2,
                offset: 2
            },
            {
                key: null,
                value: base64Encode("key2"),
                topic: "topic3",
                partition: 3,
                offset: 3
            },
        ]

        mockFetchJson(
            undefined, 
            mockConsumerResponse,
            200
        );

        mockConsumerResponse
            .forEach((record, i) => {
                expect(record.topic).toBe(`topic${i}`);
                expect(record.offset).toBe(i);
                expect(record.partition).toBe(i);
            })

        const records = await consumer.consume();

        expect(records.length).toBe(mockConsumerResponse.length);
        mockConsumerResponse
            .forEach((record, i) => {
                expect(record.topic).toBe(`topic${i}`);
                expect(record.offset).toBe(i);
                expect(record.partition).toBe(i);
            })
    });

    test("Should not decode key values if specified", async () => {
        const consumer = new Consumer(["test"], "group1", "consumer1", mockRedpandaConfig);
        const mockConsumerResponse: ConsumerRecordResponseFormat[] = [
            {
                key: base64Encode("key1"),
                value: base64Encode("{\"foo\":\"bar\"}"),
                topic: "topic0",
                partition: 0,
                offset: 0
            },
            {
                key: base64Encode("{\"foo\":\"bar\"}"),
                value: base64Encode("key1"),
                topic: "topic1",
                partition: 1,
                offset: 1
            },
            {
                key: base64Encode("key2"),
                value: null,
                topic: "topic2",
                partition: 2,
                offset: 2
            },
            {
                key: null,
                value: base64Encode("key2"),
                topic: "topic3",
                partition: 3,
                offset: 3
            },
        ]

        mockFetchJson(
            undefined, 
            mockConsumerResponse,
            200
        );

        const records = await consumer.consume({dontDecodeKeyValues: true});
        
        expect(typeof records[0].key).toBe("string");
        expect(records[0].key).not.toBe("key1"); // expect base64
        expect(typeof records[0].value).toBe("string");
        expect(records[0].value).not.toBe("{\"foo\":\"bar\"}"); // expect base64
    });
});
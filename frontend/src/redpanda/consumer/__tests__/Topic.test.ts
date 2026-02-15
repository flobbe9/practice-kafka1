import { RedpandaBasicAuthConfig } from "@/redpanda/RedpandaBasicAuthConfig";
import { RedpandaConfig } from "@/redpanda/RedpandaConfig";
import { Topic } from "@/redpanda/topic/Topic";
import { expectAsyncNotToThrow, expectAsyncToThrow, mockFetchJson } from "@/utils/testUtils";
import { throwApiException } from "@/utils/utils";
import { Consumer } from "../Consumer";
import { base64Encode } from "@/utils/projectUtils";
import { ConsumerRecordResponseFormat } from "../ConsumerRecord";

const topicName = "test";
const mockRedpandaConfig: RedpandaConfig = {
    baseUrl: "http://mockHost",
    authConfig: RedpandaBasicAuthConfig.getInstance("user", "password")
};

describe("allRecords", () => {
    test("should validate topic name", () => {
        let topicName = "testGroup";

        expect(() => {new Topic(topicName, mockRedpandaConfig)}).not.toThrow();
        expect(() => {new Topic("invalid$", mockRedpandaConfig)}).toThrow();

        let tooLongName = ""
        while (tooLongName.length <= 249)
            tooLongName += "a";

        expect(() => {new Topic(tooLongName, mockRedpandaConfig)}).toThrow();
    });

    test("should delete consumer after consume call", async () => {
        mockFetchJson();

        const topic = new Topic(topicName, mockRedpandaConfig);
        const consumerDeleteFn = jest.spyOn(Consumer.prototype, "delete");

        await expectAsyncNotToThrow(() => topic.allRecords());
        
        expect(consumerDeleteFn).toHaveBeenCalled();
    });

    test("should delete consumer after failed consume call", async () => {
        jest.spyOn(Consumer.prototype, "consume")
            .mockImplementation(async () => {throwApiException({statusCode: 500})});

        const consumerDeleteFn = jest.spyOn(Consumer.prototype, "delete");
            
        const topic = new Topic(topicName, mockRedpandaConfig);
        await expectAsyncToThrow(() => topic.allRecords());
        
        expect(consumerDeleteFn).toHaveBeenCalled();
    });

    test("failed delete call should not throw", async () => {
        jest.spyOn(Consumer.prototype, "consume")
            .mockImplementation(async () => {return []});

        const consumerDeleteFn = jest.spyOn(Consumer.prototype, "delete")
            .mockImplementation(async () => {throwApiException({statusCode: 500})});
            
        const topic = new Topic(topicName, mockRedpandaConfig);
        await expectAsyncNotToThrow(() => topic.allRecords()); 
        
        expect(consumerDeleteFn).toHaveBeenCalled();
    });
});

describe("allRecordsByPartition", () => {
    test("falsy args should throw", async () => {
        const topic = new Topic(topicName, mockRedpandaConfig);
        expectAsyncToThrow(async () => topic.allRecordsByPartition(null as any as number));
    });

    test("Should not decode key values if specified", async () => {
        const topic = new Topic(topicName, mockRedpandaConfig);
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

        const records = await topic.allRecordsByPartition(0, {dontDecodeKeyValues: true});
        
        expect(typeof records[0].key).toBe("string");
        expect(records[0].key).not.toBe("key1"); // expect base64
        expect(typeof records[0].value).toBe("string");
        expect(records[0].value).not.toBe("{\"foo\":\"bar\"}"); // expect base64
    });
});
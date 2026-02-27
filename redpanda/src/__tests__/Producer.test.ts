import { Producer } from "@/kafka/producer/Producer";
import { ProducerRecordsFormat } from "@/kafka/producer/ProducerRecordsFormat";
import { ProducerResponseFormat } from "@/kafka/producer/ProducerResponseFormat";
import { RedpandaBasicAuthConfig } from "@/kafka/RedpandaBasicAuthConfig";
import { RedpandaConfig } from "@/kafka/RedpandaConfig";
import { expectAsyncToThrow, mockFetchJson } from "@/utils/testUtils";

const mockRedpandaConfig: RedpandaConfig = {
    baseUrl: "http://mockHost",
    authConfig: RedpandaBasicAuthConfig.getInstance("user", "password")
};
const mockTopic = "test";

describe("produce", () => {
    test("falsy arg should throw", async () => {
        const producer = new Producer(mockTopic, mockRedpandaConfig);
        
        await expectAsyncToThrow(async () => producer.produce(null as any as ProducerRecordsFormat));
    });

    test("return null if records is empty", async () => {
        const producer = new Producer(mockTopic, mockRedpandaConfig);
        
        const response = await producer.produce({records: []});
        expect(response).toBeNull();
    });

    test("hasErrors should be true if at least one offset indicates an error, false otherwise", async () => {
        const producer = new Producer(mockTopic, mockRedpandaConfig);
        
        // one production error
        let mockResponse: ProducerResponseFormat = {
            offsets: [
                // failed to produce records
                {
                    partition: 0,
                    offset: -1,
                    error_code: 3
                },
                // records produced successfully
                {
                    partition: 1,
                    offset: 0
                },
            ]
        }
        mockFetchJson(undefined, mockResponse, 200);
        let response = await producer.produce({records: [{key: "", value: ""}]});
        expect(response?.hasErrors).toBe(true);

        // no production failures
        mockResponse = {
            offsets: [
                {
                    partition: 0,
                    offset: 0
                },
                {
                    partition: 1,
                    offset: 0
                },
            ]
        }
        mockFetchJson(undefined, mockResponse, 200);
        response = await producer.produce({records: [{key: "", value: ""}]});
        expect(response?.hasErrors).toBe(false);
    });
})
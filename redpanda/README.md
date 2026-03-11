# Getting started
`npm i redpanda`

Can be used in both client and server environment (e.g. react app or express app).

## Examples
### Config and auth
Configure how to authenticate with your redpanda instance. 
```
// with basic auth
let globalConfig: RedpandaConfig = {
	baseUrl: 'http://localhost:8091', // proxy rest api url
	authConfig: RedpandaBasicAuthConfig.getInstance("user", "password"), 
}

// with jwt verification, e.g. with oauth2 flow
globalConfig: RedpandaConfig = {
	baseUrl: 'http://localhost:8091', // proxy rest api url
    authConfig: new RedpandaJwtAuthConfig(async (): Promise<string> => {
		let response: Response | null = null;
		try {
			response = await fetch("http://localhost:4001/jwt"); // fetch the jwt token

		} catch (e) {
			throwApiException({
				statusCode: 503,
				message: (e as Error).message, 
				path: "/jwt"
			});
		}

		if (!isHttpStatusCodeAlright(response!.status))
            // expect backend response body to formatted exactly like CustomApiResponseFormat
			throwApiException(await response!.json() as CustomApiResponseFormat); 

		return await response!.text();
	})
}
```

### Producer
```
const producer = new Producer("myTopic", globalConfig);
try {
    const response = await producer.produce({
        records: [
            {
                key: "foo",
                value: "bar"
            },
            {
                key: {name: "John"}
                value: {lastName: "Doe"}
            }
        ]
    });

    const hasErrors = !!response.hasErrors; // at least one record could not be produced
    const lastSuccessfullyProducedRecords = response.offsets.filter(offset => !Object.has(offset, "error_code"));
} catch (e) {
    const apiException = catchApiException(e);
}
```

### Consumer
```
const consumer = new Consumer(["myTopic", "myOtherTopic"], "groupName", "consumerName", globalConfig);
// Optional configuration:
consumer
    .keepAlive(false)
    .maxBytes(5000)
    .minFetchBytes(5000)
    .consumerInstanceTimeout(200000)
    .requestTimeout(2000);

try {
    // Initialize once per instance
    await consumer.init();

    // consume latest records:
    const records = await consumer.consume();
    
} catch (e) {
    const apiException = catchApiException(e);
    // handle exception here
}
```

### Topic
```
const topic = new Topic("myTopic", globalConfig);

// list all records of topic
const allRecords: ConsumerRecord[] = await allRecords({
    timeout: 1000,
    max_bytes: -1,
    dontDecodeKeyValues: false
});

// list all topics
const topics: string[] = await Topic.allTopics(globalConfig);
```

# Notes
Tested with Redpanda version 25.3.10 and Node 24.
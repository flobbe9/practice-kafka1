import { useState } from 'react';
import { RedpandaConfig } from './redpanda/RedpandaConfig';
import { RedpandaFetcher } from './redpanda/RedpandaFetcher';
import { RedpandaJwtAuthConfig } from './redpanda/RedpandaJwtAuthConfig';
import { Consumer } from './redpanda/consumer/Consumer';
import { isHttpStatusCodeAlright, throwApiException } from './utils/utils';

const globalRedpandaConfig: RedpandaConfig = {
	baseUrl: 'http://localhost:8091',
	authConfig: new RedpandaJwtAuthConfig(async (): Promise<string> => {
		let response: Response | null = null;
		try {
			response = await fetch("http://localhost:4001/jwt");

		} catch (e) {
			throwApiException({
				statusCode: 503,
				message: (e as Error).message,
				path: "/jwt"
			});
		}

		if (!isHttpStatusCodeAlright(response.status))
			throwApiException(await response.json()); // expect backend response body to formatted exactly like CustomApiResponseFormat

		return await response.text();
	})
}

export default function App() {
	const KAFKA_BASE_URL = "http://localhost:8091";
	const [topics, setTopics] = useState([""]);
	const [records, setRecords] = useState([]);

	const redpandaFetcher = new RedpandaFetcher(globalRedpandaConfig);
	const consumer = new Consumer(["test"], "group1", "consumer1", globalRedpandaConfig);

	async function consume(): Promise<void> {
		return consumer.init();
	}

	return (
		<>
			<button onClick={() => consume()}>Consume</button>
			<button onClick={() => consumer.delete()}>Delete</button>
			<a href="http://localhost:4001/oauth2/authorization/github">Login</a>
		</>
	)
}

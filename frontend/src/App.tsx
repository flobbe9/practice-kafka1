import { useState } from 'react';
import { MEDIA_TYPE_KAFKA_JSON } from './utils/constants';
import { catchApiException, isHttpStatusCodeAlright, throwApiException } from './utils/utils';
import { RedpandaConfig } from './abstracts/redpanda/RedpandaConfig';
import { RedpandaJwtAuthConfig } from './abstracts/redpanda/RedpandaJwtAuthConfig';
import { RedpandaFetcher } from './abstracts/redpanda/RedpandaFetcher';

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

	async function consume<T>(): Promise<T> {
		const path = `/consumers/group1`

		return await redpandaFetcher.fetch(path, {
			method: "post",
			body: JSON.stringify({
				name: "consumer1",
				format: "binary"
			}),
			headers: {
				"Content-Type": MEDIA_TYPE_KAFKA_JSON,
			}
		})
	}

	return (
		<>
			<button onClick={() => consume()}>Consume</button>
			<a href="http://localhost:4001/oauth2/authorization/github">Login</a>
		</>
	)
}

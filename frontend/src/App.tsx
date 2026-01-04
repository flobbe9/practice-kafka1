import { useEffect, useState } from 'react';
import { Consumer } from './redpanda/consumer/Consumer';
import { ConsumerRecord } from './redpanda/consumer/ConsumerRecord';
import { RedpandaConfig } from './redpanda/RedpandaConfig';
import { RedpandaJwtAuthConfig } from './redpanda/RedpandaJwtAuthConfig';
import { RedpandaRecordKeyValueType } from './redpanda/RedpandaRecordKeyValueType';
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
	const [records, setRecords] = useState<ConsumerRecord[]>([]);
	const [records2, setRecords2] = useState<ConsumerRecord[]>([]);
	const [consumerInitialized, setConsumerInitialized] = useState(false);

	const [consumer, ] = useState<Consumer>(
		new Consumer(["test"], "group1", "consumer1", globalRedpandaConfig)
			.keepAlive(true));
	const [consumer2, ] = useState<Consumer>(
		new Consumer(["test2"], "group2", "consumer2", globalRedpandaConfig)
			.keepAlive(true)
	);

	useEffect(() => {
		init();
	}, []);

	async function init(): Promise<void> {
		const consumer1Promise = consumer?.init();
		const consumer2Promise = consumer2?.init();

		await consumer1Promise;
		await consumer2Promise;
		setConsumerInitialized(true);
	}

	async function consume(num: 1 | 2 = 1): Promise<any> {
		// setInterval(async () => {
			if (num === 1) {
				const response = await consumer?.consume();
				setRecords((records) => [...records, ...(response ?? [])]);
			} else {
				const response = await consumer2?.consume();
				setRecords2((records) => [...records, ...(response ?? [])]);	
			}

		// }, 2000);
	}

	function toString(keyValue: RedpandaRecordKeyValueType): string | null {
		if (!keyValue || typeof keyValue === "string")
			return keyValue;

		return JSON.stringify(keyValue);
	}

	return (
		<>
			<button disabled={!consumerInitialized} onClick={() => consumer?.delete()}>Delete</button>
			<button disabled={!consumerInitialized} onClick={() => consume()}>Consume1</button>

			{records.map((record, i) => (
				<div key={i}>
					<span>Key: {toString(record.key)} Value: {toString(record.value)}</span>
				</div>
			))}

			<br /><br />
			<button disabled={!consumerInitialized} onClick={() => consumer2?.delete()}>Delete</button>
			<button disabled={!consumerInitialized} onClick={() => consume(2)}>Consume2</button>

			{records2.map((record, i) => (
				<div key={i}>
					<span>Key: {toString(record.key)} Value: {toString(record.value)}</span>
				</div>
			))}

			<br />
			<a href="http://localhost:4001/oauth2/authorization/github">Login</a>
		</>
	)
}

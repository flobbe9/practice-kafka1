import { GLOBAL_REDPANDA_CONFIG } from "@/utils/constants";
import { useState, useRef, useEffect, JSX } from "react";
import { ConsumerRecord, Consumer, Producer, Topic, catchApiException, RedpandaRecordKeyValueType } from "redpanda";

export default function Start() {
	const [records, setRecords] = useState<ConsumerRecord[]>([]);
	const [records2, setRecords2] = useState<ConsumerRecord[]>([]);
	const [allRecords, setAllRecords] = useState<ConsumerRecord[]>([]);
	const [allTopics, setAllTopics] = useState<string[]>([]);
	const [consumerInitialized, setConsumerInitialized] = useState(false);

	const [consumer, ] = useState<Consumer>(
		new Consumer(["test"], "group1", "consumer1", GLOBAL_REDPANDA_CONFIG)
			.keepAlive(true)
			.consumerInstanceTimeout(45000));
	const [consumer2, ] = useState<Consumer>(
		new Consumer(["test"], "group2", "consumer2", GLOBAL_REDPANDA_CONFIG)
			.keepAlive(true)
			.consumerInstanceTimeout(45000));

	const [producer, ] = useState<Producer>(
		new Producer("test", GLOBAL_REDPANDA_CONFIG)
	)

	const [topic, ] = useState<Topic>(new Topic("test", GLOBAL_REDPANDA_CONFIG));

	const keyInputRef = useRef<HTMLInputElement>(null);
	const valueInputRef = useRef<HTMLInputElement>(null);

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

	async function fetchAllTopics(): Promise<void> {
		try {
			setAllTopics(await Topic.allTopics(GLOBAL_REDPANDA_CONFIG));

		} catch (e) {
			const apiException = catchApiException(e);
			console.error("Failed to fetch all records", apiException);
		}
	}

	async function fetchAllRecords(): Promise<void> {
		try {
			setAllRecords(await topic.allRecords());

		} catch (e) {
			const apiException = catchApiException(e);
			console.error("Failed to fetch all records", apiException);
		}
	}

	async function fetchAllRecordsOnPartition(): Promise<void> {
		try {
			setAllRecords(await topic.allRecordsByPartition(0));

		} catch (e) {
			const apiException = catchApiException(e);
			console.error("Failed to fetch all records", apiException);
		}
	}

	async function consume(num: 1 | 2 = 1): Promise<any> {
		// setInterval(async () => {
			try {
				if (num === 1) {
					const response = await consumer?.consume();
					setRecords((records) => [...records, ...(response ?? [])]);
				} else {
					const response = await consumer2?.consume();
					setRecords2((records) => [...records, ...(response ?? [])]);	
				}
			} catch (e) {
				const apiException = catchApiException(e);
				console.error(apiException);
			}

		// }, 2000);
	}

	function toString(keyValue: RedpandaRecordKeyValueType): string | null {
		if (!keyValue || typeof keyValue === "string")
			return keyValue;

		return JSON.stringify(keyValue);
	}

	async function produce(): Promise<any> {
		try {
			await producer.produce({
				records: [
					{
						key: keyInputRef.current?.value || null,
						value: valueInputRef.current?.value || null,
					},
					{
						key: keyInputRef.current?.value || null,
						value: valueInputRef.current?.value || null,
						partition: 1
					},
					{
						key: keyInputRef.current?.value || null,
						value: "2",
						partition: 2
					},
					{
						key: keyInputRef.current?.value || null,
						value: "3",
					}
				]
			})
		} catch (e) {
			const apiException = catchApiException(e);
			console.log(apiException);
		}
	}

	function mapConsumerRecords(consumerRecords: ConsumerRecord[]): JSX.Element[] {
		if (!consumerRecords)
			return [];

		return consumerRecords.map((record, i) => (
			<div key={i}>
				<span>Key: {toString(record.key)} Value: {toString(record.value)}</span>
			</div>
		));
	}
    return (
        <div>
            <button onClick={() => consumer?.delete()}>Delete</button>
			<button disabled={!consumerInitialized} onClick={() => consume()}>Consume1</button>

			{mapConsumerRecords(records)}

			<br /><br />
			<button onClick={() => consumer2?.delete()}>Delete</button>
			<button disabled={!consumerInitialized} onClick={() => consume(2)}>Consume2</button>

			{mapConsumerRecords(records2)}

			<br /><br />
			<button onClick={() => fetchAllRecords()}>All records for test</button>
			<button onClick={() => fetchAllRecordsOnPartition()}>All records for test on partition 0</button>
			{mapConsumerRecords(allRecords)}

			<br /><br />
			<button onClick={() => fetchAllTopics()}>All topics</button>
			{allTopics.map((topic, i) => (<div key={i}>{topic} <br /></div>))}

			<br /><br />
			<input ref={keyInputRef} type="text" placeholder='Key' />
			<br />
			<input ref={valueInputRef} type="text" placeholder='value' />
			<br />
			<button onClick={produce}>Produce</button>

			<a href="http://localhost:4001/oauth2/authorization/github">Login</a>

        </div>
    )
}
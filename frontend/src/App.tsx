import { useState } from 'react';
import './App.css';

export default function App() {
	const KAFKA_BASE_URL = "http://localhost:8000";
	const [topics, setTopics] = useState([""]);
	const [records, setRecords] = useState([]);

	async function listTopics(): Promise<void> {
		const url = `${KAFKA_BASE_URL}/topics`;

		try {
			const response = await fetch(url);

			console.log(response);
			setTopics(await response.json());
			
		} catch (e) {
			console.log(e);
		}
	}

	async function deleteConsumer(): Promise<void> {
		const url = `${KAFKA_BASE_URL}/consumers/group1/instances/consumer1`;

		try {
			console.log("delete consuumer1");
			
			const response = await fetch(url, {
				method: "delete",
				headers: {
					'Content-Type': 'application/vnd.kafka.v2+json'
				}
			});

			console.log(response);
			
			
		} catch (e) {
			console.log(e);
		}
	}

	async function consumeTopics(): Promise<void> {
		const url = `${KAFKA_BASE_URL}/consumers/group1/instances/consumer1/records`;

		try {
			console.log("get records for " + topics);
			
			const response = await fetch(url, {
				method: "get",
				headers: {
					'Accept': 'application/vnd.kafka.json.v2+json'
				}
			});

			console.log(response);
			if (response.ok)
				setRecords(await response.json());
			
			
		} catch (e) {
			console.log(e);
		}
	}

	
	async function subscribeToTopics(): Promise<void> {
		const url = `${KAFKA_BASE_URL}/consumers/group1/instances/consumer1/subscription`;

		try {
			console.log("subscribe to " + topics);
			
			const response = await fetch(url, {
				method: "post",
				body: JSON.stringify({
					topics: topics
				}),
				headers: {
					"Content-Type": "application/vnd.kafka.v2+json"
				}
			});

			console.log(response);
			
		} catch (e) {
			console.log(e);
		}
	}

	async function createConsumer(groupName: string, consumerId: string): Promise<void> {
		const url = `${KAFKA_BASE_URL}/consumers/${groupName}`;

		try {
			const response = await fetch(url, {
				method: "post", 
				headers: {
					"Content-Type": "application/vnd.kafka.v2+json"
				},
				body: JSON.stringify({
					"format": "json",
					"name": consumerId, // the consumer id
					"auto.offset.reset": "earliest",
					"auto.commit.enable": "false",
					// "fetch.min.bytes": "string",
					"consumer.request.timeout.ms": "1000"
				})
			});

			console.log(response);
			
		} catch (e) {
			console.log(e);
		}
	}

	// TODO: continue here
	async function getOffsets(): Promise<void> {
		const url = `${KAFKA_BASE_URL}/consumers/group1/instances/consumer1/offsets`;

		try {
			const response = await fetch(url, {
				method: "post", 
				headers: {
					"Content-Type": "application/vnd.kafka.v2+json"
				},
				body: JSON.stringify({
					partitions: [
						{
							"topic": topics[0],
							"partition": 0
						}
					]
				})
			});

			console.log(response);
			if (response.ok)
				console.log(await response.json());
				
			
		} catch (e) {
			console.log(e);
		}
		// 
	}

	return (
		<>
			<button onClick={listTopics}>load topics</button>
			<div>{topics}</div>

			<button onClick={() => createConsumer("group1", "consumer1")}>create consumer</button>
			<br />

			<button onClick={subscribeToTopics}>subscribe to topics</button>
			<br />

			{/* <button onClick={getOffsets}>get offsets</button>
			<br /> */}

			<button onClick={consumeTopics}>Get records for {topics}</button>
			<div>{records}</div>
			<div hidden={!!records?.length}>No records</div>

			<button onClick={deleteConsumer}>delete consumer</button>
			<br />

			<a href="http://localhost:4001/oauth2/authorization/github">Login</a>
		</>
	)
}
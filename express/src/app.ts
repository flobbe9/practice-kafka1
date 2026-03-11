import express from 'express';
import { Consumer, RedpandaJwtAuthConfig, throwApiException, type CustomApiResponseFormat, type RedpandaConfig } from 'redpanda';
import { isHttpStatusCodeAlright } from './utils.ts';

const redpandaConfig: RedpandaConfig = {
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

		if (!isHttpStatusCodeAlright(response!.status))
			throwApiException(await response!.json() as CustomApiResponseFormat); // expect backend response body to formatted exactly like CustomApiResponseFormat

		return await response!.text();
	})
}

const app = express();

app.use(express.json());

console.log("Creating consumer 'consumer1'");
const consumer = new Consumer(["test"], "group1", "consumer1", redpandaConfig)
	.keepAlive(false);

app.get("/", async (_req, res) => {
	console.log("consume");
	await consumer.init();
    
	const response = await consumer.consume();
	res.send("consumed " + JSON.stringify(response));
})

app.get("/delete", async (_req, res) => {
    console.log("delete");
	await consumer.init();
    
	const response = await consumer.delete();
	res.send("deleted " + JSON.stringify(response));
})

export default app;
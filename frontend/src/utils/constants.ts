import { RedpandaConfig, RedpandaJwtAuthConfig, throwApiException } from "redpanda";
import { isHttpStatusCodeAlright } from "./utils";

export const CSRF_TOKEN_COOKIE_NAME = "XSRF-TOKEN";
export const CSRF_TOKEN_HEADER_NAME = "X-XSRF-TOKEN";

export const GLOBAL_REDPANDA_CONFIG: RedpandaConfig = {
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
			throwApiException(await response!.json()); // expect backend response body to formatted exactly like CustomApiResponseFormat

		return await response!.text();
	})
}
import { RedpandaConfig } from "redpanda";

export const GATEWAY_BASE_URL = import.meta.env.VITE_GATEWAY_BASE_URL;

export const CSRF_TOKEN_COOKIE_NAME = "XSRF-TOKEN";
export const CSRF_TOKEN_HEADER_NAME = "X-XSRF-TOKEN";

export const GLOBAL_REDPANDA_CONFIG: RedpandaConfig = {
	baseUrl: `${GATEWAY_BASE_URL}/api/kafka`
}
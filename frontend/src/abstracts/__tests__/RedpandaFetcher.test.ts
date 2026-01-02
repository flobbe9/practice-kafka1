import { mockFetchJson } from "@/utils/testUtils"
import { RedpandaFetcher } from "../redpanda/RedpandaFetcher";
import { RedpandaConfig } from "../redpanda/RedpandaConfig";
import { RedpandaBasicAuthConfig } from "../redpanda/RedpandaBasicAuthConfig";

const mockRedpandaConfig: RedpandaConfig = {
    baseUrl: "http://mockHost",
    authConfig: RedpandaBasicAuthConfig.getInstance("user", "password")
};
const authHeaderKey = "Authorization";

describe("addFetchHeaders", () => {
    test("works with falsy arg", async () => {
        let fetchHeaders: HeadersInit = {};
        mockFetchJson((_url, init) => {
            fetchHeaders = init?.headers ?? {};
        });

        const redpandaFetcher = new RedpandaFetcher(mockRedpandaConfig);

        await redpandaFetcher.fetch("/"); // no config arg
        expect(fetchHeaders).toHaveProperty(authHeaderKey);

        await redpandaFetcher.fetch("/", {}); // no headers prop
        expect(fetchHeaders).toHaveProperty(authHeaderKey);
    })

    test("does not replace matching header (caseinsensitive)", async () => {
        let fetchHeaders: HeadersInit = {};
        mockFetchJson((_url, init) => {
            fetchHeaders = init?.headers ?? {};
        });

        const redpandaFetcher = new RedpandaFetcher(mockRedpandaConfig);

        await redpandaFetcher.fetch("/", {headers: {[authHeaderKey]: "0"}});
        expect(fetchHeaders[authHeaderKey]).toBe("0"); // should not have replace value with "Basic ..."

        await redpandaFetcher.fetch("/", {headers: {[authHeaderKey.toLowerCase()]: "0"}});
        expect(fetchHeaders).toHaveProperty(authHeaderKey.toLowerCase()); // should still have exact same key
        expect(fetchHeaders[authHeaderKey.toLowerCase()]).toBe("0");
    })

    test("should add auth header", async () => {
        let fetchHeaders: HeadersInit = {};
        mockFetchJson((_url, init) => {
            fetchHeaders = init?.headers ?? {};
        });

        const redpandaFetcher = new RedpandaFetcher(mockRedpandaConfig);
        
        await redpandaFetcher.fetch("/", {headers: {"otherHeader": "0"}});
        expect(fetchHeaders).toHaveProperty(authHeaderKey); // should have added
        expect(fetchHeaders).toHaveProperty("otherHeader"); // should keep existing headers
    })
})

describe("parseRedpandaErrorResponse", () => {
    test("validate redapnda error response", async () => {
        const redpandaFetcher = new RedpandaFetcher(mockRedpandaConfig);
        let error = null;

        mockFetchJson(
            () => {},
            null, // cannot be null
            400
        );
        try {
            // throws api exception expecting a redpanda error response
            await redpandaFetcher.fetch("/");

        } catch (e) {
            error = e;
        }
        expect(error).not.toBeFalsy();
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message.startsWith("{")).toBe(false); // should have failed to parse redpanda error response to api response format

        error = null;
        
        expect(error).toBeNull();
        mockFetchJson(
            () => {},
            {
                error: 40001, // "error" is not a valid redpanda error response prop
                message: "Bad request"
            },
            400
        );
        try {
            // throws api exception expecting a redpanda error response
            await redpandaFetcher.fetch("/");

        } catch (e) {
            error = e;
        }
        expect(error).not.toBeFalsy();
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message.startsWith("{")).toBe(false); // should have failed to parse redpanda error response to api response format
        
        error = null;
        
        expect(error).toBeNull();
        mockFetchJson(
            () => {},
            {
                error_code: 40001, 
                messageeee: "Bad request" // not a valid redpanda error response prop
            },
            400
        );
        try {
            // throws api exception expecting a redpanda error response
            await redpandaFetcher.fetch("/");

        } catch (e) {
            error = e;
        }
        expect(error).not.toBeFalsy();
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message.startsWith("{")).toBe(false); // should have failed to parse redpanda error response to api response format
        
        error = null;
        
        expect(error).toBeNull();
        mockFetchJson(
            () => {},
            {
                error_code: 4001, // cannot be 4 digits long
                message: "Bad request" 
            },
            400
        );
        try {
            // throws api exception expecting a redpanda error response
            await redpandaFetcher.fetch("/");

        } catch (e) {
            error = e;
        }
        expect(error).not.toBeFalsy();
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message.startsWith("{")).toBe(false); // should have failed to parse redpanda error response to api response format

        error = null;
        
        expect(error).toBeNull();
        mockFetchJson(
            () => {},
            {
                error_code: null, // cannot be null
                message: "Bad request" 
            },
            400
        );
        try {
            // throws api exception expecting a redpanda error response
            await redpandaFetcher.fetch("/");

        } catch (e) {
            error = e;
        }
        expect(error).not.toBeFalsy();
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message.startsWith("{")).toBe(false); // should have failed to parse redpanda error response to api response format
        
        error = null;
        
        expect(error).toBeNull(); 
        mockFetchJson(
            () => {},
            {
                error_code: 40001, 
                message: "Bad request"
            },
            400
        );
        try {
            // throws api exception expecting a redpanda error response
            await redpandaFetcher.fetch("/");
 
        } catch (e) {
            error = e;
        }
        expect(error).not.toBeFalsy();
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message.startsWith("{")).toBe(true); // should have parsed redpanda error response to api response format

        error = null;
        
        expect(error).toBeNull();
        mockFetchJson(
            () => {},
            {
                code: 40001, 
                message: "Bad request"
            },
            400
        );
        try {
            // throws api exception expecting a redpanda error response
            await redpandaFetcher.fetch("/");

        } catch (e) {
            error = e;
        }
        expect(error).not.toBeFalsy();
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message.startsWith("{")).toBe(true); // should have parsed redpanda error response to api response format
    });

    test("unslash path", async () => {
        const redpandaFetcher = new RedpandaFetcher(mockRedpandaConfig);
        let path = "/my/path/";
        const expectedPath = "my/path";

        let actualUrl = "";
        mockFetchJson(
            (url) => {
                actualUrl = url;
            },
            {},
            200
        );
        await redpandaFetcher.fetch(path);
        expect(actualUrl).toBe(`${mockRedpandaConfig.baseUrl}/${expectedPath}`); // should have unslashed the path

        path = expectedPath;
        mockFetchJson(
            (url) => {
                actualUrl = url;
            },
            {},
            200
        );
        await redpandaFetcher.fetch(path);
        expect(actualUrl).toBe(`${mockRedpandaConfig.baseUrl}/${path}`); // should have unslashed the path
    });

    test("should throw for bad response status codes", async () => {
        const redpandaFetcher = new RedpandaFetcher(mockRedpandaConfig);
        mockFetchJson(
            () => {},
            {},
            100
        );
        await redpandaFetcher.fetch("/"); // assert does not throw

        mockFetchJson(
            () => {},
            {},
            200
        );
        await redpandaFetcher.fetch("/"); // assert does not throw
        
        mockFetchJson(
            () => {},
            {},
            300
        );
        await redpandaFetcher.fetch("/"); // assert does not throw
                
        mockFetchJson(
            () => {},
            {
                code: 40001,
                message: "bad request"
            },
            400
        );
        let error = null;
        try {
            await redpandaFetcher.fetch("/");

        } catch (e) {
            error = e;
        }
        expect(error).not.toBeNull();
        expect(JSON.parse((error as Error).message)).toHaveProperty("statusCode"); // expect custom api response format

        error = null;
        
        expect(error).toBeNull();
        mockFetchJson(
            () => {},
            {
                code: 500,
                message: "error"
            },
            500
        );
        try {
            await redpandaFetcher.fetch("/");

        } catch (e) {
            error = e;
        }
        expect(error).not.toBeNull();
        expect(JSON.parse((error as Error).message)).toHaveProperty("statusCode"); // expect custom api response format
    })
});
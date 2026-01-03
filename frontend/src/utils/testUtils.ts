/**
 * Replace global `fetch` function with mock function which always resolves with a `Response` object using given args:
 * ```
 * mockFetchJson((url) => console.log(`fetch ${url}`), {value: "expectedValue"}, 200);
 * 
 * const response = await fetch(url); // logs "fetch {url}"
 * const resopnseBody = await response.json(); // == {value: "expectedValue"};
 * const status = response.status; // == 200
 * const isOk = response.ok; // == true, because status is 200
 * ```
 * 
 * @param callback executed in mock fetch call
 * @param jsonMockResponse to resolve `response.json()` promise with
 * @param mockStatus `response.status` value
 */
export function mockFetchJson(callback: (url: string, init?: RequestInit) => any, jsonMockResponse: object | null = {}, mockStatus = 200): void {
    globalThis.fetch = jest.fn((url: string, init?: RequestInit) => {
        callback(url, init);

        return Promise.resolve({
            json: () => new Promise((res, rej) => {
                if (jsonMockResponse instanceof Error)
                    rej(jsonMockResponse);
                else
                    res(jsonMockResponse);
            }),
            status: mockStatus,
            ok: mockStatus === 200
        })
    }) as jest.Mock;
}
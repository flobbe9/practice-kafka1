import { assertStrictlyFalsyAndThrow, isStrictlyFalsy } from "./utils";

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
export function mockFetchJson(callback?: (url: string, init?: RequestInit) => any, jsonMockResponse: object | null = {}, mockStatus = 200): void {
    globalThis.fetch = jest.fn((url: string, init?: RequestInit) => {
        if (callback)
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

/**
 * ```
 * await expectAsyncToThrow(async () => foo());
 * ```
 * @param asyncCallback is supposed to throw `expectedErrorMessage`
 * @param expectedErrorMessage error message to be expected
 * @throws if `asyncCallback` does not throw or, if `expectedErrorMessage` is specified, `e.message` does not equal `expectedErrorMessage`
 */
export async function expectAsyncToThrow(asyncCallback: () => Promise<any>, expectedErrorMessage?: string): Promise<void> {
    assertStrictlyFalsyAndThrow(asyncCallback);
    
    let actualError = null;
    try {
        await asyncCallback();
    } catch (e) {
        actualError = e;
    }

    if (actualError) {
        if (!isStrictlyFalsy(expectedErrorMessage) && (!(actualError instanceof Error) || actualError.message !== expectedErrorMessage)) 
            throw new Error(`Expected async callback to throw an Error with message '${expectedErrorMessage}' but threw ${actualError}.`);

    } else
        throw new Error(`Expected async callback to throw but did not throw.`);
}

/**
 * ```
 * await expectAsyncNotToThrow(async () => foo());
 * ```
 * @param asyncCallback is not supposed to throw
 * @throws if `asyncCallback` throws an error
 */
export async function expectAsyncNotToThrow(asyncCallback: () => Promise<any>): Promise<void> {
    assertStrictlyFalsyAndThrow(asyncCallback);
    
    let actualError = null;
    try {
        await asyncCallback();
    } catch (e) {
        actualError = e;
    }

    if (actualError)
        throw new Error(`Expected asnc callback not to throw but threw: ${actualError}`);
}
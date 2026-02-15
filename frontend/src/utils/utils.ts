
/**
 * @param statusCode http status code to check
 * @returns true if status code is informational (1xx), successful (2xx) or redirectional (3xx), else false
 */
export function isHttpStatusCodeAlright(statusCode: number): boolean {
    return statusCode <= 399;
}

export function isNumberStrictlyFalsy(num: any): boolean {
    return isStrictlyFalsy(num) || isNaN(num);
}

/**
 * @param obj 
 * @returns `true` if, and only if, `obj` is `undefined` or `null`
 */
export function isStrictlyFalsy(obj: any): boolean {
    return obj === undefined || obj === null;
}

/**
 * Throws at the first arg beeing strictly falsy (but not if no args are specified). 
 *
 * @param args to check
 * @see {@link isStrictlyFalsy}
 * @see {@link isNumberStrictlyFalsy}
 */
export function assertStrictlyFalsyAndThrow(...args: any[]): void {
    if (!args || !args.length) 
        return;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        let falsy = false;

        if (typeof arg === "number") 
            falsy = isNumberStrictlyFalsy(arg);
        else 
            falsy = isStrictlyFalsy(arg);

        if (falsy) 
            throw new Error(`Invalid arg at index ${i}`);
    }
}

/**
 * @param date to format, default is ```new Date()```
 * @returns nicely formatted string formatted like ```year-month-date hours:minutes:seconds:milliseconds```
 */
export function getTimeStamp(date = new Date()): string {
    return (
        date.getFullYear() +
        "-" +
        prepend0ToNumber(date.getMonth() + 1) +
        "-" +
        prepend0ToNumber(date.getDate()) +
        " " +
        prepend0ToNumber(date.getHours()) +
        ":" +
        prepend0ToNumber(date.getMinutes()) +
        ":" +
        prepend0ToNumber(date.getSeconds()) +
        ":" +
        prepend0ToNumber(date.getMilliseconds(), 3)
    );
}

/**
 * @param num to prepend a 0 to
 * @param totalDigits number of digits (including `num`) to stop prepending zeros at. Default is 2, that would make `5 => 05`
 * @returns a string representation of given number with a 0 prended if the number has only one digit
 */
function prepend0ToNumber(num: number, totalDigits = 2): string {
    let str = num.toString();

    while (str.length < totalDigits)
        // case: one digit only
        str = "0" + str;        

    return str;
}

/**
 * @param str string to check
 * @returns true if given string is empty or only contains white space chars
 */
export function isBlank(str: string | undefined | null): boolean {
    if (!str && str !== "")
        return true;

    str = str.trim();

    return str.length === 0;
}

/**
 * @return a random hex string of 13 chars
 */
export function randomString(): string {
    return (Math.random()).toString(16).substring(2);
}

/**
 * Await a promise that resolves after given delay with given ```resolveValue```.
 * 
 * @param delay in ms
 * @param resolveValue value passed to ```res``` callback 
 * @returns ```resolveValue``` or ```undefined```
 */
export async function sleep<T>(delay: number, resolveValue?: T): Promise<T | undefined> {

    return await new Promise((res, ) => {
        setTimeout(() => {
            res(resolveValue);
        }, delay);
    });
} 
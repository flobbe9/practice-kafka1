/**
 * NOTE: cannot import from modules that import from utils.ts because that would create a cycle.
 */
import { CSSProperties, JSX } from "react";

/**
 * Wont throw if not a number.
 *
 * @param str
 * @returns the number or -1
 */
export function stringToNumber(str: string | number | undefined | null): number {
    if (typeof str === "number") return str;

    try {
        return Number.parseFloat(str!);
    } catch (e) {
        return -1;
    }
}

/**
 * @param obj 
 * @returns `true` if, and only if, `obj` is `undefined` or `null`
 */
export function isFalsy(obj: any): boolean {
    return obj === undefined || obj === null;
}

export function isNumberFalsy(num: any): boolean {
    return num === undefined || num === null || isNaN(num);
}

/**
 * @param str string to check
 * @returns true if given string is empty or only contains white space chars
 */
export function isBlank(str: string | undefined | null): boolean {
    if (!str && str !== "") return true;

    str = str.trim();

    return str.length === 0;
}

/**
 * @param str to check
 * @returns true if and only if ```str.length === 0``` is true
 */
export function isEmpty(str: string): boolean {
    if (!str && str !== "") return false;

    return str.length === 0;
}

/**
 * @param length num chars the string should have. Default is 12 (but returns length 10 for some reason)
 * @returns random string of of alphanumeric chars with given length
 */
export function getRandomString(length = 12): string {
    return Math.random()
        .toString(36)
        .substring(2, length + 2);
}

/**
 * Insert given ```insertionString``` into given ```targetString``` after given index.
 *
 * I.e: ```insertString("Hello", "X", 1)``` would return ```HXello```.
 *
 * @param targetString string to insert another string into
 * @param insertionString string to insert
 * @param insertionIndex index in ```targetString``` to insert into, i.e ```insertionIndex = 0``` would insert at the start
 * @returns result string, does not alter ```targetString```
 */
export function insertString(targetString: string, insertionString: string, insertionIndex: number): string {
    let leftHalft = targetString.substring(0, insertionIndex);
    const rightHalf = targetString.substring(insertionIndex);

    leftHalft += insertionString;

    return leftHalft + rightHalf;
}

/**
 * @param haystack to count needle in
 * @param needle to count occurrences of
 * @returns the number of occurrences of ```needle``` in ```haystack``` or -1 if falsy params
 */
export function countSubstrings(haystack: string, needle: string | RegExp): number {
    if (isFalsy(haystack) || needle === null || needle === undefined) return -1;

    if (isBlank(haystack)) return 0;

    return haystack.split(needle).length - 1;
}

/**
 * Register "beforeunload" event. By default the handler will just be a confirm popup by browser
 *
 * @param handler Default is ```event.preventDefault()```
 * @param dontConfirmInDev indicates whether to avoid confirm alert if env is "development". Defautl is ```true```
 */
export function confirmPageUnload(handler: (event: BeforeUnloadEvent) => void = (event) => event.preventDefault(), dontConfirmInDev = true): void {
    if (process.env.NODE_ENV === "development" && dontConfirmInDev) return;

    window.addEventListener("beforeunload", handler);
}

/**
 * Unegister "beforeunload" event.
 *
 * @param handler
 */
export function removeConfirmPageUnload(handler: (event: BeforeUnloadEvent) => void): void {
    window.removeEventListener("beforeunload", handler);
}

/**
 * Remove given ```classToRemove``` className from given ```element```, add given ```classToAdd``` and then
 * after given ```holdTime``` undo both operations.
 *
 * @param element element to flash the className of
 * @param classToAdd className the element has while flashing
 * @param classToRemove className the element should loose while flashing and get back afterwards
 * @param holdTime time in ms that the border stays with given classToAdd and without given classToRemove, default is 1000
 * @return promise that resolves once animation is finished
 */
export async function flashClass(element: HTMLElement, classToAdd: string, classToRemove?: string, holdTime = 1000) {
    return new Promise((res, rej) => {
        if (!element) {
            rej("'element' falsy");
            return;
        }
        // remove old class
        removeClass(element, classToRemove || "");

        // add flash class shortly
        addClass(element, classToAdd);

        // reset and resolve
        setTimeout(() => {
            removeClass(element, classToAdd);
            addClass(element, classToRemove || "");
            res("");
        }, holdTime);
    });
}

/**
 * Add given css object to given element for given amount of time and reset css values afterwards.
 *
 * @param element id of element to flash the syle of
 * @param flashCss css object to apply to given element
 * @param holdTime time in ms to apply the styles before resetting them
 * @returns a Promise which resolves once styles are reset
 */
export async function flashCss(element: HTMLElement, flashCss: CSSProperties, holdTime = 1000): Promise<void> {
    return new Promise((res, rej) => {
        if (!element) {
            rej("'elementId' falsy");
            return;
        }

        const initCss: CSSProperties = {};

        // set flash styles
        Object.entries(flashCss).forEach(([cssProp, cssVal]) => {
            // save init css entry
            initCss[cssProp] = element.style[cssProp];

            // set flash css value
            element.style[cssProp] = cssVal;
        });

        // reset flash styles
        setTimeout(() => {
            res(Object.entries(initCss).forEach(([cssProp, cssVal]) => (element.style[cssProp] = cssVal)));
        }, holdTime);
    });
}

/**
 * @param str string to replace a char in
 * @param replacement string to use as replacement
 * @param startIndex of chars to replace in ```str```
 * @param endIndex of chars to replace in ```str``` (not included), default is ```str.length```
 * @returns string with replacement at given position (does not alter ```str```)
 */
export function replaceAtIndex(str: string, replacement: string, startIndex: number, endIndex = str.length): string {
    const charsBeforeIndex = str.substring(0, startIndex);
    const charsBehindIndex = str.substring(endIndex);

    return charsBeforeIndex + replacement + charsBehindIndex;
}

/**
 * @param expected first value to compare
 * @param actual second value to compare
 * @returns ```expected === actual``` after calling ```toLowerCase()``` on both values.
 *          Types wont be considered: ```"1" === 1 = true```
 */
export function equalsIgnoreCase(expected: string | number | undefined, actual: string | number | undefined): boolean {
    if (!expected || !actual) return expected === actual;

    expected = expected.toString().toLowerCase();
    actual = actual.toString().toLowerCase();

    return expected === actual;
}

/**
 * @param expected first value to compare
 * @param actual second value to compare
 * @returns ```expected === actual``` after calling ```trim()``` and ```toLowerCase()``` on both values.
 *          Types wont be considered: ```"1" === 1 = true```
 */
export function equalsIgnoreCaseTrim(expected: string | number, actual: string | number): boolean {
    if (!expected || !actual) return expected === actual;

    expected = expected.toString().trim().toLowerCase();
    actual = actual.toString().trim().toLowerCase();

    return expected === actual;
}

/**
 * @param arr array to search in
 * @param value string or number to look for
 * @returns true if value is included in array. Uses {@link equalsIgnoreCase} for comparison instead of ```includes()```.
 */
export function includesIgnoreCase(arr: (string | number)[] | string, value: string | number): boolean {
    // case: arr is string
    if (typeof arr === "string") return arr.toLowerCase().includes(value.toString().toLowerCase());

    const result = arr.find((val) => equalsIgnoreCase(val, value));

    return result ? true : false;
}

/**
 * @param arr array to search in
 * @param value string or number to look for
 * @returns true if value is included in array. Uses {@link equalsIgnoreCaseTrim} for comparison instead of ```includes()```.
 */
export function includesIgnoreCaseTrim(arr: (string | number)[] | string, value: string | number): boolean {
    // case: arr is string
    if (typeof arr === "string") return arr.trim().toLowerCase().includes(value.toString().trim().toLowerCase());

    const result = arr.find((val) => equalsIgnoreCaseTrim(val, value));

    return result ? true : false;
}

/**
 * @param str to check
 * @param regexp pattern to use for checking
 * @returns true if and only if all chars in given string match given pattern, else false
 */
export function matchesAll(str: string, regexp: RegExp): boolean {
    // iterate chars
    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char.match(regexp) === null) return false;
    }

    return true;
}

export function isStringAlphaNumeric(str: string): boolean {
    // alpha numeric regex
    const regexp = /^[a-z0-9ßäÄöÖüÜ]+$/i;

    return matchString(str, regexp);
}

/**
 * @param str to check
 * @returns true if every char of given string matches regex. Only alphabetical chars including german exceptions
 *          'ßäÄöÖüÜ' are a match (case insensitive).
 */
export function isStringAlphabetical(str: string): boolean {
    // alpha numeric regex
    const regexp = /^[a-zßäÄöÖüÜ]+$/i;

    return matchString(str, regexp);
}

/**
 * @param str to check
 * @param considerDouble if true, ',' and '.' will be included in the regex
 * @returns true if every char of given string matches the numeric regex
 */
export function isStringNumeric(str: string, considerDouble = false): boolean {
    // alpha numeric regex
    let regexp = /^[0-9]+$/;

    if (considerDouble) regexp = /^[0-9.,]+$/;

    return matchString(str, regexp);
}

export function setCssConstant(variableName: string, value: string): void {
    document.documentElement.style.setProperty("--" + variableName, value);
}

/**
 * @param variableName the variable name without the double dashes in front
 * @returns the value of the given css variable as defined in ```:root```
 */
export function getCssConstant(variableName: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue("--" + variableName);
}

/**
 * Cut given number of digits from cssValue and try to parse substring to number.
 *
 * @param cssValue css value e.g: 16px
 * @param unitDigits number of digigts to cut of cssValue string
 * @returns substring of cssValue parsed to number or NaN if parsing failed
 */
export function getCSSValueAsNumber(cssValue: string | number, unitDigits: number): number {
    // case: is a number already
    if (typeof cssValue === "number") return cssValue;

    // case: no value
    if (isBlank(cssValue)) return NaN;

    const length = cssValue.length;
    if (unitDigits >= length) {
        // case: is numeric
        if (isStringNumeric(cssValue, true)) return stringToNumber(cssValue);

        "Failed to get css value as number. 'unitDigits' (" + unitDigits + ") too long or 'cssValue' (" + cssValue + ") too short.";
    }

    const endIndex = cssValue.length - unitDigits;

    return stringToNumber(cssValue.substring(0, endIndex));
}

/**
 * @param str to check
 * @param regexp to use for matching
 * @returns true if every char of string matches the regex, trims the string first
 */
function matchString(str: string, regexp: RegExp): boolean {
    str = str.trim();

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char.match(regexp) === null) return false;
    }

    return true;
}

/**
 * Use this to compare primitive values.
 *
 * @param val1
 * @param val2
 * @param considerDistintFalsyValues if `true` values are considered not equal if they have different falsy values, e.g. `null` and `undefined`. Default is `false`
 * @returns `val1 === val2` and by default considering 2 falsy values equal
 */
export function defaultEquals<T>(val1: T, val2: T, considerDistintFalsyValues = false): boolean {
    if (considerDistintFalsyValues) return val1 === val2;

    if (!val1) return !val2;

    if (!val2) return false;

    return val1 === val2;
}

/**
 * @param val1
 * @param val2
 * @param considerDistintFalsyValues if `true` values are considered not equal if they have different falsy values, e.g. `null` and `undefined`. Default is `false`
 * @returns `val1 === val2` but only if one of the values is falsy, else `null`
 */
export function defaultEqualsFalsy<T>(val1: T, val2: T, considerDistintFalsyValues = false): boolean | null {
    if (!val1 || !val2) return defaultEquals(val1, val2, considerDistintFalsyValues);

    return null;
}

/**
 * Makes user confirm and prevents default event if confirm alert was canceld. Only confirm if
 * current location matches at least one of ```props.pathsToConfirm```.<p>
 *
 * Do nothing if ```API_ENV``` is "dev"
 *
 * @param currentPath path of current url
 * @param pathsToConfirm list of paths that should use the confirm popup
 * @param event that triggered the navigation
 */
export function confirmNavigateEvent(currentPath: string, pathsToConfirm: string[], event: any): void {
    if (process.env.ENV === "development") return;

    const confirmLeaveMessage = "Seite verlassen? \nVorgenommene Änderungen werden unter Umständen nicht gespeichert.";

    if (pathsToConfirm.includes(currentPath) && !window.confirm(confirmLeaveMessage)) event.preventDefault();
}

/**
 * Makes user confirm and prevents default event if confirm alert was canceld. Only confirm if
 * currentPath matches at least one of ```props.pathsToConfirm```, else simply excute the callback without confirmation.
 *
 * @param currentPath path of current url
 * @param callback optional. Execute on confirm
 * @param pathsToConfirm list of paths that should use the confirm popup
 */
export function confirmNavigateCallback(currentPath: string, callback?: () => any, ...pathsToConfirm: string[]): void {
    const confirmLeaveMessage = "Seite verlassen? \nVorgenommene Änderungen werden unter Umständen nicht gespeichert.";

    if (pathsToConfirm.includes(currentPath) && !window.confirm(confirmLeaveMessage)) return;

    if (callback) callback();
}

export function dateEquals(d1: Date | undefined, d2: Date | undefined): boolean {
    // check undefined
    if (!d1) {
        if (d2) return false;

        return true;
    } else if (!d2) return false;

    // copy to new object, dont consider time
    const date1 = stripTimeFromDate(new Date(d1));
    const date2 = stripTimeFromDate(new Date(d2));

    return date1.getTime() === date2.getTime();
}

/**
 * @param date date that is supposedly before ```otherDate```
 * @param otherDAte date that is supposedly after ```date```
 * @returns true if ```date``` is before ```otherDate``` (not equal). Ignores time and uses only date
 */
export function isDateBefore(date: Date, otherDate: Date): boolean {
    const date1 = stripTimeFromDate(new Date(date));
    const date2 = stripTimeFromDate(new Date(otherDate));

    return date1 < date2;
}

/**
 * @param date date that is supposedly equal to ```otherDate```
 * @param otherDAte date that is supposedly equal to ```date```
 * @returns true if ```date``` has the same year, month and day as ```otherDate```. Ignores time
 */
export function isDateEqual(date: Date, otherDate: Date): boolean {
    const date1 = stripTimeFromDate(new Date(date));
    const date2 = stripTimeFromDate(new Date(otherDate));

    return date1.getTime() === date2.getTime();
}

/**
 * @param date date that is supposedly after ```otherDate```
 * @param otherDAte date that is supposedly before ```date```
 * @returns true if ```date``` is after ```otherDate``` (not equal). Ignores time and uses only date
 */
export function isDateAfter(date: Date, otherDate: Date): boolean {
    const date1 = stripTimeFromDate(new Date(date));
    const date2 = stripTimeFromDate(new Date(otherDate));

    return date1 > date2;
}

export function datePlusYears(years: number, date = new Date()): Date {
    if (isNumberFalsy(years)) return date;

    const alteredDate = new Date(date);
    const dateYears = alteredDate.getFullYear();
    alteredDate.setFullYear(dateYears + years);

    return alteredDate;
}

export function datePlusDays(days: number, date = new Date()): Date {
    if (isNumberFalsy(days)) return date;

    const alteredDate = new Date(date);
    const dateDays = alteredDate.getDate();
    alteredDate.setDate(dateDays + days);

    return alteredDate;
}

export function dateMinusDays(days: number, date = new Date()): Date {
    if (isNumberFalsy(days)) return date;

    const alteredDate = new Date(date);
    const dateDays = alteredDate.getDate();
    alteredDate.setDate(dateDays - days);

    return alteredDate;
}

export function stripTimeFromDate(d: Date): Date {
    const date = new Date(d);

    date.setMilliseconds(0);
    date.setSeconds(0);
    date.setMinutes(0);
    date.setHours(0);

    return date;
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
 * Note: user will need to consent for this function to work.
 *
 * @returns raw unstyled text currently copied to clipboard
 */
export async function getClipboardText(): Promise<string> {
    return navigator.clipboard.readText();
}

/**
 * @param text to copy to clipboard
 */
export async function setClipboardText(text: string): Promise<void> {
    navigator.clipboard.writeText(text);
}

/**
 * @param eventKey to check
 * @param includeEnter whether to return ```true``` if event key equals "Enter". Default is ```true```
 * @param includeRemovingKey see {@link isEventKeyRemovingKey()}. Default is ```false```
 * @returns ```true``` if given eventKey would take up space when inserted into a text input
 */
export function isEventKeyTakingUpSpace(eventKey: string, includeEnter = true, includeRemovingKey = false): boolean {
    if (isEmpty(eventKey)) return false;

    return eventKey.length === 1 || (includeEnter && eventKey === "Enter") || (includeRemovingKey && isEventKeyRemovingKey(eventKey));
}

export function isEventKeyRemovingKey(eventKey: string): boolean {
    return eventKey === "Backspace" || eventKey === "Delete";
}

/**
 * @param str to change first char to upper case of (wont be altered)
 * @returns a copy of given string with the first char to upper case or a blank string
 */
export function toUpperCaseFirstChar(str: string): string {
    // case: blank
    if (isBlank(str)) return str;

    // case: only one char
    if (str.length === 1) return str.toUpperCase();

    return str.charAt(0).toUpperCase() + str.substring(1);
}

/**
 * @param array the array with jsx elements to look in
 * @param key the key of the element to search in given ```array```
 * @returns the index of the element with given ```key``` in given ```array``` or -1
 */
export function getJsxElementIndexByKey(array: JSX.Element[], key: string | number): number {
    if (isFalsy(array) || !array.length) return -1;

    for (let i = 0; i < array.length; i++) if (array[i].key === key) return i;

    return -1;
}

/**
 * Removes current page from browser history and replaces it with given ```path```.
 *
 * @param path relative path to replace the current history entry with. Default is the current path
 * @param state the ```history.state``` to replace. Default is ```null``` (beeing the current one)
 */
export function replaceCurrentBrowserHistoryEntry(path: string | URL | null = window.location.pathname, state: any = null): void {
    window.history.replaceState(state, "", path);
}

/**
 * Updates the current url's query params without creating a new history entry.
 *
 * @param key url query key. Cannot be blank
 * @param value url query value. If blank the key will be replaced as well
 */
export function updateCurrentUrlQueryParams(key: string, value: string): void {
    if (isBlank(key) || isFalsy(value)) return;

    const url = new URL(window.location.href);

    // if value is balnk
    if (isBlank(value)) url.searchParams.delete(key);
    else url.searchParams.set(key, value);

    replaceCurrentBrowserHistoryEntry(url);
}

/**
 * Indicates whether given ```path``` is relative. Will return ```true``` if ```path``` does not look absolute.
 *
 * @param path to check
 * @returns true if given path is blank or does not start with "http", "www" or the current {@link HOST}
 */
export function isPathRelative(path: string | undefined | null): boolean {
    if (isBlank(path)) return true;

    return !path!.startsWith("http") && !path!.startsWith("www");
}

/**
 * @param strNode to parse to element. Should be one node but may have any number of children
 * @returns the html element or an empty ```<div>``` element if arg is falsy
 */
export function stringToHtmlElement(strNode: string): HTMLElement {
    const parser = new DOMParser();

    if (isBlank(strNode)) return parser.parseFromString("<div></div>", "text/html").body;

    const parsedDocument = parser.parseFromString(strNode, "text/html");

    return (parsedDocument.head.firstChild as HTMLElement) || (parsedDocument.body.firstChild as HTMLElement);
}

/**
 * @param element to add class from
 * @param classNames classes to add. Blank classes will be ignored
 */
export function addClass(element: HTMLElement | undefined | null, ...classNames: string[]): void {
    if (!element || !classNames || !classNames.length) return;

    classNames.forEach((className) => {
        if (className.includes(" ")) {
            console.warn("'className' cannot contain whitespace");
            return;
        }

        if (!isBlank(className)) element.classList.add(className);
    });
}

/**
 * @param element to remove class from
 * @param classNames classes to remove. Blank classes will be ignored
 */
export function removeClass(element: HTMLElement | undefined | null, ...classNames: string[]): void {
    if (!element || !classNames || !classNames.length) return;

    classNames.forEach((className) => {
        if (className.includes(" ")) {
            console.warn("'className' cannot contain whitespace");
            return;
        }

        if (!isBlank(className)) element.classList.remove(className);
    });
}

/**
 * Get a substring of given ```str``` with "..." appended. E.g. ```"veeery long string" => "veery lon..."```
 *
 * @param str to shorten (wont be altered)
 * @param maxLength length the ```str``` may have at most. Strings longer than that will be shortened. Default is 30
 * @param blankReplacement returned if ```str``` is blank. Default is "\<blank\>"
 * @returns shortened ```str``` or ```str``` if not too long
 */
export function shortenString(str: string, maxLength = 30, blankReplacement = "<blank>"): string {
    if (isBlank(str)) return blankReplacement;

    if (str.length > maxLength) return str.substring(0, maxLength) + "...";

    return str;
}

/**
 * Await a promise that resolves after given delay with given ```resolveValue```.
 *
 * @param delay in ms
 * @param resolveValue value passed to ```res``` callback
 * @returns ```resolveValue``` or ```undefined```
 */
export async function sleep<T>(delay: number, resolveValue?: T): Promise<T | undefined> {
    return await new Promise((res, rej) => {
        setTimeout(() => {
            res(resolveValue);
        }, delay);
    });
}

/**
 * Apparently when navigating to a history entry, the scroll state is preserved despite this function call.
 *
 * Only scroll to ```y=0```, leave x as it is
 */
export function scrollTop(): void {
    window.scrollTo(window.scrollX, 0);
}

/**
 * Convenience method wrapping the ```JSON.parse``` method inside a try catch.
 *
 * @param value to parse to an object
 * @returns the parsed object or ```null``` if error
 */
export function jsonParseDontThrow<ReturnType>(value: string | null | undefined): ReturnType | null {
    if (isBlank(value)) return null;

    try {
        return JSON.parse(value!);
    } catch (e) {
        return null;
    }
}

function getUrlQueryParamsMap(): Map<string, string> {
    const urlQueryParams = window.location.search;

    // case: no params or only a '?'
    if (urlQueryParams.length <= 1) return new Map();

    const keyValueArr = urlQueryParams.replace("?", "").split("&");

    const keyValueMap = new Map<string, string>();

    keyValueArr.forEach((keyValuePair) => {
        const firstEqualsIndex = keyValuePair.indexOf("=");

        // case: no value
        if (firstEqualsIndex === -1) keyValueMap.set(keyValuePair, "");
        else {
            const key = keyValuePair.substring(0, firstEqualsIndex);
            let value = keyValuePair.substring(firstEqualsIndex).replace("=", "");
            value = cleanUpUrlQueryParamValue(value);

            keyValueMap.set(key, value);
        }
    });

    return keyValueMap;
}

/**
 * Retrieve the url query param value for given key using ```window.location.search```. Usefull if react hooks don't work for some reason.
 *
 * @param key of the url query param value
 * @returns the value for given key or ```null```
 */
export function getUrlQueryParam(key: string): string | null {
    if (isFalsy(key)) return null;

    return getUrlQueryParamsMap().get(key) || null;
}

/**
 * Replace some substrings that are used in url query params in place of certain chars with their actual chars.
 * E.g. "+" represents a " " and "%sC" a ","
 *
 * @param value from url query param
 * @returns clean (unaltered) value
 */
function cleanUpUrlQueryParamValue(value: string): string {
    if (isBlank(value)) return value;

    return value.replaceAll("%2C", ",").replaceAll("+", " ");
}

/**
 * Flatten given object by 1 depth level:
 * ```
 *  const object = {
        test: {
            sub1: "1",
        },    
        test2: {
            sub2: {
                sub3: "3"
            }
        },
        plain: "plain"
    }
    // becomes
    const flattenedObj = {
        sub1: "1",
        sub2: {
            sub3: "3"
        }
        plain: "plain"
    }
 * ```
 * @param obj to flatten
 * @returns a copy of given ```obj```
 */
export function flatMapObject(obj: object): object {
    if (!obj) return obj;

    const flatObj = {};

    Object.entries(obj).forEach(([key, value]) => {
        if (typeof value !== "object") flatObj[key] = value;
        else
            Object.entries(value).forEach(([secondLevelKey, secondLevelValue]) => {
                flatObj[secondLevelKey] = secondLevelValue;
            });
    });

    return flatObj;
}

/**
 * Destructs and reassignes all ```object``` type properties of given ```obj``` in order to remove the reference and truely copy the object.
 *
 * @type ```T``` the type of the object to clone
 * @param obj to clone
 * @param depth of properties to clone. 0 would not clone the object or any properties at all, 1 would clone only top level property objects. -1 will go full depth. Default is -1
 * @param currentDepth for recursive call only, dont specify this. Should start with 0
 * @returns a new instance of given ```obj```
 */
export function cloneObj<T extends object>(obj: T, depth = -1, currentDepth = 0): T {
    if (!obj || typeof obj !== "object" || obj instanceof Date) return obj;

    // case: reached desired depth
    if (depth === currentDepth) return obj;

    currentDepth++;

    if (Array.isArray(obj)) return [...obj].map((o) => cloneObj(o, depth, currentDepth)) as T;

    const copy = {...obj};

    Object.entries(copy).forEach(([key, value]) => {
        if (typeof value === "object") copy[key] = cloneObj(value, depth, currentDepth);
    });

    return copy;
}

/**
 * Sort first level object entries by their keys. If no sort callback is specified use the natural sort order.
 *
 * @param obj to sort
 * @param sortCallback to sort the keys
 * @returns a new instance of `obj` with sorted entries or {} if invalid args. Never `undefined`
 */
export function sortObjectByKeys<T extends object>(obj: T, sortCallback?: (key1: any, key2: any) => number): T {
    if (!obj) return {} as T;

    const sortedKeys = Object.keys(obj).sort(sortCallback);

    const sortedObj = {};
    sortedKeys.forEach((key) => (sortedObj[key] = obj[key]));

    return sortedObj as T;
}

/**
 * Merge first level entries of `objs` into one object.
 *
 * @param objs to merge
 * @returns new object containing all first level values of `objs`
 */
export function mergeObjects<T extends object>(...objs: T[]): T {
    if (!objs || !objs.length) return {} as T;

    const mergedObj = {};

    objs.forEach((obj) => Object.assign(mergedObj, obj));

    return mergedObj as T;
}

/**
 * Throws at the first arg beeing falsy (but not if no args are specified). Use util "isFalsy" methods for primitive types.
 *
 * @param args to check
 */
export function assertFalsyAndThrow(...args: any[]): void {
    if (!args || !args.length) return;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        let falsy = false;

        if (typeof arg === "number") falsy = isNumberFalsy(arg);
        else falsy = isFalsy(arg);

        if (falsy) throw new Error(`Invalid arg at index ${i}`);
    }
}

/**
 * See {@link assertFalsyAndThrow}.
 *
 * @param args to check
 * @returns `true` if no arg was falsy, else `false`
 */
export function assertFalsyAndLog(...args: any[]): boolean {
    try {
        assertFalsyAndThrow(args);
        return true;
    } catch (e) {
        console.error(e.message);
        return false;
    }
}

/**
 * Example:
 * ```
 * const arr1 = [1, 2, 3];
 * const arr2 = [2, 3, 4];
 * getArrayDiff(arr1, arr2); // returns [1]
 * ```
 * @param arr1 to get diff for
 * @param arr2 to check the diff against
 * @returns all elements from arr1 that are not in arr2. An empty array if `arr1` is falsy
 */
export function getArrayDiff<T>(arr1: T[], arr2: T[]): T[] {
    if (!arr1) return [];

    if (!arr2) return arr1;

    const arr2Set = new Set(arr2);
    const diffArr: T[] = [];

    arr1.forEach((el) => {
        if (!arr2Set.has(el)) diffArr.push(el);
    });

    return diffArr;
}

/**
 * Access nested property of `obj`.
 * 
 * @param obj to access prop of
 * @param nestedKey "." separated string of `obj` props, e.g. "user.address.city", then obj should look like this: `{user: {address: {city: any}}}`
 * @returns the value of the nested prop (new reference), `obj` if nestedKey is falsy or blank, or `undefined` if `obj` has no such nested key
 */
export function getNestedProp(obj: object, nestedKey: string): any {
    assertFalsyAndThrow(obj);

    const props = (nestedKey || "").split(".");
    if (!props || !props.length)
        return obj;

    let latestObj: object = obj;
    props.forEach(key => latestObj = latestObj[key])

    return latestObj;
}
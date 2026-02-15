import { assertStrictlyFalsyAndThrow } from "@/utils/utils";
import { Buffer } from 'buffer';


export function base64Encode(str: string): string {
    assertStrictlyFalsyAndThrow(str);

    return Buffer.from(str).toString('base64');
}

export function base64Decode(base64Str: string): string {
    assertStrictlyFalsyAndThrow(base64Str);
    
    return Buffer.from(base64Str, 'base64').toString('utf-8');
}

export function hasOwnIgnoreCase(obj: object, key: string): boolean {
    assertStrictlyFalsyAndThrow(obj);

    return !!Object.keys(obj)
        .find(_key => _key.toLowerCase() === key.toLowerCase());
}

/**
 * @param str to be trimmed
 * @param char to trim from `str`
 * @return modified `str` such that it does not start or end with `char`. Return unmodified `str`
 * if `str` is falsy
 */
export function trim(str: string, char: string): string {
    if (!str || !char?.length)
        return str;

    while (str.startsWith(char)) {
        str = str.substring(char.length);

        if (!str.length)
            return str;
    }

    while (str.endsWith(char)) {
        str = str.substring(0, str.length - char.length);
        
        if (!str.length)
            return str;
    }

    return str;
}

/**
 * @param regex to convert to string
 * @returns string of regex removing some javascript specific chars
 */
export function regexToString(regex: RegExp): string {
    if (!regex)
        return regex;

    return (regex + "")
        .replaceAll("/", "");
}
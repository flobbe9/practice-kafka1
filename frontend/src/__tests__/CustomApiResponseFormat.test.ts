import { isCustomApiResponseFormat } from "@/CustomApiResponseFormat";

describe("isCustomApiResponseFormat", () => {
    test("Expect truthy", () => {
        expect(isCustomApiResponseFormat(null as any)).toBe(false);
        expect(isCustomApiResponseFormat(undefined as any)).toBe(false);
    })

    test("Expect statusCode", () => {
        expect(isCustomApiResponseFormat({statusCode: 200})).toBe(true);
        expect(isCustomApiResponseFormat({statusCode: 200, message: ''})).toBe(true);

        expect(isCustomApiResponseFormat({} as any)).toBe(false);
        expect(isCustomApiResponseFormat({message: ''} as any)).toBe(false);
    })
});
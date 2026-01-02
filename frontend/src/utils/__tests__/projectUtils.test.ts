import { trim } from "../projectUtils"

describe("trim", () => {
    test("Falsy args should return unmodified 'str'", () => {
        expect(trim(null as any, "t")).toBeNull();
        expect(trim("test", null as any)).toBe("test");

        expect(trim("test", "")).toBe("test");
        expect(trim("", "t")).toBe("");
    });

    test("Case sensitive", () => {
        expect(trim("tes", "T")).toBe("tes");
        expect(trim("tes", "t")).toBe("es");
    })

    test("Dont fail if str becomes empty", () => {
        expect(trim(" ", " ")).toBe("");
        expect(trim("    ", " ")).toBe("");
    })

    test("Trim starting chars", () => {
        expect(trim("tes", "t")).toBe("es");
        expect(trim("tttes", "t")).toBe("es");

        expect(trim(" tes", " ")).toBe("tes");
        expect(trim("   tes", " ")).toBe("tes");    
    })

    test("Trim trailing chars", () => {
        expect(trim("est", "t")).toBe("es");
        expect(trim("esttt", "t")).toBe("es");

        expect(trim("tes ", " ")).toBe("tes");
        expect(trim("tes   ", " ")).toBe("tes");    
    })

    test("Trim starting and trailing", () => {
        expect(trim("test", "t")).toBe("es");
        expect(trim("tttesttt", "t")).toBe("es");

        expect(trim(" tes ", " ")).toBe("tes");
        expect(trim("   tes   ", " ")).toBe("tes"); 
    })

    test("Dont modify if nothing to trim", () => {
        expect(trim("es", "t")).toBe("es");
        expect(trim("es  ", "t")).toBe("es  ");
    })
})
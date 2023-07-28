import { test, expect } from "@jest/globals";
import { normalizeUrl } from "./crawl";

const normalizeCases = [
    ["https://jestjs.io/", "http://www.jestjs.io"],
    ["http://jestJS.io/", "http://www.jestjs.io"],
    ["http://www.jestjs.io/", "http://www.jestjs.io"],
    ["http://example.com/path/to/", "http://www.example.com/path/to"],
    ["http://example.com/patH/to", "http://www.example.com/path/to"],
];

for (let item of normalizeCases) {
    const input = item[0];
    const output = item[1];
    test(`${input} should be normalized to: ${output}`, () => {
        expect(normalizeUrl(input)).toBe(output);
    });
}

import { describe, it } from 'vitest';
import { assert } from 'chai';
import { currentFY, previousFY } from '@/util/dates';
import { parseDate } from '@/api/apiFormats';

describe('dates', function () {
    describe('currentFY', function () {
        const tests = [
            { ref: '2024-03-10', start: '2023-07-01', end: '2024-06-30' },
            { ref: '2024-06-30', start: '2023-07-01', end: '2024-06-30' },
            { ref: '2023-07-01', start: '2023-07-01', end: '2024-06-30' },
            { ref: '2024-07-02', start: '2024-07-01', end: '2025-06-30' },
            { ref: '20024-12-30', start: '20024-07-01', end: '20025-06-30' },
        ];
        for (const test of tests) {
            it(`should work for ref ${test.ref}`, function () {
                const result = currentFY(parseDate(test.ref));
                assert.deepEqual(result, {
                    start: parseDate(test.start),
                    end: parseDate(test.end),
                });
            });
        }
    });
    describe('previousFY', function () {
        const tests = [
            { ref: '2024-03-10', start: '2022-07-01', end: '2023-06-30' },
            { ref: '2024-06-30', start: '2022-07-01', end: '2023-06-30' },
            { ref: '2023-07-01', start: '2022-07-01', end: '2023-06-30' },
            { ref: '2024-07-02', start: '2023-07-01', end: '2024-06-30' },
            { ref: '20024-12-30', start: '20023-07-01', end: '20024-06-30' },
        ];
        for (const test of tests) {
            it(`should work for ref ${test.ref}`, function () {
                const result = previousFY(parseDate(test.ref));
                assert.deepEqual(result, {
                    start: parseDate(test.start),
                    end: parseDate(test.end),
                });
            });
        }
    });
});

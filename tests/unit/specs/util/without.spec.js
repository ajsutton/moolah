import without from '../../../../src/util/without';
import { assert } from 'chai';

describe('without', function() {
    it('should remove forbidden properties', function() {
        const result = without({ a: 1, b: 2, c: 3 }, 'b');
        assert.deepEqual(result, { a: 1, c: 3 });
    });
});

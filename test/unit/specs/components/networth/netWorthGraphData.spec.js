import extrapolateBalances from '../../../../../src/components/networth/netWorthGraphData';
import {assert} from 'chai';

describe('Net Worth Graph Data', function() {
    it('should extend last balance to today', function() {
        const result = extrapolateBalances([
            {date: '2017-01-01', balance: 100},
            {date: '2017-01-02', balance: 130},
        ], '2017-06-30');
        assert.deepEqual(result, [
            {date: '2017-01-01', balance: 100},
            {date: '2017-01-02', balance: 130},
            {date: '2017-06-30', balance: 130},
        ]);
    });

    it('should return empty array when input is empty', function() {
        assert.deepEqual(extrapolateBalances([], '2017-06-30'), []);
    });
});
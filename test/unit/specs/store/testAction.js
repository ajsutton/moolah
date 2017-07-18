const assert = require('chai').assert;
const AssertionError = require('assertion-error');

export default async (module, action, options = {state: {}}, expectedMutations = []) => {
    let mutationsCalled = [];
    let state = JSON.parse(JSON.stringify(options.state));
    let rootState = options.rootState ? JSON.parse(JSON.stringify(options.rootState)) : undefined;

    // mock commit
    const commit = (type, payload) => {
        const mutation = expectedMutations[mutationsCalled.length];
        if (mutation === undefined) {
            throw new Error("Additional unexpected commit: " + type + " - " + JSON.stringify(payload));
        }
        expect(mutation.type).to.equal(type);
        if (payload) {
            assert.deepEqual(mutation.payload, payload, 'Incorrect payload for mutation ' + mutationsCalled.length + ' of type ' + mutation.type);
        }
        module.mutations[mutation.type](state, payload);

        mutationsCalled.push(mutation.type);
    };

    // call the action with mocked store and arguments
    try {
        await module.actions[action]({commit, state: state, rootState: rootState, dispatch: options.dispatch}, options.payload);
    } catch (error) {
        if (!options.ignoreFailures || (error instanceof AssertionError)) {
            throw error;
        }
    }

    // check if no mutations should have been dispatched
    assert.equal(mutationsCalled.length, expectedMutations.length,
        'Incorrect number of mutations, got: ' + JSON.stringify(mutationsCalled) + '\nexpected: ' + JSON.stringify(expectedMutations.map(m => m.type)));
};

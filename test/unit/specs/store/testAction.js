export default async (action, options = {state: {}}, expectedMutations) => {
    let count = 0;

    // mock commit
    const commit = (type, payload) => {
        const mutation = expectedMutations[count];
        if (mutation === undefined) {
            throw new Error("Additional unexpected commit: " + type + " - " + JSON.stringify(payload));
        }
        expect(mutation.type).to.equal(type);
        if (payload) {
            expect(mutation.payload).to.deep.equal(payload);
        }

        count++;
    };

    // call the action with mocked store and arguments
    try {
        await action({commit, state: options.state, rootState: options.rootState}, options.payload);
    } catch (error) {
        if (!options.ignoreFailures) {
            throw error;
        }
    }

    // check if no mutations should have been dispatched
    expect(count).to.equal(expectedMutations.length);
};

export default (action, payload, state, expectedMutations) => new Promise((resolve, reject) => {
    let count = 0;

    // mock commit
    const commit = (type, payload) => {
        const mutation = expectedMutations[count];

        try {
            expect(mutation.type).to.equal(type);
            if (payload) {
                expect(mutation.payload).to.deep.equal(payload);
            }
        } catch (error) {
            reject(error);
        }

        count++;
        if (count >= expectedMutations.length) {
            resolve();
        }
    };

    // call the action with mocked store and arguments
    action({commit, state}, payload);

    // check if no mutations should have been dispatched
    if (expectedMutations.length === 0) {
        expect(count).to.equal(0);
        resolve();
    }
});

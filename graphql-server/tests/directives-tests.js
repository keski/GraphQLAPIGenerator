/**
 * This class is meant to test the fur directives/constraints @noloops, @distinct, @requiredForTarget and @uniqueForTarget.
 * As of currently is only tests for creation of objects/edges.
 * Createions/Updates/Deletions are handled in exactly the same manner for transactions, so only testing creations *should* be fine.
 */

const { InMemoryCache } = require('apollo-cache-inmemory')
const { ApolloClient } = require('apollo-client');
const { HttpLink } = require('apollo-link-http');
const gql = require('graphql-tag');
const fetch = require('node-fetch');

async function testDistinct(client) {
    // Creates 4 distinct objects of which the third one should fail.
    // Then creates 2 new edges of which the first should fail.

    // Create Distinct 1
    let createDistinct1 = `
        mutation {
            createDistinctTest(data:{
                dummyField: 0
            }) {
                id
            }
        }
    `;
    const mutationCreateDistinct1 = await client.mutate({ mutation: gql`${createDistinct1}` });
    if (mutationCreateDistinct1.errors) {
        console.error(mutationCreateDistinct1.errors);
        return false;
    }
    let distinct1Id = mutationCreateDistinct1.data[`createDistinct`].id;

    // Create Distinct 2
    let createDistinct2 = `
        mutation {
            createDistinctTest(data:{
                dummyField: 1
            }) {
                id
            }
        }
    `;
    const mutationCreateDistinct2 = await client.mutate({ mutation: gql`${createDistinct2}` });
    if (mutationCreateDistinct2.errors) {
        console.error(mutationCreateDistinct2.errors);
        return false;
    }
    let distinct2Id = mutationCreateDistinct2.data[`createDistinct`].id;

    // Create Distinct 3
    let createDistinct3 = `
        mutation {
            createDistinctTest(data:{
                shouldBeDistinct: [
                    {connect: "${distinct1Id}"},
                    {connect: "${distinct1Id}"}
                ]
            }) {
                id
            }
        }
    `;
    const mutationCreateDistinct3 = await client.mutate({ mutation: gql`${createDistinct3}` });
    if (mutationCreateDistinct3.errors) {
        // empty, should actually give errors.
    } else {
        console.error("Breaking a @distinct directive did not yield an error!");
        return false;
    }

    // Create Distinct 4
    let createDistinct4 = `
        mutation {
            createDistinctTest(data:{
                shouldBeDistinct: [
                    {connect: "${distinct1Id}"},
                    {connect: "${distinct2Id}"}
                ]
            }) {
                id
            }
        }
    `;
    const mutationCreateDistinct4 = await client.mutate({ mutation: gql`${createDistinct4}` });
    if (mutationCreateDistinct4.errors) {
        console.error(mutationCreateDistinct4.errors);
        return false;
    }
    let distinct4Id = mutationCreateDistinct4.data[`createDistinct`].id;

    // Create Distinct Edge 1
    let createEdge1 = `
        mutation {
            createShouldBeDistinctEdgeFromDistinctTest(data:{
                sourceID: "${distinct4Id}"
                targetID: "${distinct1Id}"
            }) {
                id
            }
        }
    `;
    const mutationCreateEdge1 = await client.mutate({ mutation: gql`${createEdge1}` });
    if (mutationCreateEdge1.errors) {
        // empty, should actually give errors.
    } else {
        console.error("Breaking a @distinct directive did not yield an error!");
        return false;
    }

    // Create Distinct Edge 2
    let createEdge2 = `
        mutation {
            createShouldBeDistinctEdgeFromDistinctTest(data:{
                sourceID: "${distinct1Id}"
                targetID: "${distinct2Id}"
            }) {
                id
            }
        }
    `;
    const mutationCreateEdge2 = await client.mutate({ mutation: gql`${createEdge2}` });
    if (mutationCreateEdge2.errors) {
        console.error(mutationCreateEdge2.errors);
        return false;
    }

    return true;
}

async function testNoloops(client) {
    // Create the two connected object.
    // Create two edges of which one the first is a loop and should fail

    // Create Noloops 1
    let createNoloops1 = `
        mutation {
            createNoloopsTest(data:{
                dummyField: 0
            }) {
                id
            }
        }
    `;
    const mutationCreateNoloops1 = await client.mutate({ mutation: gql`${createNoloops1}` });
    if (mutationCreateNoloops1.errors) {
        console.error(mutationCreateNoloops1.errors);
        return false;
    }
    let noloops1Id = mutationCreateNoloops1.data[`createNoloops`].id;

    // Create Noloops 2
    let createNoloops2 = `
        mutation {
            createNoloopsTest(data:{
                possibleLoop: {connect: "${noloops1Id}"}
            }) {
                id
            }
        }
    `;
    const mutationCreateNoloops2 = await client.mutate({ mutation: gql`${createNoloops2}` });
    if (mutationCreateNoloops2.errors) {
        console.error(mutationCreateNoloops2.errors);
        return false;
    }
    
    // Create Loop edge
    let createLoop = `
        mutation {
            createPossibleLoopEdgeFromNoloopsTest(data:{
                sourceID: "${noloops1Id}"
                targetID: "${noloops1Id}"
            }) {
                id
            }
        }
    `;
    const mutationCreateLoop = await client.mutate({ mutation: gql`${createLoop}` });
    if (mutationCreateLoop.errors) {
        // empty, should actually give errors.
    } else {
        console.error("Breaking a @noloops directive did not yield an error!");
        return false;
    }

    // Create Not Loop edge
    let createNotLoop = `
        mutation {
            createPossibleLoopEdgeFromNoloopsTest(data:{
                sourceID: "${noloops1Id}"
                targetID: "${noloops2Id}"
            }) {
                id
            }
        }
    `;
    const mutationCreateNotLoop = await client.mutate({ mutation: gql`${createNotLoop}` });
    if (mutationCreateNotLoops.error) {
        console.error(mutationCreateNotLoop.errors);
        return false;
    }

    return true;
}

async function testRequiredForTargetTest(client) {
    // 

    // Create RequiredForTargetTarget 1
    let createRequiredForTargetTarget1 = `
        mutation {
            createRequiredForTargetTarget(data:{
                dummyField: 0
            }) {
                id
            }
        }
    `;
    const mutationCreateRequiredForTargetTarget1 = await client.mutate({ mutation: gql`${createRequiredForTargetTarget1}` });
    if (mutationCreateRequiredForTargetTarget1.errors) {
        // empty, should actually give errors.
    } else {
        console.error("Breaking a @requiredForTarget directive did not yield an error!");
        return false;
    }

    // Create 
    let create = `
        mutation {
            createRequiredForTargetTest(data:{
                target: {create: {dummyField: 1}}
            }) {
                id
            }
        }
    `;
    const mutationCreate = await client.mutate({ mutation: gql`${create}` });
    if (mutationCreate.errors) {
        console.error(mutationCreate.errors);
        return false;
    }

    return true;
}

async function testUniqueForTargetTest(client) {
    // 

    // Create UniqueForTargetTarget 
    let createUniqueForTargetTarget = `
        mutation {
            createUniqueForTargetTarget(data:{
                dummyField: 0
            }) {
                id
            }
        }
    `;
    const mutationCreateUniqueForTargetTarget = await client.mutate({ mutation: gql`${createUniqueForTargetTarget}` });
    if (mutationCreateUniqueForTargetTarget.errors) {
        console.error(mutationCreateUniqueForTargetTarget.errors);
        return false;
    }
    let targetId = mutationCreateUniqueForTargetTarget.data[`createUniqueForTargetTarget`].id;

    // Create createUniqueForTargetTest 1
    let createUniqueForTargetTest1 = `
        mutation {
            createUniqueForTargetTest(data:{
                target: {connect: "${targetId}"}
            }) {
                id
            }
        }
    `;
    const mutationcreateUniqueForTargetTest1 = await client.mutate({ mutation: gql`${createUniqueForTargetTest1}` });
    if (mutationcreateUniqueForTargetTest1.errors) {
        console.error(mutationcreateUniqueForTargetTest1.errors);
        return false;
    }

    // Create createUniqueForTargetTest 2
    let createUniqueForTargetTest2 = `
        mutation {
            createUniqueForTargetTest(data:{
                target: {connect: "${targetId}"}
            }) {
                id
            }
        }
    `;
    const mutationcreateUniqueForTargetTest2 = await client.mutate({ mutation: gql`${createUniqueForTargetTest2}` });
    if (mutationCreateUniqueForTargetTarget2.errors) {
        // empty, should actually give errors.
    } else {
        console.error("Breaking a @uniqueForTarget directive did not yield an error!");
        return false;
    }

    return true;
}

async function run() {
    // connect client to server
    let uri = 'http://localhost:4000';
    let {client, schema} = await connect(uri);

    if (!(await testDistinct(client) && await testNoloops(client) && await testRequiredForTargetTest(client) && await testUniqueForTargetTest(client))) {
        console.error("One or more tests failed!");
        throw "Test failed";
    }
}

async function connect(uri){
    const httpLink = new HttpLink({ uri: uri, fetch });
    const client = new ApolloClient({ link: httpLink, cache: new InMemoryCache() });
    const schema = await introspectSchema(httpLink); // parse remote schema
    return { client: client, schema: schema };
}

run().then(() => {
    console.log("Directives tests passed.");
    let exitAfterClientTests = process.env.EXIT_AFTER_CLIENT_TESTS === 'true';
    if(exitAfterClientTests) process.exit(0);
}).catch(reason => {
    let exitAfterClientTests = process.env.EXIT_AFTER_CLIENT_TESTS === 'true';
    // Not the nicest way to exit, but it works for testing.
    console.error(reason);
    console.error("Directives tests did NOT pass.");
    if(exitAfterClientTests) process.exit(1);
});

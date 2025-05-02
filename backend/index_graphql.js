import { Hono } from "hono";
import { buildSchema } from "graphql";
import { graphqlServer } from '@hono/graphql-server'


const schema = buildSchema(`
    type Query {
        hello: String
    }
`);

/** @type {import("@hono/graphql-server").RootResolver} */
const rootResolver = (c) => {
    return {
        hello: () => "Hello World!",
    }
}


const GraphQL_App = new Hono()

GraphQL_App.use(
    "/graphql",
    
    graphqlServer({
        schema,
        rootResolver,
        graphiql: true, // if `true`, presents GraphiQL when the GraphQL endpoint is loaded in a browser.
    })
)

export default GraphQL_App
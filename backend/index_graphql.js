import { Hono } from "hono";
import { getConnInfo } from '@hono/node-server/conninfo'

import { buildSchema } from "graphql";
//import { makeExecutableSchema } from '@graphql-tools/schema'

import { graphqlServer } from '@hono/graphql-server'

import ComposeSchemas from "./api/graphql/utils/composeSchemas.js";

/*class GQL_SchemaSet {
    
}

var schema_sandbox_obj = new GQL_SchemaSet()*/

// Get all schemas from the folder
const _DIRECTORY_SCHEMAS = "backend/api/graphql/schemas"
let str_schemaComposed = await ComposeSchemas.composeStringBuildSchemas_FromDirPathAsync(_DIRECTORY_SCHEMAS)

let schema = buildSchema(str_schemaComposed);
str_schemaComposed = undefined



//
// Resolvers
//
import main_resolvers from "./api/graphql/resolvers/main_resolvers.js";

/** @type {import("@hono/graphql-server").RootResolver} */
const rootResolver = (c) => {
    //console.log(c)
    //console.log(main_resolvers)
    c.req.raw.ip = getConnInfo(c).remote.address

    return {
        ...main_resolvers,
    }
}


/*schema = makeExecutableSchema({
    typeDefs: str_schemaComposed,
    resolvers: rootResolver,
    inheritResolversFromInterfaces: true,
})*/


// Set up directives, which are the "@" things in the GraphQL Schemas
import { attachDirectiveResolvers } from "./api/graphql/utils/attachDirectiveResolvers.ts";
import mainDirectives from "./api/graphql/directives/main_directives.ts";
schema = attachDirectiveResolvers(schema, mainDirectives)


//
// Create App
//
const GraphQL_App = new Hono()

import { logger } from "hono/logger";
GraphQL_App.use(logger());

GraphQL_App.use(
    "/graphql",
    
    graphqlServer({
        schema: schema,
        rootResolver,
        graphiql: true, // if `true`, presents GraphiQL when the GraphQL endpoint is loaded in a browser.
    }),
    // context field is not present unlike in express
    // but restrictions can be added by stacking it in /graphql
)

export default GraphQL_App
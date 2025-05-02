import { Hono } from "hono";
import { buildSchema } from "graphql";
import { graphqlServer } from '@hono/graphql-server'

import fs from "fs"
import path from "path"

// Get all schemas from the folder
const _DIRECTORY_SCHEMAS = "backend/api/graphql/schemas"
let FILES_gql_schemas = await fs.promises.readdir(
    _DIRECTORY_SCHEMAS, { recursive: true, withFileTypes: true }
)

let str_schemaBuilder = ""
FILES_gql_schemas.forEach(function(v,i,a) {
    let extName = path.extname(v.name).toString()

    // Only get "graphql" related files
    if (extName != ".graphql" && extName != ".gql") {
        return // Skip
    }

    let filePath = path.join(v.path, v.name)
    str_schemaBuilder += fs.readFileSync( filePath ).toString() + "\n"
})

//console.log(str_schemaBuilder)
const schema = buildSchema(str_schemaBuilder);
str_schemaBuilder = undefined



//
// Resolvers
//
import main_resolvers from "./api/graphql/resolvers/main_resolvers.js";

/** @type {import("@hono/graphql-server").RootResolver} */
const rootResolver = (c) => {
    //console.log(c)
    //console.log(main_resolvers)

    return {
        ...main_resolvers,
    }
}



//
// Create App
//
const GraphQL_App = new Hono()

import { logger } from "hono/logger";
GraphQL_App.use(logger());

GraphQL_App.use(
    "/graphql",
    
    graphqlServer({
        schema,
        rootResolver,
        graphiql: true, // if `true`, presents GraphiQL when the GraphQL endpoint is loaded in a browser.
    })
    // context field is not present unlike in express
)

export default GraphQL_App
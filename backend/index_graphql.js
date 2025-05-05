import { Hono } from "hono";
import { getConnInfo } from '@hono/node-server/conninfo'

import { buildSchema } from "graphql";
import { makeExecutableSchema } from '@graphql-tools/schema'
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'

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
let schema = buildSchema(str_schemaBuilder);
//str_schemaBuilder = undefined



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


schema = makeExecutableSchema({
    typeDefs: str_schemaBuilder,
    resolvers: rootResolver,
    inheritResolversFromInterfaces: true,
})

/*import { defaultFieldResolver } from "graphql";
import { getDirectives } from "@graphql-tools/utils";
function rootDirectives(schema) {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName, typeName) => {
            let newFieldConfig = { ...fieldConfig }
            let originalResolver = newFieldConfig.resolve || defaultFieldResolver

            const directives = getDirectives(schema, fieldConfig)

            for (let i = directives.length - 1; i >= 0; i--) {
                const directive = directives[i]
                const { name, args } = directive
                const prevResolver = originalResolver

                if (name === 'auth_test') {
                    originalResolver = async (source, directiveArgs, context, info) => {
                        console.log(`[AUTH] ID: ${args?.id}`)
                        // Example: check context here
                        return prevResolver(source, directiveArgs, context, info)
                    }
                }

                if (name === 'log_test') {
                    originalResolver = async (source, directiveArgs, context, info) => {
                        console.log(`[LOG] ${typeName}.${fieldName} called`)
                        return prevResolver(source, directiveArgs, context, info)
                    }
                }
            }

            newFieldConfig.resolve = originalResolver
            return newFieldConfig
        }
    })
}*/

//schema = rootDirectives(schema)

import { attachDirectiveResolvers } from "./api/graphql/utils/attachDirectiveResolvers.ts";
schema = attachDirectiveResolvers(schema, {
    /**
     * @param {import("hono").Context} context
     */
    auth_test: function(next, source, directiveArgs, context, info) {
        let headerValue = context.req.raw.headers.get("Auth_Test_Header")
        
        if (headerValue == undefined)
            throw Error("The Auth Test Header is missing")
        
        if (headerValue != directiveArgs.code)
            throw Error("Bad Auth")
        
        if (headerValue == directiveArgs.code)
            return next()

        throw Error("This here shouldn't trigger")
    },

    log_test: async function(next, source, directiveArgs, context, info) {
        console.log(`[LOG Directive] ${info.fieldName}`)
        return next()
    },

    toUpperCase: async function(resolveOriginalNext, source, directiveArgs, context, info) {
        let result = await resolveOriginalNext();
        result = result.toUpperCase()

        return result;
    }
})

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
import { defaultFieldResolver } from 'graphql'
import type { GraphQLSchema, } from 'graphql'

import { mapSchema, getDirectives, MapperKind } from '@graphql-tools/utils'
import type {DirectiveAnnotation, GraphQLResolveInfo} from "@graphql-tools/utils"

// https://the-guild.dev/graphql/tools/docs/schema-directives
// directiveResolvers

// similar
// https://github.com/aws-amplify/amplify-cli/blob/dev/packages/amplify-appsync-simulator/src/schema/directives/auth.ts


// Custom defined, other one was missing
type DirectiveResolver = ( // function
    resolveOriginalNext: () => Promise<any>,
    source: any,
    directiveArgs: DirectiveAnnotation["args"],
    context: any,
    info: GraphQLResolveInfo
) => any

type DirectiveResolvers = {
    [name: string]: DirectiveResolver
}



export function attachDirectiveResolvers(
    schema: GraphQLSchema,
    directiveResolvers: DirectiveResolvers //IDirectiveResolvers
): GraphQLSchema {
    // ... argument validation ...

    return mapSchema(schema, {

        // Fields of an object
        // e.g. type Query { field }
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const newFieldConfig = { ...fieldConfig }

            const directives = getDirectives(schema, fieldConfig)
            //for (const directive of directives) {
            for (let i = directives.length - 1; i >= 0; i--) {
                const directive = directives[i]

                const directiveName = directive.name
                if (directiveResolvers[directiveName]) {
                    const resolver = directiveResolvers[directiveName]
                    const originalResolver =
                        newFieldConfig.resolve != null ? newFieldConfig.resolve : defaultFieldResolver
                    const directiveArgs = directive.args
                    newFieldConfig.resolve = (source, originalArgs, context, info) => {
                        // return (resolver as DirectiveResolver)(
                        return resolver(
                            () =>
                                new Promise((resolve, reject) => {
                                    const result = originalResolver(source, originalArgs, context, info)
                                    if (result instanceof Error) {
                                        reject(result)
                                    }
                                    resolve(result)
                                }),
                            source,
                            directiveArgs,
                            context,
                            info
                        )
                    }
                }
            }

            return newFieldConfig
        },


        
        // For things defined on the object itself
        // e.g. type Query @directive {}
        [MapperKind.OBJECT_TYPE]: (obj) => {
            const fields = obj.getFields();
            Object.values(fields).forEach((field) => {
                const directives = getDirectives(schema, obj)
                const originalResolver = field.resolve || defaultFieldResolver;


                // This seems to just put the defined directive solver on all the fields in an object.
                for (let i = directives.length - 1; i >= 0; i--) {
                    const directive = directives[i]
                    const directiveName = directive.name
                    if (directiveResolvers[directiveName]) {
                        const definedResolver = directiveResolvers[directiveName]
                        const directiveArgs = directive.args

                        const newResolver = (source, originalArgs, context, info) => {
                            return definedResolver(
                                () =>
                                    new Promise((resolve, reject) => {
                                        const result = originalResolver(source, originalArgs, context, info)
                                        if (result instanceof Error) {
                                            reject(result)
                                        }
                                        resolve(result)
                                    }),
                                source,
                                directiveArgs,
                                context,
                                info
                            )
                        }

                        // set newResolver
                        field.resolve = newResolver;
                    }
                }
            })

            return obj;
        },
        
    })
}
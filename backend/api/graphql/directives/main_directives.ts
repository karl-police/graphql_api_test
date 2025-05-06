import type { Context } from 'hono'
import type { DirectiveResolvers } from '../utils/attachDirectiveResolvers'

import exampleDirectives from './example.ts'

const mainDirectives: DirectiveResolvers = {
    // The Auth_Test_Header needs to match the directive's argument "code"
    auth_test: function(next, source, directiveArgs = {}, context: Context, info) {
        let headerValue = context.req.raw.headers.get("Auth_Test_Header")
        
        if (headerValue == undefined)
            throw Error("The Auth Test Header is missing")

        if (headerValue != directiveArgs.code)
            throw Error("Bad Auth")
        
        if (headerValue == directiveArgs.code)
            return next()

        throw Error("This shouldn't trigger")
    },

    log_test: async function(next, source, directiveArgs, context, info) {
        console.log(`[LOG Directive] ${info.fieldName}`)
        return next()
    },

    ...exampleDirectives
}


export default mainDirectives;
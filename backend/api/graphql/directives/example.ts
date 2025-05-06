import type { Context } from 'hono'
import type { DirectiveResolvers } from '../utils/attachDirectiveResolvers'

const exampleDirectives: DirectiveResolvers = {
    toUpperCase: async function (resolveOriginalNext, source, directiveArgs, context: Context, info) {
        let result = await resolveOriginalNext() // Get the original value to then modify it.
        result = result.toUpperCase()

        return result
    }
}


export default exampleDirectives;
import fs from "fs"
import path from "path"


const ComposeSchemas = {}


/**
 * Gets files from a path, by default it's recursive.
 * @param {string} dir - The directory
 * @param {boolean} bRecursive
 * @returns {string} - The schemas combined together.
 */
ComposeSchemas.composeStringBuildSchemas_FromDirPathAsync = async function(INPUT_DIRECTORY_PATH, bRecursive = true) {
    // Get all schemas from the specified directory
    let FILES_gql_schemas = await fs.promises.readdir(
        INPUT_DIRECTORY_PATH, { recursive: (bRecursive), withFileTypes: true }
    )
    
    let str_schemaBuilder = ""

    FILES_gql_schemas.forEach(function(v,i,a) {
        let extName = path.extname(v.name).toString()
    
        // Only get "graphql" related files
        if (extName != ".graphql" && extName != ".gql") {
            return // Skip otherwise
        }
    
        let filePath = path.join(v.path, v.name)
        str_schemaBuilder += ComposeSchemas.GetSchemaContent_FromFilePath(filePath) + "\n"
    })

    return str_schemaBuilder
}

// Get from file path
ComposeSchemas.GetSchemaContent_FromFilePath = function(filePath) {
    return fs.readFileSync( filePath ).toString()
}


export default ComposeSchemas;
import { example_root } from "./example.js"

const root = {}

// Example
root.hello = function() {
    return "Hello World!"
}




// Flat table
Object.assign(root, example_root)


export default root
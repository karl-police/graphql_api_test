import { serve } from "@hono/node-server";

import HonoWebApp from "./backend/index_hono.js";
import GraphQL_App from "./backend/index_graphql.js";


const PORT_web = 8000;
const PORT_gql_api = 3001;

serve({
    fetch: HonoWebApp.fetch,
    port: PORT_web,
})

console.log(`Running http://localhost:${PORT_web}!`)



serve({
    fetch: GraphQL_App.fetch,
    port: PORT_gql_api,
})
console.log(`Running http://localhost:${PORT_gql_api}!`)



//import { exec } from "child_process";
//exec("npx ruru -SP -p 4001 -e http://localhost:3001/graphql")
//console.log("http://localhost:4001/graphql")
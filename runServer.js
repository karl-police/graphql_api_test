import { serve } from "@hono/node-server";
import HonoWebApp from "./backend/index_hono.js";


const port_web = 8000;
const port_api = 3001;

serve({
    fetch: HonoWebApp.fetch,
    port: port_web,
})

console.log(`Running http://localhost:${port_web}!`)
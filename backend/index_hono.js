import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";


const HonoWebApp = new Hono()


// Root is based on the working directory, and not this file's directory.
HonoWebApp.use("*", serveStatic({
    root: "./src_web",
}))

export default HonoWebApp
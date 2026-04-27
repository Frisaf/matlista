import "dotenv/config"
import express from "express"
import nunjucks from "nunjucks"
import morgan from "morgan"
import session from "express-session"
import express_flash_notification from "express-flash-notification"
import cookieParser from "cookie-parser"

import indexRouter from "./routes/index.js"
import dishesRouter from "./routes/dishes.js"

const app = express()
const port = 3000 || process.env.port
const isProduction = process.env.NODE_ENV === "production"

const env = nunjucks.configure("views", {
    autoescape: true,
    express: app
})

app.set("view engine", "njk")
app.set("views", "./views")

app.use(morgan("dev"))
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static("public"))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true
    }
}))
app.use(cookieParser())
app.use(express_flash_notification(app, {
    sessionName: "flash",
    utilityName: "flash",
    localsName: "flash",
    viewName: "components/flash",
    beforeSingleRender: function(item, callback){callback(null, item)},
    afterAllRender: function(htmlFragments, callback){callback(null, htmlFragments.join("\n"))}
}))

app.use("/", indexRouter)
app.use("/dishes", dishesRouter)

env.addFilter("is_string", function(obj) {
    return typeof obj == "string"
})

export {app, port}
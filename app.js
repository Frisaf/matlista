import "dotenv/config"
import express from "express"
import nunjucks from "nunjucks"
import morgan from "morgan"
import session from "express-session"
import express_flash_notification from "express-flash-notification"
import cookieParser from "cookie-parser"

import indexRouter from "./routes/index.js"
import dishesRouter from "./routes/dishes.js"
import userRouter from "./routes/user.js"

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
    beforeSingleRender: function(notification, callback) {
        if (notification.type) {
            switch(notification.type) {
                case "error":
                    notification.alert_class = "alertError"
                    notification.icon = "m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm330.5-51.5Q520-263 520-280t-11.5-28.5Q497-320 480-320t-28.5 11.5Q440-297 440-280t11.5 28.5Q463-240 480-240t28.5-11.5ZM440-360h80v-200h-80v200Zm40-100Z"
                break
                case "info":
                    notification.alert_class = "alertInfo"
                    notification.icon = "M440-280h80v-240h-80v240Zm68.5-331.5Q520-623 520-640t-11.5-28.5Q497-680 480-680t-28.5 11.5Q440-657 440-640t11.5 28.5Q463-600 480-600t28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
                break
            }
        }
        callback(null, notification)
    },
    afterAllRender: function(htmlFragments, callback){callback(null, htmlFragments.join("\n"))}
}))

app.use("/", indexRouter)
app.use("/dishes", dishesRouter)
app.use("/user", userRouter)

env.addFilter("is_string", function(obj) {
    return typeof obj == "string"
})

export {app, port}
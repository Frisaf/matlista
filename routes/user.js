import express from "express"
import prisma from "../config/db.js"
import { body, param, validationResult} from "express-validator"
import bcrypt from "bcrypt"
import { nextTick } from "node:process"

const router = express.Router()

router.get("/login", (req, res) => {
    res.render("login.njk")
}) 

router.post(
    "/login",
    body("username").trim().notEmpty().withMessage("Användarnamn kan inte vara tomt"),
    body("password").trim().notEmpty().withMessage("Lösenordet kan inte vara tomt"),
    async(req, res, next) => {
        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            return req.flash("error", errors.array()[0].msg, "/dishes/add")
        }

        const {username, password} = req.body

        try {
            const user = await prisma.user.findFirst({
                where: {
                    name: username
                },
                select: {
                    name: true,
                    password: true
                }
            })

            if (!user) {
                return req.flash("error", "Fel användarnamn eller lösenord")
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                return req.flash("error", "Fel användarnamn eller lösenord")
            }

            req.session.authenticated = true

            return res.redirect("/")
        } catch (err) {
            next(err)
        }
    }
)

router.get("/logout", (req, res) => {
    if (!req.session.authenticated) {
        res.render("error.njk")
    } else {
        req.session.destroy()
        req.flash("info", "Du har loggat ut", "/")
    }
    
})

export default router
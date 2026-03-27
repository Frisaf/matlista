import express from "express"

const router = express.Router()

router.get("/", async (req, res, next) => {
    res.render("index.njk", {title: "Matlista"})
})

export default router
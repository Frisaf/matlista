import express from "express"
import prisma from "../config/db.js"

const router = express.Router()

router.get("/", async (req, res) => {
    const food = await prisma.dishes.findMany({select: {
        name: true,
        main: true,
        side: true,
        otherInfo: true,
        weekendWorthy: true
    }})
    const index = Math.floor(Math.random() * food.length)
    const randomDish = food[index]
    const sides = randomDish.side.split(", ")

    res.render("index.njk", {title: "Matlista", dish: randomDish, sides: sides})
})

export default router
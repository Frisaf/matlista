import express from "express"
import prisma from "../config/db.js"

const router = express.Router()

router.get("/", async (req, res) => {
    const dishes = await prisma.dishes.findMany({
        select: {
            name: true,
            otherInfo: true,
            weekendWorthy: true,
            side: {
                select: {
                    side: true
                }
            },
            main: {
                select: {
                    main: true
                }
            }
        }
    })

    const i = Math.floor(Math.random() * dishes.length)
    const randomDish = dishes[i]
    const dishName = randomDish.name
    const allSelectedDishes = dishes.filter(dish => dish.name === dishName)

    const sides = []
    let otherInfo = []

    allSelectedDishes.forEach(dish => {
        sides.push(dish.side.side)
        otherInfo.push(dish.otherInfo)
    })

    const main = randomDish.main.main

    otherInfo = otherInfo.filter((item, index) => otherInfo.indexOf(item) === index)

    res.render("index.njk", {title: "Matlista", dish: randomDish, sides: sides, main: main, otherInfo: otherInfo})

})

export default router
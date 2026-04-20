import express from "express"
import prisma from "../config/db.js"

const router = express.Router()

router.get("/", async (req, res) => {
    const dish = await prisma.dishes.findMany()
    const index = Math.floor(Math.random() * dish.length)
    const randomDish = dish[index]
    const result = await prisma.dishes.findMany({where: {name: randomDish.name}})

    let sides = ""
    let otherInfo = ""

    if (result.length > 1) {
        sides = []
        otherInfo = []

        result.forEach(async(dish) => {
            const side = await prisma.side.findUnique({where: {
                id: dish.sideId
            }})

            sides.push(side.ingredient)
            otherInfo.push(dish.otherInfo)
        })
    }

    else {
        sides = await prisma.side.findUnique({where: {
            id: result[0].sideId
        }})

        sides = sides.ingredient
    }

    const main = await prisma.main.findUnique({where: {
        id: result[0].mainId
    }})

    main = main.ingredient

    res.render("index.njk", {title: "Matlista", dish: randomDish})
})

export default router
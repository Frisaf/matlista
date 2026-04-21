import express from "express"
import prisma from "../config/db.js"

const router = express.Router()

router.get("/", async (req, res) => {
    const dish = await prisma.dishes.findMany()
    const i = Math.floor(Math.random() * dish.length)
    const randomDish = dish[i]
    const result = await prisma.dishes.findMany({where: {name: randomDish.name}})

    let sides, otherInfo

    console.log(result)

    // if (result.length > 1) {
        sides = []
        otherInfo = []

        result.forEach(async(dish) => {
            const side = await prisma.side.findUnique({where: {
                id: dish.sideId
            }})

            console.log({side})

            sides.push(side.ingredient)
            otherInfo.push(dish.otherInfo)
            console.log(sides, otherInfo)
        })
    // }

    // else {
    //     sides = await prisma.side.findUnique({where: {
    //         id: result[0].sideId
    //     }})

    //     sides = sides.ingredient
    //     otherInfo = result[0].otherInfo
    // }

    const main = await prisma.main.findUnique({where: {
        id: result[0].mainId
    }})

    const main_ingredient = main.ingredient

    if (typeof otherInfo != "string") otherInfo = otherInfo.filter((item, index) => otherInfo.indexOf(item) === index)

    console.log("s" + main_ingredient, sides, otherInfo)

    res.render("index.njk", {title: "Matlista", dish: randomDish, sides: sides, main: main_ingredient, otherInfo: otherInfo})
})

export default router
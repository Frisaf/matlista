import express from "express"
import prisma from "../config/db.js"
import { body, param, validationResult} from "express-validator"

const router = express.Router()

router.get("/all", async(req, res) => {
    const dishes = await prisma.dishes.findMany({
        select: {
            name: true,
            id: true,
            side: {
                select: {
                    side: true
                }
            }
        }
    })

    res.render("dishes.njk", {dishes: dishes, title: "Alla maträtter"})
})

router.get("/info/:id", param("id").isInt().withMessage("Dish ID has to be an integer"), async(req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const dishId = Number(req.params.id)
        const dish = await prisma.dishes.findUnique({
            where: {
                id: dishId
            },
            select: {
                name: true,
                weekendWorthy: true,
                main: {
                    select: {
                        main: true
                    }
                }
            }
        })

        if (dish === null) {
            throw new Error("Dish not found :(")
        }

        const sameNameDish = await prisma.dishes.findMany({
            where: {
                name: dish.name
            },
            select: {
                otherInfo: true,
                side: {
                    select: {
                        side: true
                    }
                }
            }
        })

        let otherInfo = []

        const sides = []
        const main = dish.main.main

        sameNameDish.forEach(dish => {
            sides.push(dish.side.side)
            otherInfo.push(dish.otherInfo)
        })

        otherInfo = otherInfo.filter((item, index) => otherInfo.indexOf(item) === index)

        res.render("dish.njk", {dish: dish, sides: sides, otherInfo: otherInfo, main: main})
    } catch (err) {
        next(err)
    }
})

router.get("/weekend", async(req, res) => {
    const dishes = await prisma.dishes.findMany({
        where: {
            weekendWorthy: "YES"
        },
        select: {
            id: true,
            name: true,
            side: {
                select: {
                    side: true
                }
            }
        }
    })

    res.render("dishes.njk", {dishes: dishes, title: "Helgmat"})
})

router.get("/regular", async(req, res) => {
    const dishes = await prisma.dishes.findMany({
        where: {
            weekendWorthy: "NO"
        },
        select: {
            id: true,
            name: true,
            side: {
                select: {
                    side: true
                }
            }
        }
    })

    res.render("dishes.njk", {dishes: dishes, title: "Vardagsmat"})
})

export default router
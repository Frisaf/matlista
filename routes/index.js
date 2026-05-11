import express from "express"
import prisma from "../config/db.js"

const router = express.Router()

router.get("/", async (req, res) => {
    const filters = Object.keys(req.query)

    let sidesList = []
    let sideFilters = []
    let mainFilters = []
    
    if (filters) {
        const sides = await prisma.side.findMany({select: {side: true}})

        sides.forEach(side => {
            sidesList.push(side.side)
        })

        filters.forEach(item => {
            if (sidesList.includes(item)) {
                sideFilters.push(item)
            } else {
                mainFilters.push(item)
            }
        })
    }

    let dishes = await prisma.dishes.findMany({
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

    let filtered_dishes

    try {
        if (sideFilters[0] && !mainFilters[0]) {
            filtered_dishes = dishes.filter(dish => sideFilters.includes(dish.side.side))
        } else if (mainFilters[0] && !sideFilters[0]) {
            filtered_dishes = dishes.filter(dish => mainFilters.includes(dish.main.main))
        } else if (sideFilters[0] && mainFilters[0]) {
            filtered_dishes = dishes.filter(dishes => sideFilters.includes(dishes.side.side) && mainFilters.includes(dish.main.main))
        }

        if (filtered_dishes) dishes = filtered_dishes
    } catch {
        return req.flash("error", "Ingen rätt med dessa filter kunde hittas", "/")
    }

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
    
    const allSides = await prisma.side.findMany({
        select: {
            side: true
        }
    })
    const allMains = await prisma.main.findMany({
        select: {
            main: true
        }
    })

    return res.render("index.njk", {title: "Matlista", dish: randomDish, sides: sides, main: main, otherInfo: otherInfo, logged_in: req.session.authenticated, allSides: allSides, allMains: allMains, filters: filters})

})

router.get("/about", (req, res) => {
    res.render("about.njk")
})

export default router
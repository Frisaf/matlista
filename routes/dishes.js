import express from "express"
import prisma from "../config/db.js"

const router = express.Router()

router.get("/all", async(req, res) => {
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

    res.render("all_dishes.njk", {dishes: dishes})
})

export default router
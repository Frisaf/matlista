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

    res.render("dishes.njk", {dishes: dishes, title: "Alla maträtter", logged_in: req.session.authenticated})
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
                id: true,
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

        res.render("dish.njk", {dish: dish, sides: sides, otherInfo: otherInfo, main: main, logged_in: req.session.authenticated})
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

    res.render("dishes.njk", {dishes: dishes, title: "Helgmat", logged_in: req.session.authenticated})
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

    res.render("dishes.njk", {dishes: dishes, title: "Vardagsmat", logged_in: req.session.authenticated})
})

router.get("/add", (req, res) => {
    res.render("add_dish.njk", {logged_in: req.session.authenticated})
})

router.post(
    "/add",
    body("name").trim().notEmpty().withMessage("Måltidens namn får inte vara tomt"),
    body("main").trim().notEmpty().withMessage("Huvudingrediensen kan inte vara tom"),
    body("side").trim(),
    body("otherInfo").trim(),
    body("weekendWorthy").trim(),
    async(req, res, next) => {
        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            return req.flash("error", errors.array()[0].msg, "/dishes/add")
        }

        if (!req.session.authenticated) {
            return req.flash("info", "Du måste vara inloggad för att göra detta!")
        }

        const name = req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1)
        const main = req.body.main.charAt(0).toUpperCase() + req.body.main.slice(1)
        const side = req.body.side.charAt(0).toUpperCase() + req.body.side.slice(1) ? req.body.side : "None"
        const otherInfo = req.body.otherInfo ? req.body.otherInfo : ""
        const weekendWorthy = req.body.weekendWorthy

        try {
            const is_duplicate = await prisma.dishes.findMany({
                where: {
                    name: name,
                    main: {
                        is: {
                            main: main
                        }
                    },
                    side: {
                        is: {
                            side: side
                        }
                    }
                },
                select: {
                    name: true
                }
            })

            if (is_duplicate[0]) {
                return req.flash("error", "Den här måltiden finns redan", "/dishes/add")
            }

            let mainId = await prisma.main.findMany({
                select: {
                    id: true
                },
                where: {
                    main: main
                }
            })
            let sideId = await prisma.side.findMany({
                select: {
                    id: true
                },
                where: {
                    side: side
                }
            })

            if (mainId.length === 0) {
                mainId = await prisma.main.create({
                    data: {
                        main: main
                    }
                })
            } else if (sideId.length === 0) {
                sideId = await prisma.side.create({
                    data: {
                        side: side
                    }
                })
            }

            const newDish = await prisma.dishes.create({
                data: {
                    name: name,
                    mainId: mainId[0].id,
                    sideId: sideId[0].id,
                    otherInfo: otherInfo,
                    weekendWorthy: weekendWorthy
                }
            })

            res.redirect("/")
        } catch (err) {
            next(err)
        }
})

router.get("/delete/:id", param("id").isInt().withMessage("Dish ID has to be an integer"), async(req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        if (!req.session.authenticated) {
            return req.flash("info", "Du måste vara inloggad för att göra detta!", "/")
        }

        const id = Number(req.params.id)
        const dish = await prisma.dishes.findUnique({
            select: {
                id: true
            },
            where: {
                id: id
            }
        })

        if (dish) {
            await prisma.dishes.delete({
                where: {
                    id: dish.id
                }
            })
        }

        res.redirect("/")
    } catch (err) {
        next(err)
    }
})

router.get("/edit/:id", param("id").isInt().withMessage("Dish ID has to be an integer"), async(req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const id = Number(req.params.id)

        const dish = await prisma.dishes.findUnique({
            select: {
                id: true,
                name: true,
                side: {
                    select: {
                        side: true
                    }
                },
                main: {
                    select: {
                        main: true
                    }
                },
                otherInfo: true,
                weekendWorthy: true
            },
            where: {
                id: id
            }
        })

        res.render("edit_dish.njk", {dish: dish, logged_in: req.session.authenticated})
    } catch (err) {
        next(err)
    }
})

router.post(
    "/edit/:id",
    body("name").trim().notEmpty().withMessage("Måltidens namn får inte vara tomt"),
    body("main").trim().notEmpty().withMessage("Huvudingrediensen kan inte vara tom"),
    body("side").trim(),
    body("otherInfo").trim(),
    body("weekendWorthy").trim(),
    param("id").isInt().withMessage("Dish ID must be an integer"),
    async(req, res, next) => {
        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            return req.flash("error", errors.array()[0].msg, "/dishes/add")
        }

        if (!req.session.authenticated) {
            return req.flash("info", "Du måste vara inloggad för att göra detta!")
        }

        const name = req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1)
        const main = req.body.main.charAt(0).toUpperCase() + req.body.main.slice(1)
        const side = req.body.side.charAt(0).toUpperCase() + req.body.side.slice(1) ? req.body.side : "None"
        const otherInfo = req.body.otherInfo ? req.body.otherInfo : ""
        const weekendWorthy = req.body.weekendWorthy
        const id = Number(req.params.id)

        try {
            const dish_to_edit = await prisma.dishes.findUnique({
                where: {
                    id: id
                },
                select: {
                    id: true
                }
            })
            const is_duplicate = await prisma.dishes.findMany({
                where: {
                    name: name,
                    main: {
                        is: {
                            main: main
                        }
                    },
                    side: {
                        is: {
                            side: side
                        }
                    }
                },
                select: {
                    name: true,
                    id: true
                }
            })

            if (is_duplicate[0] && dish_to_edit.id != is_duplicate[0].id) {
                return req.flash("error", "Den här måltiden finns redan", `/dishes/edit/${id}`)
            }

            let mainId = await prisma.main.findMany({
                select: {
                    id: true
                },
                where: {
                    main: main
                }
            })
            let sideId = await prisma.side.findMany({
                select: {
                    id: true
                },
                where: {
                    side: side
                }
            })

            if (mainId.length === 0) {
                mainId = await prisma.main.create({
                    data: {
                        main: main
                    }
                })
            }
            
            if (sideId.length === 0) {
                sideId = await prisma.side.create({
                    data: {
                        side: side
                    }
                })
            }

            await prisma.dishes.update({
                where: {
                    id: id
                },
                data: {
                    name: name,
                    mainId: mainId[0].id,
                    sideId: sideId[0].id,
                    otherInfo: otherInfo,
                    weekendWorthy: weekendWorthy
                }
            })

            res.redirect(`/dishes/info/${id}`)
        } catch (err) {
            next(err)
        }
    }
)

export default router
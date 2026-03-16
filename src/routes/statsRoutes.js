const express = require("express")
const AppDataSource = require('../database')

const router = express.Router();

router.get("/stats", async (req, res) => {
    try {
        const userRepo = AppDataSource.getRepository("User")
        const noteRepo = AppDataSource.getRepository("Note")

        const totalUsers = await userRepo.count()
        const totalNotes = await noteRepo.count()

        res.status(200).json({ totalUsers, totalNotes })
    } catch (error) {
        coreLogMessage("Error gathering main page stats: " + error.message)
        res.status(500).json({message : "internal error"})
    }
})

module.exports = router
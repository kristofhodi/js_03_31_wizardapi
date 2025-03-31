import express from 'express'
import { initializeDatabase, dbAll, dbGet, dbRun } from './util/database.js'

const app = express()
app.use(express.json())

app.get('/wizard', async(req, res) => {
    const wizards = await dbAll("SELECT * FROM roxfort");
    res.status(200).json(wizards)
})

app.get("/wizard/:id", async (req, res) => {
    const id = req.params.id;
    const wizard = await dbGet("SELECT * FROM roxfort WHERE id = ?;", [id])
    if (!wizard) {
        return res.status(404).json({message: "wizard not found"});
    }
    res.status(200).json(wizard)
})

app.post('/wizard', async (req, res) => {
    const  {name, wand, house} = req.body;
    if (!name || !wand || !house) {
        return res.status(400).json({message: "missing data"})
    }
    const result = await dbRun("INSERT INTO roxfort (name, wand, house) VALUES (?, ?, ?);", [name, wand, house]);
    res.status(201).json({id: result.lastID, name, wand, house});
})

app.put("/wizard/:id", async (req, res) => {
    const id = req.params.id;
    const wizard = dbGet("SELECT * FROM roxfort WHERE id = ?;", [id]);
    if (!wizard) {
        return res.status(404).json({message: "not found"})
    }
    const {name, wand, house} = req.body;
    if (!name || !wand || !house) {
        return res.status(400).json({message: "missing data"})
    }
    await dbRun("UPDATE roxfort SET name = ?, wand = ?, house = ? WHERE id = ?;", [name, wand, house, id])
    res.status(200).json({id: +id, name, wand, house})
})

app.delete("/wizard/:id", async (req, res) => {
    const id = req.params.id;
    const wizard = dbGet("SELECT * FROM roxfort WHERE id = ?;", [id]);
    if (!wizard) {
        return res.status(404).json({message: "not found"})
    }
    await dbRun("DELETE FROM roxfort WHERE id = ?;", [id]) 
    res.status(200).json({message: "delete successful"})

})

app.use((req, res, next, err) => {
    if (err) {
        res.status(500).json({message: `Error ${err.message}`})
    }
})

async function startServer() {
    await initializeDatabase();
    app.listen(3000, () => {
        console.log('Server runs on 3000')
    })
}

startServer();
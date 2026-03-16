const express = require("express")
const AppDataSource = require('../database');
const jwt = require('jsonwebtoken');
const { notesLogMessage } = require("../utils/Logger");
const router = express.Router();

const verifyToken = (req, res, next) => {  
    const token = req.headers['authorization'];
    if (!token) {
      notesLogMessage("[Notes] User does not have a token.");
      return res.status(403).json({ error: 'You are not signed in.' });
    }
      jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
          notesLogMessage("User has invalid token.");
          return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = decoded;
        notesLogMessage("User has valid token");
        next();
      });
  };

router.post("/notes/create", verifyToken, async (req, res) => {
    const userId = req.headers['authorization-id'];
    let { title, content, file, visibility } = req.body;
    try {
        const noteRepo = AppDataSource.getRepository("Note");
        const note = noteRepo.create({userId, title, content, file, visibility});
        const newNote = await noteRepo.save(note);
        
      res.status(201).json({ message: "Note made.", note : newNote});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message : "internal error"});
    }
})

router.post("/notes/delete", verifyToken, async (req, res) => {
  let { noteId, userId } = req.body;
    try {
        const noteRepo = AppDataSource.getRepository("Note");
        const note = await noteRepo.findOneBy({ id: noteId });

        if(note.userId != userId) {
          notesLogMessage(` / [Security] UserID ${userId} tried to delete a protected note.`)
          return res.status(403).json({ message: "You cannot delete notes that aren't yours."});
      }

        noteRepo.remove(note);
        res.status(201).json({ message: "Note deleted."})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message : "internal error"})
    }
})

// gets all notes, meant for dashboard
router.get("/notes/get", verifyToken, async (req, res) => {
    const userId = req.headers['authorization-id'];
    try {
        const noteRepo = AppDataSource.getRepository("Note");
        const [notes, count] = await noteRepo.findAndCountBy({ userId: userId });
        const formattedNotes = notes.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content
        }));

        res.status(200).json({
            userId: userId,
            count: count,
            notes: formattedNotes
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal error" });
    }
});

// gets note details for opening them
router.get("/notes/:id", async (req, res) => {
    const noteId = req.params.id; 
    try {
      const noteRepo = AppDataSource.getRepository("Note");
      const note = await noteRepo.findOneBy({ id: noteId });
      if (!note) {
        return res.status(404).json({ message: "Note not found." });
      }

  //    if(note.userId != userId) {
  //      return res.status(403).json({message: "You do not have access to this note."});
  //    }
   res.render('note', { note });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Internal error" });
    }
  });

module.exports = router
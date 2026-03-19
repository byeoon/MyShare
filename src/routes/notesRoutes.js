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
    next();
  });
};

// **
// Creates a note. This is posted  with the values userId, title, content, file, tags, and visibility.
// Title: Title of note
// Content: Inner content of note / more details
// File: The image uploaded (or image link)
// Tags: All available tags on the note
// Visibility: Note visibility (public or private)
// **
router.post("/notes/create", verifyToken, async (req, res) => {
  const userId = req.headers['authorization-id'];
  let { title, content, file, tags, visibility } = req.body;
  try {
    const noteRepo = AppDataSource.getRepository("Note");
    const serializedTags = typeof tags === 'object' ? JSON.stringify(tags) : tags;
    const note = noteRepo.create({ userId, title, content, file, tags: serializedTags, visibility });
    const newNote = await noteRepo.save(note);

    res.status(201).json({ message: "Note created successfully!", note: newNote });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal error" });
  }
})


// **
// Deletes a note.This is posted with noteId and userId.
// noteId: ID of the note being deleted.
// userId: The UserID of the person deleting the note.
// The user MUST be the same as the person deleting it, or else it won't work.
// **
router.post("/notes/delete", verifyToken, async (req, res) => {
  let { noteId, userId } = req.body;
  try {
    const noteRepo = AppDataSource.getRepository("Note");
    const note = await noteRepo.findOneBy({ id: noteId });

    if (note.userId != userId) {
      notesLogMessage(`UserID ${userId} tried to delete a note that wasn't theirs.`)
      return res.status(403).json({ message: "You cannot delete notes that aren't yours." });
    }
    noteRepo.remove(note);
    res.status(201).json({ message: "Note deleted." })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: "internal error" })
  }
})


// **
// Gets all the notes of all users(?) This is called with the same values as createNote.
// Maps all note values and also gets the userid.
// **
router.get("/notes/get", verifyToken, async (req, res) => {
  const userId = req.headers['authorization-id'];
  try {
    const noteRepo = AppDataSource.getRepository("Note");
    const [notes, count] = await noteRepo.findAndCountBy({ userId: userId });
    const formattedNotes = notes.map(note => {
      let parsedTags = [];
      try {
        parsedTags = JSON.parse(note.tags);
        if (!Array.isArray(parsedTags)) {
          parsedTags = note.tags ? [{ text: note.tags, color: "#570df8" }] : [];
        }
      } catch (e) {
        parsedTags = note.tags ? [{ text: note.tags, color: "#570df8" }] : [];
      }
      return {
        id: note.id,
        title: note.title,
        content: note.content,
        visibility: note.visibility,
        tags: parsedTags,
        file: note.file
      };
    });

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

// **
// Gets all public notes from all users.
// **
router.get("/notes/public", async (req, res) => {
  try {
    const noteRepo = AppDataSource.getRepository("Note");
    const notes = await noteRepo.find({
      where: { visibility: false },
      relations: ["author"],
      order: { id: "DESC" }
    });

    const formattedNotes = notes.map(note => {
      let parsedTags = [];
      try {
        parsedTags = JSON.parse(note.tags);
        if (!Array.isArray(parsedTags)) {
          parsedTags = note.tags ? [{ text: note.tags, color: "#570df8" }] : [];
        }
      } catch (e) {
        parsedTags = note.tags ? [{ text: note.tags, color: "#570df8" }] : [];
      }
      return {
        id: note.id,
        title: note.title,
        content: note.content,
        visibility: note.visibility,
        tags: parsedTags,
        file: note.file,
        author: note.author ? note.author.username : 'Unknown'
      };
    });

    res.status(200).json({ notes: formattedNotes });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal error" });
  }
});


// **
// Gets a note by it's ID. This is different than /notes/get as this is the full note that can be opened.
// For notes with visibility/privacy set to true, it will error with a 403.
// noteId: ID of the note.
// **
router.get("/notes/:id", async (req, res) => {
  const noteId = req.params.id;
  const token = req.headers['authorization'] || req.cookies.token || req.query.token;
  try {
    const noteRepo = AppDataSource.getRepository("Note");
    const userRepo = AppDataSource.getRepository("User");
    const note = await noteRepo.findOneBy({ id: noteId });

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    if (note.visibility == true) {
      if (!token) {
        notesLogMessage(`[Notes] Unauthorized access attempt to private note #${noteId} (No token)`);
        return res.status(403).json({ message: "You do not have access to this private note." });
      }

      try {
        const decoded = jwt.verify(token, 'secret');
        const user = await userRepo.findOneBy({ email: decoded.email });

        if (!user || user.id != note.userId) {
          notesLogMessage(`[Notes] User ${decoded.email} tried to access a private note belonging to UserID ${note.userId}`);
          return res.status(403).json({ message: "You do not have access to this private note." });
        }
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired session." });
      }
    }

    try {
      note.tags = JSON.parse(note.tags);
      if (!Array.isArray(note.tags)) {
        note.tags = note.tags ? [{ text: note.tags, color: "#570df8bb" }] : [];
      }
    } catch (e) {
      note.tags = note.tags ? [{ text: note.tags, color: "#570df8bb" }] : [];
    }

    res.render('note', { note });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal error", error: error.message });
  }
});

module.exports = router
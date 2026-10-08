/* ==========================================================================
   NOTES APPLICATION BACKEND (server.js)
   Express.js + Mongoose + REST API + Error Handling
   ========================================================================== */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notes_db';

// --------------------------------------------------------------------------
// 1. MIDDLEWARE SETUP
// --------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// --------------------------------------------------------------------------
// 2. MONGOOSE SCHEMA & MODEL
// --------------------------------------------------------------------------
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required.'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters.']
    },
    content: {
      type: String,
      required: [true, 'Note content is required.'],
      trim: true
    },
    color: {
      type: String,
      default: '#7C3AED',
      trim: true
    }
  },
  {
    timestamps: true // Creates createdAt and updatedAt fields automatically
  }
);

const Note = mongoose.model('Note', noteSchema);

// --------------------------------------------------------------------------
// 3. MONGODB CONNECTION
// --------------------------------------------------------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB database.');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Server is running, but database operations require MongoDB.');
  });

// --------------------------------------------------------------------------
// 4. REST API ROUTES
// --------------------------------------------------------------------------

// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Notes API backend is operational',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// GET /api/notes - Get all notes (Supports optional search query parameter ?search=keyword)
app.get('/api/notes', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i'); // Case-insensitive regex
      query = {
        $or: [{ title: regex }, { content: regex }]
      };
    }

    // Sort by most recently updated notes first
    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id - Get a single note by ID
app.get('/api/notes/:id', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }
    res.json(note);
  } catch (err) {
    next(err);
  }
});

// POST /api/notes - Create a new note
app.post('/api/notes', async (req, res, next) => {
  try {
    const { title, content, color } = req.body;

    // Server-side validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Content is required.' });
    }

    const newNote = new Note({
      title: title.trim(),
      content: content.trim(),
      color: color || '#7C3AED'
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id - Update an existing note
app.put('/api/notes/:id', async (req, res, next) => {
  try {
    const { title, content, color } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Content is required.' });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        content: content.trim(),
        color: color || '#7C3AED'
      },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ success: false, message: 'Note not found for update.' });
    }

    res.json(updatedNote);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id - Delete a note
app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }
    res.json({ success: true, message: 'Note deleted successfully.', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------------------
// 5. ERROR HANDLING MIDDLEWARE & UNKNOWN ROUTES
// --------------------------------------------------------------------------

// 404 for unknown API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);

  // CastError (Invalid MongoDB ObjectId)
  if (err.kind === 'ObjectId') {
    return res.status(400).json({ success: false, message: 'Invalid Note ID format.' });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(' ') });
  }

  res.status(500).json({ success: false, message: 'Internal Server Error. Please try again later.' });
});

// --------------------------------------------------------------------------
// 6. START SERVER
// --------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

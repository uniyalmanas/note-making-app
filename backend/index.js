require('dotenv').config(); // Load environment variables from .env file

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Add bcrypt for password hashing
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./utilities');
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Connect to models
const User = require('./models/user.model');
const Note = require('./models/note.model');

// Middleware
app.use(express.json());
app.use(cors());

// Basic route
app.get('/', (req, res) => {
  res.json({ data: 'hello' });
});

// Port configuration
const PORT = process.env.PORT || 8000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup error:', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});



// Backend Ready !!!

// Create Account Route
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res.status(400).json({ error: true, message: "Full Name is required" });
  }

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ error: true, message: "Password is required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: true, message: 'User already exists' });
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    fullName,
    email,
    password: hashedPassword, // Save the hashed password
  });

  await user.save();

  const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration Successful",
  });
});


// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const userInfo = await User.findOne({ email });
  if (!userInfo) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check if the password matches
  const isMatch = await bcrypt.compare(password, userInfo.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign({ userId: userInfo._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

  return res.json({
    error: false,
    message: "Login Successful",
    accessToken,
  });
});

// Add Note Route
app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
    const user = req.user;
  
    if (!title) {
      return res.status(400).json({ error: true, message: "Title is required" });
    }
  
    if (!content) {
      return res.status(400).json({ error: true, message: "Content is required" });
    }
  
    // Debugging: Log user information
    console.log('User from token:', user);
  
    try {
      if (!user || !user.userId) {
        throw new Error('User ID is not available');
      }
  
      const note = new Note({
        title,
        content,
        tags: tags || [],
        userId: user.userId, // Ensure userId is set
      });
  
      await note.save();
  
      return res.json({
        error: false,
        message: "Note added successfully",
        note,
      });
    } catch (error) {
      console.error('Error adding note:', error); // Log detailed error
      return res.status(500).json({ error: true, message: error.message });
    }
 

});
  
 // Edit-Node
// Edit Note Route (PUT request)
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const user = req.user; // Use req.user directly, don't destructure

    // Check if no fields are provided for update
    if (!title && !content && !tags && typeof isPinned !== 'boolean') {
        return res.status(400).json({ error: true, message: "No valid changes provided" });
    }

    try {
        // Find the note by ID and userId (to ensure the user is the owner)
        const note = await Note.findOne({ _id: noteId, userId: user.userId });

        // Check if the note exists
        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        // Update the fields if they are provided
        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (typeof isPinned === 'boolean') note.isPinned = isPinned; // Properly handle boolean values

        // Save the updated note
        await note.save();

        return res.json({
            error: false,
            message: "Note updated successfully",
            note,
        });
    } catch (error) {
        console.error('Error updating note:', error); // Log error for debugging
        return res.status(500).json({ error: true, message: error.message });
    }
});

// Get All Notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
    const user = req.user;
  
    try {
      // Fetch notes for the logged-in user and sort by pinned status
      const notes = await Note.find({ userId: user.userId }).sort({ isPinned: -1 });
  
      return res.json({
        error: false,
        notes,
        message: "All notes retrieved successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  });
  
// Delete App
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const user = req.user;
  
    try {
      // Find the note with the specified ID and ensure it belongs to the user
      const note = await Note.findOne({ _id: noteId, userId: user.userId });
  
      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }
  
      // Delete the note
      await Note.deleteOne({ _id: noteId, userId: user.userId });
  
      return res.json({
        error: false,
        message: "Note deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting note:', error); // Log detailed error
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
});

// Update isPinned
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    
    if (isPinned === undefined) {
      return res.status(400).json({ error: true, message: "isPinned is required" });
    }
  
    try {
      // Find note by noteId and userId from token
      const note = await Note.findOne({ _id: noteId, userId: req.user.userId });
      
      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }
  
      note.isPinned = isPinned;  // Update the isPinned field
      
      await note.save();  // Save the updated note
      
      return res.json({
        error: false,
        note,
        message: "Note updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  });
  
// Get user details
app.get("/get-user", authenticateToken, async (req, res) => {
    const userId = req.user.userId; // Use userId from the token payload
  
    try {
      const isUser = await User.findOne({ _id: userId });
  
      if (!isUser) {
        return res.sendStatus(401); // User not found
      }
  
      return res.json({
        user: { fullName: isUser.fullName, email: isUser.email, _id: isUser._id },
        message: "User details retrieved successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  });

// Search Notes 

app.get("/search-notes/", authenticateToken, async (req, res) => {
  const user = req.user;
  const { search } = req.query;

  console.log("Search Query:", search); // Log search query

  if (!search) {
    return res.status(400).json({ error: true, message: "Search query is required" });
  }

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: search, $options: "i" } }, // Case-insensitive search on title
        { content: { $regex: search, $options: "i" } } // Case-insensitive search on content
      ]
    }).sort({ title: 1 }); // Sort by title ascending

    console.log("Matching Notes:", matchingNotes); // Log retrieved notes

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    console.log("Error:", error); // Log errors
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});







module.exports = app; // Export the app for potential use elsewhere

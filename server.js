// ============================================
// ChordBook Backend — server.js
// Node.js + Express + MongoDB (Mongoose)
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARE ────────────────────────────────
app.use(cors({
  origin: '*', // Production mein apna domain dena
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// ── MONGODB CONNECTION ────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ajaybara1920_db_user:bircw7aJRynjOjmM@cluster0.eeyws1p.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB se connect ho gaya!'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── SONG SCHEMA (Database ka structure) ──────
const songSchema = new mongoose.Schema({
  title:  { type: String, required: true, trim: true },
  artist: { type: String, default: 'Unknown', trim: true },
  key:    { type: String, default: '' },
  genre:  { type: String, default: '' },
  lyrics: { type: String, required: true },
}, {
  timestamps: true  // createdAt, updatedAt auto add hoga
});

// Search ke liye index
songSchema.index({ title: 'text', artist: 'text', genre: 'text' });

const Song = mongoose.model('Song', songSchema);

// ── ARRANGEMENT SCHEMA (Custom versions) ──────
const arrangementSchema = new mongoose.Schema({
  song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
  name: { type: String, required: true, trim: true },
  key: { type: String, default: '' },
  lyrics: { type: String, required: true },
  sectionOrder: [{ type: String }]
}, {
  timestamps: true
});

const Arrangement = mongoose.model('Arrangement', arrangementSchema);

// ── DEFAULT SONGS (Pehli baar ke liye) ───────
const defaultSongs = [
 
  {
    title: "Amazing Grace", artist: "Traditional",
    key: "G", genre: "Gospel / Worship",
    lyrics: `[Verse 1]\n[G]Amazing [G7]grace how [C]sweet the [G]sound\nThat [G]saved a wretch like [D]me\n[G]I [G7]once was [C]lost but [G]now am [Em]found\nWas [G]blind but [D7]now I [G]see\n\n[Verse 2]\n[G]Twas [G7]grace that [C]taught my [G]heart to fear\nAnd [G]grace my fears re[D]lieved\n[G]How [G7]precious [C]did that [G]grace ap[Em]pear\nThe [G]hour I first be[D7]lieved [G]`
  },
 
];

// Seed karo agar DB empty hai
async function seedDatabase() {
  const count = await Song.countDocuments();
  if (count === 0) {
    await Song.insertMany(defaultSongs);
    console.log('🌱 Default songs add ho gaye MongoDB mein!');
  }
}

// ── API ROUTES ────────────────────────────────

// GET all songs (search support ke saath)
app.get('/api/songs', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title:  { $regex: search, $options: 'i' } },
          { artist: { $regex: search, $options: 'i' } },
          { genre:  { $regex: search, $options: 'i' } },
          { key:    { $regex: search, $options: 'i' } }
        ]
      };
    }

    const songs = await Song.find(query).select('-lyrics').sort({ createdAt: -1 });
    res.json({ success: true, count: songs.length, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single song by ID (lyrics ke saath)
app.get('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song nahi mila!' });
    res.json({ success: true, song });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new song (save karo)
app.post('/api/songs', async (req, res) => {
  try {
    const { title, artist, key, genre, lyrics } = req.body;
    if (!title || !lyrics) {
      return res.status(400).json({ success: false, message: 'Title aur Lyrics zaroori hain!' });
    }
    const song = await Song.create({ title, artist, key, genre, lyrics });
    res.status(201).json({ success: true, message: 'Song save ho gaya! 🎵', song });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update song
app.put('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!song) return res.status(404).json({ success: false, message: 'Song nahi mila!' });
    res.json({ success: true, message: 'Song update ho gaya!', song });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE song (cascade delete arrangements)
app.delete('/api/songs/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song nahi mila!' });
    
    // Associated arrangements auto-delete
    await Arrangement.deleteMany({ song: req.params.id });
    
    res.json({ success: true, message: 'Song aur uske arrangements delete ho gaye!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ARRANGEMENT API ROUTES ─────────────────────

// GET all arrangements for a specific song
app.get('/api/songs/:id/arrangements', async (req, res) => {
  try {
    const arrangements = await Arrangement.find({ song: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: arrangements.length, arrangements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single arrangement by ID
app.get('/api/arrangements/:id', async (req, res) => {
  try {
    const arrangement = await Arrangement.findById(req.params.id);
    if (!arrangement) return res.status(404).json({ success: false, message: 'Arrangement nahi mila!' });
    res.json({ success: true, arrangement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new arrangement for a song
app.post('/api/songs/:id/arrangements', async (req, res) => {
  try {
    const { name, key, lyrics, sectionOrder } = req.body;
    if (!name || !lyrics) {
      return res.status(400).json({ success: false, message: 'Name aur Lyrics zaroori hain!' });
    }
    const arrangement = await Arrangement.create({
      song: req.params.id,
      name,
      key: key || '',
      lyrics,
      sectionOrder: sectionOrder || []
    });
    res.status(201).json({ success: true, message: 'Arrangement save ho gaya! 🎸', arrangement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update arrangement
app.put('/api/arrangements/:id', async (req, res) => {
  try {
    const arrangement = await Arrangement.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!arrangement) return res.status(404).json({ success: false, message: 'Arrangement nahi mila!' });
    res.json({ success: true, message: 'Arrangement update ho gaya!', arrangement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE arrangement
app.delete('/api/arrangements/:id', async (req, res) => {
  try {
    const arrangement = await Arrangement.findByIdAndDelete(req.params.id);
    if (!arrangement) return res.status(404).json({ success: false, message: 'Arrangement nahi mila!' });
    res.json({ success: true, message: 'Arrangement delete ho gaya!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ChordBook API chal raha hai! 🎸',
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ── START SERVER ──────────────────────────────
mongoose.connection.once('open', async () => {
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server chal raha hai: http://localhost:${PORT}`);
    console.log(`📡 API ready: http://localhost:${PORT}/api/songs`);
  });
});

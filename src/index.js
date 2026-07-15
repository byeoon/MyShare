const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const express = require('express')
const bodyparser = require('body-parser')
const AppDataSource = require('./database')
const jwt = require('jsonwebtoken')
const userRoutes = require('./routes/userRoutes')
const statsRoutes = require('./routes/statsRoutes')
const notesRoutes = require('./routes/notesRoutes')
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

const userRepo = AppDataSource.getRepository("User")

const cookieParser = require('cookie-parser');
const { coreLogMessage, securityLogMessage } = require('./utils/Logger')
const PORT = process.env.PORT || 3010
const HOST = process.env.HOST || "127.0.0.1"
const app = express();

app.use(cookieParser());
app.use(bodyparser.json())
app.use("/api", userRoutes)
app.use("/api", statsRoutes)
app.use("/api", notesRoutes) // todo remove prefix
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'login.html'));
});

AppDataSource.initialize().then(() => {
  app.listen(PORT, () => coreLogMessage(`Server running on ${process.env.PORT}`))
}).catch((error) => {
  coreLogMessage("Error while initializing server: ", error.message)
})


// **
// Gets the current version hash from GitHub
// **
app.get('/api/version', async (req, res) => {
  try {
    const ghRes = await fetch('https://api.github.com/repos/byeoon/MyShare/commits/main', { headers: { 'User-Agent': 'MyShare' } });
    const data = await ghRes.json();
    res.json({ commit: data.sha?.slice(0, 7) || 'dev' });
  } catch (e) {
    res.json({ commit: 'dev' });
  }
});

// **
// Verifies user token, security measure.
// **
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'] || req.cookies.token || req.query.token;
  if (!token) {
    securityLogMessage("User does not have a token.");
    return res.status(403).json({ error: 'You are not signed in.' });
  }
  const secret = process.env.JWT_SECRET || 'secret';
  jwt.verify(token, secret, (err, decoded) => {
    if (err || !decoded || !decoded.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
};

// **
// Returns the currently authenticated user's profile information.
// **
app.get('/api/email', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await userRepo.findOneBy({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      userId: user.id,
      email: user.email,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// **
// Uploads a file.
// !! BIG POTENTIAL SECURITY WARNING - NEEDS FIXING!!!
// **
app.post("/api/upload", upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  coreLogMessage("Image upload complete: " + req.file.filename);
  res.json({ filename: req.file.filename });
})

// **
// Error page fallbacks.
// **
app.use((req, res, next) => {
  res.status(404).render('404', { message: 'Page Not Found' });
});
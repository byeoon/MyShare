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
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

const userRepo = AppDataSource.getRepository("User")

const app = express();
const { coreLogMessage, securityLogMessage } = require('./utils/Logger')

const PORT = process.env.PORT || 3010
const HOST = process.env.HOST || "127.0.0.1"

app.use(bodyparser.json())
app.use("/api", userRoutes)
app.use("/api", statsRoutes)
app.use("/api", notesRoutes) // todo remove prefix
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

AppDataSource.initialize().then(() => {
  app.listen(PORT, () => coreLogMessage(`Server running on ${process.env.PORT}`))
}).catch((error) => {
  coreLogMessage("Error while initializing server: ", error.message)
})

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    securityLogMessage("User does not have a token.");
    return res.status(403).json({ error: 'You are not signed in.' });
  }
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      securityLogMessage("User has invalid token.");
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = decoded;
    securityLogMessage("Valid token");
    next();
  });
};

app.get('/api/email', verifyToken, async (req, res) => {
  try {
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

app.post("/api/upload", upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  coreLogMessage("Image upload complete: " + req.file.filename);
  res.json({ filename: req.file.filename });
})

app.use((req, res, next) => {
  res.status(404).render('404', { message: 'Page Not Found' });
});
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const bodyparser = require('body-parser');
const AppDataSource = require('./database');
const jwt = require('jsonwebtoken');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const notesRoutes = require('./routes/notesRoutes');
const formidable = require('formidable');
const cookieParser = require('cookie-parser');
const { coreLogMessage, securityLogMessage } = require('./utils/Logger');
const app = express();

app.use(cookieParser());
app.use(bodyparser.json());
app.use('/api', userRoutes);
app.use('/api', statsRoutes);
app.use('/api', notesRoutes);
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', ''));
});

app.get('/api/version', async (req, res) => {
    try {
        const ghRes = await fetch('https://api.github.com/repos/byeoon/MyShare/commits/main', {
            headers: { 'User-Agent': 'MyShare' },
        });
        const data = await ghRes.json();
        res.json({ commit: data.sha?.slice(0, 7) || 'dev' });
    } catch {
        res.json({ commit: 'dev' });
    }
});

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'] || req.cookies.token || req.query.token;
    if (!token) {
        securityLogMessage('User does not have a token.');
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

app.get('/api/email', verifyToken, async (req, res) => {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const userRepo = AppDataSource.getRepository('User');
        const user = await userRepo.findOneBy({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({
            userId: user.id,
            email: user.email,
            username: user.username,
        });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/upload', async (req, res) => {
    const form = formidable({
        uploadDir: path.join(__dirname, '..', 'uploads'),
        keepExtensions: true,
        filename: (name, ext, part) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            return `${part.name}-${uniqueSuffix}${ext}`;
        },
    });

    try {
        const [, files] = await form.parse(req);
        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        coreLogMessage('Image upload complete: ' + file.newFilename);
        res.json({ filename: file.newFilename });
    } catch {
        return res.status(400).json({ error: 'No file uploaded' });
    }
});


module.exports = app;

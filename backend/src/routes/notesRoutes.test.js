import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoist fake repositories so they can be shared with Vitest's module setup.
const repositories = vi.hoisted(() => ({
    Note: {
        create: vi.fn(),
        save: vi.fn(),
        findOneBy: vi.fn(),
        findAndCountBy: vi.fn(),
        find: vi.fn(),
        remove: vi.fn(),
    },
    User: {
        findOneBy: vi.fn(),
    },
}));

// Mock route logging so tests focus on HTTP behavior.
vi.mock(
    '../utils/Logger',
    () => ({
        securityLogMessage: vi.fn(),
        notesLogMessage: vi.fn(),
    }),
    { virtual: true },
);

const AppDataSource = require('../database');
// Spy on repository lookup and route all database calls to the fake repositories.
vi.spyOn(AppDataSource, 'getRepository');
const app = require('../app');

beforeEach(() => {
    // Provide fresh repository behavior and a known JWT secret for each test.
    vi.spyOn(AppDataSource, 'getRepository').mockImplementation((name) => repositories[name]);
    process.env.JWT_SECRET = 'test-secret';
});

afterEach(() => {
    vi.clearAllMocks();
    delete process.env.JWT_SECRET;
});

describe('POST /api/notes/create', () => {
    it('rejects requests without a token', async () => {
        const response = await request(app).post('/api/notes/create').send({});

        expect(response.status).toBe(403);
    });

    it('rejects titles longer than 32 characters', async () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET);
        repositories.Note.create.mockImplementation((note) => note);

        const response = await request(app)
            .post('/api/notes/create')
            .set('Authorization', token)
            .send({ title: 'a'.repeat(33), content: 'content' });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Title exceeds');
    });

    it('creates a note for a valid token', async () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET);
        const note = {
            userId: '7',
            title: 'A note',
            content: 'Content',
            file: null,
            tags: '[{"text":"tag"}]',
            visibility: false,
        };
        repositories.Note.create.mockReturnValue(note);
        repositories.Note.save.mockResolvedValue({ id: 1, ...note });

        const response = await request(app)
            .post('/api/notes/create')
            .set('Authorization', token)
            .set('Authorization-Id', '7')
            .send({
                title: 'A note',
                content: 'Content',
                file: null,
                tags: [{ text: 'tag' }],
                visibility: false,
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Note created successfully!');
        expect(repositories.Note.save).toHaveBeenCalled();
    });
});

describe('POST /api/notes/delete', () => {
    it('rejects deleting another user’s note', async () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET);
        repositories.Note.findOneBy.mockResolvedValue({ id: 1, userId: 8 });

        const response = await request(app)
            .post('/api/notes/delete')
            .set('Authorization', token)
            .send({ noteId: 1, userId: 7 });

        expect(response.status).toBe(403);
        expect(repositories.Note.remove).not.toHaveBeenCalled();
    });

    it('deletes the user’s note', async () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET);
        const note = { id: 1, userId: 7 };
        repositories.Note.findOneBy.mockResolvedValue(note);

        const response = await request(app)
            .post('/api/notes/delete')
            .set('Authorization', token)
            .send({ noteId: 1, userId: 7 });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Note deleted.' });
        expect(repositories.Note.remove).toHaveBeenCalledWith(note);
    });
});

describe('GET /api/notes/get', () => {
    it('returns formatted notes for the authenticated user', async () => {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET);
        repositories.Note.findAndCountBy.mockResolvedValue([
            [
                {
                    id: 1,
                    title: 'Note',
                    content: 'Content',
                    visibility: false,
                    tags: 'plain',
                    file: null,
                },
            ],
            1,
        ]);

        const response = await request(app)
            .get('/api/notes/get')
            .set('Authorization', token)
            .set('Authorization-Id', '7');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            userId: '7',
            count: 1,
            notes: [
                {
                    id: 1,
                    title: 'Note',
                    content: 'Content',
                    visibility: false,
                    tags: [{ text: 'plain', color: '#570df8' }],
                    file: null,
                },
            ],
        });
    });
});

describe('GET /api/notes/public', () => {
    it('returns public notes and author names', async () => {
        repositories.Note.find.mockResolvedValue([
            {
                id: 1,
                title: 'Public note',
                content: 'Content',
                visibility: false,
                tags: '["tag"]',
                file: null,
                author: { username: 'author' },
            },
        ]);

        const response = await request(app).get('/api/notes/public');

        expect(response.status).toBe(200);
        expect(response.body.notes[0]).toMatchObject({
            id: 1,
            author: 'author',
            tags: ['tag'],
        });
        expect(repositories.Note.find).toHaveBeenCalledWith({
            where: { visibility: false },
            relations: ['author'],
            order: { id: 'DESC' },
        });
    });
});

describe('GET /api/notes/:id', () => {
    it('returns 404 for an unknown note', async () => {
        repositories.Note.findOneBy.mockResolvedValue(null);

        const response = await request(app).get('/api/notes/99');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Note not found.' });
    });

    it('rejects a private note without a token', async () => {
        repositories.Note.findOneBy.mockResolvedValue({ id: 1, userId: 7, visibility: true });

        const response = await request(app).get('/api/notes/1');

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('do not have access');
    });

    it('renders a public note', async () => {
        repositories.Note.findOneBy.mockResolvedValue({
            id: 1,
            userId: 7,
            title: 'Public note',
            content: 'Content',
            visibility: false,
            tags: '[]',
            file: null,
        });

        const response = await request(app).get('/api/notes/1');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Public note');
    }, 25000);
});

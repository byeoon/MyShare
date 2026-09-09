import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';

// Hoist shared mock data so Vitest can use it when it evaluates vi.mock calls.
const repositories = vi.hoisted(() => ({
    User: {
        findOneBy: vi.fn(),
        count: vi.fn(),
    },
    Note: {
        count: vi.fn(),
    },
}));

// Mock logging because these tests should not depend on logger implementation or output.
vi.mock(
    './utils/Logger',
    () => ({
        coreLogMessage: vi.fn(),
        securityLogMessage: vi.fn(),
        notesLogMessage: vi.fn(),
    }),
    { virtual: true },
);

const AppDataSource = require('./database');
// Spy on repository lookup so each test can provide its own fake repositories.
vi.spyOn(AppDataSource, 'getRepository');
const app = require('./app');
const uploadsDir = path.join(process.cwd(), 'uploads');

beforeAll(() => fs.mkdir(uploadsDir, { recursive: true }));

afterAll(async () => {
    const files = await fs.readdir(uploadsDir);
    await Promise.all(files.map((file) => fs.unlink(path.join(uploadsDir, file))));
    await fs.rmdir(uploadsDir);
});

beforeEach(() => {
    // Route database calls to the hoisted repository mocks.
    vi.spyOn(AppDataSource, 'getRepository').mockImplementation((name) => repositories[name]);
});

afterEach(() => {
    vi.clearAllMocks();
    delete process.env.JWT_SECRET;
});

describe('GET /api/stats', () => {
    it('returns the total users and notes', async () => {
        // Resolve async database calls with controlled test data.
        repositories.User.count.mockResolvedValue(4);
        repositories.Note.count.mockResolvedValue(12);

        const response = await request(app).get('/api/stats');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ totalUsers: 4, totalNotes: 12 });
    });
});

describe('GET /api/email', () => {
    it('rejects requests without a token', async () => {
        const response = await request(app).get('/api/email');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: 'You are not signed in.' });
    });

    describe('GET /api/version', () => {
        it('returns the short commit hash from GitHub', async () => {
            // Replace the external GitHub request with a predictable response.
            vi.stubGlobal(
                'fetch',
                vi.fn().mockResolvedValue({
                    json: async () => ({ sha: '123456789abcdef' }),
                }),
            );

            const response = await request(app).get('/api/version');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ commit: '1234567' });
        });

        it('returns dev when GitHub is unavailable', async () => {
            // Simulate a failed external request without using the network.
            vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failure')));

            const response = await request(app).get('/api/version');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ commit: 'dev' });
        });
    });

    describe('POST /api/upload', () => {
        it('rejects requests without a file', async () => {
            const response = await request(app).post('/api/upload');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'No file uploaded' });
        });

        it('stores an uploaded file and returns its generated filename', async () => {
            const response = await request(app)
                .post('/api/upload')
                .attach('file', Buffer.from('test image'), 'test.txt');

            expect(response.status).toBe(200);
            expect(response.body.filename).toMatch(/^file-\d+-\d+\.txt$/);
            await expect(
                fs.access(path.join(uploadsDir, response.body.filename)),
            ).resolves.toBeUndefined();
        });
    });

    it('returns the authenticated user profile', async () => {
        process.env.JWT_SECRET = 'test-secret';
        repositories.User.findOneBy.mockResolvedValue({
            id: 7,
            email: 'user@example.com',
            username: 'test-user',
        });

        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET);
        const response = await request(app).get('/api/email').set('Authorization', token);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            userId: 7,
            email: 'user@example.com',
            username: 'test-user',
        });
        expect(repositories.User.findOneBy).toHaveBeenCalledWith({
            email: 'user@example.com',
        });
    });
});

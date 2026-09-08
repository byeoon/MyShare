import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const repositories = vi.hoisted(() => ({
    User: {
        findOneBy: vi.fn(),
        count: vi.fn(),
    },
    Note: {
        count: vi.fn(),
    },
}));

vi.mock(
    './utils/Logger',
    () => ({
        coreLogMessage: vi.fn(),
        securityLogMessage: vi.fn(),
        notesLogMessage: vi.fn(),
    }),
    { virtual: true }
);

const AppDataSource = require('./database');
vi.spyOn(AppDataSource, 'getRepository');
const app = require('./app');

beforeEach(() => {
    vi.spyOn(AppDataSource, 'getRepository').mockImplementation((name) => repositories[name]);
});

afterEach(() => {
    vi.clearAllMocks();
    delete process.env.JWT_SECRET;
});

describe('GET /api/stats', () => {
    it('returns the total users and notes', async () => {
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

    it('returns the authenticated user profile', async () => {
        process.env.JWT_SECRET = 'test-secret';
        repositories.User.findOneBy.mockResolvedValue({
            id: 7,
            email: 'user@example.com',
            username: 'test-user',
        });

        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET);
        const response = await request(app)
            .get('/api/email')
            .set('Authorization', token);

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

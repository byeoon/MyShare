import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const repository = vi.hoisted(() => ({
    findOneBy: vi.fn(),
}));

vi.mock(
    '../utils/Logger',
    () => ({
        securityLogMessage: vi.fn(),
        notesLogMessage: vi.fn(),
    }),
    { virtual: true }
);

const AppDataSource = require('../database');
vi.spyOn(AppDataSource, 'getRepository');
const app = require('../app');

beforeEach(() => {
    vi.spyOn(AppDataSource, 'getRepository').mockReturnValue(repository);
});

afterEach(() => {
    vi.clearAllMocks();
    delete process.env.ALLOW_REGISTERING;
});

describe('POST /api/users/login', () => {
    it('rejects an unknown user', async () => {
        repository.findOneBy.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/users/login')
            .send({ email: 'missing@example.com', password: 'password' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid credentials' });
    });
});

describe('GET /api/getregistrationstatus', () => {
    it('reports when registration is disabled', async () => {
        process.env.ALLOW_REGISTERING = 'false';

        const response = await request(app).get('/api/getregistrationstatus');

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Registering is not allowed');
    });

    it('reports when registration is enabled', async () => {
        process.env.ALLOW_REGISTERING = 'true';

        const response = await request(app).get('/api/getregistrationstatus');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Registration is allowed.' });
    });
});

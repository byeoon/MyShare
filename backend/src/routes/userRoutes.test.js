import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoist the fake repository so it is available when Vitest evaluates module mocks.
const repository = vi.hoisted(() => ({
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
}));

// Mock logging to isolate route behavior from logger side effects.
vi.mock(
    '../utils/Logger',
    () => ({
        securityLogMessage: vi.fn(),
        notesLogMessage: vi.fn(),
    }),
    { virtual: true },
);

const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const mailer = { sendMail: vi.fn() };
// Spy on external services and replace their implementations with test doubles.
vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');
vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
vi.spyOn(nodemailer, 'createTransport').mockReturnValue(mailer);

const AppDataSource = require('../database');
// Spy on repository access so routes use the in-memory fake repository.
vi.spyOn(AppDataSource, 'getRepository');
const app = require('../app');

beforeEach(() => {
    // Reset the service behavior to safe defaults before each test.
    vi.spyOn(AppDataSource, 'getRepository').mockReturnValue(repository);
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
});

afterEach(() => {
    vi.clearAllMocks();
    delete process.env.ALLOW_REGISTERING;
    delete process.env.EMAIL_NAME;
    delete process.env.EMAIL_PASSWORD;
    delete process.env.JWT_SECRET;
});

describe('POST /api/users/login', () => {
    it('rejects an unknown user', async () => {
        // Control the async lookup result instead of querying the database.
        repository.findOneBy.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/users/login')
            .send({ email: 'missing@example.com', password: 'password' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('rejects an incorrect password', async () => {
        repository.findOneBy.mockResolvedValue({ email: 'user@example.com', password: 'hash' });
        // Make the password check fail for this test only.
        bcrypt.compare.mockResolvedValue(false);

        const response = await request(app)
            .post('/api/users/login')
            .send({ email: 'user@example.com', password: 'wrong' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid password' });
    });

    it('returns a token for valid credentials', async () => {
        process.env.JWT_SECRET = 'test-secret';
        repository.findOneBy.mockResolvedValue({
            email: 'user@example.com',
            password: 'hash',
        });

        const response = await request(app)
            .post('/api/users/login')
            .send({ email: 'user@example.com', password: 'correct' });

        expect(response.status).toBe(200);
        expect(response.body.token).toEqual(expect.any(String));
    });
});

describe('POST /api/users', () => {
    it('rejects registration when disabled', async () => {
        process.env.ALLOW_REGISTERING = 'false';

        const response = await request(app).post('/api/users').send({
            username: 'new-user',
            email: 'new@example.com',
            password: 'password',
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Registering is not allowed');
    });

    it('rejects an existing user', async () => {
        repository.findOneBy.mockResolvedValue({ id: 1 });

        const response = await request(app).post('/api/users').send({
            username: 'existing-user',
            email: 'existing@example.com',
            password: 'password',
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'User already exists!' });
    });

    it('creates a user and returns a token', async () => {
        repository.findOneBy.mockResolvedValue(null);
        // Keep the created entity visible to the route without TypeORM.
        repository.create.mockImplementation((user) => user);
        repository.save.mockResolvedValue({ id: 2, username: 'new-user' });

        const response = await request(app).post('/api/users').send({
            username: 'new-user',
            email: 'new@example.com',
            password: 'password',
        });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User created.');
        expect(response.body.token).toEqual(expect.any(String));
        expect(repository.create).toHaveBeenCalledWith({
            username: 'new-user',
            email: 'new@example.com',
            password: expect.any(String),
        });
    });
});

describe('POST /api/users/accountrecovery', () => {
    it('rejects an unknown email', async () => {
        repository.findOneBy.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/users/sendrecoveryemail')
            .send({ email: 'missing@example.com' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'This email has not been registered.' });
    });

    it("generates a recovery link when sender email isn't configured", async () => {
        repository.findOneBy.mockResolvedValue({ email: 'user@example.com' });
        delete process.env.EMAIL_NAME;
        delete process.env.EMAIL_PASSWORD;

        const response = await request(app)
            .post('/api/users/sendrecoveryemail')
            .send({ email: 'user@example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Your recovery link has been sent to the corresponding email.'
        });
    });

    it('sends a recovery email when sender email is configured', async () => {
        process.env.EMAIL_NAME = 'sender@example.com';
        process.env.EMAIL_PASSWORD = 'password';
        repository.findOneBy.mockResolvedValue({ email: 'user@example.com' });
        // Invoke the callback as a successful fake SMTP delivery.
        mailer.sendMail.mockImplementation((mail, callback) => callback(null, {}));

        const response = await request(app)
            .post('/api/users/sendrecoveryemail')
            .send({ email: 'user@example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Recovery email sent.' });
        expect(mailer.sendMail).toHaveBeenCalled();
    });
});

describe('POST /api/users/resetpassword', () => {
    it('requires a token and new password', async () => {
        const response = await request(app)
            .post('/api/users/resetpassword')
            .send({ token: '', newPassword: '' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Token and new password are required.' });
    });

    it('rejects an invalid token', async () => {
        const response = await request(app)
            .post('/api/users/resetpassword')
            .send({ token: 'invalid', newPassword: 'new-password' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid or expired token.' });
    });

    it('resets the password for a valid token', async () => {
        process.env.JWT_SECRET = 'test-secret';
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET);
        const user = { email: 'user@example.com', password: 'old-password' };
        repository.findOneBy.mockResolvedValue(user);
        repository.save.mockResolvedValue(user);

        const response = await request(app)
            .post('/api/users/resetpassword')
            .send({ token, newPassword: 'new-password' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Password has been successfully reset.' });
        expect(repository.save).toHaveBeenCalledWith(user);
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

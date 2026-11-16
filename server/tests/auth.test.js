const request = require('supertest');
const { app } = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

describe('Authentication API Endpoints', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
          bio: 'Hello world',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.username).toBe('johndoe');
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject registration if email is already registered', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'firstuser',
        email: 'same@example.com',
        password: 'password123',
      });

      const res = await request(app).post('/api/auth/register').send({
        username: 'seconduser',
        email: 'same@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it('should reject registration if username is already taken', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'duplicateuser',
        email: 'user1@example.com',
        password: 'password123',
      });

      const res = await request(app).post('/api/auth/register').send({
        username: 'duplicateuser',
        email: 'user2@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already taken/i);
    });

    it('should reject registration with invalid password length', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'shortpass',
        email: 'short@example.com',
        password: '123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        username: 'validuser',
        email: 'valid@example.com',
        password: 'password123',
      });
    });

    it('should login successfully with valid credentials and return token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        loginIdentifier: 'valid@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.username).toBe('validuser');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        loginIdentifier: 'valid@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return profile for authenticated user with valid token', async () => {
      const regRes = await request(app).post('/api/auth/register').send({
        username: 'profileuser',
        email: 'profile@example.com',
        password: 'password123',
      });

      const token = regRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('profileuser');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject request without token with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password & reset-password', () => {
    it('should handle forgot password and return generic success response', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'resetuser',
        email: 'reset@example.com',
        password: 'oldpassword123',
      });

      const forgotRes = await request(app).post('/api/auth/forgot-password').send({
        email: 'reset@example.com',
      });

      expect(forgotRes.statusCode).toBe(200);
      expect(forgotRes.body.success).toBe(true);
      expect(forgotRes.body.message).toMatch(/an account with that email exists/i);

      // Verify token set on user
      const user = await User.findOne({ email: 'reset@example.com' }).select(
        '+resetPasswordToken +resetPasswordExpires'
      );
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpires).toBeDefined();
    });

    it('should reset password with valid token and allow subsequent login', async () => {
      const crypto = require('crypto');
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

      await User.create({
        username: 'directreset',
        email: 'direct@example.com',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        resetPasswordToken: hashed,
        resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
      });

      const resetRes = await request(app)
        .post(`/api/auth/reset-password/${rawToken}`)
        .send({ password: 'newbrandpassword123' });

      expect(resetRes.statusCode).toBe(200);
      expect(resetRes.body.success).toBe(true);
      expect(resetRes.body.message).toMatch(/successfully/i);

      // Verify token cleared
      const updated = await User.findOne({ email: 'direct@example.com' });
      expect(updated.resetPasswordToken).toBeUndefined();

      // Test login with new password
      const loginRes = await request(app).post('/api/auth/login').send({
        loginIdentifier: 'direct@example.com',
        password: 'newbrandpassword123',
      });
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });

    it('should reject reset password with expired or invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password/invalidtoken123456789')
        .send({ password: 'somepassword123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid or expired/i);
    });
  });
});

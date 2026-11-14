const request = require('supertest');
const { app } = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

describe('Posts & Interactions API Endpoints', () => {
  let userToken1;
  let userToken2;
  let userId1;
  let userId2;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
    ]);

    // Create user 1
    const u1 = await request(app).post('/api/auth/register').send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
    });
    userToken1 = u1.body.data.token;
    userId1 = u1.body.data.user._id;

    // Create user 2
    const u2 = await request(app).post('/api/auth/register').send({
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
    });
    userToken2 = u2.body.data.token;
    userId2 = u2.body.data.user._id;
  });

  describe('POST /api/posts', () => {
    it('should create a post successfully with valid text', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken1}`)
        .send({ text: 'My first post on ConnectSphere!' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toBe('My first post on ConnectSphere!');
      expect(res.body.data.author.username).toBe('alice');
    });

    it('should reject post creation without text', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken1}`)
        .send({ text: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/posts/:id (Edit Post)', () => {
    it('should allow owner to update post text', async () => {
      const post = await Post.create({
        author: userId1,
        text: 'Original post',
      });

      const res = await request(app)
        .put(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${userToken1}`)
        .send({ text: 'Updated post content' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toBe('Updated post content');
    });

    it('should reject non-owner trying to update post with 403', async () => {
      const post = await Post.create({
        author: userId1,
        text: 'Original post',
      });

      const res = await request(app)
        .put(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${userToken2}`)
        .send({ text: 'Malicious update' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/posts/:id/like', () => {
    it('should toggle like on a post', async () => {
      const post = await Post.create({
        author: userId1,
        text: 'Like me!',
      });

      // Like
      const likeRes = await request(app)
        .put(`/api/posts/${post._id}/like`)
        .set('Authorization', `Bearer ${userToken2}`);

      expect(likeRes.statusCode).toBe(200);
      expect(likeRes.body.data.isLiked).toBe(true);
      expect(likeRes.body.data.likesCount).toBe(1);

      // Unlike
      const unlikeRes = await request(app)
        .put(`/api/posts/${post._id}/like`)
        .set('Authorization', `Bearer ${userToken2}`);

      expect(unlikeRes.statusCode).toBe(200);
      expect(unlikeRes.body.data.isLiked).toBe(false);
      expect(unlikeRes.body.data.likesCount).toBe(0);
    });
  });

  describe('Comments API', () => {
    it('should add a comment and increment commentsCount on post', async () => {
      const post = await Post.create({
        author: userId1,
        text: 'Discuss this post',
      });

      const res = await request(app)
        .post(`/api/posts/${post._id}/comments`)
        .set('Authorization', `Bearer ${userToken2}`)
        .send({ text: 'Insightful discussion!' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toBe('Insightful discussion!');
      expect(res.body.data.author.username).toBe('bob');

      const updatedPost = await Post.findById(post._id);
      expect(updatedPost.commentsCount).toBe(1);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should allow owner to delete post', async () => {
      const post = await Post.create({
        author: userId1,
        text: 'To be deleted',
      });

      const res = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${userToken1}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Post.findById(post._id);
      expect(check).toBeNull();
    });

    it('should prevent non-owner from deleting post with 403', async () => {
      const post = await Post.create({
        author: userId1,
        text: 'Safe post',
      });

      const res = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${userToken2}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});

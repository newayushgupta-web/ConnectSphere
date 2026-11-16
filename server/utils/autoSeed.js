const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    console.log('🌱 Database is empty. Auto-seeding 5 demo accounts and sample posts...');

    const demoUsers = [
      {
        username: 'alex_tech',
        email: 'alex@example.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        cover: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
        location: 'San Francisco, CA',
        website: 'https://alexrivera.dev',
        bio: 'Full Stack Engineer & Open-Source tinkerer. Building modern web platforms and distributed microservices. 🚀',
      },
      {
        username: 'maya_designer',
        email: 'maya@example.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        location: 'New York, NY',
        website: 'https://mayadesign.co',
        bio: 'Product Designer & Design Systems enthusiast. Obsessed with micro-interactions, typography, and clean UI.',
      },
      {
        username: 'dev_sam',
        email: 'sam@example.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        location: 'London, UK',
        website: 'https://sampatel.cloud',
        bio: 'Backend & Cloud Developer. Exploring Node.js streams, Redis architectures, and GraphQL APIs. ☕',
      },
      {
        username: 'elena_photo',
        email: 'elena@example.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        cover: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
        location: 'Tokyo, Japan',
        website: 'https://elenaphoto.art',
        bio: 'Visual Storyteller & Street Photographer. Capturing moments, shadows, and urban reflections.',
      },
      {
        username: 'jordan_ai',
        email: 'jordan@example.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        location: 'Seattle, WA',
        website: 'https://jordank.ai',
        bio: 'AI/ML Researcher working on LLM agents and multi-modal generative networks. Lifelong learner.',
      },
    ];

    const createdUsers = [];
    for (const u of demoUsers) {
      const passwordHash = await User.hashPassword(u.password);
      const user = await User.create({
        username: u.username,
        email: u.email,
        passwordHash,
        avatar: u.avatar,
        cover: u.cover,
        location: u.location,
        website: u.website,
        bio: u.bio,
      });
      createdUsers.push(user);
    }

    const [alex, maya, sam, elena, jordan] = createdUsers;

    // Follow relationships
    alex.following.push(maya._id, sam._id, jordan._id);
    maya.followers.push(alex._id);
    sam.followers.push(alex._id);
    jordan.followers.push(alex._id);

    maya.following.push(alex._id, elena._id);
    alex.followers.push(maya._id);
    elena.followers.push(maya._id);

    sam.following.push(alex._id, maya._id);
    alex.followers.push(sam._id);
    maya.followers.push(sam._id);

    elena.following.push(alex._id, maya._id, jordan._id);
    alex.followers.push(elena._id);
    maya.followers.push(elena._id);
    jordan.followers.push(elena._id);

    await Promise.all(createdUsers.map((u) => u.save()));

    const postsData = [
      {
        author: alex._id,
        text: '🚀 Welcome to ConnectSphere! Just shipped the full-stack architecture with React, Express, MongoDB, and real-time Socket.io notifications. What do you think of the new design? #React #FullStack #WebDev',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
        likes: [maya._id, sam._id, elena._id],
        commentsCount: 2,
      },
      {
        author: maya._id,
        text: '✨ Exploring minimalist card interfaces with soft shadows and dark mode palette. Consistency across mobile and desktop creates a seamless user experience. #UI #Design #DesignSystems',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
        likes: [alex._id, sam._id],
        commentsCount: 1,
      },
      {
        author: elena._id,
        text: 'Golden hour lights hitting the city streets. Taking time to notice the details around us makes all the difference. #Photography #GoldenHour #Urban',
        image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1000&q=80',
        likes: [alex._id, maya._id, jordan._id],
        commentsCount: 1,
      },
      {
        author: sam._id,
        text: 'Optimizing MongoDB aggregation queries for user feeds. Indexing createdAt and author arrays cuts query latency by over 70% under load. Benchmark numbers coming soon! #MongoDB #Backend #NodeJS',
        image: null,
        likes: [alex._id],
        commentsCount: 1,
      },
      {
        author: jordan._id,
        text: 'Multi-agent coordination is evolving rapidly. Excited to see collaborative autonomous agents building full-stack software side-by-side. #AI #MachineLearning #Tech',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
        likes: [alex._id, sam._id, elena._id],
        commentsCount: 0,
      },
    ];

    const createdPosts = [];
    for (const p of postsData) {
      const created = await Post.create(p);
      createdPosts.push(created);
    }

    // Add bookmarks
    alex.bookmarks.push(createdPosts[1]._id, createdPosts[4]._id);
    await alex.save();

    maya.bookmarks.push(createdPosts[0]._id);
    await maya.save();

    const commentsData = [
      {
        post: createdPosts[0]._id,
        author: maya._id,
        text: 'The UI is super clean! Love the dark mode and responsive layout.',
      },
      {
        post: createdPosts[0]._id,
        author: sam._id,
        text: 'Great work Alex! Looking forward to testing the real-time notifications.',
      },
      {
        post: createdPosts[1]._id,
        author: alex._id,
        text: 'Love the color hierarchy and spacing Maya, spot on!',
      },
      {
        post: createdPosts[2]._id,
        author: maya._id,
        text: 'Breathtaking capture Elena! Which lens did you use?',
      },
      {
        post: createdPosts[3]._id,
        author: alex._id,
        text: 'Indexes make all the difference, especially on high-concurrency feeds!',
      },
    ];

    await Comment.insertMany(commentsData);

    const notificationsData = [
      {
        recipient: alex._id,
        sender: maya._id,
        type: 'like',
        post: createdPosts[0]._id,
        isRead: false,
      },
      {
        recipient: alex._id,
        sender: maya._id,
        type: 'comment',
        post: createdPosts[0]._id,
        isRead: false,
      },
      {
        recipient: alex._id,
        sender: elena._id,
        type: 'follow',
        isRead: false,
      },
      {
        recipient: alex._id,
        sender: sam._id,
        type: 'like',
        post: createdPosts[0]._id,
        isRead: true,
      },
    ];

    await Notification.insertMany(notificationsData);

    console.log('✅ Auto-seeded ConnectSphere sample database successfully!');
  } catch (err) {
    console.error('⚠️ Auto-seed error (non-fatal):', err.message);
  }
};

module.exports = autoSeedIfEmpty;

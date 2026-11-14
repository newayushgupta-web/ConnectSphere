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
        bio: 'Full Stack Engineer & Open-Source tinkerer. Building modern web platforms and distributed microservices. 🚀',
      },
      {
        username: 'maya_designer',
        email: 'maya@example.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        bio: 'Product Designer & Design Systems enthusiast. Obsessed with micro-interactions, typography, and clean UI.',
      },
      {
        username: 'dev_sam',
        email: 'sam@example.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        bio: 'Backend & Cloud Developer. Exploring Node.js streams, Redis architectures, and GraphQL APIs. ☕',
      },
      {
        username: 'elena_photo',
        email: 'elena@example.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        bio: 'Visual Storyteller & Street Photographer. Capturing moments, shadows, and urban reflections.',
      },
      {
        username: 'jordan_ai',
        email: 'jordan@example.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
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
        bio: u.bio,
      });
      createdUsers.push(user);
    }

    const [alex, maya, sam, elena, jordan] = createdUsers;

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
        text: '🚀 Welcome to ConnectSphere! Just shipped the full-stack architecture with React, Express, MongoDB, and real-time Socket.io notifications. What do you think of the new design?',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
        likes: [maya._id, sam._id, elena._id],
        commentsCount: 2,
      },
      {
        author: maya._id,
        text: '✨ Exploring minimalist card interfaces with soft shadows and dark mode palette. Consistency across mobile and desktop creates a seamless user experience.',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
        likes: [alex._id, sam._id],
        commentsCount: 1,
      },
      {
        author: elena._id,
        text: 'Golden hour lights hitting the city streets. Taking time to notice the details around us makes all the difference.',
        image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1000&q=80',
        likes: [alex._id, maya._id, jordan._id],
        commentsCount: 1,
      },
      {
        author: sam._id,
        text: 'Optimizing MongoDB aggregation queries for user feeds. Indexing createdAt and author arrays cuts query latency by over 70% under load. Benchmark numbers coming soon!',
        image: null,
        likes: [alex._id],
        commentsCount: 1,
      },
      {
        author: jordan._id,
        text: 'Multi-agent coordination is evolving rapidly. Excited to see collaborative autonomous agents building full-stack software side-by-side.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
        likes: [alex._id, sam._id, elena._id],
        commentsCount: 0,
      },
    ];

    const createdPosts = await Post.insertMany(postsData);

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
        author: jordan._id,
        text: 'Incredible shot Elena, the lighting is breathtaking.',
      },
      {
        post: createdPosts[3]._id,
        author: alex._id,
        text: 'Would love to read that benchmark write-up Sam!',
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
        sender: sam._id,
        type: 'comment',
        post: createdPosts[0]._id,
        isRead: true,
      },
      {
        recipient: alex._id,
        sender: elena._id,
        type: 'follow',
        isRead: false,
      },
    ];

    await Notification.insertMany(notificationsData);

    console.log('✨ Auto-seed complete. 5 demo accounts ready for evaluation!');
  } catch (err) {
    console.error('Auto-seed warning:', err.message);
  }
};

module.exports = autoSeedIfEmpty;

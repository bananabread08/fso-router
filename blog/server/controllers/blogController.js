const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const Comment = require('../models/comment');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
  const { title, author, url, likes } = request.body;
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response
      .status(401)
      .json({ error: 'Unauthorized. Invalid token or user does not exists.' });
  }
  if (!title || !author) {
    return response.status(400).json({ error: 'Missing title or author.' });
  }
  const user = await User.findById(decodedToken.id);
  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: user, //user._id originally
    comments: [],
  });
  const result = await blog.save();
  user.blogs = user.blogs.concat(result._id);
  await user.save();
  response.status(201).json(result);
});

blogRouter.delete('/:id', async (request, response) => {
  const id = request.params.id;
  const blog = await Blog.findById(id).populate('user');
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'Unauthorized. Invalid token.',
    });
  }
  if (blog.user._id.toString() !== decodedToken.id) {
    return response.status(401).json({
      error: 'Unauthorized. Blog User and Current User do not match',
    });
  }
  await Blog.findByIdAndDelete(id);
  response.status(204).end();
});

blogRouter.put('/:id', async (request, response) => {
  const id = request.params.id;
  const { title, author, url, likes } = request.body;
  //const blog = await Blog.findById(id).populate('user');
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'Unauthorized. Invalid token.',
    });
  }
  // if (blog.user._id.toString() !== decodedToken.id) {
  //   return response.status(401).json({
  //     error: 'Unauthorized. Blog User and Current User do not match',
  //   });
  // }

  const update = {
    title,
    author,
    url,
    likes: likes || 0,
  };

  await Blog.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
    context: 'query',
  });
  response.status(202).end();
});

blogRouter.post('/:id/comments', async (request, response) => {
  const id = request.params.id;
  const { comment } = request.body;
  if (!comment) {
    return response.status(400).json({ error: 'Missing comment.' });
  }
  const blog = await Blog.findById(id);
  const newComment = new Comment({
    content: comment,
  });
  const saved = await newComment.save();
  blog.comments = blog.comments.concat(saved._id);
  await blog.save();
  response.status(201).json(saved);
});

blogRouter.get('/:id/comments', async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  const commentArray = blog.comments;
  const comments = await Comment.find().where('_id').in(commentArray);
  response.status(201).json(comments);
});

module.exports = blogRouter;

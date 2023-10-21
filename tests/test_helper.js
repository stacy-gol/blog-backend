const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'Blog1',
    author: 'Autor1',
    url: 'wikipedia',
    likes: 1,
  },
  {
    title: 'Blog2',
    author: 'Autor2',
    url: 'wikipedia',
    likes: 4,
  },
];

const getNonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const getAllBlogsFromDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = {
  getNonExistingId,
  initialBlogs,
  getAllBlogsFromDb,
};

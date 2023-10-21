const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);

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

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('all notes are returned', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body).toHaveLength(initialBlogs.length);
});

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/blogs');
  const contents = response.body.map((r) => r.author);
  expect(contents).toContain('Autor1');
});

test('blogs have id', async () => {
  const response = await api.get('/api/blogs');
  const { id } = response.body[0];
  expect(id).toBeDefined();
});

test('create new blog', async () => {
  const testBlogData = {
    title: 'testTitle',
    author: 'testAutor',
    url: 'test',
    likes: 0,
  };
  await api.post('/api/blogs').send(testBlogData);

  const response = await api.get('/api/blogs');
  const contents = response.body.map((r) => r.author);
  expect(contents).toContain('testAutor');
});

test('likes default value', async () => {
  const testBlogData = {
    title: 'testTitle',
    author: 'testAutor',
    url: 'test',
  };
  await api.post('/api/blogs').send(testBlogData);
  const response = await api.get('/api/blogs');
  const { likes } = response.body.find(({ title }) => title === 'testTitle');
  expect(likes).toEqual(0);
});

test('400 response', async () => {
  const testBlogData = {
    title: 'testTitle',
    author: 'testAutor',
  };
  await api.post('/api/blogs').send(testBlogData).expect(400);
  // const response = await api.get('/api/blogs');
  // const { likes } = response.body.find(({ title }) => title === 'testTitle');
  // expect(likes).toEqual(0);
});

afterAll(async () => {
  await mongoose.connection.close();
});

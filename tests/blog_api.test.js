const mongoose = require('mongoose');
const helper = require('./test_helper')
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);

const Blog = require('../models/blog');

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(helper.initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(helper.initialBlogs[1]);
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
  expect(response.body).toHaveLength(helper.initialBlogs.length);
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
});

describe('deleting by id', () => {
  test('delete existing blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const contents = blogsAtEnd.map(r => r.title)

    expect(contents).not.toContain(blogToDelete.title)
  })
  test('attempt to delete inexisting blogs', async () => {
    const nonExistingId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${nonExistingId}`)
      .expect(404)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deleting by id', () => {
  test('updating existing blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const newBlogInfo = {
      title: 'Blog1',
      author: 'Autor1',
      url: 'wikipedia',
      likes: 100,
    }
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlogInfo)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd.find(b => b.id === blogToUpdate.id)

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    expect(updatedBlog.title).toEqual(newBlogInfo.title)
  })
  test('attempt to update inexisting blogs', async () => {
    const nonExistingId = await helper.nonExistingId()

    await api
      .put(`/api/blogs/${nonExistingId}`)
      .expect(404)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})
afterAll(async () => {
  await mongoose.connection.close();
});

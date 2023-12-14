const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const {
  initialBlogs,
  getAllBlogsFromDb,
  getNonExistingId,
  getAllUsersFromDb,
} = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all notes are returned", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(initialBlogs.length);
});

test("a specific note is within the returned notes", async () => {
  const response = await api.get("/api/blogs");
  const contents = response.body.map((r) => r.author);
  expect(contents).toContain("Autor1");
});

test("blogs have id", async () => {
  const response = await api.get("/api/blogs");
  const { id } = response.body[0];
  expect(id).toBeDefined();
});

test("create new blog", async () => {
  const testBlogData = {
    title: "testTitle",
    author: "testAutor",
    url: "test",
    likes: 0,
  };
  await api.post("/api/blogs").send(testBlogData);

  const response = await api.get("/api/blogs");
  const contents = response.body.map((r) => r.author);
  expect(contents).toContain("testAutor");
});

test("likes default value", async () => {
  const testBlogData = {
    title: "testTitle",
    author: "testAutor",
    url: "test",
  };
  await api.post("/api/blogs").send(testBlogData);
  const response = await api.get("/api/blogs");
  const { likes } = response.body.find(({ title }) => title === "testTitle");
  expect(likes).toEqual(0);
});

test("400 response", async () => {
  const testBlogData = {
    title: "testTitle",
    author: "testAutor",
  };
  await api.post("/api/blogs").send(testBlogData).expect(400);
});

describe("deleting by id", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

    test("delete existing blog", async () => {
      const blogsAtStart = await getAllBlogsFromDb();
      const blogToDelete = blogsAtStart[0];

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

      const blogsAtEnd = await getAllBlogsFromDb();

      expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1);

      const contents = blogsAtEnd.map((r) => r.title);

      expect(contents).not.toContain(blogToDelete.title);
    });
    test("attempt to delete inexisting blogs", async () => {
      const nonExistingId = await getNonExistingId();
      await api.delete(`/api/blogs/${nonExistingId}`).expect(404);

      const blogsAtEnd = await getAllBlogsFromDb();

      expect(blogsAtEnd).toHaveLength(initialBlogs.length);
    });
  });


describe("updating by id", () => {
  test("updating existing blog", async () => {
    const blogsAtStart = await getAllBlogsFromDb();
    const blogToUpdate = blogsAtStart[0];

    const newBlogInfo = {
      title: "Blog1",
      author: "Autor1",
      url: "wikipedia",
      likes: 100,
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlogInfo)
      .expect(200);

    const blogsAtEnd = await getAllBlogsFromDb();
    const updatedBlog = blogsAtEnd.find((b) => b.id === blogToUpdate.id);

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
    expect(updatedBlog.title).toEqual(newBlogInfo.title);
  });
  test("attempt to update inexisting blogs", async () => {
    const nonExistingId = await getNonExistingId();
    await api.put(`/api/blogs/${nonExistingId}`).expect(404);

    const blogsAtEnd = await getAllBlogsFromDb();

    expect(blogsAtEnd).toHaveLength(initialBlogs.length);
  });
});

describe("check that invalid users are not created", () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salainen', 10)
    const defaultUser = new User({ username: 'root', passwordHash })

    await defaultUser.save()
  })
  test("user without username cannot be created", async () => {
    const newUser = {
      password: "password",
      name: "Test User",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);

    expect(result.body.error).toContain("Username and password are required.");

    const usersAtEnd = await getAllUsersFromDb;
    expect(usersAtEnd).toHaveLength(0);
  });

  test("user without password cannot be created", async () => {
    const usersAtStart = await getAllUsersFromDb();
    const newUser = {
      username: "testuser",
      name: "Test User",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);

    expect(result.body.error).toContain("Username and password are required.");

    const usersAtEnd = await getAllUsersFromDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await getAllUsersFromDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("Username is already taken");

    const usersAtEnd = await getAllUsersFromDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

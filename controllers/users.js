const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  if (!password || !username) {
    return response.status(400).json({
      error: "Username and password are required.",
    });
  }

  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error: "Username and password should be minimum of 3 characters."
    });
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return response.status(400).json({
      error: "Username is already taken.",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({});
  response.json(users);
});

module.exports = usersRouter;

const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;
  return next();
}

function checksCreateTodosUserAvailability(request, respone, next) {
  const { user } = request;

  if (user.todo.length === 9 && user.pro === false) {
    return response
      .status(406)
      .json({ unauthorized: "Free plan has limit to 10 todos" });
  }

  return next();
}

app.post("/user", (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  users.push({
    name,
    username,
    id: uuidv4(),
    pro: false,
    todo: [],
  });

  return response.status(201).send();
});

app.post(
  "/todo",
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  (request, response) => {
    const { title, description } = request.body;
    const { user } = request;

    user.todo.push({
      title,
      description,
      done: false,
      id: uuidv4(),
    });

    return response.status(201).send();
  }
);

app.listen(3333);

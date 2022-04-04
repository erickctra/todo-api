const express = require("express");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");

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

function checksCreateTodosUserAvailability(request, response, next) {
  const { user } = request;

  if (user.todo.length === 9 && user.pro === false) {
    return response
      .status(406)
      .json({ unauthorized: "Free plan has limit to 10 todos" });
  }

  return next();
}

function checksTodoExists(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;
  const { user } = request;

  const exitsTodo = user.todo.filter((todo) => todo.id === id);
  if (!validator.isUUID(id) && !exitsTodo) {
    return response.status(400).json({ error: "UUID not valid or not exist" });
  }
  request.todo = exitsTodo;
  return next();
}

function findUserById(request, response, next) {
  const { id } = request.params;

  const existUser = users.filter((user) => user.id === id);
  if (!validator.isUUID(id) && !existUser) {
    return response.status(400).json({ error: "UUID not valid or not exist" });
  }
  request.user = existUser;
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

app.get("/todo", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const list = user.todo;

  return response.status(200).json(list);
});

app.get(
  "/todo/:id",
  checksExistsUserAccount,
  checksTodoExists,
  (request, response) => {
    const { todo } = request;

    return response.status(200).json(todo);
  }
);

app.get("/user/:id", findUserById, (request, response) => {
  const { user } = request;

  return response.status(200).json(user);
});

app.get("/user", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user);
});

app.listen(3333);

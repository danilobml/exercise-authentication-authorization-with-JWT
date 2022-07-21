const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../database/client");
const bcrypt = require("bcrypt");
const authorizeUser = require("../middlewares/authorizeUser");

router.get("/login", function (req, res, next) {
  const loginForms = `<h1>Login to your account</h1><br>
  <form action="http://localhost:3000/jwt/connect" method="post">
  <label for="username">username:</label>
  <input type="text" id="username" name="username"><br><br>
  <label for="password">password:</label>
  <input type="password" id="password" name="password"><br><br>
  <input type="submit" value="Submit">
</form>`;
  res.send(loginForms);
});

router.post("/connect", async function (req, res, next) {
  const { username, password } = req.body;
  const key = process.env.SECRET_KEY;

  const jwtForm = `<h1>Check your JWT</h1><br>
  <form action="http://localhost:3000/jwt/checkJWT" method="POST">
    <label for="token">token:</label>
    <input type="text" id="token" name="token"><br><br>
    <input type="submit" value="Submit">
  </form>`;

  try {
    const getUser = {
      text: `SELECT * 
              FROM users
              WHERE name = $1`,
      values: [username],
    };
    const data = await db.query(getUser);
    const dbPassword = data.rows[0].password;
    const comparedPassword = await bcrypt.compare(password, dbPassword);
    // exercise 1: if (username === "john" && password === "doe") {
    if (comparedPassword) {
      const payload = { name: password };
      const token = jwt.sign(payload, key, { expiresIn: "1h" });
      res.set("x-authorization-token", token).send(jwtForm);
    } else {
      res.redirect("http://localhost:3000/jwt/login");
    }
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

router.post("/checkJWT", function (req, res, next) {
  const { token } = req.body;
  const payload = jwt.verify(token, process.env.SECRET_KEY);
  if (payload) {
    res.redirect("http://localhost:3000/jwt/admin");
  } else {
    res.redirect("http://localhost:3000/jwt/login");
  }
});

router.get("/admin", function (req, res, next) {
  res.send("<h1>Welcome to the admin page</h1>");
});

router.get("/restricted", authorizeUser, function (req, res, next) {
  res.send("Welcome to the restricted area!");
});

module.exports = router;

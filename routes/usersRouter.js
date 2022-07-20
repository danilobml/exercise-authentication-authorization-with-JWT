var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
const db = require("../database/client");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const { name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const createOneUser = {
      text: `INSERT INTO users
                      (name, password)
                      VALUES ($1, $2)
                      RETURNING *`,
      values: [name, hashedPassword],
    };
    const data = await db.query(createOneUser);
    res.sendStatus(201).json(data.rows);
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

module.exports = router;

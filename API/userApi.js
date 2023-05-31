const express = require("express");
const user = express.Router();
const bcrypt = require("bcryptjs");
const db = require("./dbconnector");

user.use(express.json());

user.get("/test", async (request, response) => {
  db.query("select * from users", async (err, result) => {
    if (err) {
      response.send(err);
    } else {
      response.send(result);
    }
  });
});

user.post("/login", async (request, response) => {
  const { username, password } = request.body;

  db.query(
    "select * from users where BINARY username=?",
    username,
    async (err, result) => {
      try {
        if (!result[0]) {
          response.status(401).send({ message: "Invalid Username !!" });
        } else {
          const isPasswordValid = await bcrypt.compare(
            password,
            result[0].password
          );
          if (!isPasswordValid) {
            response.status(401).send({ message: "Invalid Password" });
          } else {
            response.send("success");
          }
        }
      } catch (err) {
        response.status(500).send({ message: "Error Logging in !!", err });
      }
    }
  );
});

user.post("/register", async (request, response) => {
  let details = request.body;

  db.query(
    "select * from users where BINARY username=?",
    details.username,
    async (err, result) => {
      if (err) {
        response
          .status(500)
          .send({ message: "Something went wrong, Please try again !!", err });
      }
      if (result[0]) {
        response.status(401).send("User already exists !!");
      } else {
        let password = await bcrypt.hash(details.password, 6);
        details.password = password;
        db.query("insert into users SET ?", details, (err, result) => {
          if (err) {
            response.status(500).send({
              message: "Something went wrong, Please try again !!",
              err,
            });
          } else {
            response.send("Registered successfully !!");
          }
        });
      }
    }
  );
});

module.exports = user;

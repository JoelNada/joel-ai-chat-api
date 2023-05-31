const express = require("express");
const cors = require("cors");
const { openApi } = require("./apiHandling/apicall");
const db = require("./API/dbconnector");
const user = require("./API/userApi");
const chalk = require("chalk");
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/user", user);
require("dotenv").config();
const port = process.env.port || 5000;

db.connect((err) => {
  if (err) {
    console.log("Database Connection failed !!");
  } else {
    console.log("Connected to Database..");
  }
});

app.post("/completions", (req, res) => {
  const { message } = req.body;

  const body = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    max_tokens: 100,
  });

  openApi(body)
    .then((response) => {
      res.send({ reply: response.data.choices[0].message.content });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(port, () => {
  console.log(`Server started and running at port ${port}`);
});

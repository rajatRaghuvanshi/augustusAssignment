const express = require("express");
const cors = require("cors");
const parser = require("body-parser");

const Tasks = require('./Tasks');

const tasks = new Tasks();

const app = express();
app.use(cors())
app.use(parser.json())

app.get("/tasks", (req, res) => {
    tasks.get(req, res);
}) 

app.post("/task", (req, res) => {
    tasks.create(req, res);
}) 

app.put("/task", (req, res) => {
    tasks.complete(req, res);
}) 

app.delete("/task/:taskId", (req, res) => {
    tasks.delete(req, res);
}) 

app.listen(3001);
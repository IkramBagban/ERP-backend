require("../models/config_model");

const express = require("express");
const cors = require("cors");

const app = express();
const path = require("path");

app.use(
    cors({
        credentials: true,
        origin: '*'
    })
);

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "../../public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Main Route
app.get("/", (req, res, next) => {
    res.json({ message: "Welcome to Server Application." });
});

// Other Routes
require("../routes")(app);

module.exports = app;
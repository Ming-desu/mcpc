const express = require("express");
const Router = express.Router();

const controller = require("../controllers/client.controller");

Router.get("/", controller.home);
Router.get("/about", controller.about);
Router.get("/help", controller.help);
Router.get("/make-appointment", controller.appointment);
Router.post("/write-us", controller.writeUs);

module.exports = Router;

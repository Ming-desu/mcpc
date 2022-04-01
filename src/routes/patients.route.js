const express = require("express");
const Router = express.Router();

const controller = require("../controllers/patients.controller");

Router.get("/", controller.index);
Router.get("/create", controller.create);
Router.get("/:id/edit", controller.edit);
Router.get("/print", controller.print);

module.exports = Router;

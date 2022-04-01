const express = require('express')
const Router = express.Router()

const controller = require('../controllers/auth.controller.js')

Router.get('', controller.index)
Router.get('/register', controller.register)

module.exports = Router
const express = require('express')
const Router = express.Router()

const controller = require('../controllers/users.controller')

Router.get('', controller.index)
Router.get('/create', controller.create)
Router.get('/:id/edit', controller.edit)

module.exports = Router
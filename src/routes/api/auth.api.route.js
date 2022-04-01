const express = require('express')
const Router = express.Router()

const controller = require('../../controllers/api/auth.api.controller')

Router.post('/login', controller.index)
Router.get('/logout', controller.logout)
Router.post('/verify', controller.verify)
Router.post('/refresh', controller.refresh)

module.exports = Router
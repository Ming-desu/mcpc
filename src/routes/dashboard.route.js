const express = require('express')
const Router = express.Router()

const controller = require('../controllers/dashboard.controller')

Router.get('/', (req, res) => res.redirect('/admin/dashboard'))
Router.get('/dashboard', controller.index)

module.exports = Router
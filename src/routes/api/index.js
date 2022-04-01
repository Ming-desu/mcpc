const express = require('express')
const Router = express.Router()

Router.use('/auth', require('./auth.api.route'))
Router.use('/users', require('./users.api.route'))
Router.use('/patients', require('./patients.api.route'))
Router.use('/appointments', require('./appointments.api.route'))

module.exports = Router
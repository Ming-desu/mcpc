const { Request, Response } = require('express')
const moment = require('moment')
const Appointment = require('../models/Appointment')

/**
 * Index page of dashboard
 * 
 * @param {Request} req 
 * @param {Response} res
 */
exports.index = async function(req, res) {
  try {
    res.locals.appointment = await Appointment.findOne({ date: moment().format('YYYY-MM-DD') }).populate('queue.patient')
  }
  catch(err) {
    res.locals.appointment = null
  }

  res.render('pages/dashboard/index.twig')
}
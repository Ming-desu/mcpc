const { Request, Response } = require('express')
const moment = require('moment')
const Patient = require('../../models/Patient')
const Appointment = require('../../models/Appointment')
const axios = require('axios')
const { API_CODE, API_PASSWORD } = require('../../../config')
const qs = require('qs')

/**
 * Stores appointment to the database
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.store = async function(req, res) {
  try {
    const {
      patient_id,
      first_name,
      middle_name,
      last_name,
      sex,
      birthdate,
      guardian,
      time
    } = req.body

    const regex = new RegExp(/^09[\d]{9}$/)
    if (!guardian.contact_number || !regex.test(guardian.contact_number)) {
      throw new Error('Please provide a valid contact number.')
    }

    // Try to find the appointment
    const appointment = await Appointment.find({ date: moment().format('YYYY-MM-DD') })
    
    let args = [
      {
        first_name,
        middle_name,
        last_name,
        sex,
        birthdate
      }
    ]

    if (patient_id.length >= 1) {
      let patient = await Patient.findOne({
        uuid: patient_id
      })

      args.push({
        _id: patient._id
      })
    }

    // Try to find the patient or create if not exists
    let patient = await Patient.findOne({
      $and: args
    })

    // Patient does not exists so we create one
    if (!patient) {
      patient = await Patient.create({
        first_name,
        middle_name,
        last_name,
        sex,
        birthdate,
        guardian
      })
    }

    // Today's appointment does not exists so we create a new one for the queue
    if (appointment && appointment.length <= 0) {
      await Appointment.create({
        queue: [{
          patient: patient._id,
          time
        }]
      })
    }
    else {
      if (appointment[0].queue.find(schedule => schedule.time == time && schedule.status == 'approved')) {
        throw new Error('Sorry, the time you selected is not available.')
      }

      await appointment[0].set({
        queue: [...appointment[0].queue, {
          patient: patient._id,
          time
        }]
      }).save()
    }

    res.message('We had received your reservation. Please wait for an email or text message for the confirmation. Thank you. Here is your patient id: ' + patient.uuid)
    res.status(201).json({
      message: 'We had received your reservation. Please wait for an email or text message for the confirmation. Thank you. Here is your patient id: ' + patient.uuid
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
}

/**
 * Updates status of queue appointment
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.status = async function(req, res) {
  try {
    const { queue_id, status, date } = req.body
    const appointment = await Appointment.findOne({ date: moment().format(date) })
    let index = appointment.queue.findIndex(q => q._id.toString() == queue_id)
    
    if (status == 'approved') {
      appointment.queue[index].status = 'approved'
      appointment.queue.map(async (v, i) => {
        if (v.time == appointment.queue[index].time && i != index) {
          v.status = 'declined'
        }

        return v
      })
    }
    else {
      appointment.queue[index].status = status
    }

    const patient = await Patient.findById(appointment.queue[index].patient)
    const contact_number = patient.guardian.contact_number

    const payload = {
      1: contact_number,
      2: `We would like to inform you that your appointment at ${appointment.queue[index].time} was ${status}.`,
      3: API_CODE,
      passwd: API_PASSWORD
    }

    const response = await axios.post('https://www.itexmo.com/php_api/api.php', qs.stringify(payload), {
      headers: { 'Content-type': 'application/x-www-form-urlencoded' }
    });

    await appointment.save()

    res.message(`Successfully ${status} an appointment.`)
    res.status(200).json({
      message: `Successfully ${status} an appointment.`
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
}
const { Request, Response } = require('express')
const Patient = require('../../models/Patient')

/**
 * Finds patient from the database
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.find = async function(req, res) {
  try {
    const { id } = req.params
    const uuid = req.query.uuid || false

    let patient = null

    if (uuid) {
      patient = await Patient.findOne({ uuid: id })  
    }
    else {
      patient = await Patient.findById(id)
    }
    
    res.status(200).json({
      message: 'ok',
      sub: patient
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
}

/**
 * Read patients from the database
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
 exports.read = async function(req, res) {
  const q = req.query.q || ''
  const page = req.query.page || 1
  const limit = 15

  try {
    const patients = await Patient.find({
      $or: [
        { first_name: new RegExp(q) },
        { last_name: new RegExp(q) }
      ]
    })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort('-updated_at')

    res.status(200).json({
      message: 'ok',
      sub: patients
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message,
      sub: []
    })
  }
}

/**
 * Stores patient in the database
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.store = async function(req, res) {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      sex,
      birthdate,
      guardian
    } = req.body

    await Patient.create({
      first_name,
      middle_name,
      last_name,
      sex,
      birthdate,
      guardian
    })

    res.message('Successfully created a patient.')
    res.status(201).json({
      message: 'Successfully created a patient.'
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
}

/**
 * Updates information about patient in the database
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.edit = async function(req, res) {
  try {
    const { id } = req.params

    const patient = await Patient.findById(id)

    if (!patient) {
      throw new Error('Patient does not exists.')
    }

    const {
      first_name,
      middle_name,
      last_name,
      sex,
      birthdate,
      guardian
    } = req.body

    await patient.set({
      first_name,
      middle_name,
      last_name,
      sex,
      birthdate,
      guardian
    }).save()

    res.message('Successfully updated a patient.')
    res.status(200).json({
      message: 'Successfully updated a patient.'
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
}

/**
 * Deletes patient from the database
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
 exports.delete = async function(req, res) {
  try {
    const { id } = req.params

    const patient = await Patient.findById(id)

    if (!patient) {
      throw new Error('Patient does not exists.')
    }

    await Patient.deleteOne({ _id: id })

    res.message('Successfully deleted a patient.')
    res.status(200).json({
      message: 'Successfully deleted a patient.'
    })
  }
  catch(err) {
    res.status(400).json({
      message: err.message
    })
  }
}
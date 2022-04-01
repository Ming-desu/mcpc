const { Request, Response } = require("express");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const mongoose = require("mongoose");

/**
 * Index page of patients
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.index = function (req, res) {
  res.render("pages/patients/index.twig");
};

/**
 * Create page of patients
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.create = function (req, res) {
  res.render("pages/patients/create.twig");
};

/**
 * Edit page of patients
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.edit = async function (req, res) {
  try {
    const { id } = req.params;
    res.locals.patient = await Patient.findById(id);
    res.render("pages/patients/edit.twig");
  } catch (err) {
    res.message("Patient does not exists.");
    res.redirect("/admin/patients");
  }
};

/**
 * Prints all the information of the patient...
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.print = async function (req, res) {
  try {
    const patientsRecords = await Patient.find({}).sort("first_name asc");

    let patients = [...patientsRecords.map((x) => x.toJSON())];
    patients = await Promise.all(
      patients.map(async (x) => {
        x.appointments = await Appointment.find({
          "queue.patient": mongoose.Types.ObjectId(x._id),
        });

        x.appointments.map((c) => {
          c.queue = c.queue.filter(
            (q) => q.patient.toString() === x._id.toString()
          );

          return {
            queue: c.queue,
            date: c.date,
            _id: c._id,
          };
        });

        return x;
      })
    );

    res.locals.patients = patients;
  } catch (err) {
    res.locals.patients = [];
  }
  res.render("pages/patients/print");
};

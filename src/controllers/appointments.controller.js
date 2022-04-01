const { Request, Response } = require('express')
const moment = require('moment')
const Appointment = require('../models/Appointment')

/**
 * Index page of appointments
 * 
 * @param {Request} req 
 * @param {Response} res
 */
exports.index = async function(req, res) {
  try {
    const from = moment(req.query.from).startOf('day').toDate() || moment().startOf('day').toDate()
    const to = moment(req.query.to).startOf('day').toDate() || moment().startOf('day').toDate()

    res.locals.appointments = await Appointment.aggregate([
      {
        $project: {
          date: {
            $dateFromString: {
              dateString: '$date',
              format: '%Y-%m-%d',
              timezone: 'Asia/Manila'
            }
          },
          queue: 1
        }
      },
      {
        $match: {
          date: {
            $gte: from,
            $lte: to
          }
        }
      },
      {
        $lookup: {
          from: 'patients',
          localField: 'queue.patient',
          foreignField: '_id',
          as: 'patients'
        }
      },
      {
        $project: {
          date: {
            $dateToString: {
              date: '$date',
              format: '%Y-%m-%d',
              timezone: 'Asia/Manila'
            }
          },
          queue: {
            $map: {
              input: '$queue',
              as: 'q',
              in: {
                $mergeObjects: [
                  '$$q',
                  {
                    patient: {
                      $arrayElemAt: [
                        '$patients',
                        {
                          $indexOfArray: ['$patients._id', '$$q.patient']
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ])

    res.locals.from = moment(from).format('YYYY-MM-DD')
    res.locals.to = moment(to).format('YYYY-MM-DD')
  }
  catch(err) {
    res.locals.appointments = []
  }

  res.render('pages/appointments/index.twig')
}
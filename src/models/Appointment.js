const mongoose = require('mongoose')
const moment = require('moment')

const schema = mongoose.Schema({
  date: {
    type: String,
    required: true,
    default: moment().format('YYYY-MM-DD')
  },
  queue: [{
    patient: {
      type: mongoose.Types.ObjectId,
      ref: 'Patient'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined', 'finished'],
      default: 'pending'
    },
    time: String
  }]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

const time = ['08:00AM', '08:30AM', '09:00AM', '09:30AM', '10:00AM', '10:30AM', '11:00AM', '11:30AM', '12:00NN', '12:30PM', '01:00PM', '01:30PM', '02:00PM', '02:30PM', '03:00PM', '03:30PM', '04:00PM', '04:30PM', '05:00PM']

schema.virtual('get_all_queue').get(function() {
  return this.queue.sort((a, b) => time.indexOf(a.time) - time.indexOf(b.time))
})

schema.virtual('get_queue').get(function() {
  return this.queue.filter(s => s.status == 'approved')
    .sort((a, b) => time.indexOf(a.time) - time.indexOf(b.time))
})

schema.virtual('booked_times').get(function() {
  return this.queue.filter(s => s.status == 'approved')
    .map(s => s.time)
})

schema.virtual('finished_appointments').get(function() {
  return this.queue.filter(s => s.status == 'finished').length
})

schema.virtual('pending_appointments').get(function() {
  return this.queue.filter(s => s.status == 'pending').length
})

schema.set('toJSON', { virtuals: true })
schema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Appointment', schema)
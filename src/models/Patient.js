const mongoose = require('mongoose')
const moment = require('moment')
const shortid = require('shortid')

const schema = mongoose.Schema({
  uuid: {
    type: String,
    default: shortid.generate()
  },
  first_name: {
    required: true,
    type: String
  },
  middle_name: String,
  last_name: {
    required: true,
    type: String
  },
  sex: {
    enum: ['Male', 'Female'],
    type: String,
    required: true
  },
  birthdate: {
    type: Date,
    required: true,
    get: v => moment(v).format('YYYY-MM-DD')
  },
  guardian: {
    first_name: String,
    last_name: String,
    contact_number: String,
    email: String
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

schema.virtual('full_name').get(function() {
  return [this.first_name, this.middle_name, this.last_name].join(' ')
})

schema.virtual('guardian_full_name').get(function() {
  return [this.guardian.first_name, this.guardian.last_name].join(' ')
})

schema.virtual('age').get(function() {
  return moment().diff(moment(this.birthdate), 'years')
})

schema.virtual('formatted_birthdate').get(function() {
  return moment(this.birthdate).format('YYYY-MM-DD')
})

schema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Patient', schema)
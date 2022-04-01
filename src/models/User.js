const mongoose = require('mongoose')

const schema = mongoose.Schema({
  first_name: String,
  last_name: String,
  sex: {
    enum: ['Male', 'Female'],
    type: String,
    required: true
  },
  username: {
    required: true,
    type: String
  },
  password: {
    required: true,
    type: String
  },
  password_salt: {
    required: true,
    type: String
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

schema.virtual('full_name').get(function() {
  return [this.first_name, this.last_name].join(' ')
})

schema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('User', schema)
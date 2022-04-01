const { Request, Response } = require('express')
const User = require('../models/User')

/**
 * Index page of users
 * 
 * @param {Request} req 
 * @param {Response} res
 */
exports.index = function(req, res) {
  res.render('pages/users/index.twig')
}

/**
 * Create page of users
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.create = function(req, res) {
  res.render('pages/users/create.twig')
}

/**
 * Edit page of users
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.edit = async function(req, res) {  
  try {
    const { id } = req.params
    res.locals.user = await User.findById(id).select('-password -password_salt')

    if (id == res.locals.current_user._id) {
      res.message('Kindly edit your information here.')
      return res.redirect('/admin/settings')
    }

    res.render('pages/users/edit')
  }
  catch(err) {
    console.log(err)
    res.message('User does not exists.')
    res.redirect('/admin/users')
  }
}
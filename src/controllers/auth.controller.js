const { Request, Response } = require('express')

/**
 * Login page for auth
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.index = function(req, res) {
  res.render('pages/auth/index.twig')
}

/**
 * Register page for auth
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
exports.register = function(req, res) {
  res.render('pages/auth/register.twig')
}
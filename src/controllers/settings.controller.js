const { Request, Response } = require('express')

/**
 * Index page of settings
 * 
 * @param {Request} req 
 * @param {Response} res
 */
exports.index = function(req, res) {
  res.render('pages/settings/index.twig')
}
const { Request, Response } = require('express')

/**
 * Index page of feedbacks
 * 
 * @param {Request} req 
 * @param {Response} res
 */
exports.index = function(req, res) {
  res.render('pages/feedbacks/index.twig')
}
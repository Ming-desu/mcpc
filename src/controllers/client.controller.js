const { Request, Response } = require("express");
const moment = require("moment");
const Appointment = require("../models/Appointment");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const nodemailer = require("nodemailer");

const GMAIL_USER = "marolcerdapediatricclinic@gmail.com";
const CLIENT_ID =
  "262368927836-d2cq0pevva4i9p2qmmvlbi0d179kgtii.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN =
  "1//04srRkzuZvSC2CgYIARAAGAQSNwF-L9IrJY_8xHSmI90s7SzP03F7rdVXnCBJXOigc-qR-ua-a-4p-Hlk64LGdazGno7ykBkfWnQ";

/**
 * Home page for client
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.home = function (req, res) {
  res.render("pages/client/home.twig");
};

/**
 * About page for client
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.about = function (req, res) {
  res.render("pages/client/about.twig");
};

/**
 * Help page for client
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.help = function (req, res) {
  res.render("pages/client/help.twig");
};

/**
 * Appointment page for client
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.appointment = async function (req, res) {
  try {
    res.locals.appointment = await Appointment.findOne({
      date: moment().format("YYYY-MM-DD"),
    });
    // return res.send(res.locals.appointment)
  } catch (err) {
    res.locals.appointment = null;
  }

  res.render("pages/client/appointment.twig");
};

/**
 * Writes a message and send it via email
 *
 * @param {Request} req
 * @param {Response} res
 */
exports.writeUs = async function (req, res) {
  try {
    const client = new OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );
    client.setCredentials({
      refresh_token: REFRESH_TOKEN,
    });

    const accessToken = client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: GMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const { name, email, message } = req.body;

    transport.sendMail(
      {
        from: GMAIL_USER,
        to: "apulgado067@gmail.com",
        cc: ["jcoriel78@gmail.com", "georgesartcollection@gmail.com"],
        subject: "[CONTACT US FORM]",
        html: `
        <h1>Client Feedback</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
      },
      function (err, response) {
        if (err) {
          res.status(400).json({
            message: "Something went wrong.",
          });
        } else {
          res.status(200).json({
            message: "ok",
          });
        }
      }
    );
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

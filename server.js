const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
const twig = require("twig");
// const http = require('http').createServer(app)
const { BASE_URL, PORT, MONGODB_URI } = require("./config");

const mongoose = require("mongoose");
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to database: ", err.message));

// Twig filters
twig.extendFilter("appointments_summary", function (appointments) {
  let data = {
    pending: 0,
    total: 0,
    finished: 0,
  };

  if (appointments.length <= 0) {
    return data;
  }

  appointments.forEach((appointment) => {
    appointment.queue.forEach((q) => {
      if (q.status == "pending") {
        data.pending += 1;
      }

      if (q.status == "finished") {
        data.finished += 1;
      }

      data.total += 1;
    });
  });

  return data;
});

twig.extendFilter("sort_queue", function (queue) {
  if (queue.length <= 0) {
    return [];
  }

  const time = [
    "08:00AM",
    "09:00AM",
    "10:00AM",
    "11:00AM",
    "12:00NN",
    "01:00PM",
    "02:00PM",
    "03:00PM",
    "04:00PM",
    "05:00PM",
  ];
  return queue.sort((a, b) => time.indexOf(a.time) - time.indexOf(b.time));
});

twig.extendFilter("format_date", function (date) {
  const moment = require("moment");

  return moment(date).format("LL");
});

twig.extendFunction("indexOf", function (value, string) {
  return value.indexOf(string);
});

twig.extendFilter("dd", function (value) {
  return JSON.stringify(value);
});

app.set("view engine", "twig");

app.set("twig options", {
  allow_sync: true,
  strict_variables: false,
});

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "some-random-string-xxxx",
  })
);

app.response.message = function (message, type = "notification") {
  const session = this.req.session || [];

  session.messages = session.messages = [];
  session.messages.push({
    body: message,
    type,
  });

  return this;
};

app.use((req, res, next) => {
  const messages = req.session.messages || [];

  // Expose the messages in the template engine
  res.locals.messages = messages;
  res.locals.hasMessage = messages.length > 0;

  res.locals.getMessage = () => {
    if (messages.length <= 0) {
      return;
    }

    req.session.messages = [];
    return messages[0];
  };

  res.locals.active = req.originalUrl.substr(1).split("/")[1] || "/";
  res.locals.client_active = req.originalUrl.substr(1).split("/")[0] || "/";

  next();
});

app.use(cookieParser());

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));

// Client Routes
app.use(require("./src/routes/client.route"));

// Admin Routes
app.use("/admin", require("./src/routes/index.route"));

// Api Routes
app.use("/api", require("./src/routes/api/index"));

app.listen(PORT, () => console.log(`${BASE_URL}`));

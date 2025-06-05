require("dotenv").config();
require("./config/dbconnect");
const express = require("express");
const cookieParser = require("cookie-parser");
const pendingLeaveNotifier = require("./cron/notifyPendingLeaves");
const passport = require("passport");
require("./controllers/oAuth/oAuth.js");
const cors = require("cors");
const router = require("./routes");
const app = express();
const port = process.env.PORT || 6000;
const { REACT_URL } = process.env;
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: REACT_URL,
    credentials: true,
    withCredentials: true,
  })
);
app.use("/image", express.static("public"));
pendingLeaveNotifier.start();
app.use(passport.initialize());
app.use("/api", router);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

const express = require("express");
const app = express();

app.use(express.json());

app.use("/auth", require("./routes/auth.routes"));
app.use("/requests", require("./routes/requests.routes"));

module.exports = { app };

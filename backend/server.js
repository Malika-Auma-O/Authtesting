const express = require("express");
const app = express();
const cors = require("cors");
// parse or stringify data
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.listen(3636, () => {
  console.log("server is running on port 3636")
})
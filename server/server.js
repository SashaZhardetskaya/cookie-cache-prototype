const express = require('express');
const app = express();
const port = 9001;

app.use(function(req, res, next) {
  return next();
});
app.use(express.static('dist'));

app.listen(port);

app.post("/getip", function (req, res) {
  res.send("213.160.110.124");
});

app.get("/", (req, res) => {
  res.send('./index.html');
});


console.log(`Listening on port ${port}`);

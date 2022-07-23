const scraper = require("./scraper");
const express = require("express");
const app = express();

const PORT = 8001;

// main route
app.get("/", function (request, response) {
  response.send("hello server");
});

// scraper solution route
app.get("/unblock1", async function (request, response) {
  var url = request.query.url;
  const results = (await scraper.getPageHTML(url) || "Error");
  response.send(results);
});

// route doesn't exist 
app.use(function (request, response, next) {
  response.status(404).send("Not found");
});

// start at port
app.listen(PORT, function () {
  console.log(`Server started on ${PORT}`);
});
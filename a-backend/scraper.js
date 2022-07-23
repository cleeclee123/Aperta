const cheerio = require("cheerio");
const axios = require("axios");
const HTMLParser = require('node-html-parser');

const ERROR_MESSAGE = "Sorry, an error as occured. Please try again";

// ROTATION FUNCTIONS FROM Project-Helper-Function

// scraps sslproxies.org for port numbers and ip addresses
const generateProxy = async function () {
  let ipAddresses = [];
  let portNumbers = [];

  await axios
    .get("https://sslproxies.org/")
    .then(async function (response) {
      // load html data with cheerio
      const $ = cheerio.load(response.data);

      // loop through table tag, grab second nth-child
      $("td:nth-child(1)").each((index, element) => {
        ipAddresses[index] = $(element).text();
      });

      // loop through table tag, grab second nth-child
      $("td:nth-child(2)").each((index, element) => {
        portNumbers[index] = $(element).text();
      });

      ipAddresses.join(", ");
      portNumbers.join(", ");
    })
    .catch(async function (error) {
      // console.log(error.response);
      // throw new Error("Proxy Rotation Scrap Error");
      return `${ERROR_MESSAGE} ${error}`
    });

  let randomNumber = Math.floor(Math.random() * 100);
  let proxy = `http://${ipAddresses[randomNumber]}:${portNumbers[randomNumber]}`;

  return proxy;
};

// function to rotate user agents by scrapping github repo, returns a string
const rotateUserAgent = async function () {
  let userAgents = [];

  await axios
    .get(
      "https://github.com/tamimibrahim17/List-of-user-agents/blob/master/Chrome.txt"
    )
    .then(async function (repsonse) {
      // load html with cheerio
      const $ = cheerio.load(repsonse.data);

      // loop through tr tag, loop through table tag, grab second nth-child
      // check for space (valid user agent) and will only scrap windows uas
      $("tr > td:nth-child(2)").each((index, element) => {
        if (
          $(element).text().includes(" ") &&
          $(element).text().includes("(Windows")
        ) {
          userAgents[index] = $(element).text();
        }
      });

      userAgents.join(", ");
    })
    .catch(async function (error) {
      // console.log(error.response);
      // throw new Error("User Agent Rotation Error");
      return `${ERROR_MESSAGE} ${error}`
    });

  let randomNumber = Math.floor(Math.random() * 100);
  let rotatedUserAgent = userAgents[randomNumber];
  return String(rotatedUserAgent);
};

// write request header interface for bing
// referer to https://t.co/ (Twitter's link service)
const OPTIONS = {
  headers: {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://t.co/",
    "Sec-Ch-Ua":
      '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": rotateUserAgent(),
    "X-Amzn-Trace-Id": "Root=1-629e4d2d-69ff09fd3184deac1df68d18",
    Proxy: generateProxy(),
  },
};

// from stack overflow answer
function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

// load call page from axios
const getPageHTML = async function (url) {
  if (!isValidHttpUrl(url)) {
    return "Not a Valid URL!";
  }
  return await axios
    .get(url, OPTIONS)
    .then(async function (response) {
      const pageHTMLString = cheerio.load(response.data).html();
      
      // parses string to html
      let root = HTMLParser.parse(pageHTMLString);

      // selects all scripts tag to delete all embedded jaavscript
      let allScripts = root.getElementsByTagName('script');
      for(var i = 0; i < allScripts.length; i++) {
        var script = allScripts[i];
        script.remove();
      }
      return root.innerHTML;
    });
};

module.exports = {
  getPageHTML
};



// const url = "https://www.bloomberg.com/news/articles/2022-07-23/california-governor-newsom-tries-to-speed-energy-transition-in-climate-fight?srnd=premium#xj4y7vzkg";
// const test = loadPageData(url);
// test.then(function(data) {
//   console.log(data);
// });

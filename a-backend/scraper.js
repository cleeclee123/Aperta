const cheerio = require("cheerio");
const axios = require("axios");
const HTMLParser = require('node-html-parser');

const ERROR_MESSAGE_R = "Sorry, an error as occured. Please try again";
const ERROR_MESSAGE_U = "Not a Valid URL!";

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
      return `${ERROR_MESSAGE_R} ${error}`;
    });

  let randomNumber = Math.floor(Math.random() * 100);
  let proxy = `http://${ipAddresses[randomNumber]}:${portNumbers[randomNumber]}`;

  return proxy;
};

// function to rotate user agents by scrapping github repo, returns a string
const rotateUserAgent = async function () {
  let userAgents = [];

  await axios
    .get("https://github.com/tamimibrahim17/List-of-user-agents/blob/master/Chrome.txt")
    .then(async function (repsonse) {
      // load html with cheerio
      const $ = cheerio.load(repsonse.data);

      // loop through tr tag, loop through table tag, grab second nth-child
      // check for space (valid user agent) and will scrap windows, mac, linux uas
      $("tr > td:nth-child(2)").each((index, element) => {
        if ($(element).text().includes(" ") && $(element).text().includes("(Windows") ||
            $(element).text().includes(" ") && $(element).text().includes("(Macintosh") ||
            $(element).text().includes(" ") && $(element).text().includes("(Linux")) {
          userAgents[index] = $(element).text();
        }
      });

      userAgents.join(", ");
    })
    .catch(async function(error) {
      // console.log(error.response);
      // throw new Error("User Agent Rotation Error");
      return `${ERROR_MESSAGE_R} ${error}`;
    });

  let randomNumber = Math.floor(Math.random() * 100);
  let rotatedUserAgent = userAgents[randomNumber];
  return String(rotatedUserAgent);
}

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
    "X-Forwarded-For": "66.102.0.0",
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
    return ERROR_MESSAGE_U;
  }
  const cache = "http://webcache.googleusercontent.com/search?q=cache:";
  return await axios
    .get((cache + url), OPTIONS)
    .then(async function (response) {
      const pageHTMLString = cheerio.load(response.data).html();
      
      // parses string to html
      let root = HTMLParser.parse(pageHTMLString);

      // selects all scripts tag to delete all embedded jaavscript
      if (url.includes("medium") || 
          url.includes("towardsdata") ||
          url.includes("telegraph") ||
          url.includes("chicagotribune")
        ) {
        let allScripts = root.getElementsByTagName('script');
        for (var i = 0; i < allScripts.length; i++) {
          var script = allScripts[i];
          script.remove();
        }
      }
      root.getElementById('bN015htcoyT__google-cache-hdr').remove();

      return root.innerHTML;
    })
    .catch((error) => {
      return `${ERROR_MESSAGE_R} ${error}`;
    });
};

module.exports = {
  getPageHTML
};

// const url = "https://www.wsj.com/articles/investors-bet-fed-will-need-to-cut-interest-rates-next-year-to-bolster-the-economy-11658694486?mod=hp_lead_pos1";
// const test = getPageHTML(url);
// test.then(function(data) {
//   console.log(data);
// });

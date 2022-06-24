const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const asyncHandler = require("express-async-handler");
const { performance } = require("perf_hooks");

dotenv.config();
const app = express();

app.use(cors());

app.listen(process.env.PORT || 3333, () => {
  console.log("Server is running!");
});

const convertHtmlToImage = async (req, res) => {
  const { url } = req.query;

  if (!url.includes(process.env.APPLICATION_DOMAIN)) {
    throw new Error("Invalid URL");
  }

  // To run as Heroku App, you should be able to solve this issue by passing the --no-sandbox and --disable-setuid-sandbox flags to puppeteer.launch()
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const t0 = performance.now();
  const page = await browser.newPage();
  await page.goto(url);
  const t1 = performance.now();
  await page.waitForSelector(process.env.ELEMENT_ID);
  const element = await page.$(process.env.ELEMENT_ID);
  const base64Image = await element.screenshot({
    encoding: "base64",
  });
  await browser.close();
  const imageBuffer = Buffer.from(base64Image, "base64");
  console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);

  res.setHeader("Content-Type", "image/png");
  res.send(imageBuffer);
};

app.get("/api/html-to-image", asyncHandler(convertHtmlToImage));

const express = require("express");
const puppeteer = require("puppeteer");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.listen(process.env.PORT || 3333, () => {
  console.log(`Server at http://localhost:3333`);
});

const convertHtmlToImage = async (req, res) => {
  const { url } = req.query;

  if (!url.includes(process.env.APPLICATION_DOMAIN)) {
    throw new Error("Invalid URL");
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(process.env.ELEMENT_ID);
  const element = await page.$(process.env.ELEMENT_ID);
  const base64Image = await element.screenshot({
    encoding: "base64",
  });
  const imageBuffer = Buffer.from(base64Image, "base64");
  await browser.close();

  res.setHeader("Content-Type", "image/png");
  res.send(imageBuffer);
};

app.get("/api/html-to-image/", asyncHandler(convertHtmlToImage));

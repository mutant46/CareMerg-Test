const async = require("async");
const express = require("express");
const url = require("url");
const axios = require("axios");
const app = express();

const parseTitle = (body) => {
  let match = body.match(/<title>(.*?)<\/title>/);
  if (!match || typeof match[1] !== "string") "Title Not FOund";
  return match[1];
};

const head = `<html><head></head><body><h1> Following are the titles of given websites: </h1> <h2> Please write urls in the form of https://www.example.com </h2>`;
const tail = `</body></html>`;

app.get("/I/want/title/", (req, res) => {
  const results = [];
  const query = url.parse(req.url, true).query;
  if (!query.address) {
    res.status(400).send("Missing url query parameter");
  }
  const list = typeof query.address === "string" ? [query.address] : query.address;
  async.each(
    list,
    (address, callback) => {
      axios
        .get(address)
        .then((res) => {
          results.push(`${address} -- ${parseTitle(res.data)}`);
          callback();
        })
        .catch((error) => {
          results.push(`${address} -- NO RESPONSE`);
          callback();
        });
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        let response = "<ul>";
        results.forEach((s) => {
          response = response + `<li>${s}</li>`;
        });
        response = response + "</ul>";
        res.send(head + response + tail);
      }
    }
  );
});

app.get("*", (req, res) => {
  res.status(404).send("Sorry, cant find that");
});

app.listen(3000);

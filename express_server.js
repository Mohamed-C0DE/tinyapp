const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

function generateRandomString() {
  let text = "";
  const possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i <= 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Response sent to homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Response with urls_index ejs file
app.get("/urls", (req, res) => {
  const templeVars = { urls: urlDatabase };
  res.render("urls_index", templeVars);
});

// Response with urls_new ejs file
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Response with urls_show ejs file
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: req.params.longURL,
  };
  res.render("urls_show", templateVars);
});

// Redirects to longURL based on the shortURL key in urlDatabase
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // Added below if shortURL doesnt exist
  if (!longURL) {
    res.send("We dont have any record of that URL");
  }
  res.redirect(longURL);
});

// Generates a random string and references the longURL inputed as the shortURL, then redirects to the urls_show ejs file
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL;
  shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

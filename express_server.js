const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// helper functions
function generateRandomString() {
  let text = "";
  const possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i <= 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

// Data our app uses
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {};

// Response sent to homepage
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// Response with urls_index ejs file
app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const templeVars = { user: users[userId], urls: urlDatabase };
  res.render("urls_index", templeVars);
});

// Response with urls_new ejs file
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const templeVars = { user: users[userId] };
  res.render("urls_new", templeVars);
});

// Response is urls_show ejs file
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    user: users[userId],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
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

// Edits a shortURL from the database
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls");
});

// Deletes a shortURL from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.params.shortURL;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Login route
app.post("/login", (req, res) => {
  const user = req.body.username;
  res.cookie("username", user);
  res.redirect("/urls");
});

// Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Register
app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const templeVars = { user: users[userId] };
  res.render("register", templeVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[id] = { id, email, password };
  const user = users[id];
  res.cookie("user_id", user.id);
  console.log(users);
  res.redirect("/urls");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

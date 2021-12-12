const express = require("express");
const app = express();
const PORT = 8080;
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers.js");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["This key is using cookie session to build my tinyapp application"],
  })
);

// VIEW ENGINE
app.set("view engine", "ejs");

// DATA OUR APP USES
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "123d" },
};

const users = {
  "123d": {
    id: "123d",
    email: "123@example.com",
    hashPassword: bcrypt.hashSync("abc", 10),
  },
};

// ROUTES
// REDIRECT HOME PAGE TO URLS PAGE
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// URLS_INDEX PAGE
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const userDatabase = urlsForUser(userId, urlDatabase);
  const templeVars = { user: users[userId], urls: userDatabase };
  res.render("urls_index", templeVars);
});

// URLS_NEW PAGE
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect("/login");
  }
  const templeVars = { user: users[userId] };
  res.render("urls_new", templeVars);
});

// URLS_SHOW PAGE
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(userId, urlDatabase);
  const templateVars = {
    user: users[userId],
    shortURL: shortURL,
    userUrls: userUrls,
  };
  res.render("urls_show", templateVars);
});

// REDIRECTS TO longURL BASED ON THE shortURL KEY IN urlDatabase
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.send("We dont have any record of that URL");
  }
  res.redirect(urlDatabase[shortURL].longURL);
});

// GENERATES OUR SHORTURL THEN REDIRECTS TO THE URLS_SHOW PAGE
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect("/login");
  }
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID: userId };
  res.redirect(`/urls/${shortURL}`);
});

// EDIT shortURL
app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  const userUrls = urlsForUser(userId, urlDatabase);
  for (const key in userUrls) {
    if (key === shortURL) {
      urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userID: userId,
      };
      res.redirect("/urls");
    }
  }
  res.send("You dont have access to this shortURL, so you can't edit it");
});

// DELETES shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(userId, urlDatabase);
  for (const key in userUrls) {
    if (key === shortURL) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  }
  res.send("You can't delete this shortURL because its not your shortURL.");
});

// LOGIN ROUTE
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templeVars = { user: users[userId] };
  res.render("login", templeVars);
});

app.post("/login", (req, res) => {
  const enteredEmail = req.body.email;
  const enteredPassword = req.body.password;
  const userId = getUserByEmail(enteredEmail, users);
  if (!userId) {
    res.send("Email cannot be found!");
  }
  const hashedPassword = users[userId].hashPassword;
  if (!bcrypt.compareSync(enteredPassword, hashedPassword)) {
    res.send("Invalid Password");
  }
  req.session.user_id = userId;
  res.redirect("/urls");
});

// LOGOUT ROUTE
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// REGISTER ROUTES
// RENDERS REGISTER PAGE
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const templeVars = { user: users[userId] };
  res.render("register", templeVars);
});

// REGISTERS USER, INPUTS USER INTO USERS OBJ & REDIRECTS TO URLS PAGE
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Email and password fields must be filled!");
  }

  const hashPassword = bcrypt.hashSync(password, 10);
  const userId = getUserByEmail(email, users);

  if (userId) {
    res.status(400).send("Email already exists!");
  }

  users[id] = { id, email, hashPassword };
  const registeredUser = users[id];

  req.session.user_id = registeredUser.id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// HELPER FUNCTIONS
const generateRandomString = () => {
  let text = "";
  const possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i <= 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

const emailLookup = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

// DATA OUR APP USES
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "123d" },
};

const users = {
  "123d": {
    id: "123d",
    email: "123@example.com",
    password: "abc",
  },
};

// REDIRECT HOME PAGE TO URLS PAGE
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// RENDER URLS_INDEX FILE
app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const userDatabase = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === userId) {
      userDatabase[key] = urlDatabase[key];
    }
  }
  const templeVars = { user: users[userId], urls: userDatabase };
  res.render("urls_index", templeVars);
});

// RENDER URLS_NEW FILE
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    res.redirect("/login");
  }
  const templeVars = { user: users[userId] };
  res.render("urls_new", templeVars);
});

// RENDER URLS_SHOW FILE
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    user: users[userId],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
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

// GENERATES A RANDOM STRING & REFERENCES THE longURL INPUTED AS THE shortURL, THEN REDIRECTS TO THE URLS_SHOW FILE
app.post("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    res.redirect("/login");
  }
  let longURL = req.body.longURL;
  let shortURL;
  shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID: userId };
  res.redirect(`/urls/${shortURL}`);
});

// EDIT shortURL
app.post("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const id = req.params.id;
  urlDatabase[id] = { longURL: req.body.longURL, userID: userId };
  res.redirect("/urls");
});

// DELETES shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.params.shortURL;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// LOGIN ROUTE
app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;
  const templeVars = { user: users[userId] };
  res.render("login", templeVars);
});

app.post("/login", (req, res) => {
  const enteredEmail = req.body.email;
  const enteredPassword = req.body.password;
  const user = emailLookup(enteredEmail);
  if (!user) {
    res.status(403).send("Email cannot be found!");
  }
  if (user.password !== enteredPassword) {
    res.status(403).send("Invalid Password");
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// LOGOUT ROUTE
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// REGISTER ROUTES
// RENDERS REGISTER PAGE
app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
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

  const emailExists = emailLookup(email);

  if (emailExists) {
    res.status(400).send("Email already exists!");
  }

  users[id] = { id, email, password };
  const user = users[id];
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

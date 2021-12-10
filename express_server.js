const express = require("express");
const app = express();
const PORT = 8080;
const { getUserByEmail } = require("./helpers.js");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

// HELPER FUNCTIONS
const generateRandomString = () => {
  let text = "";
  const possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i <= 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

const urlsForUser = (id) => {
  const urls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["This key is using cookie session to build my tinyapp application"],
  })
);

app.set("view engine", "ejs");

// DATA OUR APP USES
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "123d" },
};

const users = {
  "123d": {
    id: "123d",
    email: "123@example.com",
    password: bcrypt.hashSync("abc", 10),
  },
};

// REDIRECT HOME PAGE TO URLS PAGE
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// RENDER URLS_INDEX FILE
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
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
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect("/login");
  }
  const templeVars = { user: users[userId] };
  res.render("urls_new", templeVars);
});

// RENDER URLS_SHOW FILE
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(userId);
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

// GENERATES A RANDOM STRING & REFERENCES THE longURL INPUTED AS THE shortURL, THEN REDIRECTS TO THE URLS_SHOW FILE
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
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
  const userId = req.session.user_id;
  const shortURL = req.params.id;
  const userUrls = urlsForUser(userId);
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
  const userUrls = urlsForUser(userId);
  for (const key in userUrls) {
    if (key === shortURL) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  }
  res
    .status(400)
    .send("You can't delete this shortURL because its not your shortURL.");
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
    res.status(403).send("Email cannot be found!");
  }
  console.log(users);
  const hashedPassword = users[userId].password;
  if (!bcrypt.compareSync(enteredPassword, hashedPassword)) {
    res.status(403).send("Invalid Password");
  }
  req.session.user_id = userId;
  res.redirect("/urls");
});

// LOGOUT ROUTE
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    res.status(400).send("Email and password fields must be filled!");
  }

  const userId = getUserByEmail(email, users);

  if (userId) {
    res.status(400).send("Email already exists!");
  }

  users[id] = { id, email, password };
  const registeredUser = users[id];

  req.session.user_id = registeredUser.id;
  res.redirect("/urls");
});

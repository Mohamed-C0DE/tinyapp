const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
};

const generateRandomString = () => {
  let text = "";
  const possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i <= 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

const urlsForUser = (id, database) => {
  const urls = {};
  for (const key in database) {
    if (database[key].userID === id) {
      urls[key] = database[key];
    }
  }
  return urls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };

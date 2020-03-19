const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const express = require("express");
const bcrypt = require('bcrypt');
const { findUserByEmail } = require('./helpers');
const saltRounds = 10;
const app = express();

const PORT = 8080; // default port 8080


app.use(
  cookieSession({
    name: 'session',
    keys: [
      '8f232fc4-47de-41a1-a8cd-4f9323253715',
      '1279e050-24c2-4cc6-a176-3d03d66948a2',
    ],
  }),
);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


/////////////////////////////////
////////// DATABASE ////////////

// URLS DATABASE
const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.tsn.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

// REGISTERED USERS
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


/////////////////////////////////
////////// FUNCTIONS ///////////

// RETURNS URL WHERE USERID === TO ID OF LOGGED IN USER
const urlsForUser = (id) => {
  let result = [];
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      result.push(urlDatabase[urlId]);
    }
  }
  return result;
};

// GENERATES SHORT URLS
function generateRandomString() {
  let randomString = "";
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random() * 62));
  }
  return randomString;
}


/////////////////////////////////////////
////////// GLOBAL VARIABLES ////////////

const createNewURL = (longURL, userID) => {
  const shortURL = generateRandomString(8);

  // creating the new url object
  const newURL = {
    shortURL,
    longURL,
    userID
  };

  // Add the newlink object to urlDatabase
  urlDatabase[shortURL] = newURL;
  return shortURL;
};

const updateURL = (shortURL, longURL) => {
  urlDatabase[shortURL].longURL = longURL;
  return true;
};

const addNewUser = (email, password) => {
  // hash passwords
  const salt = bcrypt.genSaltSync(saltRounds);
  // Generate a random id
  const userId = generateRandomString(8);

  // Create a new user object
  const newUserObj = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, salt)
  };

  // Add the user Object into the usersDb
  users[userId] = newUserObj;

  // return the id of the user
  return userId;
};

const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = findUserByEmail(email, users);  

  // if we got a user back and the passwords match then return the userObj
  if (user && bcrypt.compareSync(password, user.password)) {
    // user is authenticated
    return user;
  } else {
    // Otherwise return false
    return false;
  }
};


/////////////////////////////////
/////// POST POST POST /////////

// SAVE, STORE AND ASSIGN SMALL URL TO LONG URL
app.post("/urls", (req, res) => {
  // cookie
  const userId = req.session.user_id;
  // take longUrl from user input
  const longURL = req.body.longURL;
  // create shortUrl by calling callback function
  const shortURL = createNewURL(longURL, userId);
  // assign cookie to logged in user
  const loggedInUser = users[userId];
  // designate url to logged in user
  let templateVars = { shortURL, longURL, users: loggedInUser };
  res.render("urls_show", templateVars); 
});

// DELETE AN URL ENTRY
app.post("/urls/:shortURL/delete", (req, res) => {
  // cookie
  const userId = req.session.user_id;
  // take short url from a place I dont remember
  const shortURL = req.params.shortURL;

  // if user id match delete otherwise redirect
  if (userId === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

// UPDATE AN URL AND REDIRECT TO URLS
app.post("/urls/:shortURL", (req, res) => {
  // take short url from a place I dont remember
  const shortURL = req.params.shortURL;
  // take longUrl from user input
  const longURL = req.body.longURL;

  // callback function to update url
  updateURL(shortURL, longURL);
  res.redirect("/urls")
});

// HANDLES THE REGISTRATION FORM DATA
app.post("/register", (req, res) => {
  // extract the info from the form
  const email = req.body.email;
  const password = req.body.password;

  // check if the user is not already in the database
  const user = findUserByEmail(email, users);

  // if not in the database, add user
  if (!user) {
    const userId = addNewUser(email, password);
    req.session.user_id = userId;
    res.redirect('/urls');
  } else if (email === "" || password === "") {
    res.status(411).send('Please complet your email and password field');
  } else {
    res.status(403).send('Sorry, the user is already registered');
  }
});

// LOGIN
app.post('/login', (req, res) => {
  // extract the info from the form
  const email = req.body.email;
  const password = req.body.password;

  // Authenticate the user
  const user = authenticateUser(email, password);
  
  // if authenticated, set cookie with its user id and redirect
  if (user) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else if (user === false) {
    // email or password are incorrect
    res.status(403).send('Password or email are incorrect, please try again');
  } else {
    // user with that e-mail cannot be found
    res.status(403).send('Email cannot be found');
  }
});

// LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


////////////////////////////////////////
/////// CREATE AND UPDATE URLS ////////

// RENDER THE PAGE FOR THE NEW URL FORM
app.get("/urls/new", (req, res) => {
  // cookie
  const userId = req.session.user_id;
  // assign cookie to logged user
  const loggedInUser = users[userId];
  // take user from users database
  let templateVars = { users: loggedInUser };

  // Authenticate the user
  const user = loggedInUser;

  // if authenticated, set cookie with its user id and redirect
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// RENDER THE PAGE FOR THE BRAND NEW GENERATED SHORT URL
app.get("/urls/:shortURL", (req, res) => {
  // cookie
  const userId = req.session.user_id;
  // take info from form
  const shortURL = req.params.shortURL;
  // assign cookie to logged user
  const loggedInUser = users[userId];
  // add url to database?!
  let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, users: loggedInUser };
  
  // if user id match with id in database do:
  if (loggedInUser.id === urlDatabase[shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.send("Please login!");
  }
});



/////////////////////////////////
//////// AUTENTICATION /////////

// RENDER THE PAGE FOR THE LIST OF SAVED URLS AND LOGIN NAME
app.get("/urls", (req, res) => {
  // cookie
  const userId = req.session.user_id;
  // assign cookie to logged user
  const loggedInUser = users[userId];
  // not sure what it does :O
  const urls = urlsForUser(userId);
  let templateVars = { urls, users: loggedInUser };

  res.render("urls_index", templateVars);
});

// DISPLAY THE REGISTER FORM
app.get('/register', (req, res) => {
  // cookie
  const userId = req.session.user_id;
  // assign cookie to logged user
  const loggedInUser = users[userId];
  let templateVars = { users: loggedInUser };

  res.render('register', templateVars);
});

// DISPLAY THE LOGIN FORM
app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  let templateVars = { users: loggedInUser };

  res.render('login', templateVars);
});



// SHOW ON CONSOLE THAT WE CONNECT TO THE SERVER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
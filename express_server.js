const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


/////////////////////////////////
////////// DATABASE ////////////

// URLS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// GENERATES SHORT URLS
function generateRandomString() {
  let randomString = "";
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 6; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random() * 62));
  }
  return randomString;
}

// FIND USER BY EMAIL
const findUserByEmail = email => {
  // loop through the users object
  for (let userId in users) {
    // compare the emails, if they match return the user obj
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  // else return false
  return false;
};


/////////////////////////////////////////
////////// GLOBAL VARIABLES ////////////

const addNewUser = (email, password) => {
  // Generate a random id
  const userId = generateRandomString(8);

  // Create a new user object
  const newUserObj = {
    id: userId,
    email,
    password,
  };

  // Add the user Object into the usersDb
  users[userId] = newUserObj;

  // return the id of the user
  return userId;
};

const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = findUserByEmail(email);  

  // if we got a user back and the passwords match then return the userObj
  if (user && user.password === password) {
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
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`)

  console.log(urlDatabase);
});

// DELETE AN URL ENTRY
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

// UPDATE AN URL AND REDIRECT TO URLS
app.post("/urls/:shortURL", (req, res) => {
  // req.params used for path / req.body used for forms
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls")
});

// HANDLES THE REGISTRATION FORM DATA
app.post("/register", (req, res) => {
  // extract the info from the form
  const email = req.body.email;
  const password = req.body.password;

  // check if the user is not already in the database
  const user = findUserByEmail(email);

  // if not in the database, add user
  if (!user) {
    const userId = addNewUser(email, password);
    // setCookie with the user id
    res.cookie('user_id', userId);
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
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else if (user === false) {
    // user with that e-mail cannot be found
    res.status(403).send('Password or email are incorrect, please try again');
  } else {
    // user with that e-mail cannot be found
    res.status(403).send('Email cannot be found');
  }
});

// LOGOUT
app.post("/logout", (req, res) => {
  const userId = req.cookies['user_id'];
  res.clearCookie('user_id', userId);
  res.redirect("/urls");
});


////////////////////////////////////////
/////// CREATE AND UPDATE URLS ////////

// RENDER THE PAGE FOR THE NEW URL FORM
app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { users: loggedInUser };
  res.render("urls_new", templateVars);
});

// RENDER THE PAGE FOR THE BRAND NEW GENERATED SHORT URL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], users: loggedInUser };
  res.render("urls_show", templateVars);
});


/////////////////////////////////
//////// AUTENTICATION /////////

// RENDER THE PAGE FOR THE LIST OF SAVED URLS AND LOGIN NAME
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { urls: urlDatabase, users: loggedInUser };
  res.render("urls_index", templateVars);
});

// DISPLAY THE REGISTER FORM
app.get('/register', (req, res) => {
  const templateVars = { users: null };
  res.render('register', templateVars);
});

// DISPLAY THE LOGIN FORM
app.get('/login', (req, res) => {
  const templateVars = { users: null };
  res.render('login', templateVars);
});



// SHOW ON CONSOLE THAT WE CONNECT TO THE SERVER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

console.log(urlDatabase);



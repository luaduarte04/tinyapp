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
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com",

  // "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  // "i3BoGr": { longURL: "https://www.google.ca", userID: "aJ48lW" },

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

// RETURNS URL  WHERE USERID === TO ID OF LOGGED IN USER
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
  console.log("newURL", newURL);
  return shortURL;
};

const updateURL = (shortURL, longURL) => {
  urlDatabase[shortURL].longURL = longURL;
  return true;
};

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

// CHECK IF USER EXIST
// const checkUserByEmail = email => {
//   for (let userId in users) {
//     if (users[userId].email === email) {
//       return users[userId];
//     }
//   }
//   return false;
// };

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
  const userId = req.cookies["user_id"];
  const longURL = req.body.longURL;
  const shortURL = createNewURL(longURL, userId);
  const loggedInUser = users[userId];
  let templateVars = { shortURL, longURL, users: loggedInUser };
  res.render("urls_show", templateVars); 
  // res.redirect(`/urls/${shortURL}`);
});

// DELETE AN URL ENTRY
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  if (userId === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

// UPDATE AN URL AND REDIRECT TO URLS
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  // req.params used for path / req.body used for forms
  // urlDatabase[req.params.shortURL] = req.body.longURL;
  updateURL(shortURL, longURL);
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

  // if (!checkUserByEmail(email)) {
  //   const userId = addNewUser(email, password);
  //   res.cookie("user_id", userId);
  //   res.redirect("/urls");
  // }
});

// LOGIN
app.post('/login', (req, res) => {
  // extract the info from the form
  const email = req.body.email;
  const password = req.body.password;
  // const userId = checkUserByEmail(email);

  // Authenticate the user
  const user = authenticateUser(email, password);

  // if authenticated, set cookie with its user id and redirect
  if (user) {
    res.cookie('user_id', userId.id);
    res.redirect('/urls');
  } else if (user === false) {
    // email or password are incorrect
    res.status(403).send('Password or email are incorrect, please try again');
  } else {
    // user with that e-mail cannot be found
    res.status(403).send('Email cannot be found');
  }

  // if (!userId.email) {
  //   res.status(403).send('User with this email cannot be found!');
  // } else if (userId.email) {
  //     if (password !== userId.password) {
  //       res.status(403).send('Incorrect password!');
  //     } else {
  //   res.cookie("user_id", userId.id);
  //   res.redirect("/urls");
  //   }
  // }
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('user_id', null);
  res.redirect("/urls");
});


////////////////////////////////////////
/////// CREATE AND UPDATE URLS ////////

// RENDER THE PAGE FOR THE NEW URL FORM
app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
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
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, users: loggedInUser };
  
  console.log("loggedInUSer", loggedInUser, "db user id", urlDatabase[shortURL].userID);

  if (loggedInUser.id === urlDatabase[shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.send("Please login!");
  }
});

// NOT SURE WHAT IS THAT - AN ERROR MAYBE???
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

/////////////////////////////////
//////// AUTENTICATION /////////

// RENDER THE PAGE FOR THE LIST OF SAVED URLS AND LOGIN NAME
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const urls = urlsForUser(userId);
  console.log("urls", urls);
  let templateVars = { urls, users: loggedInUser };
  res.render("urls_index", templateVars);
});

// DISPLAY THE REGISTER FORM
app.get('/register', (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { users: loggedInUser };

  //const templateVars = { users: null };
  res.render('register', templateVars);
});

// DISPLAY THE LOGIN FORM
app.get('/login', (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { users: loggedInUser };

  //const templateVars = { users: null };
  res.render('login', templateVars);
});



// SHOW ON CONSOLE THAT WE CONNECT TO THE SERVER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

console.log(urlDatabase);



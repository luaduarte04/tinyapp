const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// "DATABASE"
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// RENDER THE PAGE FOR THE LIST OF SAVED URLS
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// RENDER THE PAGE FOR THE NEW URL FORM
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// RENDER THE PAGE FOR THE BRAND NEW GENERATED SHORT URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// SHOW ON CONSOLE THAT WE CONNECT TO THE SERVER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

console.log(urlDatabase);


// Once the user submits an Update request, it should modify the corresponding longURL, and then redirect the client back to "/urls".
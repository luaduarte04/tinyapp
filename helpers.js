// FIND USER BY EMAIL AND COMPARE WITH DATABASE
const findUserByEmail = (email, database) => {
  // loop through the users object
  for (let userId in database) {
    // compare the emails, if they match return the user obj
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  // else return false
  return;
};

module.exports = { findUserByEmail };

// We lookup a user in our database whenever we register or login a user. To avoid duplicating the logic for looking up users in multiple routes, we should write a function that does this for us, and then we call that function wherever we need it.
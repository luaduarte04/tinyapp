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
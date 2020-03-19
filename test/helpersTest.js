const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.id, expectedOutput, 'this email match with user database');
  });

  it('should return undefined when email does not exist in database', function() {
    const user = findUserByEmail("not_registered@example.com", testUsers)
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput, 'this email does not in database');
  });
});
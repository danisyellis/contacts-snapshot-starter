const bcrypt = require('bcrypt');
const router = require('express').Router();
const contactsRoutes = require('./contacts');
const Contacts = require('../../models/contacts');
const Users = require('../../models/users');

const saltRounds = 10;

router.get('/login', (request, response) => {
  if (!request.session.user) {
    response.render('login');
  } else {
    response.redirect('/contacts');
  }
});

router.post('/login', (request, response) => {
  const loginUsername = request.body.username;
  const loginPassword = request.body.password;
  Users.findUser(loginUsername)
    .then((user) => {
      if (!user) {
        console.log("Username and password don't match");
        response.redirect('/login');
      } else {
        bcrypt.compare(loginPassword, user.password)
        .then(comparisonResult => {
          if (comparisonResult === false) {
            console.log("Username and password don't match");
            response.redirect('/login');
          } else {
            console.log("User logged in");
            console.log("This is user", user.username, "This is session", request.session);
            request.session.user = user;
            response.redirect('/contacts');
          }
        })
        .catch(error => console.error(error.message));
      }
    })
    .catch( err => console.log('err', err) );
});

router.get('/signup', (request, response) => {
  response.render('signup');
});

router.post('/signup', (request, response) => {
  const username = request.body.username;
  const userPassword = request.body.password;
  bcrypt.hash(userPassword, saltRounds).then(newlyHashedPassword => {
    const hashedPassword = newlyHashedPassword;
    return hashedPassword;
  }).then(hashedPassword => {
  Users.createUser(username, hashedPassword)
    .then((user) => {
        response.redirect('/login');
    })
    .catch( err => {
      console.log("That username already exists");
      console.error(err.message);
      response.redirect('/signup');
    });
  });
  //.catch( err => {console.log("something happened with the hash: " + err.message )};)
});

router.get('/home', (request, response) => {
  console.log("***", request.session, request.session.user);
  response.render('index');
});

router.get('/', (request, response) => {
  Contacts.getContacts()
    .then((contacts) => {response.render('contacts/index', { contacts });})
    .catch( err => console.log('err', err) );
});

router.use('/contacts', contactsRoutes); // /contacts/search

module.exports = router;

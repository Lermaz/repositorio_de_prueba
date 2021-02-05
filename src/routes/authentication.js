const express = require("express");
const { deserializeUser } = require("passport");
const router = express.Router();

const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

// SIGNUP
router.get("/signup", isNotLoggedIn, (req, res) => {
  res.render("auth/signup");
});

router.post("/signup", isNotLoggedIn, passport.authenticate("local.signup", {
    successRedirect: "/profile",
    failureRedirect: "/signup",
    failureFlash: true
}));

// SINGIN
router.get('/signin', isNotLoggedIn, (req, res) => {
  res.render('auth/signin');
});

router.post('/signin', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local.signin', {
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true
  })(req, res, next);
});

router.get("/profile", isLoggedIn, (req, res) => {
    if(req.user.idtipousuario == 1)
      res.render('profile');
    else if(req.user.idtipousuario == 2)
      res.render('profile');
    else
      res.render('subprofile');
});

router.get("/subprofile", isLoggedIn, (req, res) => {
  res.render('subprofile');
});

router.get("/usuarios", isLoggedIn, (req, res) => {
  res.render('usuarios');
});

router.get('/logout', isLoggedIn, (req, res) => {
  req.logOut();
  res.redirect('/signin');
});

module.exports = router;
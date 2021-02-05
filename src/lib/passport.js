const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const pool = require("../database");
const helpers = require("./helpers");

passport.use('local.signin', new LocalStrategy({
    usernameField: 'nombrelogin',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, nombrelogin, password, done) => {
    const rows = await pool.query('SELECT * FROM catusuarios WHERE nombrelogin = ?', [nombrelogin]);
    if (rows.length > 0) {
      const user = rows[0];
      const validPassword = await helpers.matchPassword(password, user.password)
      if (validPassword) {
        done(null, user, req.flash('success', 'Hola ' + user.nombrelogin));
      } else {
        done(null, false, req.flash('message', 'Contraseña incorrecta'));
      }
    } else {
      return done(null, false, req.flash('message', 'El nombre de usuario no existe.'));
    } 
}));

passport.use("local.signup", new LocalStrategy({
    usernameField: "nombrelogin",
    passwordField: "password",
    passReqToCallback: true,
}, async (req, nombrelogin, password, done) => {
    const { nombre } = req.body;
    const { apellidopaterno } = req.body;
    const { apellidomaterno } = req.body;
    const { idtipousuario } = req.body;
    const { email } = req.body;
    let newUser = {
        nombre,
        apellidopaterno,
        apellidomaterno,
        idtipousuario,
        nombrelogin,
        email,
        password,
    };
    newUser.password = await helpers.encryptPassword(password);
    const result = await pool.query('INSERT INTO catusuarios SET ? ', [newUser]);
    //newUser.id = result.insertId;
    //return done(null, newUser);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM catusuarios WHERE id = ?', [id]);
  done(null, rows[0]);
});
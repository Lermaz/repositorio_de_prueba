const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const passport = require('passport');

const { database } = require('./keys');
console.log('entro 1');

// Intializations
const app = express();
require('./lib/passport');
console.log('entro 2');

// Settings
app.set('port', process.env.PORT || 5000);
console.log('entro 3');
app.set('views', path.join(__dirname, 'views'));
console.log('entro 4');
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
console.log('entro 5');
app.set('view engine', '.hbs');
console.log('entro 6');

// Middlewares
app.use(session({
    secret: 'reactivamysqlnodesession',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));
console.log('entro 7');
app.use(flash());
console.log('entro 8');
app.use(morgan('dev'));
console.log('entro 9');
app.use(express.urlencoded({extended: false}));
console.log('entro 10');
app.use(express.json());
console.log('entro 11');
app.use(passport.initialize());
console.log('entro 12');
app.use(passport.session());
console.log('entro 12');

// Global variables
app.use((req, res, next) => {
    console.log('entro 13');
    app.locals.success = req.flash('success');
    console.log('entro 14');
    app.locals.message = req.flash('message');
    console.log('entro 15');
    app.locals.user = req.user;
    console.log('entro 16');
    next();
});

// Routes
app.use(require('./routes/index'));
console.log('entro 17');
app.use(require('./routes/authentication'));
console.log('entro 18');
app.use('/links', require('./routes/links'));
console.log('entro 19');

// Public
app.use(express.static(path.join(__dirname, 'public')));
console.log('entro 20');

// Starting the server
app.listen(app.get('port'), () => {
    console.log('entro 21');
    console.log('Server is in port', app.get('port'));
});
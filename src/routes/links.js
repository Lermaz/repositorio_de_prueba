const express = require('express');
const router = express.Router();
const helpers = require("../lib/helpers");

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

//Agregar usuarios
router.get('/adduser', isLoggedIn, async (req, res) => {
    const usuarios = await pool.query('SELECT * FROM cattipousuarios WHERE opcactivo = 1')
    res.render('links/adduser', { usuarios });
});

router.post('/adduser', isLoggedIn, async (req, res) => {
    const { nombre, apellidopaterno, apellidomaterno, idtipousuario, nombrelogin, email, password } = req.body;
    const newUser = {
        nombre,
        apellidopaterno,
        apellidomaterno,
        idtipousuario,
        nombrelogin,
        email,
        password
    };
    newUser.password = await helpers.encryptPassword(password);
    await pool.query('INSERT INTO catusuarios SET ? ', [newUser]);
    req.flash('success', 'Usuario guardado correctamente');
    res.redirect('/profile');
});

router.get('/deleteuser/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await pool.query('UPDATE catusuarios SET opcactivo = 0 WHERE id = ?', [id]);
    req.flash('success', 'Usuario deshabilitado correctamente');
    res.redirect('/profile');
});

router.get('/edituser/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const usuario = await pool.query('SELECT * FROM catusuarios WHERE id = ?', [id]);
    const usuarios = await pool.query('SELECT * FROM cattipousuarios WHERE opcactivo = 1')
    res.render('links/edituser',{usuario: usuario[0], usuarios });
});

router.post('/edituser/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellidopaterno, apellidomaterno, email, idtipousuario, nombrelogin } = req.body; 
    const newUser = {
        nombre,
        apellidopaterno,
        apellidomaterno,
        idtipousuario,
        nombrelogin,
        email
    };
    await pool.query('UPDATE catusuarios set ? WHERE id = ?', [newUser, id]);
    req.flash('success', 'Usuario actualizado correctamente');
    res.redirect('/profile');
});

router.get('/listfisios', isLoggedIn, async (req, res) => {
    const fisios = await pool.query('SELECT * FROM catusuarios WHERE idtipousuario = 4');
    res.render('links/listfisios', { fisios });
});

router.get('/listdoctores', isLoggedIn, async (req, res) => {
    const doctores = await pool.query('SELECT * FROM catusuarios WHERE idtipousuario = 5');
    res.render('links/listdoctores', { doctores });
});

router.get('/addpacientes', isLoggedIn, async (req, res) => {
    const evaluadores = await pool.query('SELECT id, nombrelogin FROM catusuarios WHERE idtipousuario = 3');
    const fisios = await pool.query('SELECT id, nombrelogin FROM catusuarios WHERE idtipousuario = 4');
    const doctores = await pool.query('SELECT id, nombrelogin FROM catusuarios WHERE idtipousuario = 5');
    res.render('links/addpacientes', { evaluadores, fisios, doctores });
});

router.post('/addpacientes', isLoggedIn, async (req, res) => {
    const { nombre, apellidopaterno, apellidomaterno, rfc, email, idevaluador, idfisio, iddoctor } = req.body;
    const newPaciente = {
        nombre,
        apellidopaterno,
        apellidomaterno,
        rfc,
        email,
        idevaluador,
        idfisio,
        iddoctor
    };
    await pool.query('INSERT INTO catpacientes set ?', [newPaciente]);
    req.flash('success', 'Paciente guardado correctamente');
    res.redirect('/profile');
});

router.get('/editpacientes/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const paciente = await pool.query('SELECT * FROM catpacientes WHERE id = ?', [id]);
    const evaluadores = await pool.query('SELECT id, nombrelogin FROM catusuarios WHERE idtipousuario = 3');
    const fisios = await pool.query('SELECT id, nombrelogin FROM catusuarios WHERE idtipousuario = 4');
    const doctores = await pool.query('SELECT id, nombrelogin FROM catusuarios WHERE idtipousuario = 5');
    res.render('links/editpacientes',{paciente: paciente[0], evaluadores, fisios, doctores });
});

router.post('/editpacientes/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellidopaterno, apellidomaterno, rfc, email, idevaluador, idfisio, iddoctor } = req.body;
    const newPaciente = {
        nombre,
        apellidopaterno,
        apellidomaterno,
        rfc,
        email,
        idevaluador,
        idfisio,
        iddoctor
    };
    await pool.query('UPDATE catpacientes set ? WHERE id = ?', [newPaciente, id]);
    req.flash('success', 'Paciente actualizado correctamente');
    res.redirect('/profile');
});

router.get('/listpacientes', isLoggedIn, async (req, res) => {
    const { id } = req.user;
    const { idtipousuario } = req.user;
    if(idtipousuario < 3)
    {
        const pacientes = await pool.query('SELECT * FROM catpacientes');
        res.render('links/listpacientesedit', { pacientes });
    }
    else if(idtipousuario == 3)
    {
        const pacientes = await pool.query('SELECT * FROM catpacientes WHERE idevaluador = ?', [id]);
        res.render('links/listpacientes', { pacientes });
    }
    else if(idtipousuario == 4)
    {
        const pacientes = await pool.query('SELECT * FROM catpacientes WHERE idfisio = ?', [id]);
        res.render('links/listpacientes', { pacientes });
    }
    else if(idtipousuario == 5)
    {
        const pacientes = await pool.query('SELECT * FROM catpacientes WHERE iddoctor = ?', [id]);
        res.render('links/listpacientes', { pacientes });
    }
});

router.get('/comentarios/:tmp', isLoggedIn, async (req, res) => {
    const { tmp } = req.params;
    const { idtipousuario } = req.user;
    const { id } = req.user;
    console.log(id);
    if(idtipousuario < 4)
    {
        const comentarios = await pool.query('SELECT u.nombrelogin, t.nombre, c.feccomentario, c.comentario FROM ctlcomentariospacientes c INNER JOIN cattipocomentarios t ON c.idtipocomentario = t.id INNER JOIN catusuarios u ON u.id = c.idusuario WHERE c.idpaciente = ?', [tmp]);
        res.render('links/comentarios', { comentarios, tmp });
    }
    else
    {
        const comentarios = await pool.query('SELECT u.nombrelogin, t.nombre, c.feccomentario, c.comentario FROM ctlcomentariospacientes c INNER JOIN cattipocomentarios t ON c.idtipocomentario = t.id INNER JOIN catusuarios u ON u.id = c.idusuario WHERE c.idtipocomentario < 5 && c.idpaciente = ?', [tmp]);
        res.render('links/comentarios', { comentarios, tmp });
    }
});

router.get('/addcoment/:tmp', isLoggedIn, async (req, res) => {
    const { tmp } = req.params;
    const { idtipousuario } = req.user;
    if(idtipousuario < 4)
    {
        const comentarios = await pool.query('SELECT * FROM cattipocomentarios WHERE opcactivo = 1');
        res.render('links/addcoment', { comentarios, tmp });
    }
    else
    {
        res.render('links/addcomenttmp', { tmp });
    }
});

router.post('/addcoment/:tmp', isLoggedIn, async (req, res) => {
    const { tmp } = req.params;
    const { id } = req.user;
    const { comentario , idtipocomentario } = req.body; 
    const newComent = {
        idcomentario,
        tipocomentario
    };
    await pool.query('INSERT INTO ctlcomentariospacientes set ?, idpaciente = ?, idusuario = ?', [newComent, tmp, id]);
    req.flash('success', 'Comentario guardado correctamente');
    res.redirect('/profile');
});

router.post('/addcomenttmp/:tmp', isLoggedIn, async (req, res) => {
    const { tmp } = req.params;
    const { id } = req.user;
    const { comentario } = req.body; 
    const newComent = {
        comentario
    };
    await pool.query('INSERT INTO ctlcomentariospacientes set ?, idtipocomentario = 5, idpaciente = ?, idusuario = ?', [newComent, tmp, id]);
    req.flash('success', 'Comentario guardado correctamente');
    res.redirect('/profile');
});

router.get('/', isLoggedIn, async (req, res) => {
    res.render('/profile');
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM links WHERE id = ?', [id]);
    req.flash('success', 'Paciente borrado correctamente');
    res.redirect('/links');
});

module.exports = router;
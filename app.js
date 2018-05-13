'use strict'

const express = require('express')
const favicon = require('serve-favicon')
const replay_dir = require('./controller/replay')

const app = express()

// English by default.
global.language = 'en'

// Templating by default.
app.set('view engine', 'ejs')
// Views directory.
app.set('views', './view')
// I don't want to see x-powered-by...
app.set('x-powered-by', false)

// Favicon.
app.use(favicon('./public/favicon.ico'))

// Routing.
app.use('/', replay_dir)

// Listening to 8080 port.
app.listen(8080)

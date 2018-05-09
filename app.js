const express = require('express')
const app = express()
const replay_dir = require(`${__dirname}/controller/replay`)

// English by default.
global.language = 'en'

// Templating by default.
app.set('view engine', 'ejs')
// Views directory.
app.set('views', `${__dirname}/view`)
// I don't want to see x-powered-by...
app.set('x-powered-by', false)

// Routing.
app.use('/', replay_dir)

// Listening to 8080 port.
app.listen(8080)

'use strict'

import express from 'express'
import router from '../controller/replay'
import { redirect } from '../lib/utils'

const app = express()

// English by default.
global.language = 'en'

// Templating by default.
app.set('view engine', 'ejs')
// Views directory.
app.set('views', './view')
// I don't want to see x-powered-by...
app.set('x-powered-by', false)

// Static files.
app.use(express.static('public'))

// Routing.
app.use('/:langcode', router)

// Redirect.
app.use(redirect)

// Listening to 8080 port.
app.listen(8080)

// Help.
console.log('=> http://localhost:8080 !')

'use strict'

import express from 'express'
import i18n from 'i18n'
import { join } from 'path'
import router from '../controller/replay'
import { redirect, getLangCodes } from '../lib/utils'

const app = express()
const port = process.env.PORT || 8080
const langCodes = getLangCodes()

// Templating by default.
app.set('view engine', 'ejs')
// Views directory.
app.set('views', './view')
// I don't want to see x-powered-by...
app.set('x-powered-by', false)

// Static files.
app.use(express.static('public'))

// I18n.
i18n.configure({
  locales: langCodes,
  directory: join(__dirname, '/../locales'),
  api: {
    __: 't',
  },
})
app.use(i18n.init)

// Routing.
app.use(`/:langcode(${langCodes.join('|')})`, (request, response, next) => {
  i18n.setLocale(response, request.params.langcode)
  next()
}, router)

// Redirect.
app.use(redirect)

// Listening to XXXX port.
app.listen(port, () => console.log(`=> http://localhost:${port} !`))

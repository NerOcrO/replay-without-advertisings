'use strict'

import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import i18n from 'i18n'
import { join } from 'path'
import favicon from 'serve-favicon'
import router from './middlewares/router'
import redirect from './middlewares/redirect'
import { getLangCodes } from './lib/utils'

const app = express()
const port = process.env.PORT || 8080
const langCodes = getLangCodes()

// Templating by default.
app.set('view engine', 'ejs')
// Views directory.
app.set('views', './views')

// Header protection.
app.use(helmet())

// Compress all responses.
app.use(compression())

// Static files.
app.use(express.static('public'))

// I18n.
i18n.configure({
  locales: langCodes,
  directory: join(__dirname, '/locales'),
  api: {
    __: 't',
  },
})
app.use(i18n.init)

// Routing.
app.use(`/:langcode(${langCodes.join('|')})`, favicon(join(__dirname, 'public', 'favicon.ico')), (request, response, next) => {
  i18n.setLocale(response, request.params.langcode)
  next()
}, router)

// Redirect.
app.use(redirect)

// Listening to XXXX port.
app.listen(port, () => console.log(`=> http://localhost:${port} !`))

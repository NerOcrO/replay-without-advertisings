import Debug from 'debug'
import * as utils from '../lib/utils'

const debug = Debug('replay')

/**
 * Get the default browser lang code.
 *
 * @param {Request} request
 *  Request object.
 *
 * @return {String}
 *   Lang code.
 */
const getBrowserLangCode = async (request) => {
  const langCodes = await utils.getLangCodes()

  try {
    return langCodes.find(langCode => request.acceptsLanguages(langCode) === langCode)
  }
  catch (error) {
    debug(error)
  }
}

/**
 * Redirect when there is no langcode.
 *
 * @param {Request} request
 *   Request object.
 * @param {Response} response
 *   Response object.
 */
const redirect = async (request, response) => {
  const { originalUrl } = request
  const routes = await utils.getRoutes()

  try {
    const routeIsValid = await routes
      .map(route => route.value.replace(/:channelId|:showId|:videoId/g, '([a-z]+)'))
      .some((route) => {
        if (route === '/') {
          if (route === originalUrl) {
            return true
          }
          return false
        }

        return RegExp(route).test(originalUrl)
      })

    if (!routeIsValid) {
      response.status(404).render('layout', {
        page: 'error',
        title: response.t('Error 404'),
        error: response.t('Sorry, we cannot find that!'),
      })
    }
    else {
      const langCode = await getBrowserLangCode(request)

      try {
        response.redirect(`/${langCode}${originalUrl}`)
      }
      catch (error) {
        debug(error)
      }
    }
  }
  catch (error) {
    debug(error)
  }
}

export default redirect

import Debug from 'debug'
import * as utils from '../lib/utils'

const debug = Debug('replay')

/**
 * Get the default browser lang code.
 *
 * @param {Object} request
 *  Request object.
 *
 * @return {String}
 *   Lang code.
 */
const getBrowserLangCode = request =>
  utils.getLangCodes()
    .then(langCodes =>
      langCodes.find(langCode =>
        request.acceptsLanguages(langCode) === langCode))
    .catch(error => debug(error))

/**
 * Redirect when there is no langcode.
 *
 * @param {Object} request
 *   Request object.
 * @param {Object} response
 *   Response object.
 * @param {Function} next
 *   The callback.
 */
const redirect = (request, response, next) => {
  const { originalUrl } = request

  utils.getRoutes()
    .then(routes => routes.map(route => route.value.replace(/:channelId|:showId|:videoId/g, '([a-z]+)')))
    .then(routes =>
      routes.some((route) => {
        if (route === '/') {
          if (route === originalUrl) {
            return true
          }
          return false
        }

        return RegExp(route).test(originalUrl)
      }))
    .then((routeIsValid) => {
      if (!routeIsValid) {
        response.status(404).render('layout', {
          page: 'error',
          title: response.t('Error 404'),
          error: response.t('Sorry, we cannot find that!'),
        })
      }
      else {
        getBrowserLangCode(request)
          .then(langCode =>
            response.redirect(`/${langCode}${originalUrl}`))
          .catch(error => debug(error))
      }

      next()
    })
    .catch(error => debug(error))
}

export default redirect

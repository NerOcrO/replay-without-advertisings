import * as utils from '../lib/utils'

/**
 * Get the default browser lang code.
 *
 * @param {Object} request
 *  Request object.
 *
 * @return {String}
 *   Lang code.
 */
function getBrowserLangCode(request) {
  return utils.getLangCodes().find(langCode => request.acceptsLanguages(langCode) === langCode)
}

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
function redirect(request, response, next) {
  const { originalUrl } = request
  const routes = utils.getRoutes().map(value => value.route.replace(/:channelId|:showId|:videoId/g, '([a-z]+)'))
  const routeIsValid = routes.some((route) => {
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
    response.redirect(`/${getBrowserLangCode(request)}${originalUrl}`)
  }

  next()
}

export default redirect

import Debug from 'debug'
import fs from 'fs'

const debug = Debug('replay')

/**
 * HTTP error handler for axios.
 *
 * @param {Object} error
 *   Error object.
 * @param {Object} response
 *   Express response object.
 */
export const axiosErrorHandler = (error, response) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx.
    debug(error.response.data)
    debug(error.response.status)
    debug(error.response.headers)
  }
  else if (error.request) {
    // The request was made but no response was received `error.request`
    // is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js.
    debug(error.request)
  }
  else {
    // Something happened in setting up the request that triggered an
    // Error.
    debug(error.message)
  }

  debug(error.config)

  response.status(500).send(response.t('Sorry, there is something wrong!'))
}

/**
 * Get the routes.
 *
 * @return {Array}
 *   Array of routes.
 */
export const getRoutes = () =>
  new Promise((resolve, reject) =>
    fs.readFile('./data/routes.json', 'utf8', (error, lines) => (
      error ? reject(error) : resolve(JSON.parse(lines))
    )))

/**
 * Get the lang codes.
 *
 * @return {Array}
 *   Array of locales.
 */
export const getLangCodes = () =>
  new Promise((resolve, reject) =>
    fs.readdir('./locales/', (error, files) => {
      if (error) {
        reject(error)
      }
      else {
        resolve(files.map(file =>
          file.replace('.json', '')))
      }
    }))

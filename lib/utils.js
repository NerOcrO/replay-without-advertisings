import Debug from 'debug'
import fs from 'fs'

const debug = Debug('replay')

/**
 * HTTP error handler for fetch.
 *
 * @param {TypeError} error
 *   Error object.
 * @param {Response} response
 *   Express response object.
 */
export const fetchErrorHandler = (error, response) => {
  debug(error)

  response.status(500).send(response.t('Sorry, there is something wrong!'))
}

/**
 * Get the routes.
 *
 * @param {PathLike} path
 *   A path to a file.
 *
 * @return {Promise}
 *   The Promise to be fulfilled.
 */
export const getRoutes = (path = './data/routes.json') =>
  new Promise((resolve, reject) =>
    fs.readFile(path, 'utf8', (error, lines) => (
      error ? reject(error) : resolve(JSON.parse(lines))
    )))

/**
 * Get the lang codes.
 *
 * @param {PathLike} path
 *   Directory path.
 *
 * @return {Promise}
 *   The Promise to be fulfilled.
 */
export const getLangCodes = (path = './locales/') =>
  new Promise((resolve, reject) =>
    fs.readdir(path, (error, files) => {
      if (error) {
        reject(error)
      }
      else {
        resolve(files.map(file =>
          file.replace('.json', '')))
      }
    }))

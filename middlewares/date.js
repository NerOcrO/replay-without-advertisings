/**
 * The date.
 *
 * @param {Request} request
 *   Request object.
 * @param {Response} response
 *   Response object.
 * @param {Function} next
 *   Callback.
 */
const date = (request, response, next) => {
  request.date = new Date()
  next()
}

export default date

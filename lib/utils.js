const fs = require('fs')
const path = require('path')

const utils = module.exports = {

  /**
   * Get the home.
   *
   * @param {object} request
   * @param {object} response
   */
  getHome(request, response) {
    fs.readFile('./channels.json', 'utf8', (error, data) => {
      if (error) {
        throw error
      }

      const channels = []

      for (const channel of JSON.parse(data).channels) {
        channels.push({
          url: path.join(global.language, 'channel', channel.id),
          label: channel.label
        })
      }

      response.render('layout', {
        page: 'channel',
        title: utils.t('The channels'),
        variables: { channels }
      })
    })
  },

  /**
   * Get plugin.
   *
   * @param {object} request
   * @param {object} response
   * @param {string} method
   */
  getPlugin(request, response, method) {
    const pluginPath = path.join(__dirname, '..', 'plugin', request.params.idChannel, 'index.js')

    if (fs.existsSync(pluginPath)) {
      const plugin = require(pluginPath)
      plugin[method](request, response)
    }
    else {
      response.status(404).send(utils.t('Sorry, we cannot find that!'))
    }
  },

  /**
   * HTTP error handling.
   *
   * @param {object} response
   * @param {object} res
   */
  hasError(response, res) {
    let error = ''

    if (res.statusCode !== 200) {
      error = new Error(utils.t('Request Failed.\nStatus Code: @@statusCode@@', [res.statusCode]))
    }
    else if (!/^application\/json/.test(res.headers['content-type'])) {
      error = new Error(utils.t('Invalid content-type.\nExpected application/json but received @@contentType@@', [res.headers['content-type']]))
    }

    if (error) {
      console.error(error.message)
      // Consume response data to free up memory.
      res.resume()
      response.status(500).send(utils.t('Sorry, there is something wrong!'))
      return false
    }

    return true
  },

  /**
   * Translate sentence.
   *
   * @param {string} string
   * @param {object} words
   */
  t(string, words = {}) {
    if (global.language !== 'en') {
      const filePath = path.join(__dirname, '..', 'language', `${global.language}.json`)
      const language = fs.readFileSync(filePath, 'utf8')

      string = JSON.parse(language)[string] ? JSON.parse(language)[string] : string
    }

    if (words.length > 0) {
      for (const word of words) {
        string = string.replace(/@@([a-z]*)@@/, word)
      }
    }

    return string
  }

}

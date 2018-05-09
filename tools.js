const fs = require('fs')

module.exports = {
  getHome(request, response) {
    fs.readFile('./channels.json', 'utf8', (error, data) => {
      if (error) {
        throw error
      }

      const channels = []

      for (const channel of JSON.parse(data).channels) {
        channels.push({
          url: `${global.language}/channel/${channel.id}`,
          label: channel.label
        })
      }

      response.render('layout', {
        page: 'channel',
        title: this.t('The channels'),
        variables: { channels }
      })
    })
  },

  getPlugin(request, response, method) {
    const path = `${__dirname}/plugin/${request.params.idChannel}/index.js`

    if (fs.existsSync(path)) {
      const plugin = require(path)
      plugin[method](request, response)
    }
    else {
      response.status(404).send(this.t('Sorry, we cannot find that!'))
    }
  },

  /**
   * HTTP error handling.
   */
  hasError(response, res) {
    let error = ''

    if (res.statusCode !== 200) {
      error = new Error(this.t('Request Failed.\nStatus Code: @@statusCode@@', [res.statusCode]))
    }
    else if (!/^application\/json/.test(res.headers['content-type'])) {
      error = new Error(this.t('Invalid content-type.\nExpected application/json but received @@contentType@@', [res.headers['content-type']]))
    }

    if (error) {
      console.error(error.message)
      // Consume response data to free up memory.
      res.resume()
      response.status(500).send(this.t('Sorry, there is something wrong!'))
      return false
    }

    return true
  },

  t(string, words = {}) {
    if (global.language !== 'en') {
      const language = fs.readFileSync(`./language/${global.language}.json`, 'utf8')

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

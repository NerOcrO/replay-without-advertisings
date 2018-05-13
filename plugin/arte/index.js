const debug = require('debug')('utils')
const http = require('http')
const path = require('path')
const utils = require('../../lib/utils')

const channel = module.exports = {

  date: new Date(),
  urlShow: 'http://www.arte.tv/hbbtvv2/services/web/index.php/OPA/v3/programs/{{DATE}}/fr',
  urlVideos: 'http://www.arte.tv/hbbtvv2/services/web/index.php/OPA/v3/programs/{{DATE}}/fr',
  urlVideo: 'http://www.arte.tv/hbbtvv2/services/web/index.php/OPA/v3/streams/{{ID}}/fr',

  /**
   * Show's page.
   *
   * @param {object} request
   * @param {object} response
   */
  show(request, response) {
    // Channel's ID.
    const idChannel = request.params.idChannel
    // URL.
    const url = this.urlShow.replace(/{{DATE}}/, `${this.date.getFullYear()}${this.date.getMonth()}${this.date.getDay()}`)

    // Get the JSON.
    http.get(url, (res) => {
      debug(utils.t('Show: @@url@@', [url]))

      if (!utils.hasError(response, res)) {
        return
      }

      let rawData = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        rawData += chunk
      })
      res.on('end', () => {
        try {
          const variables = []
          const temp = []

          // JSON parsing.
          for (const program of JSON.parse(rawData).programs) {
            if (temp.indexOf(program.program.genrePresseCode) == -1) {
              temp.push(program.program.genrePresseCode)

              variables.push({
                url: path.join(idChannel, 'show', String(program.program.genrePresseCode)),
                label: program.program.genrePresse,
                image: program.program.imageUrl
              })
            }
          }

          response.render('layout', {
            page: 'show',
            title: utils.t('The show'),
            titleChannels: utils.t('The channels'),
            variables
          })
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(utils.t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.error(utils.t('Got error: @@message@@', [error.message]))
    })
  },

  /**
   * Videos page.
   *
   * @param {object} request
   * @param {object} response
   */
  videos(request, response) {
    // Channel's ID.
    const idChannel = request.params.idChannel
    // Show's ID.
    const idShow = request.params.idShow
    // Show's URL.
    const urlShow = path.join(path.sep, global.language, 'channel', idChannel)
    // URL.
    const url = this.urlVideos.replace(/{{DATE}}/, `${this.date.getFullYear()}${this.date.getMonth()}${this.date.getDay()}`)

    // Get the JSON.
    http.get(url, (res) => {
      debug(utils.t('Videos: @@url@@', [url]))

      if (!utils.hasError(response, res)) {
        return
      }

      let rawData = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        rawData += chunk
      })
      res.on('end', () => {
        try {
          const variables = []
          let programTitle = ''

          // JSON parsing.
          for (const program of JSON.parse(rawData).programs) {
            if (program.program.genrePresseCode !== parseInt(idShow)) {
              continue
            }

            if (program.video) {
              programTitle = program.program.genrePresse
              variables.push({
                url: path.join(idShow, 'video', `${program.video.programId}%2F${program.video.kind}`),
                label: `${program.video.title} <span class="h6">[${program.broadcast.durationRounded / 60} min]</span>`,
                image: program.video.imageUrl
              })
            }
          }

          response.render('layout', {
            page: 'videos',
            title: programTitle,
            titleChannels: utils.t('The channels'),
            titleShow: utils.t('The show'),
            urlShow,
            variables
          })
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(utils.t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.error(utils.t('Got error: @@message@@', [error.message]))
    })
  },

  /**
   * Video's page.
   *
   * @param {object} request
   * @param {object} response
   */
  video(request, response) {
    // Channel's ID.
    const idChannel = request.params.idChannel
    // Show's URL.
    const urlShow = path.join(path.sep, global.language, 'channel', idChannel)
    // Videos URL.
    const urlVideos = path.join(path.sep, global.language, 'channel', idChannel, 'show', request.params.idShow)
    // URL.
    const url = this.urlVideo.replace(/{{ID}}/, request.params.idVideo)

    // Get the JSON.
    http.get(url, (res) => {
      debug(utils.t('Video: @@url@@', [url]))

      if (!utils.hasError(response, res)) {
        return
      }

      let rawData = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        rawData += chunk
      })
      res.on('end', () => {
        try {
          for (const video of JSON.parse(rawData).videoStreams) {
            if (video.quality === 'HQ' && (video.audioShortLabel === 'VF' || video.audioShortLabel === 'VOF')) {
              const urlVideo = video.url

              response.render('layout', {
                page: 'video',
                title: utils.t('The video'),
                titleChannels: utils.t('The channels'),
                titleShow: utils.t('The show'),
                titleVideos: utils.t('The videos'),
                download: utils.t('Download the video'),
                urlShow,
                urlVideos,
                urlVideo
              })
            }
          }
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(utils.t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.error(utils.t('Got error: @@message@@', [error.message]))
    })
  }

}

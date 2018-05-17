import Debug from 'debug'
import { get } from 'http'
import { join } from 'path'
import { hasError, t } from '../../lib/utils'

const debug = Debug('utils')

const channel = {

  date: new Date(),
  showUrl: 'http://www.arte.tv/hbbtvv2/services/web/index.php/OPA/v3/programs/{{DATE}}/fr',
  videosUrl: 'http://www.arte.tv/hbbtvv2/services/web/index.php/OPA/v3/programs/{{DATE}}/fr',
  videoUrl: 'http://www.arte.tv/hbbtvv2/services/web/index.php/OPA/v3/streams/{{ID}}/fr',

  /**
   * Show's page.
   *
   * @param {Object} request
   * @param {Object} response
   */
  show(request, response) {
    // Base URL.
    const baseUrl = request.baseUrl
    // Channel's ID.
    const channelId = request.params.channelId
    // URL.
    const url = this.showUrl.replace(/{{DATE}}/, `${this.date.getFullYear()}${this.date.getMonth()}${this.date.getDay()}`)

    // Get the JSON.
    get(url, (res) => {
      debug(t('Show: @@url@@', [url]))

      if (!hasError(response, res)) {
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
                url: join(channelId, 'show', String(program.program.genrePresseCode)),
                label: program.program.genrePresse,
                image: program.program.imageUrl
              })
            }
          }

          response.render('layout', {
            page: 'show',
            title: t('The show'),
            titleChannels: t('The channels'),
            baseUrl,
            variables
          })
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.error(t('Got error: @@message@@', [error.message]))
    })
  },

  /**
   * Videos page.
   *
   * @param {Object} request
   * @param {Object} response
   */
  videos(request, response) {
    // Base URL.
    const baseUrl = request.baseUrl
    // Channel's ID.
    const channelId = request.params.channelId
    // Show's ID.
    const showId = request.params.showId
    // Show's URL.
    const showUrl = join(baseUrl, 'channel', channelId)
    // URL.
    const url = this.videosUrl.replace(/{{DATE}}/, `${this.date.getFullYear()}${this.date.getMonth()}${this.date.getDay()}`)

    // Get the JSON.
    get(url, (res) => {
      debug(t('Videos: @@url@@', [url]))

      if (!hasError(response, res)) {
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
            if (program.program.genrePresseCode !== parseInt(showId)) {
              continue
            }

            if (program.video) {
              programTitle = program.program.genrePresse
              variables.push({
                url: join(showId, 'video', `${program.video.programId}%2F${program.video.kind}`),
                label: `${program.video.title} <span class="h6">[${program.broadcast.durationRounded / 60} min]</span>`,
                image: program.video.imageUrl
              })
            }
          }

          response.render('layout', {
            page: 'videos',
            title: programTitle,
            titleChannels: t('The channels'),
            titleShow: t('The show'),
            showUrl,
            baseUrl,
            variables
          })
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.error(t('Got error: @@message@@', [error.message]))
    })
  },

  /**
   * Video's page.
   *
   * @param {Object} request
   * @param {Object} response
   */
  video(request, response) {
    // Base URL.
    const baseUrl = request.baseUrl
    // Channel's ID.
    const channelId = request.params.channelId
    // Show's URL.
    const showUrl = join(baseUrl, 'channel', channelId)
    // Videos URL.
    const videosUrl = join(showUrl, 'show', request.params.showId)
    // URL.
    const url = this.videoUrl.replace(/{{ID}}/, request.params.videoId)

    // Get the JSON.
    get(url, (res) => {
      debug(t('Video: @@url@@', [url]))

      if (!hasError(response, res)) {
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
              const videoUrl = video.url

              response.render('layout', {
                page: 'video',
                title: t('The video'),
                titleChannels: t('The channels'),
                titleShow: t('The show'),
                titleVideos: t('The videos'),
                download: t('Download the video'),
                showUrl,
                videosUrl,
                baseUrl,
                videoUrl
              })
            }
          }
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.error(t('Got error: @@message@@', [error.message]))
    })
  }

}

export { channel }

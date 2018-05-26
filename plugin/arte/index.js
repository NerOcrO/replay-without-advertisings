import Debug from 'debug'
import { get } from 'http'
import { join } from 'path'
import { hasError } from '../../lib/utils'

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
   *   Request object.
   * @param {Object} response
   *   Response object.
   */
  show(request, response) {
    const url = this.showUrl.replace(/{{DATE}}/, `${this.date.getFullYear()}${this.date.getMonth()}${this.date.getDay()}`)

    // Get the JSON.
    get(url, (res) => {
      debug(response.t('Show: %s', url))

      if (hasError(response, res)) {
        return
      }

      let rawData = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        rawData += chunk
      })
      res.on('end', () => {
        try {
          response.locals.baseUrl = request.baseUrl
          response.locals.variables = JSON.parse(rawData).programs
            .filter((program, index, programs) => programs.slice(index + 1)
              .every(p => p.program.genrePresseCode !== program.program.genrePresseCode))
            .map(program => (
              {
                url: join(request.params.channelId, 'show', String(program.program.genrePresseCode)),
                label: program.program.genrePresse,
                image: program.program.imageUrl,
              }
            ))

          response.render('layout', {
            page: 'show',
            title: response.t('The show'),
            titleChannels: response.t('The channels'),
          })
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(response.t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.error(response.t('Got error: %s', error.message))
    })
  },

  /**
   * Videos page.
   *
   * @param {Object} request
   *   Request object.
   * @param {Object} response
   *   Response object.
   */
  videos(request, response) {
    const { baseUrl } = request
    const { showId } = request.params
    const url = this.videosUrl.replace(/{{DATE}}/, `${this.date.getFullYear()}${this.date.getMonth()}${this.date.getDay()}`)

    // Get the JSON.
    get(url, (res) => {
      debug(response.t('Videos: %s', url))

      if (hasError(response, res)) {
        return
      }

      let rawData = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        rawData += chunk
      })
      res.on('end', () => {
        try {
          response.locals.showUrl = join(baseUrl, 'channel', request.params.channelId)
          response.locals.variables = JSON.parse(rawData).programs
            .filter(program => program.program.genrePresseCode === parseInt(showId, 10))
            .map((program) => {
              if (program.video) {
                response.locals.title = program.program.genrePresse

                return {
                  url: join(showId, 'video', `${program.video.programId}%2F${program.video.kind}`),
                  label: `${program.video.title} <span class="h6">[${Math.floor((parseInt(program.video.durationSeconds, 10) / 60))} min]</span>`,
                  image: program.video.imageUrl,
                }
              }
            })

          response.render('layout', {
            page: 'videos',
            titleChannels: response.t('The channels'),
            titleShow: response.t('The show'),
            baseUrl,
          })
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(response.t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.error(response.t('Got error: %s', error.message))
    })
  },

  /**
   * Video's page.
   *
   * @param {Object} request
   *   Request object.
   * @param {Object} response
   *   Response object.
   */
  video(request, response) {
    const { baseUrl } = request
    const url = this.videoUrl.replace(/{{ID}}/, request.params.videoId)

    // Get the JSON.
    get(url, (res) => {
      debug(response.t('Video: %s', url))

      if (hasError(response, res)) {
        return
      }

      let rawData = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        rawData += chunk
      })
      res.on('end', () => {
        try {
          JSON.parse(rawData).videoStreams.forEach((video) => {
            if (video.quality === 'HQ' && (video.audioShortLabel === 'VF' || video.audioShortLabel === 'VOF')) {
              response.locals.showUrl = join(baseUrl, 'channel', request.params.channelId)
              response.locals.videosUrl = join(response.locals.showUrl, 'show', request.params.showId)

              response.render('layout', {
                page: 'video',
                title: response.t('The video'),
                titleChannels: response.t('The channels'),
                titleShow: response.t('The show'),
                titleVideos: response.t('The videos'),
                download: response.t('Download the video'),
                baseUrl,
                videoUrl: video.url,
              })
            }
          })
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(response.t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.error(response.t('Got error: %s', error.message))
    })
  },

}

export default channel

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
   *   Request object.
   * @param {Object} response
   *   Response object.
   */
  show(request, response) {
    // Base URL.
    const { baseUrl } = request
    // Channel's ID.
    const { channelId } = request.params
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
          const variables = JSON.parse(rawData).programs
            .filter((program, index, programs) => programs.slice(index + 1)
              .every(p => p.program.genrePresseCode !== program.program.genrePresseCode))
            .map((program) => {
              return {
                url: join(channelId, 'show', String(program.program.genrePresseCode)),
                label: program.program.genrePresse,
                image: program.program.imageUrl,
              }
            })

          response.render('layout', {
            page: 'show',
            title: t('The show'),
            titleChannels: t('The channels'),
            baseUrl,
            variables,
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
   *   Request object.
   * @param {Object} response
   *   Response object.
   */
  videos(request, response) {
    // Base URL.
    const { baseUrl } = request
    // Channel's ID.
    const { channelId } = request.params
    // Show's ID.
    const { showId } = request.params
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
          let programTitle = ''
          const variables = JSON.parse(rawData).programs
            .filter(program => program.program.genrePresseCode === parseInt(showId, 10))
            .map((program) => {
              if (program.video) {
                programTitle = program.program.genrePresse

                return {
                  url: join(showId, 'video', `${program.video.programId}%2F${program.video.kind}`),
                  label: `${program.video.title} <span class="h6">[${Math.floor((parseInt(program.video.durationSeconds, 10) / 60))} min]</span>`,
                  image: program.video.imageUrl,
                }
              }
            })

          response.render('layout', {
            page: 'videos',
            title: programTitle,
            titleChannels: t('The channels'),
            titleShow: t('The show'),
            showUrl,
            baseUrl,
            variables,
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
   *   Request object.
   * @param {Object} response
   *   Response object.
   */
  video(request, response) {
    // Base URL.
    const { baseUrl } = request
    // Channel's ID.
    const { channelId } = request.params
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
          JSON.parse(rawData).videoStreams.forEach((video) => {
            if (video.quality === 'HQ' && (video.audioShortLabel === 'VF' || video.audioShortLabel === 'VOF')) {
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
                videoUrl: video.url,
              })
            }
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

}

export default channel

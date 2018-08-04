import fetch from 'node-fetch'
import Debug from 'debug'
import { join } from 'path'
import { fetchErrorHandler } from '../../lib/utils'

const debug = Debug('replay')

const channel = {

  baseReplayUrl: 'https://www.arte.tv/hbbtvv2/services/web/index.php/OPA/v3/',

  /**
   * Show's page.
   *
   * @param {Request} request
   *   Request object.
   * @param {Response} response
   *   Response object.
   */
  async show(request, response) {
    await fetch(`${this.baseReplayUrl}programs/${request.date.getFullYear()}/fr`)
      .then((res) => {
        debug(response.t('Show: %s', res.url))

        return res.json()
      })
      .then((res) => {
        response.locals.baseUrl = request.baseUrl
        response.locals.variables = res.programs
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
          title: request.params.channelId.toUpperCase(),
          titleChannels: response.t('The channels'),
        })
      })
      .catch((error) => {
        fetchErrorHandler(error, response)
      })
  },

  /**
   * Videos page.
   *
   * @param {Request} request
   *   Request object.
   * @param {Response} response
   *   Response object.
   */
  async videos(request, response) {
    const { baseUrl } = request
    const { showId } = request.params

    await fetch(`${this.baseReplayUrl}programs/${request.date.getFullYear()}/fr`)
      .then((res) => {
        debug(response.t('Videos: %s', res.url))

        return res.json()
      })
      .then((res) => {
        response.locals.showUrl = join(baseUrl, 'channel', request.params.channelId)
        response.locals.variables = res.programs
          .filter(program => program.program.genrePresseCode === parseInt(showId, 10))
          .map((program) => {
            let url = ''
            let label = ''
            let image = ''

            if (program.video) {
              response.locals.title = program.program.genrePresse

              url = join(showId, 'video', `${program.video.programId}%2F${program.video.kind}`)
              label = `${program.video.title} <span class="h6">[${Math.floor((parseInt(program.video.durationSeconds, 10) / 60))} min]</span>`
              image = program.video.imageUrl
            }
            else {
              url = ''
              label = response.t('Video unabled.')
              image = ''
            }

            return {
              url,
              label,
              image,
            }
          })

        response.render('layout', {
          page: 'videos',
          titleChannels: response.t('The channels'),
          titleShow: request.params.channelId.toUpperCase(),
          baseUrl,
        })
      })
      .catch((error) => {
        fetchErrorHandler(error, response)
      })
  },

  /**
   * Video's page.
   *
   * @param {Request} request
   *   Request object.
   * @param {Response} response
   *   Response object.
   */
  async video(request, response) {
    const { baseUrl } = request

    await fetch(`${this.baseReplayUrl}streams/${request.params.videoId}/fr`)
      .then((res) => {
        debug(response.t('Video: %s', res.url))

        return res.json()
      })
      .then((res) => {
        res.videoStreams.forEach((video) => {
          if (video.quality === 'HQ' && (video.audioShortLabel === 'VF' || video.audioShortLabel === 'VOF')) {
            response.locals.showUrl = join(baseUrl, 'channel', request.params.channelId)
            response.locals.videosUrl = join(response.locals.showUrl, 'show', request.params.showId)

            response.render('layout', {
              page: 'video',
              title: response.t('The video'),
              titleChannels: response.t('The channels'),
              titleShow: request.params.channelId.toUpperCase(),
              titleVideos: response.t('The videos'),
              download: response.t('Download the video'),
              baseUrl,
              videoUrl: video.url,
            })
          }
        })
      })
      .catch((error) => {
        fetchErrorHandler(error, response)
      })
  },

}

export default channel

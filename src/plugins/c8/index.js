import fetch from 'node-fetch'
import Debug from 'debug'
import { join } from 'path'
import { fetchErrorHandler } from '../../lib/utils'

const debug = Debug('replay')

const channel = {

  baseReplayUrl: 'https://service.mycanal.fr/',

  /**
   * Show's page.
   *
   * @param {Request} request
   *   Request object.
   * @param {Response} response
   *   Response object.
   */
  async show(request, response) {
    await fetch(`${this.baseReplayUrl}page/f7a409073d5e935fd5ee776ae284b644/4578.json`)
      .then((res) => {
        debug(response.t('Show: %s', res.url))

        return res.json()
      })
      .then((res) => {
        response.locals.baseUrl = request.baseUrl
        response.locals.variables = res.strates[0].contents.map(program => (
          {
            url: join(request.params.channelId, 'show', program.onClick.URLPage.match(/(\d+).json/)[1]),
            label: program.onClick.displayName,
            image: program.URLImageCompact,
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

    fetch(`${this.baseReplayUrl}page/f7a409073d5e935fd5ee776ae284b644/${showId}.json`)
      .then((res) => {
        debug(response.t('Videos: %s', res.url))

        return res.json()
      })
      .then((res) => {
        response.locals.showUrl = join(baseUrl, 'channel', request.params.channelId)
        response.locals.variables = res.strates
          .filter(strate => strate.type === 'contentRow')
          .reduce((accumulator, program) => accumulator.concat(program.contents), [])
          .map(value => (
            {
              url: join(showId, 'video', value.onClick.URLPage.match(/(\d+).json/)[1]),
              label: `${value.title}<br>${value.subtitle}`,
              image: value.URLImage,
            }
          ))

        response.render('layout', {
          page: 'videos',
          title: res.currentPage.displayName,
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
    const showUrl = join(baseUrl, 'channel', request.params.channelId)

    fetch(`${this.baseReplayUrl}getMediaUrl/f7a409073d5e935fd5ee776ae284b644/${request.params.videoId}.json?pfv={FORMAT}`)
      .then((res) => {
        debug(response.t('Video: %s', res.url))

        return res.json()
      })
      .then((res) => {
        response.locals.videosUrl = join(showUrl, 'show', request.params.showId)
        response.locals.videoUrl = res.detail.informations.videoURLs[0].videoURL

        response.render('layout', {
          page: 'video',
          title: `${res.detail.informations.title} | ${res.detail.informations.subtitle}`,
          titleChannels: response.t('The channels'),
          titleShow: request.params.channelId.toUpperCase(),
          titleVideos: response.t('The videos'),
          download: response.t('Download the video'),
          showUrl,
          baseUrl,
        })
      })
      .catch((error) => {
        fetchErrorHandler(error, response)
      })
  },

}

export default channel

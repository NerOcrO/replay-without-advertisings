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
    const res = await fetch(`${this.baseReplayUrl}page/f7a409073d5e935fd5ee776ae284b644/4578.json`)

    try {
      debug(response.t('Show: %s', res.url))

      const data = await res.json()

      response.locals.baseUrl = request.baseUrl
      response.locals.variables = data.strates[0].contents.map(program => (
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
    }
    catch (error) {
      fetchErrorHandler(error, response)
    }
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
    const res = await fetch(`${this.baseReplayUrl}page/f7a409073d5e935fd5ee776ae284b644/${showId}.json`)

    try {
      debug(response.t('Videos: %s', res.url))

      const data = await res.json()

      response.locals.showUrl = join(baseUrl, 'channel', request.params.channelId)
      response.locals.variables = data.strates
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
        title: data.currentPage.displayName,
        titleChannels: response.t('The channels'),
        titleShow: request.params.channelId.toUpperCase(),
        baseUrl,
      })
    }
    catch (error) {
      fetchErrorHandler(error, response)
    }
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
    const res = await fetch(`${this.baseReplayUrl}getMediaUrl/f7a409073d5e935fd5ee776ae284b644/${request.params.videoId}.json?pfv={FORMAT}`)

    try {
      debug(response.t('Video: %s', res.url))

      const data = await res.json()

      response.locals.videosUrl = join(showUrl, 'show', request.params.showId)
      response.locals.videoUrl = data.detail.informations.videoURLs[0].videoURL

      response.render('layout', {
        page: 'video',
        title: `${data.detail.informations.title} | ${data.detail.informations.subtitle}`,
        titleChannels: response.t('The channels'),
        titleShow: request.params.channelId.toUpperCase(),
        titleVideos: response.t('The videos'),
        download: response.t('Download the video'),
        showUrl,
        baseUrl,
      })
    }
    catch (error) {
      fetchErrorHandler(error, response)
    }
  },

}

export default channel

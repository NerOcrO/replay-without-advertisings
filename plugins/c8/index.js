import axios from 'axios'
import Debug from 'debug'
import { join } from 'path'
import { axiosErrorHandler } from '../../lib/utils'

const debug = Debug('replay')

axios.defaults.baseURL = 'https://service.mycanal.fr/'

const channel = {

  showUrl: 'page/f7a409073d5e935fd5ee776ae284b644/4578.json',
  videosUrl: 'page/f7a409073d5e935fd5ee776ae284b644/{{ID}}.json',
  videoUrl: 'getMediaUrl/f7a409073d5e935fd5ee776ae284b644/{{ID}}.json',

  /**
   * Show's page.
   *
   * @param {Request} request
   *   Request object.
   * @param {Response} response
   *   Response object.
   */
  show(request, response) {
    const url = this.showUrl

    // Get the JSON.
    axios.get(url)
      .then((res) => {
        debug(response.t('Show: %s', url))

        response.locals.baseUrl = request.baseUrl
        response.locals.variables = res.data.strates[0].contents.map(program => (
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
      .catch(error => axiosErrorHandler(error, response))
  },

  /**
   * Videos page.
   *
   * @param {Request} request
   *   Request object.
   * @param {Response} response
   *   Response object.
   */
  videos(request, response) {
    const { baseUrl } = request
    const { showId } = request.params
    const url = this.videosUrl.replace(/{{ID}}/, showId)

    // Get the JSON.
    axios.get(url)
      .then((res) => {
        debug(response.t('Videos: %s', url))

        response.locals.showUrl = join(baseUrl, 'channel', request.params.channelId)
        response.locals.variables = res.data.strates
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
          title: res.data.currentPage.displayName,
          titleChannels: response.t('The channels'),
          titleShow: request.params.channelId.toUpperCase(),
          baseUrl,
        })
      })
      .catch(error => axiosErrorHandler(error, response))
  },

  /**
   * Video's page.
   *
   * @param {Request} request
   *   Request object.
   * @param {Response} response
   *   Response object.
   */
  video(request, response) {
    const { baseUrl } = request
    const showUrl = join(baseUrl, 'channel', request.params.channelId)
    const url = this.videoUrl.replace(/{{ID}}/, request.params.videoId)

    // Get the JSON.
    axios.get(url, { params: { pfv: '{FORMAT}' } })
      .then((res) => {
        debug(response.t('Video: %s', url))

        response.locals.videosUrl = join(showUrl, 'show', request.params.showId)
        response.locals.videoUrl = res.data.detail.informations.videoURLs[0].videoURL

        response.render('layout', {
          page: 'video',
          title: `${res.data.detail.informations.title} | ${res.data.detail.informations.subtitle}`,
          titleChannels: response.t('The channels'),
          titleShow: request.params.channelId.toUpperCase(),
          titleVideos: response.t('The videos'),
          download: response.t('Download the video'),
          showUrl,
          baseUrl,
        })
      })
      .catch(error => axiosErrorHandler(error, response))
  },

}

export default channel

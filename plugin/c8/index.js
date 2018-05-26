import Debug from 'debug'
import { get } from 'http'
import { join } from 'path'
import { hasError } from '../../lib/utils'

const debug = Debug('utils')

const channel = {

  showUrl: 'http://service.mycanal.fr/page/f7a409073d5e935fd5ee776ae284b644/4578.json',
  videosUrl: 'http://service.mycanal.fr/page/f7a409073d5e935fd5ee776ae284b644/{{ID}}.json',
  videoUrl: 'http://service.mycanal.fr/getMediaUrl/f7a409073d5e935fd5ee776ae284b644/{{ID}}.json?pfv={FORMAT}',

  /**
   * Show's page.
   *
   * @param {Object} request
   *   Request object.
   * @param {Object} response
   *   Response object.
   */
  show(request, response) {
    const url = this.showUrl

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
          response.locals.variables = JSON.parse(rawData).strates[0].contents.map((program) => {
            return {
              url: join(request.params.channelId, 'show', program.onClick.URLPage.match(/(\d+).json/)[1]),
              label: program.onClick.displayName,
              image: program.URLImageCompact,
            }
          })

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
    const url = this.videosUrl.replace(/{{ID}}/, showId)

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
          const data = JSON.parse(rawData)

          response.locals.showUrl = join(baseUrl, 'channel', request.params.channelId)
          response.locals.variables = data.strates
            .filter(strate => strate.type === 'contentRow')
            .reduce((accumulator, program) => accumulator.concat(program.contents), [])
            .map((value) => {
              return {
                url: join(showId, 'video', value.onClick.URLPage.match(/(\d+).json/)[1]),
                label: `${value.title}<br>${value.subtitle}`,
                image: value.URLImage,
              }
            })

          response.render('layout', {
            page: 'videos',
            title: data.currentPage.displayName,
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
    const showUrl = join(baseUrl, 'channel', request.params.channelId)
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
          const data = JSON.parse(rawData)

          response.locals.videosUrl = join(showUrl, 'show', request.params.showId)
          response.locals.videoUrl = data.detail.informations.videoURLs[0].videoURL

          response.render('layout', {
            page: 'video',
            title: `${data.detail.informations.title} | ${data.detail.informations.subtitle}`,
            titleChannels: response.t('The channels'),
            titleShow: response.t('The show'),
            titleVideos: response.t('The videos'),
            download: response.t('Download the video'),
            showUrl,
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

}

export default channel

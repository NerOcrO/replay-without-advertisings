import Debug from 'debug'
import { get } from 'http'
import { join } from 'path'
import { hasError, t } from '../../lib/utils'

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
    // Base URL.
    const { baseUrl } = request
    // Channel's ID.
    const { channelId } = request.params
    // URL.
    const url = this.showUrl

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
          const variables = JSON.parse(rawData).strates[0].contents.map((program) => {
            return {
              url: join(channelId, 'show', program.onClick.URLPage.match(/(\d+).json/)[1]),
              label: program.onClick.displayName,
              image: program.URLImageCompact,
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
    const url = this.videosUrl.replace(/{{ID}}/, showId)

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
          const data = JSON.parse(rawData)
          const variables = data.strates
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
          const data = JSON.parse(rawData)
          const videoUrl = data.detail.informations.videoURLs[0].videoURL

          response.render('layout', {
            page: 'video',
            title: `${data.detail.informations.title} | ${data.detail.informations.subtitle}`,
            titleChannels: t('The channels'),
            titleShow: t('The show'),
            titleVideos: t('The videos'),
            download: t('Download the video'),
            showUrl,
            videosUrl,
            baseUrl,
            videoUrl,
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

import Debug from 'debug'
import { get } from 'http'
import { join } from 'path'
import { hasError, t } from '../../lib/utils'

const debug = Debug('utils')

const channel = {

  urlShow: 'http://service.mycanal.fr/page/f7a409073d5e935fd5ee776ae284b644/4578.json',
  urlVideos: 'http://service.mycanal.fr/page/f7a409073d5e935fd5ee776ae284b644/{{ID}}.json',
  urlVideo: 'http://service.mycanal.fr/getMediaUrl/f7a409073d5e935fd5ee776ae284b644/{{ID}}.json?pfv={FORMAT}',

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
    const idChannel = request.params.idChannel
    // URL.
    const url = this.urlShow

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

          // JSON parsing.
          for (const program of JSON.parse(rawData).strates[0].contents) {
            const idShow = program.onClick.URLPage.match(/(\d+).json/)

            variables.push({
              url: join(idChannel, 'show', idShow[1]),
              label: program.onClick.displayName,
              image: program.URLImageCompact
            })
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
    const idChannel = request.params.idChannel
    // Show's ID.
    const idShow = request.params.idShow
    // Show's URL.
    const urlShow = join(baseUrl, 'channel', idChannel)
    // URL.
    const url = this.urlVideos.replace(/{{ID}}/, idShow)

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
          const data = JSON.parse(rawData)

          // JSON parsing.
          for (const strate of data.strates) {
            if (strate.type !== 'contentRow') {
              continue
            }

            for (const value of strate.contents) {
              const idVideo = value.onClick.URLPage.match(/(\d+).json/)

              variables.push({
                url: join(idShow, 'video', idVideo[1]),
                label: value.onClick.displayName,
                image: value.URLImage
              })
            }
          }

          response.render('layout', {
            page: 'videos',
            title: data.currentPage.displayName,
            titleChannels: t('The channels'),
            titleShow: t('The show'),
            urlShow,
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
    const idChannel = request.params.idChannel
    // Show's URL.
    const urlShow = join(baseUrl, 'channel', idChannel)
    // Videos URL.
    const urlVideos = join(baseUrl, 'channel', idChannel, 'show', request.params.idShow)
    // URL.
    const url = this.urlVideo.replace(/{{ID}}/, request.params.idVideo)

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
          const urlVideo = data.detail.informations.videoURLs[0].videoURL

          response.render('layout', {
            page: 'video',
            title: data.detail.informations.title,
            titleChannels: t('The channels'),
            titleShow: t('The show'),
            titleVideos: t('The videos'),
            download: t('Download the video'),
            urlShow,
            urlVideos,
            baseUrl,
            urlVideo
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
  }

}

export { channel }

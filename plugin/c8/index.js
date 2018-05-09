const http = require('http')
const tools = require('../../tools')

module.exports = {
  urlShow: 'http://service.mycanal.fr/page/f7a409073d5e935fd5ee776ae284b644/4578.json',
  urlVideos: 'http://service.mycanal.fr/page/f7a409073d5e935fd5ee776ae284b644/{{ID}}.json',
  urlVideo: 'http://service.mycanal.fr/getMediaUrl/f7a409073d5e935fd5ee776ae284b644/{{ID}}.json?pfv={FORMAT}',

  show(request, response) {
    // Channel's ID.
    const idChannel = request.params.idChannel
    // Channel's URL.
    const urlChannel = `/${global.logger}/channel/${idChannel}`
    // URL.
    const url = this.urlShow

    // Get the JSON.
    http.get(url, (res) => {
      console.log(tools.t('Show: @@url@@', [url]))

      if (!tools.hasError(response, res)) {
        return
      }

      let rawData = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { rawData += chunk })
      res.on('end', () => {
        const variables = []

        try {
          // JSON parsing.
          JSON.parse(rawData).strates[0].contents.forEach((value) => {
            const idShow = value.onClick.URLPage.match(/(\d+).json/)

            variables.push({
              url: `/${global.logger}/channel/${idChannel}/show/${idShow[1]}`,
              label: value.onClick.displayName,
              image: value.URLImageCompact
            })
          })

          response.render('layout', {
            page: 'show',
            title: tools.t('The show'),
            titleChannels: tools.t('The channels'),
            urlChannel,
            variables
          })
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(tools.t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.log(tools.t('Got error: @@message@@', [error.message]))
    })
  },

  videos(request, response) {
    // Channel's ID.
    const idChannel = request.params.idChannel
    // Show's ID.
    const idShow = request.params.idShow
    // Channel's URL.
    const urlChannel = `/${global.logger}/channel/${idChannel}`
    // Show's URL.
    const urlShow = `/${global.logger}/channel/${idChannel}/show/${idShow}`
    // URL.
    const url = this.urlVideos.replace(/{{ID}}/, idShow)

    // Get the JSON.
    http.get(url, (res) => {
      console.log(tools.t('Videos: @@url@@', [url]))

      if (!tools.hasError(response, res)) {
        return
      }

      let rawData = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { rawData += chunk })
      res.on('end', () => {
        try {
          const variables = []
          const data = JSON.parse(rawData)

          // JSON parsing.
          data.strates.forEach((strate) => {
            if (strate.type !== 'contentRow') {
              return
            }

            strate.contents.forEach((value) => {
              const idVideo = value.onClick.URLPage.match(/(\d+).json/)

              variables.push({
                url: `/${global.logger}/channel/${idChannel}/show/${idShow}/video/${idVideo[1]}`,
                label: value.onClick.displayName,
                image: value.URLImage
              })
            })
          })

          response.render('layout', {
            page: 'videos',
            title: data.currentPage.displayName,
            titleChannels: tools.t('The channels'),
            titleShow: tools.t('The show'),
            urlChannel,
            urlShow,
            variables
          })
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(tools.t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.log(tools.t('Got error: @@message@@', [error.message]))
    })
  },

  video(request, response) {
    // Channel's ID.
    const idChannel = request.params.idChannel
    // Channel's URL.
    const urlChannel = `/${global.logger}/channel/${idChannel}`
    // Show's URL.
    const urlShow = `/${global.logger}/channel/${idChannel}/show/${request.params.idShow}`
    // URL.
    const url = this.urlVideo.replace(/{{ID}}/, request.params.idVideo)

    // Get the JSON.
    http.get(url, (res) => {
      console.log(tools.t('Video: @@url@@', [url]))

      if (!tools.hasError(response, res)) {
        return
      }

      let rawData = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { rawData += chunk })
      res.on('end', () => {
        try {
          const data = JSON.parse(rawData)
          const urlVideo = data.detail.informations.videoURLs[0].videoURL

          response.render('layout', {
            page: 'video',
            title: data.detail.informations.title,
            titleChannels: tools.t('The channels'),
            titleShow: tools.t('The show'),
            titleVideos: tools.t('The videos'),
            download: tools.t('Download the video'),
            urlChannel,
            urlShow,
            urlVideo
          })
        }
        catch (error) {
          console.error(error.message)
          response.status(500).send(tools.t('Sorry, there is something wrong!'))
        }
      })
    }).on('error', (error) => {
      console.log(tools.t('Got error: @@message@@', [error.message]))
    })
  }
}

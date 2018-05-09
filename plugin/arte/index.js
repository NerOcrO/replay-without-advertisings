const http = require('http')
const tools = require('../../tools')

module.exports = {
  date: new Date(),
  urlShow: 'http://www.arte.tv/hbbtvv2/services/web/index.php/OPA/v3/programs/{{DATE}}/fr',
  urlVideos: 'http://www.arte.tv/hbbtvv2/services/web/index.php/OPA/v3/programs/{{DATE}}/fr',
  urlVideo: 'http://www.arte.tv/hbbtvv2/services/web/index.php/OPA/v3/streams/{{ID}}/fr',

  show(request, response) {
    // Channel's ID.
    const idChannel = request.params.idChannel
    // Channel's URL.
    const urlChannel = `/${global.language}/channel/${idChannel}`
    // URL.
    const url = this.urlShow.replace(/{{DATE}}/, `${this.date.getFullYear()}${this.date.getMonth()}${this.date.getDay()}`)

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
        try {
          const variables = []
          const temp = []

          // JSON parsing.
          for (const program of JSON.parse(rawData).programs) {
            if (temp.indexOf(program.program.genrePresseCode) == -1) {
              temp.push(program.program.genrePresseCode)

              variables.push({
                url: `/${global.language}/channel/${idChannel}/show/${program.program.genrePresseCode}`,
                label: program.program.genrePresse,
                image: program.program.imageUrl
              })
            }
          }

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
    const urlChannel = `/${global.language}/channel/${idChannel}`
    // Show's URL.
    const urlShow = `/${global.language}/channel/${idChannel}/show/${idShow}`
    // URL.
    const url = this.urlVideos.replace(/{{DATE}}/, `${this.date.getFullYear()}${this.date.getMonth()}${this.date.getDay()}`)

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
          let programTitle = ''

          // JSON parsing.
          for (const program of JSON.parse(rawData).programs) {
            if (program.program.genrePresseCode !== parseInt(idShow)) {
              continue
            }

            if (program.video) {
              programTitle = program.program.genrePresse
              variables.push({
                url: `/${global.language}/channel/${idChannel}/show/${idShow}/video/${program.video.programId}%2F${program.video.kind}`,
                label: `${program.video.title} <span class="h6">[${program.broadcast.durationRounded / 60} min]</span>`,
                image: program.video.imageUrl
              })
            }
          }

          response.render('layout', {
            page: 'videos',
            title: programTitle,
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
    const urlChannel = `/${global.language}/channel/${idChannel}`
    // Show's URL.
    const urlShow = `/${global.language}/channel/${idChannel}/show/${request.params.idShow}`
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
          for (const video of JSON.parse(rawData).videoStreams) {
            if (video.quality === 'HQ' && (video.audioShortLabel === 'VF' || video.audioShortLabel === 'VOF')) {
              const urlVideo = video.url

              response.render('layout', {
                page: 'video',
                title: tools.t('The video'),
                titleChannels: tools.t('The channels'),
                titleShow: tools.t('The show'),
                titleVideos: tools.t('The videos'),
                download: tools.t('Download the video'),
                urlChannel,
                urlShow,
                urlVideo
              })
            }
          }
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

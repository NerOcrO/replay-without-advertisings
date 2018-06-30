(() => {
  'use strict'

  const $ = selector => document.querySelector(selector)
  const getDarkTheme = JSON.parse(localStorage.getItem('darkTheme'))
  const setSunTheme = () => {
    const nightMode = $('#nightMode')
    nightMode.innerHTML = '🌞'
    nightMode.className = 'btn btn-light'
    nightMode.title = 'Clair'
    $('body').className = 'dark-theme'
  }
  const changeBackground = (event) => {
    const darkTheme = getDarkTheme || { data: false }

    if (darkTheme.data) {
      event.originalTarget.innerHTML = '🌙'
      event.originalTarget.className = 'btn btn-dark'
      event.originalTarget.title = 'Foncé'
      $('body').classList.remove('dark-theme')
    }
    else {
      setSunTheme()
    }

    darkTheme.data = !darkTheme.data
    localStorage.setItem('darkTheme', JSON.stringify(darkTheme))
  }

  $('#nightMode').addEventListener('click', changeBackground)

  if (getDarkTheme.data) {
    setSunTheme()
  }
})()

(() => {
  'use strict'

  const $ = selector => document.querySelector(selector)
  const getDarkTheme = (item = 'darkTheme') => JSON.parse(localStorage.getItem(item))
  const setLightTheme = (event) => {
    event.originalTarget.innerHTML = '🌙'
    event.originalTarget.className = 'btn btn-dark'
    event.originalTarget.title = 'Dark'
    $('body').classList.remove('dark-theme')
  }
  const setDarkTheme = () => {
    const nightMode = $('#nightMode')
    nightMode.innerHTML = '🌞'
    nightMode.className = 'btn btn-light'
    nightMode.title = 'Light'
    $('body').className = 'dark-theme'
  }
  const changeBackground = (event) => {
    const { data } = getDarkTheme() || { data: false }

    if (data) {
      setLightTheme(event)
    }
    else {
      setDarkTheme()
    }

    localStorage.setItem('darkTheme', JSON.stringify({ data: !data }))
  }

  $('#nightMode').addEventListener('click', changeBackground)

  if (getDarkTheme() && getDarkTheme().data) {
    setDarkTheme()
  }
})()

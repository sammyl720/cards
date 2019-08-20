const ge = (id) => document.getElementById(id)
const container = ge('container')
const back = ge('back')
const img = ge('img')
const play = back.dataset.song === 'true'
const confetti = back.dataset.confetti === 'true'
const song = new Audio('/public/assets/audio/bdaysong.mp3')
img.style.background = `url(${img.dataset.img})`
img.style.backgroundSize = 'cover'
img.style.backgroundPosition = 'center'
container.addEventListener('click', () => {
  if (!back.classList.contains('active')) {
    back.classList.add('active')
    container.classList.add('open')
    if (confetti) {
      document.body.id = 'confetti'
    }
    if (play) song.play()
  } else {
    back.classList.remove('active')
    container.classList.remove('open')
    document.body.id = ''
    if (play) song.pause()
  }
})
back.addEventListener('click', () => {
  back.classList.remove('active')
  container.classList.remove('open')
  document.body.id = ''
  song.pause()
})
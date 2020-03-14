import { ATT_MIN, ATT_MULT } from '@/constants.js'

const shuffle = array => {
  let i = array.length,
    temp,
    j

  // While there remain elements to shuffle…
  while (i) {
    // Pick a remaining element…
    j = Math.floor(Math.random() * i--)

    // And swap it with the current element.
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }

  return array
}

const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length

const getFormedScore = unit => {
  return (
    (unit.att - ATT_MIN) * ATT_MULT[0] +
    (unit.def - ATT_MIN) * ATT_MULT[1] +
    (unit.com - ATT_MIN) * ATT_MULT[2] +
    (unit.tac - ATT_MIN) * ATT_MULT[3] +
    (unit.sta - ATT_MIN) * ATT_MULT[4]
  )
}

const getRandomColor = () => {
  const rnd = () => Math.floor(Math.random() * 255)
  return `rgba(${rnd()}, ${rnd()}, ${rnd()}, 0.3)`
}

// math helper...
const valueToPoint = (value, index, total) => {
  const x = 0
  const y = -value * 0.8
  const angle = ((Math.PI * 2) / total) * index
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const tx = x * cos - y * sin + 100
  const ty = x * sin + y * cos + 100
  return {
    x: tx,
    y: ty
  }
}

export { shuffle, average, getFormedScore, getRandomColor, valueToPoint }

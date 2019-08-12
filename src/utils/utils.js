import { ATT_MIN, ATT_MULT } from '@/constants.js'

let shuffle = array => {
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

let average = arr => arr.reduce((a, b) => a + b, 0) / arr.length

let getFormedScore = unit => {
  return (
    (unit.att - ATT_MIN) * ATT_MULT[0] +
    (unit.def - ATT_MIN) * ATT_MULT[1] +
    (unit.com - ATT_MIN) * ATT_MULT[2] +
    (unit.tac - ATT_MIN) * ATT_MULT[3] +
    (unit.sta - ATT_MIN) * ATT_MULT[4]
  )
}

let getRandomColor = () => {
  const rnd = () => Math.floor(Math.random() * 255)
  return `rgba(${rnd()}, ${rnd()}, ${rnd()}, 0.3)`
}

export { shuffle, average, getFormedScore, getRandomColor }

import { ATT_MIN, ATT_MULT, ATTS } from '@/constants.js'

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

const averages2d = array2d => {
  const sums = []
  array2d.forEach(row => {
    row.forEach((_, ri) => {
      sums[ri] = sums[ri] ? sums[ri] + row[ri] : row[ri]
    })
  })
  return sums.map(avg => avg / array2d.length)
}

const getAllAverages = players => {
  const playersAtts = players.map(pl => pl.attributes)
  const averages = []

  for (const playerIndex in playersAtts) {
    for (const key in playersAtts[playerIndex]) {
      const value = playersAtts[playerIndex][key]
      averages[key] = averages[key] ? averages[key] + value : value
    }
  }

  Object.keys(averages).map(key => (averages[key] /= ATTS.length))
  console.log(averages)
  return averages
}

const getFormedScore = attributes => {
  return Object.keys(attributes)
    .map((key, i) => (attributes[key] - ATT_MIN) * ATT_MULT[i])
    .reduce((acc, cur) => acc + cur)
}

const configAttributes = averages => {
  return averages.reduce((acc, cur, i) => {
    return { ...acc, [ATTS[i]]: cur }
  }, {})
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

export {
  shuffle,
  average,
  getFormedScore,
  getRandomColor,
  valueToPoint,
  configAttributes,
  getAllAverages,
  averages2d
}

let shuffle = function(array) {
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

let sum = arr => arr.reduce((a, b) => a + b, 0)

let passWithout = (obj, key) => {
  // eslint-disable-next-line no-unused-vars
  const { [key]: deletedKey, ...otherKeys } = obj
  return otherKeys
}

export { shuffle, average, sum, passWithout }

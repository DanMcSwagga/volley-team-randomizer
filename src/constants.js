const ATT_MIN = 1 // < than lowest attribute score

// Normalize: ATT_MULT.map(x => (x * 100) / ATT_MULT.reduce((curr, acc) => acc + curr))
const ATT_MULT = [
  1.2755102040816326,
  1.2755102040816326,
  1.1224489795918366,
  1.0714285714285714,
  0.8163265306122448,
  0.8673469387755102,
  0.9693877551020408,
  0.9693877551020408,
  0.8163265306122448,
  0.8163265306122448
] // attribute multipliers

const ATTS = [
  'pas',
  'rec',
  'ser',
  'spi',
  'spe',
  'jum',
  'com',
  'sta',
  'vis',
  'tac'
] // attribute keys

const DUMMY = false // condition whether to include dummies

const API_KEY_WEATHER = 'f7ba91b3d1dc4cd09c0774fbdcfcae8b'
const CURRENT_WEATHER = `https://api.weatherbit.io/v2.0/current?city=Khotyanivka,UA&lang=ru&key=${API_KEY_WEATHER}`

export { ATT_MIN, ATT_MULT, ATTS, DUMMY, API_KEY_WEATHER, CURRENT_WEATHER }

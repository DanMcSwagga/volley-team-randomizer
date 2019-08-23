const ATT_MIN = 2 // < than lowest attribute score
const ATT_MULT = [4, 4, 1, 3, 2] // attribute multipliers

const DUMMY = true // condition whether to include dummies

const API_KEY_WEATHER = 'f7ba91b3d1dc4cd09c0774fbdcfcae8b'
const CURRENT_WEATHER = `https://api.weatherbit.io/v2.0/current?city=Khotyanivka,UA&lang=ru&key=${API_KEY_WEATHER}`

export { ATT_MIN, ATT_MULT, DUMMY, API_KEY_WEATHER, CURRENT_WEATHER }

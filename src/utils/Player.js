import { getFormedScore } from './utils.js'

export default class Player {
  constructor(name, attributes, score = 0, isExtra = false) {
    this.name = name
    this.attributes = attributes
    this.score = score
    this.isExtra = isExtra
  }

  calculateScore() {
    if (this.score && this.score !== 0) this.score = 0 // Reset
    this.score = getFormedScore(this.attributes)
  }

  toString() {
    return (
      this.name +
      ': ALL ' +
      `<b> ${this.score.toFixed(2)} </b>` +
      ' | attributes ' +
      this.attributes
    )
  }
}

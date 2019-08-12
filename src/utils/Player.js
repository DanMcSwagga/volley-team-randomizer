import { getFormedScore } from './utils.js'

export default class Player {
  constructor(name, att, def, com, tac, sta, score = 0, isExtra = false) {
    this.name = name
    this.att = att
    this.def = def
    this.com = com
    this.tac = tac
    this.sta = sta
    this.score = score
    this.isExtra = isExtra
  }

  calculateScore() {
    if (this.score && this.score !== 0) this.score = 0 // Reset
    this.score = getFormedScore(this)
  }

  toString() {
    return (
      this.name +
      ': ALL ' +
      `<b> ${this.score.toFixed(2)} </b>` +
      ' | att ' +
      this.att +
      ' | def ' +
      this.def +
      ' | com ' +
      this.com +
      ' | tac ' +
      this.tac +
      ' | sta ' +
      this.sta
    )
  }
}

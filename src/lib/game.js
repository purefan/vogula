import Debug from 'debug'
const debug = Debug('vogula:lib:game')

/**
 * Interacts with the database and prepares a db-compatible object
 */

class Game {
    constructor(param) {
        this.event = param.event
        this.site = param.site
        this.date = param.date
        this.round = param.round
        this.white = param.white
        this.black = param.black
        this.source = param.source
        this.external_id = param.external_id
        this.result = param.result
        this.white_elo = param.white_elo
        this.black_elo = param.black_elo
        this.moves = param.moves
    }

    get timestamp() {
        const log = debug.extend('timestamp')
        const when = new Date(this.date)
        log('this date', this.date)
        log('when', when)
        return when.getTime()
    }
}

export default Game * /
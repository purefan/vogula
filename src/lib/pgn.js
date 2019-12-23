const Chess = require('chess.js')
const m = require('mithril')
const stream = require('mithril/stream')

class MovesList {
    constructor() {
        this.moves = {}
        this.vnodes = stream(m('div', '<no moves>'))
        this.half_move = -1
        const initial_position = new Move({
            san: '',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        })
        this.add_move(initial_position)
        this.current_move = initial_position.id
    }

    get next_move() {
        return this.moves[ this.moves[ this.current_move ].next_move ] || false
    }

    /**
     *
     * @param {Move} move
     */
    add_move(move) {
        console.log('add_move(', move)
        if (move.id == this.current_move) {
            throw new Error('1. Duplicating move', this.moves)
        }
        if (this.current_move && this.moves[ this.current_move ].previous_move == move.id) {
            throw new Error('2. Duplicating previous move', this.moves)
        }
        if (this.current_move && this.moves[ this.current_move ].next_move == move.id) {
            throw new Error('3. Duplicating next move', this.moves)
        }

        move.previous_move = this.current_move
        this.half_move++
        move.half_move = this.half_move
        this.moves[ move.id ] = move
        // is this a RAV?
        if (this.current_move && this.moves[ this.current_move ].next_move) {
            console.log('[add_move] has next, rav-ing')
            this.moves[ this.current_move ].ravs.push(move.id)
            this.current_move = move.id
        } else {
            console.log('[add_move] No next_move')
            this.current_move = move.id
            if (this.moves[ this.current_move ].previous_move && !this.moves[ this.current_move ].next_move) {
                this.moves[ this.moves[ this.current_move ].previous_move ].next_move = move.id
            }
        }
        this.update_vnodes()
    }

    get first_move() {
        while (this.move_backward());
        return this.moves[ this.current_move ]
    }

    move_forward() {
        if (this.moves[ this.current_move ].next_move) {
            this.current_move = this.moves[ this.current_move ].next_move
            return true
        }
        return false
    }

    move_backward() {
        if (this.moves[ this.current_move ].previous_move) {
            this.current_move = this.moves[ this.current_move ].previous_move
            return true
        }
        return false
    }

    import_pgn(full_pgn) {
        const pgn_moves = this.separate_pgn_parts(full_pgn)
        console.log('-->', pgn_moves)
    }

    separate_pgn_parts(full_pgn) {
        const match = /([\[\w\W]*)\n\n([\w\W\s]*)/gm.exec(`\n\n${full_pgn}`)
        const headers = {}
        if (match[ 1 ]) { // headers
            match[ 1 ].split(`\n`).map(line => {
                const header_parts = /\[([\w\W]+) "([\w\W]+)"/.exec(line)
                if (header_parts) {
                    headers[ header_parts[ 1 ] ] = header_parts[ 2 ]
                }

            })
        }
        return {
            headers,
            moves: match[ 2 ].replace(/\r?\n|\r/g, '').replace(/\s\s+/g, ' ')
        }
    }

    update_vnodes() {
        // rewind
        while (this.move_backward());
        const current_move = this.moves[ this.current_move ]
        let new_vnodes = this.make_vnode_line(current_move)
        console.log('[update_vnodes] Updating vnodes', new_vnodes)
        this.vnodes(new_vnodes)

    }

    /**
     *
     * @param {Move} move
     */
    make_vnode_line(move) {
        if (!move || move == undefined) {
            throw new Error('[make_vnode_line] Move is not valid')
        }
        const list = []

        if (move.san) {
            list.push(move.vnode)
        }

        if (move.next_move) {
            this.move_forward()
            console.log('[make_vnode_line] move.next_move', move.next_move)
            return list.concat(this.make_vnode_line(this.moves[ move.next_move ]))
        }
        return list
    }
}

/**
 * How we internally store a move that will be displayed in the pgn viewer.
 * color is inferred from halfmove: halfmove % 2 == 0 ---> black
 * @typedef Move
 * @property {String} id - Unique move identifier
 * @property {String} fen - How the board looks after making this move
 * @property {String} san - human readable format
 * @property {Number} halfmove - starting from 1 according to standards
 * @property {Move.id[]} ravs - variations stemming from this position
 */
class Move {
    constructor(param) {
        this.id = param.san + ' - ' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        this.fen = param.fen
        this.san = param.san
        this.previous_move = null
        this.next_move = null
        this.ravs = []
        this.half_move = 0
    }

    get vnode() {
        return [
            m('span.move', {
                'data-id': this.id,
                'data-fen': this.fen,
                class: `move ${this.half_move % 2 == 1 ? 'white_move' : 'black_move'} `
            }, (this.half_move % 2 == 1 ? `${this.half_move}. ` : ' ') + this.san)
        ]
    }
}

module.exports = {
    MovesList,
    Move
}


/*
const list = new MovesList()

list.add_move(new Move({
    fen: 'fen1',
    san: 'a1'
}))
list.add_move(new Move({
    fen: 'fen1',
    san: 'b2'
}))
list.add_move(new Move({
    fen: 'fen1',
    san: 'c3'
}))
list.move_backward()
list.add_move(new Move({
    fen: 'fen1',
    san: 'd4'
}))

list.print()
*/
// console.log('---> ', )


/* const test = {
    moves: []
}

const p = new Proxy(test, {
    get: (target, name) => {
        console.log('get-->', name)

        if (property === 'length') {
            return length
        }
        if (property in target) {
            return target[ property ]
        }
        if (property in Array.prototype) {
            return Array.prototype[ property ]
        }
    }
})

p.map(move => console.log('one move', move)) */
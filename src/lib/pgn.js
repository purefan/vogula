const m = require('mithril')
const stream = require('mithril/stream')

class MovesList {
    constructor() {
        this.moves = {}
        this.vnodes = stream(m('div', '<no moves>'))
        this.half_move = -1
        this.current_move = stream()
        const initial_position = new Move({
            san: '',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        })
        this.add_move(initial_position)
    }

    get next_move() {
        return this.moves[ this.moves[ this.current_move() ].next_move ] || false
    }

    /**
     *
     * @param {Move} move
     */
    add_move(move) {
        console.log('PGN::add_move(', move)
        if (move.id == this.current_move()) {
            throw new Error('1. Duplicating move', this.moves)
        }
        if (this.current_move() && this.moves[ this.current_move() ].previous_move == move.id) {
            throw new Error('2. Duplicating previous move', this.moves)
        }
        if (this.current_move() && this.moves[ this.current_move() ].next_move == move.id) {
            throw new Error('3. Duplicating next move', this.moves)
        }

        move.previous_move = this.current_move()
        this.half_move++
        move.half_move = this.count_half_moves_before()
        this.moves[ move.id ] = move
        // is this a RAV?
        if (this.current_move() && this.moves[ this.current_move() ].next_move) {
            console.log('[PGN::add_move] has next, rav-ing')
            this.moves[ this.current_move() ].ravs.push(move.id)
            this.moves[ move.id ].is_first_move_in_rav = true
            this.current_move(move.id)
        } else {
            console.log('[PGN::add_move] No next_move')
            this.current_move(move.id)
            if (this.moves[ this.current_move() ].previous_move && !this.moves[ this.current_move() ].next_move) {
                this.moves[ this.moves[ this.current_move() ].previous_move ].next_move = move.id
            }
        }
        this.update_vnodes()
    }

    count_half_moves_before() {
        let total = 1
        let current = this.current_move()
        if (!current) return total
        while (this.moves[ current ].previous_move) {
            total++
            current = this.moves[ current ].previous_move
        }
        return total
    }

    get current_fen() {
        console.log('[PGN::current_fen] ', this.moves[ this.current_move() ])
        return this.moves[ this.current_move() ].fen
    }

    get first_move() {
        while (this.move_backward());
        return this.moves[ this.current_move() ]
    }

    move_forward() {
        if (this.moves[ this.current_move() ].next_move) {
            this.current_move(this.moves[ this.current_move() ].next_move)
            return true
        }
        return false
    }

    move_backward() {
        if (this.moves[ this.current_move() ].previous_move) {
            this.current_move(this.moves[ this.current_move() ].previous_move)
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
        // find the first move
        let current_move = this.moves[ this.current_move() ]
        while (current_move.previous_move) {
            current_move = this.moves[ current_move.previous_move ]
        }

        let new_vnodes = this.make_vnode_line(current_move)
        console.log('[PGN::update_vnodes] Updating vnodes', new_vnodes)
        this.vnodes(new_vnodes)

    }

    /**
     *
     * @param {Move} move
     * @param {Move} last_move - Used to avoid printing duplicates
     */
    make_vnode_line(move, last_move) {
        if (!move || move == undefined) {
            throw new Error('[PGN::make_vnode_line] Move is not valid')
        }
        console.log('----> make_vnode_line last', move, last_move)
        let list = []

        // Append this move: e.g: 1.d4
        if (move.san && (!last_move || move.id != last_move.id)) {
            console.log('[PGN::make_vnode_line] list.push because move.san')
            list.push(move.make_vnode({ current_move: this.current_move() }))
        }

        // Add the line starting with 1...Nf6
        if (move.next_move) {
            list.push(this.moves[ move.next_move ].make_vnode({ current_move: this.current_move() }))
        }

        // If there are variations to 1...Nf6, add them
        if (move.ravs.length > 0) {
            console.log('[PGN::make_vnode_line] RAVing')
            move.ravs.map(rav => list.push(m('div.rav.tree-branch', [ m('span', '('), this.make_vnode_line(this.moves[ rav ]), m('span', ')') ])))
        }

        if (move.next_move) {
            console.log('[PGN::make_vnode_line] move.next_move', move.next_move)
            list = list.concat(this.make_vnode_line(this.moves[ move.next_move ], this.moves[ move.next_move ]))
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
 * @property {Boolean} is_first_move_in_rav - Used to display ...
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
        this.is_first_move_in_rav = false
        this.is_white_move = param.fen.split(' ')[ 1 ] == 'b' // because the fen is after the move was played
    }

    make_vnode(param) {
        console.log('[Move::make_vnode] ', param.current_move + ' =+= ' + this.id)
        let move_number = ''
        if (this.is_white_move) {
            move_number = `${Math.ceil(this.half_move / 2)}.`
        } else if (this.is_first_move_in_rav) {
            move_number = `${Math.ceil(this.half_move / 2)}...`
        }
        return [
            m('span.move', {
                onclick: () => {
                    const Board = require('../ui/component/board/chessground')
                    const Moves = require('../ui/component/pgn/moves')
                    console.log('[Move.click] ', Board)
                    Board.chessjs.load(this.fen)
                    Board.sync()
                    Moves.current_move(this.id)
                },
                'data-id': this.id,
                'data-fen': this.fen,
                class: `move ${this.is_white_move ? 'white_move' : 'black_move'} ${param.current_move == this.id ? 'current_move' : ''}`
            }, `${move_number} ${this.san}`)
        ]
    }
}

module.exports = {
    MovesList,
    Move
}
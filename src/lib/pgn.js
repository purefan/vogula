const m = require('mithril')
const stream = require('mithril/stream')
const chessjs = require('chess.js')
const headers = require('../ui/component/pgn/headers')

class MovesList {
    constructor() {
        this.reset()
    }

    /**
     * Useful when starting a new game
     */
    reset() {
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
     * Adds one move to the list
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
            this.current_move(move.id)
        }

        // is the new move equal to the next move?
        if (this.current_move() && this.moves[ this.current_move() ].next_move && this.moves[ this.moves[ this.current_move() ].next_move ].san == move.san) {
            this.current_move(this.moves[ this.moves[ this.current_move() ].next_move ].id)
            return
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

    get moves_count() {
        let current_move = this.moves[ this.current_move() ]
        let count = 0
        while (current_move.previous_move) {
            current_move = this.moves[ current_move.previous_move ]
        }
        while (current_move.next_move) {
            count++
            current_move = this.moves[ current_move.next_move ]
        }
        return count
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

    /**
     * Looks backwards from this.current_move() until we find the move that
     * starts this variation or is the first move
     */
    find_start_of_rav() {
        let previous_current_move = this.moves[ this.current_move() ]
        while (previous_current_move.previous_move && !previous_current_move.is_first_move_in_rav) {
            previous_current_move = this.moves[ this.moves[ previous_current_move.id ].previous_move ]
        }
        return previous_current_move
    }

    /**
     *
     * @param {*} full_pgn
     * @example
[Event ""]
[Site ""]
[Date "????.??.??"]
[Round ""]
[White ""]
[Black ""]
[Result "*"]

1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 a6 5.Bd3 Nf6 6.O-O Qc7 7.c4 d6 8.Qe2 g6
9.Nc3 Bg7 10.Nf3 Nc6 11.Rd1 O-O 12.Be3 b6 13.Rac1 Nd7 14.h3 Nc5 15.Bb1 Bb7
16.Qd2 Rad8 17.b3 Qb8
    ( 17...Ba8 18.Nh2 )
*
    * @example
[Event "Rated Classical game"]
[Site "https://lichess.org/RtRAV1DX"]
[Date "2020.03.20"]
[Round "-"]
[White "chessinblackandwhite"]
[Black "purefan"]
[Result "0-1"]
[WhiteElo "2111"]
[BlackElo "2105"]
[TimeControl "1800+30"]
[Termination "Normal"]
[UTCDate "2020.03.21"]
[UTCTime "11:04:50"]
[Variant "Standard"]
[ECO "B43"]
[Opening "Sicilian Defense: Kan Variation, Knight Variation"]
[Annotator "https://lichess.org/@/purefan"]

1. e4 { [%clk 0:30:00] } c5 { [%clk 0:30:00] } 2. Nf3 { [%clk 0:30:10] } e6 { [%clk 0:30:23] }

     */
    import_pgn(full_pgn) {
        const game_parts = this.separate_pgn_parts(full_pgn)
        const chess = new chessjs()
        this.first_move
        let next_move = null
        let san_to_import = null
        if (this.moves_count < 1) {
            headers.set_headers(game_parts.headers)
        }

        for (move in game_parts.moves) {
            next_move = this.moves[ this.current_move() ].next_move
            san_to_import = game_parts.moves[ move ]
            // Entering RAV
            if (san_to_import.includes('(')) {
                this.move_backward()
                chess.load(this.moves[ this.current_move() ].fen)
                continue
            }

            // Exiting RAV
            if (san_to_import.includes(')')) {
                const start = this.find_start_of_rav()
                const next_move_from_start = this.moves[ start.previous_move ].next_move
                this.current_move(next_move_from_start)
                chess.load(this.moves[ this.current_move() ].fen)
                continue
            }

            const chess_move = chess.move(san_to_import)
            if (!chess_move) {
                console.error(`Importing an invalid move: "${san_to_import}"`)
                this.moves[ this.current_move() ].comment_after_move += ` ${san_to_import} `
                continue
            }

            if (
                // is the next move equal to the move we are trying to import and not equal to the current move
                (next_move && !(this.moves[ next_move ].san == chess_move.san && this.moves[ next_move ].fen == chess.fen()))
                // Or is it a whole new move
                || !next_move
            ) {
                const new_move = new Move({
                    san: chess_move.san,
                    fen: chess.fen()
                })
                this.add_move(new_move)
            }
        }

        this.update_vnodes()
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
            moves: match[ 2 ]
                .replace(/\r?\n|\r/g, ' ')
                .replace(/\s\s+/g, ' ') // not perfect but 7+% of the time works every time
                .replace(/[\d]+[\.]{1,3}\s(\w)/g, '$1') // Remove space after move number 4. d3 --> 4.d3
                .replace(/\(/, ' ( ') // add a space so we can easily tell when a variation starts
                .replace(/\)/, ' ) ') // and ends in the for loop
                .replace(/[\d]+\./g, '') // remove numbers
                .split(' ')
                .map(san => san.replace(/\s/g, ''))
                .filter(san => san.length > 0)
        }
    }

    update_vnodes() {
        // find the first move
        let current_move = this.moves[ this.current_move() ]
        while (current_move.previous_move) {
            current_move = this.moves[ current_move.previous_move ]
        }

        let new_vnodes = this.make_vnode_line(current_move)
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
 * @property {String[]} ravs - variations stemming from this position
 * @property {Boolean} is_first_move_in_rav - Used to display ...
 * @property {String} previous_move - id for the previous move
 * @property {String} comment_after_move - Text commentary
 */
class Move {
    constructor(param) {
        this.id = param.san + ' - ' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        this.fen = param.fen
        this.san = param.san
        this.previous_move = null
        this.next_move = null
        this.ravs = []
        this.half_move = param.half_move || 0
        this.is_first_move_in_rav = false
        this.is_white_move = param.fen.split(' ')[ 1 ] == 'b' // because the fen is after the move was played
        this.comment_after_move = ''
        this.clk = '' // "remaining time to next time control" i.e. time left
    }
    /**
     * Normally it just appends strings (to comment_after_move) to be displayed when making the vnode
     * but if the current comment string includes an extension command it processes into a different
     * variable.
     * The idea of processing it here is to alleviate the processing when making the vnode, which can
     * happen more than once per move.
     * @see https://www.enpassant.dk/chess/palview/enhancedpgn.htm
     * @param {String} comment
     */
    add_comment(comment) {
        this.comment_after_move += comment
        const clk_regex = /%clk\s?(\d+:\d+:\d+)/i
        const matched = this.comment_after_move.match(clk_regex)
        if (matched) {
            this.clk = matched[ 1 ]
        }
    }

    /**
     *
     * @param {Object} param
     * @param {String} param.current_move - id of the current move
     */
    make_vnode(param) {
        let move_number = ''
        if (this.is_white_move) {
            move_number = `${Math.ceil(this.half_move / 2)}.`
        } else if (this.is_first_move_in_rav) {
            move_number = `${Math.ceil(this.half_move / 2)}...`
        }

        return [
            m('span.move', {
                onclick: async () => {
                    const Board = require('../ui/component/board/chessground')
                    const Moves = require('../ui/component/pgn/moves')
                    // We need to find this moves squares to update the highlighted squares
                    if (Moves.move_list.moves[ this.previous_move ]) {
                        Board.chessjs.load(Moves.move_list.moves[ this.previous_move ].fen)
                        Board.chessjs.move(this.san)
                    } else {
                        Board.chessjs.load(this.fen)
                    }
                    await Board.sync()
                    await Board.process_queue_after_move()
                    Moves.current_move(this.id)
                },
                'data-id': this.id,
                'data-fen': this.fen,
                'data-clk': this.clk,
                class: `move ${this.is_white_move ? 'white_move' : 'black_move'} ${param && param.current_move == this.id ? 'current_move' : ''}`
            }, `${move_number} ${this.san} ${this.comment_after_move ? this.comment_after_move : ''}`)
        ]
    }
}

module.exports = {
    MovesList,
    Move
}
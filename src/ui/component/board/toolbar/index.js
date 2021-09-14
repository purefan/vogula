import Board from '../chessground'
import Moves from '../../pgn/moves'

import './index.scss'
const toolbar = {
    move_forwards,
    move_backwards,
    oninit: () => {
        toolbar.is_running = false
        document.onkeydown = e => {
            if (e.keyCode == 39) {
                move_forwards()
            }
            if (e.keyCode == 37) {
                move_backwards()
            }
        }
    },
    view: () => [
        m('button.toolbar-item', { onclick: () => move_to_start() }, '<<'),
        m('button.toolbar-item', { onclick: () => move_backwards() }, '<'),
        m('button.toolbar-item', { onclick: () => toggle_orientation() }, 'Flip'),
        m('button.toolbar-item', { onclick: () => move_forwards() }, '>'),
        m('button.toolbar-item', { onclick: () => move_to_end() }, '>>')
    ]
}

function toggle_orientation() {
    Board.chessground.toggleOrientation()
    localStorage.setItem('board.orientation', Board.chessground.state.orientation)
}

async function move_to_end() {
    if (!toolbar.is_running) {
        toolbar.is_running = true
        while (Moves.move_list.move_forward());
        Board.chessjs.load(Moves.move_list.current_fen)
        Moves.move_list.update_vnodes()
        await Board.sync()
        await Board.process_queue_after_move()
        toolbar.is_running = false
    }
}

/**
 * Moves all the way to the beginning, before white's first move
 */
async function move_to_start() {
    if (!toolbar.is_running) {
        toolbar.is_running = true
        while (Moves.move_list.move_backward());
        Board.chessjs.load(Moves.move_list.current_fen)
        Moves.move_list.update_vnodes()
        await Board.sync()
        await Board.process_queue_after_move()
        toolbar.is_running = false
    }
}

/**
 * Moves backwards one move and syncs the chessground configuration
 * it is triggered by pressing a key or clicking on a button
 */
async function move_backwards() {
    if (!toolbar.is_running && Moves.move_list.move_backward()) {
        toolbar.is_running = true
        Board.chessjs.load(Moves.move_list.current_fen)
        Moves.move_list.update_vnodes()
        await Board.sync()
        await Board.process_queue_after_move()
        toolbar.is_running = false
    }
}

/**
 * Moves forwards one move and syncs the chessground configuration
 * it is triggered by pressing a key or clicking on a button
 */
async function move_forwards() {
    if (!toolbar.is_running && Moves.move_list.move_forward()) {
        toolbar.is_running = true
        Board.chessjs.load(Moves.move_list.current_fen)
        Moves.move_list.update_vnodes()
        await Board.sync()
        await Board.process_queue_after_move()
        toolbar.is_running = false
    }
}
export default toolbar
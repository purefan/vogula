const m = require('mithril')
const board = require('../component/board')
const pgn = require('../component/pgn')
const promote = require('../component/board/promote') // Needed here because chessground overtakes the component
const engine = require('../component/engine')
const Base = {
  view: vnode => m('div', [
    m('div.grid-container', [
      m(promote),
      m('div.board-container', [
        m('div.board-container-chessground', m(board.chessground)),
        m('div.board-container-toolbar', 'board-toolbar')
      ]),
      m('div.pgn-container', [
        m('div.pgn-container-toolbar', 'pgn-toolbar'),
        m('div.pgn-container-headers', 'pgn-headers'),
        m('div.pgn-container-moves', m(pgn.moves))
      ]),
      m('div.engine-container', [
        m('div.engine-container-toolbar', m(engine.toolbar)),
        m('div.engine-container-analysis', m(engine.analysis)),
        m('div.engine-container-status', m(engine.status))
      ]),
      m('div.db-container', [
        m('div.db-container-toolbar', 'db-toolbar'),
        m('div.db-container-data', 'db-data'),
        m('div.db-container-status', 'db-status')
      ])
    ])
  ])
}

module.exports = Base

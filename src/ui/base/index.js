import board from '../component/board/index.js'
import pgn from '../component/pgn'
import engine from '../component/engine'
// import modal from '../../lib/modal'
import promote from '../component/board/promote'
import db from '../component/db/index'

const Base = {
  view: () =>
    m('div.grid-container', [
      m(promote),
      m('div.board-container', /* board.config, */[
        m('div.board-container-chessground', m(board.chessground)),
        m('div.board-container-toolbar.toolbar-container', m(board.toolbar))
      ]),
      m('div.pgn-container', [
        m('div.pgn-container-toolbar.toolbar-container', m(pgn.toolbar)),
        m('div.pgn-container-headers', m(pgn.headers)),
        m('div.pgn-container-moves', m(pgn.moves))
      ]),
      m('div.engine-container', [
        m('div.engine-container-toolbar.toolbar-container', m(engine.toolbar)),
        m('div.engine-container-analysis', m(engine.analysis)),
        m('div.engine-container-status', m(engine.status))
      ]),
      m('div.db-container', [
        m('div.db-container-toolbar.toolbar-container', m(db.toolbar)),
        m('div.db-container-data', 'db-data'),
        m('div.db-container-status', 'db-status')
      ])
    ])
}

export default Base

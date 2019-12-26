const m = require('mithril')
const moves = require('../../moves')
require('./index.scss')

const Clipboard = {
    show,
    state: 'hidden',
    view: () => m('div.pgn_toolbar_clipboard', { class: `modal ${Clipboard.state}` }, m('div.modal-content', [
        m('button.close-modal', { onclick: e => Clipboard.state = 'hidden' }, 'Close'),
        m('p', 'Paste the PGN or the FEN in the text box below:'),
        m('textarea', {
            onchange: e => Clipboard.data = e.target.value
        }),
        m('div.actions', [
            m('button', 'Copy from text box to the board'),
            m('button', 'Copy position to clipboard'),
            m('button', 'Copy game to clipboard')
        ])
    ]))
}

/**
 * Displays the overlay and
 */
function show() {
    // Clipboard.state = 'visible'
    fake_paste()
}

function fake_paste() {
    const pgn = `[Event "TCh-BEL 2019-20"]
    [Site "Belgium BEL"]
    [Date "2019.10.20"]
    [Round "3.5"]
    [White "De Rover,YH"]
    [Source "twic1303"]
    [Black "Gourevitch,Mikhail"]
    [Result "1-0"]
    [WhiteTitle "IM"]
    [WhiteElo "2370"]
    [BlackElo "2108"]
    [ECO "D82"]
    [Opening "Gruenfeld"]
    [Variation "4.Bf4"]
    [EventDate "2019.09.29"]
    [WhiteTeam "Wachtebeke"]
    [BlackTeam "KSK47-Eynatten"]
    [WhiteFideId "1010298"]
    [BlackFideId "4690605"]

    1. d4 Nf6 2. c4 g6 3. Nc3 d5 (4. Bg3) 4. Bf4 Bg7 5. e3 e6 6. h3 O-O 7. Nf3 c5 8.
    dxc5 Qa5 9. Rc1 dxc4 10. Bxc4 Qxc5 11. Bd6 Qxc4 12. Ne2 Qc6 13. Rxc6 Nxc6
    14. Bxf8 Bxf8 15. O-O e5 16. Qb3 h6 17. Rc1 a5 18. Qb5 a4 19. Nxe5 Ra5 20.
    Qxa5 Nxa5 21. Rxc8 b5 22. Nd4 b4 23. Ra8 Nb7 24. Rxa4 Nd5 25. e4 Nf6 26.
    Ra7 Nd6 27. f3 Nfe8 28. Nd7 Bg7 29. e5 Kh7 30. b3 h5 31. Kf2 Nf5 32. Nxf5
    gxf5 33. f4 1-0
    `
    moves.import_pgn(pgn)
}

module.exports = Clipboard
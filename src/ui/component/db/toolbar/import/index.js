/*
For now we simulate loading a file by just loading a fixed PGN string
*/
import ChessTypes from 'chess-types'
console.log(ChessTypes)
//const chess_types = ChessTypes()
// console.log(chess_types)
import './index.scss'

function Importer() {
    let progress = {}
    let feedback = ''
    let state = 'hidden'
    function import_from_file() { }
    function import_from_url() { }
    return {
        oninit: () => {
            // request progress from api and assign to progress
        },
        view: () => m('span', [
            m('button', { onclick: () => state = 'show' }, 'Import PGN')
            , m(
                'div',
                { class: `importer_modal modal ${Importer.state}` },
                m('div.modal-content', [
                    m('button.close-modal', { onclick: e => Importer.state = 'hidden' }, 'Close'),

                    m('div.db-importer-container', [
                        m('div.db-importer-info', info),
                        m('div.db-importer-actions', [
                            m('div.table', [
                                m('div.tr', [ m('div.td',
                                    m('div.db-importer-actions-url', [
                                        m('input', {
                                            type: 'url',
                                            placeholder: 'https://theweekinchess.com/zips/twic{number:920}g.zip',
                                            id: 'db-importer-actions-url'
                                        }),

                                    ])
                                ), m('div.td', m('button', { onclick: import_from_url }, 'Import from URL')) ]),
                                m('div.tr', [
                                    m('div.td',
                                        m('input', {
                                            type: 'file'
                                        }),
                                    ),
                                    m('div.td', m('button', { onclick: import_from_file }, 'Import from file')) ]
                                ) ]),


                            m('div.feedback', {}, feedback)
                        ]),
                        m('div.db-importer-progress')
                    ])
                ]
                )),
        ])
    }
}

const info = [
    m('p', `Here you can manage importing PGN files, even extremely large ones. In the input below you can choose to
    import a PGN file in your computer, or to import from a URL. If you are importing from a URL you can use a magic
    word to denote a numeric incremental name, this is particularly useful with databases like TWIC, so for example:
    https://theweekinchess.com/zips/twic{number:920}g.zip tells that we should import the PGN zip file and that the
    first file starts at 920.`),
    m('p', `Further down you will find the Progress section where you can see how far along an import is, you can also stop
    and abort imports, you can even delete the games imported from specific files`),
    m('p', `Once a URL import starts it will download the remote file to your computer in a temporary folder (it will
        be deleted automatically when finished) and then sent to Resker`)
]

export default Importer
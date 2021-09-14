import Chess from 'chess.js'
import { MovesList as pgn, Move } from './pgn'

class Position {
    /**
     *
     * @param {Object} param
     * @param {Array} param.analysis
     */
    constructor(param) {
        if (!Array.isArray(param.analysis)) {
            param.analysis = [ param.analysis ]
        }

        /**
         * @property {Analysis[]} analysis
         */
        this.analysis = (param.analysis || []).filter(analysis => typeof analysis != 'undefined').map(analysis => new Analysis(Object.assign({ fen: param._id }, analysis)))

        /**
         * @property {String} id
         */
        this.id = param._id

        this.fen = param.fen || param._id

        this.client = param.client

        /**
         * @property {Number} depth_goal
         * */
        this.depth_goal = param.depth_goal

        /**
         * @property {Number} multipv_goal
         * */
        this.multipv_goal = param.multipv_goal

        /**
         * @property {Number} priority
         * */
        this.priority = param.priority

        /**
         * @property {Number} status
         * */
        this.status = param.status

        /**
         * @property {String} updated
         * */
        this.updated = param.updated
    }

    /**
     * Finds the deepest analysis
     * @param {Analysis[]} analysis
     * @returns {Analysis[]} An array of Analysis
     */
    get_deepest_analysis(analysis) {
        const max_analysis_depth = Math.max(...analysis.map(analysis => analysis.depth))
        return analysis.filter(analysis => analysis.depth == max_analysis_depth)
    }

    /**
     * Returns all the steps from all the analysis
     * that match the deepest analysis
     * @param {Analysis[]} analysis
     * @returns {Step[]}
     */
    get_best_steps(analysis) {
        const max_analysis_depth = Math.max(...analysis.map(one_analysis => one_analysis.depth))
        return this.get_deepest_analysis(analysis)
            .reduce((acc, curr) => {
                acc = acc.concat(curr.get_steps_by_depth(max_analysis_depth))
                return acc
            }, [])
    }

    /**
     * Removes duplicated first moves by taking the one with the highest node count
     * @param {Step[]} steps
     * @returns {Step[]} Step[] with unique values taking the step with the highest node count
     */
    remove_duplicated_first_pv(steps) {
        const unique = steps.reduce((acc, curr) => {
            const current_best_move = curr.pv.split(' ')[ 0 ]
            if (!acc[ current_best_move ] || acc[ current_best_move ].nodes < curr.nodes) {
                acc[ current_best_move ] = curr
            }
            return acc
        }, {})
        return Object.values(unique)
    }
}

class Analysis {
    constructor(param) {

        /**
         * @property {Number} depth
         */
        this.depth = param.depth

        /**
         * @property {String} engine_name
         */
        this.engine_name = param.engine_name

        /**
         * @property {String} fen
         */
        this.fen = param.fen

        /**
         * @property {Number} score
         */
        this.score = param.score

        /**
         * @property {Number} multipv
         */
        this.multipv = param.multipv

        /**
         * @property {String} best_move
         */
        this.best_move = param.best_move

        /**
         * @property {Number} nodes
         */
        this.nodes = param.nodes

        /**
         * @property {Number} time
         */
        this.time = param.time

        /**
         * @property {Step[]} steps
         */
        this.steps = param.steps.map(step => new Step(Object.assign(step, { fen: param.fen })))
    }

    /**
     * Filters out the steps that are not at the deepest level
     * @returns {Step[]}
     */
    get_deepest_steps() {
        // find deepest step
        const max = Math.max(...this.steps.map(step => step.depth))
        return this.steps.filter(step => step.depth == max)
    }

    /**
     *
     * @param {Number} depth
     * @returns {Step[]}
     */
    get_steps_by_depth(depth) {
        return this.steps.filter(step => step.depth == depth)
    }
}

class Step {
    constructor(param) {

        /**
         * @property {Number} depth
         */
        this.depth = param.depth

        /**
         * @property {Number} multipv
         */
        this.multipv = param.multipv

        /**
         * @property {Number} nodes
         */
        this.nodes = param.nodes

        /**
         * @property {Number} nps
         */
        this.nps = param.nps

        /**
         * @property {String} pv Move(s) represented as <src><src><trg><trg>
         * @example g8f6 g1f3 e7e6 c2c4 d7d5 b1c3 f8e7 c4d5 e6d5 c1f4
         */
        this.pv = param.pv

        /**
         * @property {String} fen The position that this step stems from
         */
        this.fen = param.fen

        /**
         * @property {Object} score_object
         * @property {Number} score_object.value
         */
        this.score_object = param.score

        /**
         * @property {Number} seldepth
         */
        this.seldepth = param.seldepth

        /**
         * @property {Number} tbhits
         */
        this.tbhits = param.tbhits

        /**
         * @property {Number} time
         */
        this.time = param.time

    }

    /**
     * @returns {Number}
     */
    get score() {
        const floated = Number((this.score_object.value / 100).toFixed(2))
        return this.fen.split(' ')[ 1 ] == 'b' ? (floated * -1) : floated
    }

    /**
     * @returns {Move}
     */
    get moves() {
        // @ts-ignore
        const validator = new Chess()
        validator.load(this.fen)
        return this.pv
            .split(' ')
            .map(sloppy => {
                const chess_move = validator.move(sloppy, { sloppy: true })
                if (!chess_move) {
                    throw new Error('invalid move')
                }
                return new Move({
                    san: chess_move.san,
                    fen: validator.fen()
                })
            })
    }
}

export default Position
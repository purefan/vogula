
/**
 * A general purpose FIFO queue. Triggers functions in order
 */
function Queue(param) {
    const statuses = {
        IDLE: 0,
        DOING: 1
    }

    let status = statuses.IDLE
    let tasks = []

    /**
     *
     * @param {Function} func Function to queue
     */
    function add(func) {
        tasks.push(func)
        run()
    }

    /**
     * Its safe to trigger run() multiple times.
     */
    async function run() {
        if (tasks.length < 1) {
            status = statuses.IDLE
        } else if (status == statuses.IDLE) {
            status = statuses.DOING
            await tasks.shift()()
            status = statuses.IDLE
        } else {
        }
    }
}

/*
const q1 = new Queue()
function f1() {
    console.log('[f1]')
}
q1.add(f1)
 */
export default Queue
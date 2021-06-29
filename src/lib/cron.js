/**
 * Some operations require periodic, unattended runs, for example: checking if the
 * watched players have played a new game. This lib is a central point for storing
 * those operations and handling their execution
 */

module.exports = cron


function cron() {
    const intervals = {
        ONE_MINUTE: 'ONE_MINUTE',
        FIVE_MINUTES: 'FIVE_MINUTES'
    }

    const scheduled_functions = []
    let interval_id = null

    /**
     * Register a function to be triggered every so often
     * @param {Function} fn
     * @param {String} interval
     */
    function register_cron(fn, interval) {
        if (!intervals[interval]) {
            throw new Error('Invalid interval')
        }
        scheduled_functions.push({fn, interval})
    }

    function start() {
        interval_id = setInterval(trigger_interval, 60000)
    }

    /**
     * Function responsible to trigger all the scheduled functions.
     * Scheduled functions can be triggered in "multiples" of 1 minute
     */
    function trigger_interval() {
        const now = new Date()
        const one_minute = scheduled_functions.filter(scheduled => scheduled.interval == intervals.ONE_MINUTE)
        const five_minutes = scheduled_functions.filter(scheduled => scheduled.interval == intervals.FIVE_MINUTES)

        one_minute.map(scheduled => scheduled.fn())
        five_minutes.map(scheduled => scheduled.fn())
    }

    return {
        trigger_interval,
        register_cron,
        start,
        intervals
    }
}
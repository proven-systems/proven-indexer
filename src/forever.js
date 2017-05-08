module.exports = (interval, action, callback) => {
    (function p() {
        action((done = false) => {
            if (done) {
                callback();
            } else {
                setTimeout(p, interval);
            }
        });
    })();
};
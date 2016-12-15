module.exports = function() {
    this.Before(function() {
        console.log('Before');
        return true;
    });

    this.After(function() {
        console.log('After');
        return true;
    });
}

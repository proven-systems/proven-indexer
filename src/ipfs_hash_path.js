const split = function(s, levels) {
    if (levels == 0) {
        return [s];
    } else {
        return [s.substr(0, 2)].concat(split(s.substr(2), levels - 1));
    }
};

module.exports.split = split;

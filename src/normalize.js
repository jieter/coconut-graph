var d3 = require('d3');

function parseDatetime(s) {
    return (typeof s === 'string') ?
        d3.time.format('%Y-%m-%dT%H:%M:%S').parse(s) : s;
}

module.exports = function normalize (data) {
    if (data.extents) {
        data.extents = data.extents.map(parseDatetime);
    }

    var timestamp_idx = data.keys.indexOf('timestamp');
    if (timestamp_idx !== -1) {
        data.values.forEach(function (it, i) {
            data.values[i][timestamp_idx] = parseDatetime(it[timestamp_idx]);
        }, this);
    }

    return data;
};

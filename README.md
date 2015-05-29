# coconut-graph

Quick and dirty reusable graph with d3.

Currently supports line, bar, scatter.

Depends heavily on json structure used in the coconut wepapp:

```json
{
    "meta": {
        "period": "day",
        "urls": {
            "next": "<url to get json for the day>",
            "previous": "<url to get json for previous day>"
        },
        "readable_interval": "15 minuten"
    },
    "data": {
        "keys": ["timestamp", "amount"],
        "extents": ["2015-05-29T00:00:00", "2015-05-29T23:59:59"],
        "values": [
            ["2015-05-29T14:00:00", 50],
            ["2015-05-29T14:15:00", 0],
            ["2015-05-29T14:30:00", 5],
            ["2015-05-29T15:00:00", 6]
        ],
        "slices": 96
    }
}
```

```javascript
var Loader = require('coconut-graph').Loader;
var url = '/api.json'; // url to above json

var graph = new Loader(url, {
	graphs: [{
		container: 'graph-flow',
		plot: { type: 'bar', key: 'amount', label: 'verbruik [l]'}
	}]
});
```

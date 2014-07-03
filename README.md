# mongoose-geojson-schema

## About
Mongoose JS SchemaTypes for GeoJSON

## Usage

```
var mongoose = require('mongoose');
require('mongoose-geojson-schema')(mongoose);

var schema = new mongoose.Schema({
	Point:mongoose.SchemaTypes.GeoJSONPoint,
	Geo:mongoose.SchemaTypes.GeoJSON,
	PointReq: {type:mongoose.SchemaTypes.GeoJSONPoint, required: true}
});
```

## Supported Types

Point
MultiPoint
LineString
MultiLineString
Polygon
MultiPolygon

## License

See LICENSE for more info.
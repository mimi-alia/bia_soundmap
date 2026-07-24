import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

var map = new maplibregl.Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/globe.json',
    center: [0, 0],
    zoom: 2
});

console.log("wtf")
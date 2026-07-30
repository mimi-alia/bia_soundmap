import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.0.0/dist/maplibre-gl.mjs';import 'maplibre-gl/dist/maplibre-gl.css';

var map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [-81.000000, 37.800000],
    zoom: 5
});




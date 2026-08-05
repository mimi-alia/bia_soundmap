import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.0.0/dist/maplibre-gl.mjs';
import 'maplibre-gl/dist/maplibre-gl.css';

var map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [-81.000000, 37.800000],
    zoom: 5
});


map.on('load', () => {
    const layers = map.getStyle().sources;
    
    map.addSource('media-points', {
        'type': 'geojson',
        'data':'./media.geojson'
    });

    console.log(map.getStyle().sources);

    map.addLayer({
        'id': 'media-points',
        'type': 'circle',
        'source': 'media-points',
        'paint': {
        'circle-radius': 6,
        'circle-color': '#3b82f6',
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 1
    }
    });

});
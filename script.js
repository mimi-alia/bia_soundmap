import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.0.0/dist/maplibre-gl.mjs';
import 'maplibre-gl/dist/maplibre-gl.css';

var map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [-81.000000, 37.800000],
    zoom: 5
});


map.on('load', () => {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('media_clusters', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: './media.geojson',
        cluster: true,
        clusterMaxZoom: 22, // Max zoom to cluster points on, needs to be under 32 because of bit storage
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
        // clusterProperties: {
        //     total_count : ["+", ["coalesce", ["get", "count"], 1]]
        // }
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'media_clusters',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://maplibre.org/maplibre-style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                10,
                '#f1f075',
                20,
                '#f28cb1'
            ],
            'circle-radius': [ //how do i make this count for points === 1
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });

     map.addLayer({
        id: 'unclustered',
        type: 'circle',
        source: 'media_clusters',
        filter: ["!", ['has', 'point_count']],
        paint: {
            
            'circle-color': '#011418',
            'circle-radius': 20
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'media_clusters',
        // filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Noto Sans Regular'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'point-count',
        type: 'symbol',
        source: 'media_clusters',
        filter: ['!', ['has', 'point_count']],
        layout: {
            'text-field': '1',
            'text-font': ['Noto Sans Regular'],
            'text-size': 12,
            'text-allow-overlap': true,
            'text-ignore-placement': true
        },
        paint: {
            'text-color': '#ffffff'
        }
    });

    // inspect a cluster on click

    map.on('click', 'clusters', async (e) => {
        const feature = e.features[0]; //all data points are contained in this single feature as a cluster
        const clusterId = feature.properties.cluster_id; // the cluster feature is assigned a unique id
        const pointCount = feature.properties.point_count; //the cluster feature also has a point count
        const source = map.getSource('media_clusters');
        console.log("Cluster ID: ", clusterId)

        try {
            // Fetch leaves first, with an explicit offset
            //more about the getClusterLeaves method : https://maplibre.org/maplibre-gl-js/docs/API/classes/GeoJSONSource/#getclusterleaves
            const leaves = await source.getClusterLeaves(clusterId, pointCount, 0);

            console.log("Leaves:", leaves)

            // Check if all points share the same location
            const [lng0, lat0] = leaves[0].geometry.coordinates; //coordinates of the first data point

            //for each point in the cluster, return if they are the same coordinates as that of the first coordinate, assign to allSame var
            const allSame = leaves.every((leaf) => {
                const [lng, lat] = leaf.geometry.coordinates;
                return lng === lng0 && lat === lat0;
            });

            //If all of the coordinates for each point in the leaf are the same, create a popup to display data
            if (allSame) {
                const container = document.createElement('div');
                leaves.forEach((leaf) => {
                    const p = document.createElement('p');
                    // swap in whichever property you want to display
                    p.textContent = leaf.properties.title ?? JSON.stringify(leaf.properties);
                    container.appendChild(p);
                });

                new maplibregl.Popup()
                    .setLngLat([lng0, lat0])
                    .setDOMContent(container)
                    .addTo(map);
            } else { //otherwise zoom to feature
                // Points differ, so zoom until the cluster splits
                const zoom = await source.getClusterExpansionZoom(clusterId);
                map.easeTo({
                    center: feature.geometry.coordinates,
                    zoom
            });
        }
    } catch (err) {
        console.error('Cluster click failed:', clusterId, err);
    }
});




    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const prop = e.features[0].properties;

        console.log(prop)
        console.log(e)
        console.log(e.features)
        console.log(e.features.length)



        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                "yummu"
            )
            .addTo(map);
    });

    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });

    map.on('mouseenter', 'unclustered', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered', () => {
        map.getCanvas().style.cursor = '';
    });

});
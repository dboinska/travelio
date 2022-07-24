mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: [-103.5917, 40.6699],
  zoom: 3,
});

map.on("load", () => {
  map.addSource("hotels", {
    type: "geojson",
    data: hotels,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "hotels",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#03A9F4",
        20,
        "#9C27B0",
        40,
        "#76FF03",
        70,
        "#F50057",
      ],
      "circle-radius": ["step", ["get", "point_count"], 18, 20, 24, 28, 38],
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "hotels",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "hotels",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#FFEA00",
      "circle-radius": 6,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#FFEA00",
    },
  });

  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource("hotels").getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom,
      });
    });
  });

  map.on("click", "unclustered-point", (e) => {
    const { popUpMarkup } = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup().setLngLat(coordinates).setHTML(popUpMarkup).addTo(map);
  });

  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });
});

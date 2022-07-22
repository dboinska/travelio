mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: hotel.geometry.coordinates,
  zoom: 4,
  projection: "globe",
});
map.on("style.load", () => {
  map.setFog({});
});

new mapboxgl.Marker().setLngLat(hotel.geometry.coordinates).addTo(map);

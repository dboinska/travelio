mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: hotel.geometry.coordinates,
  zoom: 8,
});

map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

new mapboxgl.Marker()
  .setLngLat(hotel.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h5>${hotel.title}</h5><p>${hotel.location}</p>`
    )
  )
  .addTo(map);

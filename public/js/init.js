let $ = (i) => document.querySelector(i)
let _ = document
let sotres = []

let render = () => {
	render_type()
	render_map()
}

let orangeIcon = new L.Icon({
  iconUrl: 'marker/marker-icon-2x-orange.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
})

let redIcon = new L.Icon({
  iconUrl: 'marker/marker-icon-2x-grey.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
})

let blueIcon = new L.Icon({
  iconUrl: 'marker/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
})

let zoom = 18
if (window.screen.width < 1000) {
	zoom = 16
}
let map = L.map('map').setView([25.03210, 121.54257], zoom)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
	maxZoom: 19,
}).addTo(map)

let render_map = () => {
	fetch("/api/stores").then((res) => {
		return res.json()
	}).then((data) => {
		data.forEach((store) => {
			let marker = L.marker(store.location, {icon: blueIcon})
			marker.addTo(map)
			marker.bindPopup(`
				<b>${store.name}</b><br>
				價格：${store.price[0]} ~ ${store.price[1]}
			`)
			store["marker"] = marker
		})
		stores = data
	})
}

let render_type = () => {
	fetch("/api/types").then((res) => {
		return res.json()
	}).then((type_of_food) => {
		type_of_food.forEach((item) => {
			$("#type_of_food").innerHTML += `
				<input type="checkbox" name="type_of_food" value="${item}">
				<label for="type_of_food"> ${item}</label>
			`
		})
	})
}

render()
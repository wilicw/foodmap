class Map {

    constructor (element) {
        this.map = L.map(element);
        this.map.setView([25.03210, 121.54257], Map.getZoom())
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: `Made by <a href="https://dacsc.club">DACSC</a> Source code on <a href="https://github.com/wilicw/foodmap">Github</a>`,
            maxZoom: 21
        }).addTo(this.map)
    }

    addMarker (marker) {
        marker.addTo(this.map)
    }

    static generateMarker (store, clickHandler) {
        let marker = L.marker(store.location, {
            _id: store._id,
            icon: Map.generateIcon('blue')
        })
        marker.on('click', clickHandler)
        return marker
    }

    static getZoom () {
        return (screen.width < 1000) ? 16 : 18
    }

    static generateIcon (color) {
        return new L.Icon({
            iconUrl: `images/markers/marker-icon-2x-${color}.png`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        })
    }

}

export { Map }
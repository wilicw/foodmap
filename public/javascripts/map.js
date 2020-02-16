class Map {

    constructor (element) {
        this.map = L.map(element);
        this.map.setView(Map.DEFAULT_POSITION, Map.getZoom())
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
            maxZoom: 19
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
        return (screen.width < 1000) ? Map.ZOOM_MOBILE : Map.ZOOM
    }

    static generateIcon (color) {
        return new L.Icon({
            iconUrl: `marker/marker-icon-2x-${color}.png`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        })
    }

    static ZOOM = 18
    static ZOOM_MOBILE = 16
    static DEFAULT_POSITION = [25.03210, 121.54257]

}

export { Map }
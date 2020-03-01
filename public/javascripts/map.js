class Map {

    constructor (element) {
        this.map = L.map(element, { zoomControl: false });
        L.control.zoom({ position:'bottomright' }).addTo(this.map);
    }

    set source (path) {
        L.tileLayer(path, {
            attribution: `Made by <a href="https://dacsc.club" target="_blank">DACSC</a> Source code on <a href="https://github.com/wilicw/foodmap" target="_blank">Github</a>`,
            maxZoom: 21
        }).addTo(this.map)
    }

    goto (position, zoom) {
        this.map.flyTo(position, zoom)
    }

    insertMarker (marker) {
        marker.addTo(this.map)
    }

    static createMarker (store, onclick) {
        let marker = L.marker(store.location, {
            _id: store._id,
            icon: Map.generateIcon('blue')
        })
        marker.on('click', () => {
            onclick(store)
        })
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

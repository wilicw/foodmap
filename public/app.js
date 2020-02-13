const $ = (q) => document.querySelector(q),
    $$ = (q) => document.querySelectorAll(q)

const ZOOM = 18,
    ZOOM_MOBILE = 16,
    INIT_POSITION = [25.03210, 121.54257]

let map, stores = []

// TOOL

const generateIconByColor = (color) => new L.Icon({
    iconUrl: `marker/marker-icon-2x-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

const getZoomValue = () => (screen.width < 1000) ? ZOOM_MOBILE : ZOOM

const getPriceLevel = (priceLevel) => priceLevel.length

// MAP

const fetchStorePositions = async () => (await fetch('api/stores')).json()

const generateMarkerContent = (store) => `<b>${store.name}</b><br>價位： ${store.price_level}<br>分類： ${store.type.join(" ,")}`

const initStoreMarkers = () => stores.map((store) => {
    let marker = L.marker(store.location, { icon: generateIconByColor('blue') })
    marker.addTo(map)
    marker.bindPopup(generateMarkerContent(store))
    store['marker'] = marker
})

const initLeafletMap = async () => {
    map = L.map('map')
    map.setView(INIT_POSITION, getZoomValue())
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
        maxZoom: 19
    }).addTo(map)
    stores = await fetchStorePositions()
    initStoreMarkers()
}

// TAGS

const generateTagElement =  (name, id) => `
    <label for="${id}">
        <input type="checkbox" name="tag" id="${id}" value="${name}">
        <span>${name}</span>
    </label>
`

const fetchTags = async () => (await fetch('api/types')).json()



const initTags = async () => {
    let count = 0
    let tagList = $('#tags')
    let tags = await fetchTags()
    tags.forEach((tag) => {
        let tagElement = generateTagElement(tag, `tag_${++count}`)
        tagList.insertAdjacentHTML('beforeend', tagElement)
    })
}

// PRICE_LEVEL

const initPriceLevel = () => {
    let buttons = $$('.price_level_button')
    let buttonList = $('#price_level')
    buttons.forEach((button) => {
        button.addEventListener('click', function setPriceLevel () {
            let index = Array.from(buttons).indexOf(this)
            buttons.forEach((button) => {
                button.classList.remove('active')
            })
            buttons.forEach((button) => {
                let buttonIndex = Array.from(buttons).indexOf(button)
                if (buttonIndex <= index) {
                    button.classList.add('active')
                }
            })
            buttonList.dataset.value = (index + 1).toString()
        })
    })
}

/*
* TODO: add hover effect for price level
* */

// SMOOTH SCROLL

const currentYPosition = () => {
    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset) return self.pageYOffset
    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop
    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop) return document.body.scrollTop
    return 0
}

const elmYPosition = (eID) => {
    var elm = document.getElementById(eID)
    var y = elm.offsetTop
    var node = elm
    while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent
        y += node.offsetTop
    } return y
}

const smoothScroll = (eID) => {
    var startY = currentYPosition()
    var stopY = elmYPosition(eID)
    var distance = stopY > startY ? stopY - startY : startY - stopY
    if (distance < 100) {
        scrollTo(0, stopY); return
    }
    var speed = Math.round(distance / 100)
    if (speed >= 20) speed = 20
    var step = Math.round(distance / 25)
    var leapY = stopY > startY ? startY + step : startY - step
    var timer = 0
    if (stopY > startY) {
        for ( var i=startY; i<stopY; i+=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed)
            leapY += step; if (leapY > stopY) leapY = stopY; timer++
        } return
    }
    for ( var i=startY; i>stopY; i-=step ) {
        setTimeout("window.scrollTo(0, "+leapY+")", timer * speed)
        leapY -= step; if (leapY < stopY) leapY = stopY; timer++
    }
}

// SEARCH

const getFilterRules = () => ({
    keyword: $('#keyword').value,
        priceLevel: Number($('#price_level').dataset.value),
        tags: (() => {
        let checkedTags = []
        $$('[name=tag]').forEach((tagCheckbox) => {
            let value = tagCheckbox.value
            if (tagCheckbox.checked) checkedTags.push(value)
        })
        return checkedTags
    })()
})

const listFilteredStores = () => {
    let rules = getFilterRules()
    stores.forEach((store) => map.removeLayer(store.marker))
    stores.map((store) => {
        let storePriceLevel = getPriceLevel(store.price_level)
        if (
            (store.name.search(rules.keyword) !== -1) &&
            (storePriceLevel <= rules.priceLevel) &&
            (rules.tags.every((tag) => store.type.includes(tag)))
        ) return store
    }).filter(Boolean).forEach((store) => {
        store.marker.addTo(map)
    })
    smoothScroll('map')
}

window.onload = async function () {
    initLeafletMap()
    initTags()
    initPriceLevel()
    $('#search').addEventListener('click', listFilteredStores)
}
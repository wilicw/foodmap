import { smoothScroll } from "./scroll.js";
import { Map } from "./map.js";
import { Store, Filter } from "./store.js";
import { Menu } from "./menu.js";

const $ = (q) => document.querySelector(q),
     $$ = (q) => document.querySelectorAll(q)

let map, stores, tags;

const initMap = () => {
    map = new Map($('#map'))
}

window.stores = () => console.log(stores)

const initStore = async () => {
    stores = await Store.fetchList()
    const onMarkerClick = async (e) => {
        let id = e.target.options._id
        let full = await Store.fetchStoreDetails(id)
        stores[id] = {extended: true, ...stores[id], ...full}
        storeInfo(stores[id])
    }
    Store.forEach(stores, (store) => {
        stores[store._id].score = Store.getAverageScore(store.scores)
        stores[store._id].priceLevelDescription = Store.describePriceLevel(store.price_level)
        stores[store._id].marker = Map.generateMarker(store, onMarkerClick)
        map.addMarker(store.marker)
    })
}

const storeInfo = (store) => {
    $('#store_name').innerText = store.name
    $('#store_about').innerText = `${store.score}分 · ${store.priceLevelDescription}價位`
    $('main').classList.add('store')
}

const Search = () => {
    const storeList = $('#store_list')
    Store.forEach(stores, (store) => map.map.removeLayer(store.marker))
    while (storeList.firstChild) storeList.removeChild(storeList.firstChild)
    Store.forEach(Filter.applyFilter(stores), (store) => {
        storeList.appendChild(Menu.generateStoreListItem(store, (storeListItem) => {
            storeInfo(stores[storeListItem.id])
        }))
        store.marker.addTo(map.map)
    })
    smoothScroll('map')
}

const initTagList = async () => {
    const tagList = $('#filter_tag')
    tags = await Store.fetchTagList()
    for (let tag of tags) {
        tagList.appendChild(Menu.generateTagItem(tag))
    }
}

const initStoreList = () => {
    const storeList = $('#store_list')
    Store.forEach(stores, (store) => {
        storeList.appendChild(Menu.generateStoreListItem(store, (storeListItem) => {
            storeInfo(stores[storeListItem.id])
        }))
    })
}

const initTextInput = () => {
    const restaurantName = $('#restaurant_name'),
        clearRestaurantName = $('#clear_restaurant_name'),
        menu = $('main')
    restaurantName.addEventListener('input', (e) => {
        if (restaurantName.value) {
            clearRestaurantName.classList.add('active')
        } else {
            clearRestaurantName.classList.remove('active')
        }
        Search()
    })
    clearRestaurantName.addEventListener('click', (e) => {
        menu.classList.remove('search')
        restaurantName.value = ''
        restaurantName.dispatchEvent(new Event('input'))
    })
}

const initToggleFilter = () => {
    const filter = $('#filter')
    const toggleFilter = $('#toggle_filter')
    toggleFilter.addEventListener('click', (e) => {
        let prevStat = toggleFilter.classList.contains('active')
        toggleFilter.innerText = `${prevStat ? '展開' : '收起'}篩選條件`
        filter.classList[prevStat ? 'remove' : 'add']('active')
        toggleFilter.classList[prevStat ? 'remove' : 'add']('active')
    })
}

const initSelectable = () => {
    $$('label.selectable').forEach((element) => {
        element.addEventListener('click', (e) => {
            let action = element.classList.contains('active') ? 'remove' : 'add'
            element.classList[action]('active')
            Search()
        })
    })
}

const initToggleSearch = () => {
    const toggleMenu = $('#toggle_search')
    const menu = $('main')
    toggleMenu.addEventListener('click', (e) => {
        let prevStat =  menu.classList.contains('search')
        menu.classList[prevStat ? 'remove' : 'add']('search')
    })
}

const initPriceLevel = () => {
    let priceLevelButtons = $$('.price_level_button')
   priceLevelButtons.forEach((priceLevelButton) => {
        priceLevelButton.addEventListener('click', function (e) {
            priceLevelButtons.forEach((priceLevelButton) => {
                priceLevelButton.classList.remove('active')
            })
            this.classList.add('active')
            Search()
        })
    })
}

const initClearFilter = () => {
    const clearFilterButton = $('#clear_filter')
    clearFilterButton.addEventListener('click', (e) => {
        $$('div .active').forEach((button) => {
            button.classList.remove('active')
            Search()
        })
    })
}

const initCloseStore = () => {
    const closeStore = $('#close_store')
    const main = $('main')
    closeStore.addEventListener('click', (e) => {
        main.classList.remove('store')
    })
}

const initMenuControl = () => {
    initTextInput()
    initToggleFilter()
    initSelectable()
    initToggleSearch()
    initPriceLevel()
    initClearFilter()
    initCloseStore()
}

const initMenu = async () => {
    await initTagList()
    initMenuControl()
    initStoreList()
}

window.onload = async () => {
    await initMap()
    await initStore()
    await initMenu()
}
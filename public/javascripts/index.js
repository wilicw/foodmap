import { smoothScroll } from "./scroll.js";
import { Map } from "./map.js";
import { Store, Filter } from "./store.js";
import { Menu } from "./menu.js";

const $ = (q) => document.querySelector(q),
     $$ = (q) => document.querySelectorAll(q)

let map, stores, tags, categories;

const initMap = () => {
    map = new Map($('#map .leaflet-map'))
}

const initStore = async () => {
    const menu = $('main')
    stores = await Store.fetchList()
    const onMarkerClick = (e) => {
        e.originalEvent.stopPropagation()
        menu.classList.remove('search')
        let id = e.target.options._id
        storeInfo(id)
    }
    Store.forEach(stores, (store) => {
        stores[store._id].score = Store.getAverageScore(store.scores)
        stores[store._id].priceLevelDescription = Store.describePriceLevel(store.price_level)
        stores[store._id].marker = Map.generateMarker(store, onMarkerClick)
        map.addMarker(store.marker)
    })
}

const storeInfo = async (id) => {
    let store = stores[id], full
    $('main').classList.add('store')
    if (!stores[id].extended) {
        $('#store').classList.add('loading')
        full = await Store.fetchStoreDetails(store._id)
        $('#store').classList.remove('loading')
        stores[id] = {extended: true, ...stores[id], ...full}
    }
    $('#store_name').innerText = store.name
    $('#store_about').innerText = `${store.score}分 · ${store.priceLevelDescription}價位`
    $('#store_menu').innerHTML = ''
    $('#store').classList.remove('active')
    $('#store').classList[stores[id].menu ? 'remove' : 'add']('empty')
    $('#toggle_store_menu').innerText = stores[id].menu ? '菜單' : '暫無菜單'
    if (stores[id].menu) $('#store_menu').appendChild(Menu.processStoreMenuData(stores[id]))
}

const Search = () => {
    const storeList = $('#store_list')
    Store.forEach(stores, (store) => map.map.removeLayer(store.marker))
    while (storeList.firstChild) storeList.removeChild(storeList.firstChild)
    Store.forEach(Filter.applyFilter(stores), (store) => {
        storeList.appendChild(Menu.generateStoreListItem(store, (storeListItem) => {
            $('main').classList.remove('search')
            storeInfo(storeListItem.id)
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

const initCategoriesList = async () => {
    const CategoriesList = $('#filter_categories')
    categories = await Store.fetchCategoriesList()
    for (let category of categories) {
        CategoriesList.appendChild(Menu.generateCategoriesItem(category))
    }
}

const initStoreList = () => {
    const storeList = $('#store_list'),
          menu = $('main')
    Store.forEach(stores, (store) => {
        storeList.appendChild(Menu.generateStoreListItem(store, (storeListItem, e) => {
            e.stopPropagation()
            menu.classList.remove('search')
            storeInfo(storeListItem.id)
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
        menu.classList.remove('store')
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
    const store = $('#store')
    closeStore.addEventListener('click', (e) => {
        main.classList.remove('store')
        store.classList.remove('active')
    })
}

const initStoreMenu = () => {
    const store = $('#store'),
          main = $('main'),
          toggle = $('#toggle_store_menu'),
          menu = $('#store_menu')
    store.addEventListener('click', (e) => {
        e.stopPropagation()
    })
    window.addEventListener('click', (e) => {
        main.classList.remove('store')
        store.classList.remove('active')
    })
    toggle.addEventListener('click', (e) => {
        if (menu.firstChild) {
            store.classList.add('active')
        }
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
    initStoreMenu()
}

const initMenu = async () => {
    await initTagList()
    await initCategoriesList()
    initMenuControl()
    initStoreList()
}

const registerServiceWorker = (e) => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
    }
}

const checkInternet = () => {
    if (!navigator.onLine) {
        $('#offline').classList.add('active')
    }
    window.addEventListener('online', (e) => {
        location.reload()
    })
}

window.onload = async () => {
    registerServiceWorker()
    checkInternet()
    await initMap()
    await initStore()
    $('#map .load').style.display = 'none'
    await initMenu()
}
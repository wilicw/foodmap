import { Map } from "./map.js";
import { StoreList, Filter } from "./store.js";
import { Menu } from "./menu.js";

let map, stores

const initPrototype = () => {
    Element.prototype.classIf = function (name, cond) {
        if (arguments.length === 1) cond = !this.classList.contains(name)
        this.classList[cond ? 'add' : 'remove'](name)
    }
}

const initMap = () => {
    map = new Map('map')
    map.map.setView([25.03210, 121.54257], Map.getZoom())
    map.source = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
}

const storeListItemConfig = {
    onclick: async (store, target, e=false) => {
        const elmStore = document.getElementById('store')
        if (!store.extended) {
            elmStore.classList.add('loading')
            let full = await StoreList.fetchStoreData(store)
            elmStore.classList.remove('loading')
            store = {extended: true, ...store, ...full}
            stores[store._id] = store
        }
        Menu.setStore(store)
        setView('map')
        map.goto(store.location, 20)
        Menu.setTab(elmStore)
        if (e) e.stopPropagation()
    },
    onlocate: (store, target, e) => {
        e.stopPropagation()
        setView('map')
        map.goto(store.location, 20)
    },
    onbookmark: (store, target, e) => {
        e.stopPropagation()
        target.classIf('active')
    }
}

const Search = () => {
    const elmStoreList = document.getElementById('store_list')
    stores.forEach((store) => map.map.removeLayer(store.marker))
    while (elmStoreList.firstChild) elmStoreList.removeChild(elmStoreList.firstChild)
    Filter.applyFilter(stores).forEach((store) => {
        map.insertMarker(store.marker)
        elmStoreList.appendChild(Menu.createStoreListItem(store, storeListItemConfig))
    })
}

const setView = (name) => {
    const elmBottomNav = document.getElementById('bottom_nav')
    const elmBottomNavButton = elmBottomNav.querySelector(`[data-target=${name}]`)
    let prev = elmBottomNav.getElementsByClassName('active')
    if (prev) prev[0].classList.remove('active')
    if (name === 'explore') {
        Menu.setTab(document.getElementById('store_list'))
    }
    if (name !== 'explore') {
        document.getElementById('toggle_filter').classList.remove('active')
    }
    elmBottomNavButton.classList.add('active')
    document.getElementsByTagName('main')[0].dataset.view = name
}

const initStore = async () => {
    const elmStoreList = document.getElementById('store_list'),
          elmStore = document.getElementById('store'),
        elmStoreClose = document.getElementsByClassName('store_close')[0]
    stores = new StoreList()
    await stores.fetchData('api/stores')
    stores.forEach((store) => {
        store.marker = Map.createMarker(store, storeListItemConfig.onclick.bind())
        map.insertMarker(store.marker)
        elmStoreList.appendChild(Menu.createStoreListItem(store, storeListItemConfig))
    })
    elmStore.addEventListener('click', (e) => {
        elmStore.classList.add('expand')
        e.stopPropagation()
    })
    elmStore.addEventListener('touchend', (e) => {
        elmStore.classList.add('expand')
        e.stopPropagation()
    })
    window.addEventListener('click', (e) => {
        elmStore.classList.remove('expand')
        elmStore.classList.remove('active')
        document.getElementById('map').classList.remove('shrink')
    })
    elmStoreClose.addEventListener('click', (e) => {
        elmStore.classList.remove('expand')
        elmStore.classList.remove('active')
        Menu.setTab(elmStoreList)
        document.getElementById('map').classList.remove('shrink')
    })
}

const initStoreNameInput = () => {
    const elmStoreName = document.getElementById('store_name'),
          elmClearStoreName = document.getElementsByClassName('store_name_clear')[0]
    elmStoreName.addEventListener('input', (e) => {
        elmClearStoreName.classIf('active', elmStoreName.value)
        Search()
    })
}

const initStoreRate = () => {
    let elmScoreButtonList = document.getElementsByClassName('store_rate')[0].children
    Array.from(elmScoreButtonList).forEach((elmScoreButton) => {
        elmScoreButton.addEventListener('click', (e) => {
            let targetIndex = Array.prototype.indexOf.call(elmScoreButtonList, elmScoreButton)
            Array.from(elmScoreButtonList).forEach((elmScoreButton) => {
                let thisIndex = Array.prototype.indexOf.call(elmScoreButtonList, elmScoreButton)
                elmScoreButton.classIf('active', thisIndex <= targetIndex)
            })
        })
    })
}

const initToggles = () => {
    const elmToggleFilter = document.getElementById('toggle_filter'),
          elmFilter = document.getElementById('filter'),
          elmStoreList = document.getElementById('store_list')
    elmToggleFilter.addEventListener('click', (e) => {
        elmToggleFilter.classIf('active')
        if (elmToggleFilter.classList.contains('active')) setView('explore')
        Menu.setTab(elmToggleFilter.classList.contains('active') ? elmFilter : elmStoreList)
    })
}

const initBottomNav = () => {
    const elmBottomNav = document.getElementById('bottom_nav')
    Array.from(elmBottomNav.children).forEach((elmBottomNavButton) => {
        elmBottomNavButton.addEventListener('click', (e) => {
            setView(elmBottomNavButton.dataset.target)
        })
    })
}

const initControl = () => {
    initToggles()
    initStoreNameInput()
    initStoreRate()
    initBottomNav()
}

const initFilter = async () => {
    const elmsPriceLevel = document.getElementsByName('price_level')
    elmsPriceLevel.forEach((elmPriceLevel) => {
        elmPriceLevel.addEventListener('click', function (e) {
            const elmPrevActive = document.querySelector('[name=price_level].active')
            if (elmPrevActive) elmPrevActive.classList.remove('active')
            this.classList.add('active')
            Search()
        })
    })
    const elmCategoryList = document.getElementsByClassName('filter_category')[0],
            elmTypeList = document.getElementsByClassName('filter_type')[0]
    const categories = await StoreList.fetchCategoriesList(),
          types = await StoreList.fetchTypeList()
    // TODO: func:onclick - move selected items to the first
    const onclick = (e) => {
        e.target.classIf('active')
        Search()
    }
    categories.forEach((category) => elmCategoryList.appendChild(Menu.createCategoryItem(category, onclick)))
    types.forEach((type) => elmTypeList.appendChild(Menu.createTypeItem(type, onclick)))
}

window.onload = async () => {
    initPrototype()
    initControl()
    initMap()
    await initStore()
    await initFilter()
}
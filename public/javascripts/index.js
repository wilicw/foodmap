import { Map } from "./map.js";
import { StoreList, Filter } from "./store.js";
import { Menu } from "./menu.js";
import { User } from "./user.js";

let map, stores

const elmStoreList = document.getElementById('store_list'),
      elmStore = document.getElementById('store'),
      elmStoreClose = document.getElementsByClassName('store_close')[0],
      elmToggleFilter = document.getElementById('toggle_filter'),
      elmFilter = document.getElementById('filter')

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
        if (!store.extended) {
            elmStore.classList.add('loading')
            let full = await StoreList.fetchStoreData(store)
            elmStore.classList.remove('loading')
            store = {extended: true, ...store, ...full}
            stores[store._id] = store
        }
        Menu.setStore(store)
        setView('map')
        initSeats()
        initStoreRate()
        map.goto(store.location, 20)
        Menu.setTab(elmStore)
        elmStore.classList.remove('expand')
        elmStore.classList.add('active')
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
        Menu.setTab(elmStoreList)
    }
    if (name !== 'explore') {
        elmToggleFilter.classList.remove('active')
    }
    elmBottomNavButton.classList.add('active')
    document.getElementsByTagName('main')[0].dataset.view = name
}

const initStore = async () => {
    const resetStoreList = () => {
        elmStore.classList.remove('expand')
        elmStore.classList.remove('active')
        Menu.setTab(elmStoreList)
        document.getElementById('map').classList.remove('shrink')
    }
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

    let touchMoveStart
    elmStore.addEventListener('touchstart', (e) => {
        touchMoveStart = e.touches[0].clientY
    })
     
    elmStore.addEventListener('touchend', (e) => {
        let touchMoveEnd = e.changedTouches[0].clientY
        if (elmStore.scrollTop < 5) {
            if (touchMoveStart < touchMoveEnd - 5) {
                elmStore.classList.remove('expand')
            }
        }
        if(touchMoveStart > touchMoveEnd + 5) {
            elmStore.classList.add('expand')
        }
        e.stopPropagation()
    })
    document.getElementById('bottom_nav').addEventListener('click', (e) => {
        resetStoreList()
    })
    elmStoreClose.addEventListener('click', (e) => {
        resetStoreList()
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
        elmScoreButton.classList.remove('active')
        elmScoreButton.addEventListener('click', (e) => {
            let targetIndex = Array.prototype.indexOf.call(elmScoreButtonList, elmScoreButton)
            Array.from(elmScoreButtonList).forEach((elmScoreButton) => {
                let thisIndex = Array.prototype.indexOf.call(elmScoreButtonList, elmScoreButton)
                elmScoreButton.classIf('active', thisIndex <= targetIndex)
            })
        })
    })
}

const initSeats = () => {
    let elmSeatsButtonList = document.getElementsByClassName('store_mark_seat')[0].children
    Array.from(elmSeatsButtonList).forEach((elmSeatsButton) => {
            elmSeatsButton.classList.remove('active')
            elmSeatsButton.addEventListener('click', (e) => {
            Array.from(elmSeatsButtonList).forEach((elmSeatsButton) => {
                elmSeatsButton.classList.remove('active')
            })
            let seatsStatus = Array.prototype.indexOf.call(elmSeatsButtonList, elmSeatsButton)
            Menu.sendSeatsStatus(seatsStatus)
            e.srcElement.classList.add('active')
        })
    })
}

const initToggles = () => {
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

const initFirebaseApi = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyDGJZSiVy05E1ypRBqIXbF1qsoopqa1JY0",
        authDomain: "daanfoodmap.firebaseapp.com",
        databaseURL: "https://daanfoodmap.firebaseio.com",
        projectId: "daanfoodmap",
        storageBucket: "daanfoodmap.appspot.com",
        messagingSenderId: "104547902017",
        appId: "1:104547902017:web:d4ce838822441d54301cc0",
        measurementId: "G-48GH08JQHS"
    }
    firebase.initializeApp(firebaseConfig)
    firebase.analytics()
}

const initUser = () => {
    let user  = new User()
    if (localStorage.jwt) {
        User.showPage('personal')
        User.renderUserData()
    }
    document.getElementById('login_button').addEventListener('click', (e) => {
        User.loginWithGoogle()
    })
    document.getElementById('logout').addEventListener('click', (e) => {
        User.logout()
    })
    document.getElementById('save_data').addEventListener('click', (e) => {
        User.savePersonalData()
    })
}

const initControl = () => {
    initToggles()
    initStoreNameInput()
    initStoreRate()
    initSeats()
    initBottomNav()
    initFirebaseApi()
    initUser()
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
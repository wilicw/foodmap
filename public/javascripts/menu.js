import { StoreList } from "./store.js"

class Menu {

    static setStore (store) {
        let seatsStatus = `本店家暫無座位資訊`
        if (store.seats.length) {
            seatsStatus = StoreList.seatsLevel(store.seats[0].seats, store.seats[0].timestamp) 
        }
        document.getElementById('store')._id = store._id
        document.getElementsByClassName('store_name')[0].innerText = store.name
        document.getElementsByClassName('store_priceLevel')[0].innerText = store.plString
        document.getElementsByClassName('store_avgScore')[0].innerText = store.avgScore
        document.getElementsByClassName('store_numOfScore')[0].innerText = store.scores.length
        document.getElementsByClassName('store_seat_status')[0].innerText = seatsStatus
        if (store.menu && store.menu.length) {
            let elmStoreMenu  =document.getElementsByClassName('store_menu')[0]
            document.getElementsByClassName('store_menu_wrapper')[0].classList.remove('no_menu')
            while (elmStoreMenu.firstChild) elmStoreMenu.removeChild(elmStoreMenu.firstChild)
            elmStoreMenu.appendChild(this.processStoreMenuData(store.menu))
        } else {
            document.getElementsByClassName('store_menu_wrapper')[0].classList.add('no_menu')
        }

    }

    static setTab (element) {
        document.getElementById('map').classIf('shrink', element === document.getElementById('store'))
        const prevActiveElm = document.querySelector('.main_section_tab.active')
        if (prevActiveElm === element) return
        if (prevActiveElm) prevActiveElm.classList.remove('active')
        element.classList.add('active')
    }

    static createStoreListItem (store, config) {
        let elmStoreListItem = document.createElement('div')
        elmStoreListItem.insertAdjacentHTML('afterbegin', `<div class="store_list_item">
                    <div class="store_li_title">
                        <p class="store_li_name">${store.name}</p>
                        <span class="about">${store.avgScore}分 · ${store.plString}</span>
                    </div>
                    <div class="store_li_control"></div>
                </div>`)
        elmStoreListItem.addEventListener('click', function (e) {
            config.onclick(store, this, e)
        })
        let locateButton = document.createElement('button'),
            bookmarkButton = document.createElement('button')
        locateButton.className = 'store_li_locate'
        locateButton.insertAdjacentHTML('afterbegin', `<iconify-icon data-icon="cil-location-pin" data-inline="false"></iconify-icon>`)
        locateButton.addEventListener('click', function (e) {
            config.onlocate(store, this, e)
            config.onclick(store, this, e)
        })
        bookmarkButton.className = 'store_li_bookmark'
        bookmarkButton.insertAdjacentHTML('afterbegin', `<iconify-icon data-icon="mdi:bookmark-outline" data-inline="false"></iconify-icon>`)
        bookmarkButton.addEventListener('click', function (e) {
            config.onbookmark(store, this, e)
        })
        let control = elmStoreListItem.getElementsByClassName('store_li_control')[0]
        control.appendChild(locateButton)
        control.appendChild(bookmarkButton)
        return elmStoreListItem
    }

    static createTypeItem (type, onclick) {
        let elmType = document.createElement('button')
        elmType.name = 'type'
        elmType.onclick = onclick
        elmType.insertAdjacentText('afterbegin', type)
        return elmType
    }

    static createCategoryItem (category, onclick) {
        let elmCategory = document.createElement('button')
        elmCategory.name = 'category'
        elmCategory.onclick = onclick
        elmCategory.insertAdjacentText('afterbegin', category)
        return elmCategory
    }

    static getMenuCategories (menu) {
        let menuCategories = []
        menu.map(item => menuCategories.push(item.categories))
        menuCategories = [... new Set(menuCategories.flat())]
        return menuCategories
    }

    static processStoreMenuData (menu) {
        let menuCategories = this.getMenuCategories(menu)
        let menuHTML = document.createElement('div')
        menuHTML.insertAdjacentHTML('afterbegin', `<p class="store_card_title">菜單</p>`)
        menuCategories.map(categorie => {
            const items = menu.filter(item => item.categories === categorie)
            let categoriesHTML = document.createElement('div')
            categoriesHTML.className = 'pricing-box'
            let categorieTitle = document.createElement('h5')
            categorieTitle.innerText = categorie
            categoriesHTML.appendChild(categorieTitle)
            let itemList = document.createElement('ul')
            itemList.className = 'items-list'
            itemList.appendChild(this.generateMenuHeader(items[0]))
            items.map(item => {
                itemList.appendChild(this.generateMenuItem(item))
            })
            categoriesHTML.appendChild(itemList)
            menuHTML.appendChild(categoriesHTML)
        })
        let claim = `<p class="menu_claim lighter">菜單僅供參考，實際以店家公告為主</p>`
        menuHTML.insertAdjacentHTML('beforeend', claim)
        return menuHTML
    }

    static generateMenuHeader (item) {
        let headerLabel = document.createElement('li')
        headerLabel.className = 'lighter'
        headerLabel.innerText = '品項'
        if (item.size) {
            item.size.reverse().map(size => {
                let sizeLabel = document.createElement('span')
                sizeLabel.className = 'price_label'
                sizeLabel.innerText = size
                headerLabel.appendChild(sizeLabel)
            })
        } else if (item.types) {
            item.types.reverse().map(type => {
                let typeLabel = document.createElement('span')
                typeLabel.className = 'price_label'
                typeLabel.innerText = type
                headerLabel.appendChild(typeLabel)
            })
        } else {
            let typeLabel = document.createElement('span')
            typeLabel.className = 'price_label'
            typeLabel.innerText = '價格'
            headerLabel.appendChild(typeLabel)
        }
        return headerLabel
    }

    static menuItemHoverEffect (e) {
        if (Array.from(e.srcElement.classList).includes('active')) {
            e.srcElement.classList.remove('active')
        } else {
            e.srcElement.classList.add('active')
        }
    }

    static generateMenuItem (item) {
        let itemHTML = document.createElement('li')
        let newLine = '\u000D\u000A'
        if (item.description.length) {
            itemHTML.setAttribute('data-description', `備註: ${item.description}`)
            itemHTML.addEventListener('click', this.menuItemHoverEffect)
        }
        itemHTML.innerText = item.name
        let itemFormat = item.format
        if (itemFormat === 'drink' || itemFormat === 'main' | itemFormat === 'set') {
            item.price.reverse().map(price => {
                let price_label = document.createElement('span')
                price_label.className = 'price_label'
                price = price == -1 ? "​" : price
                price_label.innerText = price
                itemHTML.appendChild(price_label)
            })
        } else if (itemFormat === 'addon' || itemFormat === 'regular') {
            let price_label = document.createElement('span')
            price_label.className = 'price_label'
            price_label.innerText = item.price
            itemHTML.appendChild(price_label)
        }
        if (itemFormat === 'set') {
            let description = itemHTML.getAttribute('data-description')
            let subItemText = `${newLine}主餐：`
            item.items.map(subItem => {
                subItemText += newLine + "  ．" + subItem
            })
            itemHTML.setAttribute('data-description', `${description}${subItemText}`)
        } else if (itemFormat === 'drink') {
            let description = itemHTML.getAttribute('data-description')
            description = description ? description + newLine : ""
            if (item.types.length) {
                let additionalText = "溫度：" + item.types.join(" / ")
                itemHTML.setAttribute('data-description', `${description}${additionalText}`)
                itemHTML.addEventListener('click', this.menuItemHoverEffect)
            }
        }
        return itemHTML
    }

    static async sendSeatsStatus (seatsStatus) {
        let StoreID = document.getElementById('store')._id
        await fetch(`api/seats/${StoreID}`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    seats: seatsStatus
                })
            })
        seatsStatus = StoreList.seatsLevel(seatsStatus, new Date().getTime())
        document.getElementsByClassName('store_seat_status')[0].innerText = seatsStatus
        return
    }

}

export { Menu }
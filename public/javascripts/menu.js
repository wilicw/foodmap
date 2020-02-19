
class Menu {

    static generateTagItem (tag) {
        let tagItem = document.createElement('label')
        tagItem.className = 'li_tag selectable'
        tagItem.insertAdjacentText('beforeend', tag)
        return tagItem
    }

    static generateCategoriesItem (category) {
        let categoriesItem = document.createElement('label')
        categoriesItem.className = 'category_button selectable'
        categoriesItem.insertAdjacentText('beforeend', category)
        return categoriesItem
    }

    static generateStoreListItem (store, onclick) {
        let storeListItem = document.createElement('div')
        storeListItem.className = 'li_store'
        storeListItem.id = store._id
        storeListItem.insertAdjacentHTML('beforeend',
            `<p class="li_store_name">${store.name}</p>` +
            `<span class="li_about">${store.score}分 · ${store.priceLevelDescription}價位</span>`)
        storeListItem.addEventListener('click', function (e) {onclick(this, e)})
        return storeListItem
    }

    static getMenuCategories (menu) {
        let menuCategories = []
        menu.map(item => menuCategories.push(item.categories))
        menuCategories = [... new Set(menuCategories.flat())]
        return menuCategories
    }

    static processStoreMenuData (store) {
        let menu = store.menu
        let menuCategories = this.getMenuCategories(menu)
        let menuHTML = document.createElement('div')
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

}

export { Menu }
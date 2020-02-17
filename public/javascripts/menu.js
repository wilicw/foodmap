class Menu {

    static generateTagItem (tag) {
        let tagItem = document.createElement('label')
        tagItem.className = 'li_tag selectable'
        tagItem.insertAdjacentText('beforeend', tag)
        return tagItem
    }

    static generateStoreListItem (store, onclick) {
        let storeListItem = document.createElement('div')
        storeListItem.className = 'li_store'
        storeListItem.id = store._id
        storeListItem.insertAdjacentHTML('beforeend',
            `<p class="li_store_name">${store.name}</p>` +
            `<span class="li_about">${store.score}分 · ${store.priceLevelDescription}價位</span>`)
        storeListItem.addEventListener('click', function (e) {onclick(this)})
        return storeListItem
    }

}

export { Menu }
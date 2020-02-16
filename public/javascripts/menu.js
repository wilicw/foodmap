class Menu {

    static generateTagItem (tag) {
        let tagItem = document.createElement('label')
        tagItem.className = 'li_tag selectable'
        tagItem.insertAdjacentText('beforeend', tag)
        return tagItem
    }

    static generateStoreListItem (store) {
        return `<div class="li_store">` +
            `<p class="li_store_name">${store.name}</p>` +
            `<span class="li_about">${store.score}分 · ${store.priceLevelDescription}價位</span>` +
            `</div>`
    }

}

export { Menu }
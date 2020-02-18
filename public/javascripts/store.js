class Store {

    static async fetchList () {
        let output = {}, raw_list = await (await fetch('api/stores')).json()
        raw_list.forEach((store) => {output[store._id] = store})
        return output
    }

    static async fetchTagList () {
        return (await fetch('api/types')).json()
    }

    static async fetchCategoriesList () {
        return (await fetch('api/categories')).json()
    }

    static async fetchStoreDetails (id) {
        return (await fetch(`api/store/${id}`)).json()
    }

    static getAverageScore (scores) {
        let sum = 0
        if (!scores.length) return '未評'
        scores.map((score) => { sum += score.score })
        return sum / scores.length
    }

    static describePriceLevel (price_level) {
        if (price_level === '$') return '低'
        if (price_level === '$$') return '中'
        if (price_level === '$$$') return '高'
        return '未知'
    }

    static forEach (storeList, handler) {
        for (let entry of Object.entries(storeList)) {
            handler(entry[1])
        }
    }

}

class Filter {

    static getFilterRules () {
        const $ = (q) => document.querySelector(q),
            $$ = (q) => document.querySelectorAll(q)
        const advFilter = $('#toggle_filter').classList.contains('active')
        return {
            advFilter: advFilter,
            restaurantName: $('#restaurant_name').value,
            maxPriceLevel: !advFilter ? 3 : (
                ($('.price_level_button.active') &&
                    $('.price_level_button.active').innerText.length) || 3),
            selectedCategories: (() => {
                let checkedCategories = []
                $$('.category_button').forEach((categorieCheckbox) => {
                    if (categorieCheckbox.classList.contains('active')) checkedCategories.push(categorieCheckbox.innerText)
                })
                return checkedCategories
            })(),
            selectedTags: (() => {
                let checkedTags = []
                $$('.li_tag').forEach((tagCheckbox) => {
                    if (tagCheckbox.classList.contains('active')) checkedTags.push(tagCheckbox.innerText)
                })
                return checkedTags
            })()
        }
    }

    static filterRestaurantName (match, store) {
        if (match.length === 0) return true
        return (store.name.toLowerCase().search(match.toLowerCase()) !== -1)
    }

    static filterPriceLevel (match, store) {
        return (store.price_level.length <= match)
    }

    static filterCategories (match, store) {
        let matches = false
        store.categories.forEach((category) => {
            if (match.includes(category)) matches = true
        })
        return matches
    }

    static filterTags (match, store) {
        let matches = false
        store.type.forEach((tag) => {
            if (match.includes(tag)) matches = true
})
        return matches
    }

    static applyFilter (list) {
        let rules = this.getFilterRules()
        let filtered = {}
        Store.forEach(list, (store) => {
            console.log(store.name,rules)
            let isMatchName = this.filterRestaurantName(rules.restaurantName, store)
            let isMatchPriceLevel = this.filterPriceLevel(rules.maxPriceLevel, store)
            let isMatchCategories = this.filterCategories(rules.selectedCategories, store) || !rules.selectedCategories.length
            let isMatchTags = this.filterTags(rules.selectedTags, store) || !rules.selectedTags.length
            if (
                isMatchName &&
                isMatchPriceLevel &&
                isMatchTags &&
                isMatchCategories
            ) filtered[store._id] = store
        })
        return filtered
    }

}

export { Store, Filter }
class Store {

    static async fetchList () {
        let output = {}, raw_list = await (await fetch('api/stores')).json()
        raw_list.forEach((store) => {output[store._id] = store})
        return output
    }

    static async fetchTagList () {
        return (await fetch('api/types')).json()
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
            time: !advFilter ? ['早餐','午餐','晚餐'] : ((() => {
                let list = []
                $$('.time_button').forEach((button) => {
                    if (button.classList.contains('active')) {
                        list.push(button.innerText)
                    }
                })
                if (!list.length) list = ['早餐','午餐','晚餐']
                return list
            })()),
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
        if (!match.length) return true
        return match.every((tag) => store.type.includes(tag))
    }

    static applyFilter (list) {
        let rules = this.getFilterRules()
        let filtered = {}
        Store.forEach(list, (store) => {
            console.log(store.name,rules)
            if (
                this.filterRestaurantName(rules.restaurantName, store) &&
                this.filterPriceLevel(rules.maxPriceLevel, store) &&
                this.filterCategories(rules.time, store) &&
                this.filterTags(rules.selectedTags, store)
            ) filtered[store._id] = store
        })
        return filtered
    }

}

export { Store, Filter }
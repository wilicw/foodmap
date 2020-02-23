class StoreList {

    constructor () {
        this.list = {}
    }

    fetchData (path) {
        return new Promise(async (resolve, reject) => {
            (await fetch(path)).json().then((raw) => {
                raw.forEach((store) => {
                    store.avgScore = StoreList.avgScore(store.scores)
                    store.plString = StoreList.priceLevel(store.price_level, 'string')
                    this.list[store._id] = store
                })
                resolve()
            }).catch((error) => {
                this.list = this.list || {}
                reject(error)
            })
        })
    }

    forEach (method) {
        Object.entries(this.list).forEach((entry) => method(entry[1]))
    }

    static avgScore (scores) {
        let sum = 0
        scores.forEach((score) => {sum += score.score})
        return (sum / scores.length) || 0
    }

    static priceLevel (value = 0, format = 'symbol') {
        value = (typeof value === 'string') ? value.length : value
        let text = {
            number: [0, 1, 2, 3],
            symbol: ['', '$', '$$', '$$$'],
            string: ['未知價位', '低價位', '中價位', '高價位']
        }
        return text[format] ? text[format][value] : false
    }

    static seatsLevel (value, timestamp) {
        value = (typeof value === 'string') ? value.length : value
        let text = {
            string: ['空閒', '普通', '繁忙', '極為繁忙']
        }
        return text.string[value] + " · " + this.timestampConvertToHumanFormat(timestamp)
    }

    static timestampConvertToHumanFormat (timestamp) {
        let zeroize = (num) => {
            return (String(num).length == 1 ? '0' : '') + num
        }
        let currentTimestamp = new Date().getTime()
        let timestampDiff = currentTimestamp - timestamp
        let currentDate = new Date(currentTimestamp)
        let timestampDate = new Date(timestamp)
        let Y = timestampDate.getFullYear(), m = timestampDate.getMonth()+1, d = timestampDate.getDate();
        let H = timestampDate.getHours(), i = timestampDate.getMinutes(), s = timestampDate.getSeconds();
        if ( timestampDiff < 60000 ) {
            return "剛剛";
        } else if( timestampDiff < 3600000 ) {
            return `${Math.floor(timestampDiff/60000)}分鐘前`;
        } else if (currentDate.getFullYear() === Y && currentDate.getMonth() + 1 === m && currentDate.getDate() === d ) {
            return `今天 ${zeroize(H)}:${zeroize(i)}`
        } else {
            let yesterday = new Date(currentTimestamp - 86400000)
            if (yesterday.getFullYear() === Y && yesterday.getMonth()+1 === m && yesterday.getDate() === d ) {
                return `昨天 ${zeroize(H)}:${zeroize(i)}`
            } else if (currentDate.getFullYear() === Y) {
                return `${zeroize(m)}月${zeroize(d)}日 ${zeroize(H)}:${zeroize(i)}`
            } else {
                return `${Y}年${zeroize(m)}月${zeroize(d)}日${zeroize(H)}:${zeroize(i)}`
            }
        }
    }

    static async fetchStoreData (store) {
        return await (await fetch(`api/store/${store._id}`)).json()
    }

    static async fetchTypeList () {
        return (await fetch('api/types')).json()
    }

    static async fetchCategoriesList () {
        return (await fetch('api/categories')).json()
    }

}

class Filter {

    static getFilterRules () {
        const elmPriceLevel = document.querySelector('[name=price_level].active'),
            elmsCategory = document.getElementsByName('category'),
            elmsType = document.getElementsByName('type')
        return {
            restaurantName: document.getElementById('store_name').value,
            maxPriceLevel: !(() => {
                return elmPriceLevel ? elmPriceLevel.innerText.length : 3
            }),
            selectedCategories: !(() => {
                let categories = []
                elmsCategory.forEach((elmCategory) => {
                    if (elmCategory.classList.contains('active')) categories.push(elmCategory.innerText)
                })
                return categories
            }),
            selectedType: !(() => {
                let types = []
                elmsType.forEach((elmType) => {
                    if (elmType.classList.contains('active')) types.push(elmType.innerText)
                })
                return types
            })
        }
    }

    static filterRestaurantName (match, store) {
        if (match.length === 0) return true
        return (store.name.toLowerCase().search(match.toLowerCase()) !== -1)
    }

    static filterPriceLevel (match, store) {
        if (match.length === 0) return true
        return (store.price_level.length <= match)
    }

    static filterCategories (match, store) {
        if (match.length === 0) return true
        let matches = false
        store.categories.forEach((category) => {
            if (match.includes(category)) matches = true
        })
        return matches
    }

    static filterTypes (match, store) {
        if (match.length === 0) return true
        let matches = false
        store.type.forEach((type) => {
            if (match.includes(type)) matches = true
        })
        return matches
    }

    static applyFilter (list) {
        let rules = this.getFilterRules()
        console.log(rules)
        let filtered = new StoreList()
        list.forEach((store) => {
            let isMatchName = this.filterRestaurantName(rules.restaurantName, store)
            let isMatchPriceLevel = this.filterPriceLevel(rules.maxPriceLevel, store)
            let isMatchCategories = this.filterCategories(rules.selectedCategories, store)
            let isMatchTypes = this.filterTypes(rules.selectedType, store)
            if (isMatchName && isMatchPriceLevel && isMatchTypes && isMatchCategories) {
                console.log(store.name)
                filtered.list[store._id] = store
            }
        })
        return filtered
    }

}


export { StoreList, Filter }
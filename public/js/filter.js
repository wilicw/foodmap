let price

let change_price = () => {
  price = $("#price_filter").value
  $("#max_price").innerHTML = price
}
change_price()

let search = () => {

  let search_text = $("#search_text").value

  let types = []
  _.getElementsByName("type_of_food").forEach(element => {
    if (element.checked) {
      types.push(element.value)
    }
  })
  stores.forEach(store => {
    map.removeLayer(store.marker) 
  })
  
  stores.forEach(store => {
    // process types filter
    let numoftype = 0
    if (types.length == 0) {
      numoftype++
    }
    types.forEach(type => {
      if (store.type.includes(type)) {
        numoftype++
      }
    })
    
    if (store.price[0]+store.price[1] < price*2) {
      if (numoftype) {
        if (!store.name.search(search_text)) {
          store.marker.addTo(map)
        }
      }
    }
  })

  smoothScroll('map')
}
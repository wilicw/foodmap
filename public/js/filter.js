let price, price_level

let to_price_level = () => {
  if (price < 100) {
    price_level = "$"
  } else if (price >= 100 && price < 200) {
    price_level = "$$"
  } else {
    price_level = " $$$"
  }
}

let change_price = () => {
  price = $("#price_filter").value
  to_price_level()
  $("#max_price").innerHTML = price_level
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
    
    if (store.price_level.length <= price_level.length) {
      if (numoftype) {
        if (!store.name.search(search_text)) {
          store.marker.addTo(map)
        }
      }
    }
  })

  smoothScroll('map')
}
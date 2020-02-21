// Copyright - Oskar Krawczyk (oskar@krawczyk.io)

class Filter {

  constructor(productsData){
    this.filters    = document.querySelector("#filters .fieldset")
    this.blankslate = document.querySelector("#blankslate")
    this.results    = document.querySelector("#results")
    this.data       = productsData

    // initial lisitng of all products
    this.buildFilters()
    this.filterProducts()
    this.preselectFilters()
  }

  buildFilters(){

    // ignore some columns from the JSON data
    let ignore  = [
      "Index",
      "Nazwa",
      "Zdjęcie produktu", "Data (kiedy możemy to pokazać)"
    ]
    let store   = {}
    let selects = {}

    Object.keys(this.data[0]).forEach((filter) => {
      if (ignore.indexOf(filter) < 0){
        selects[filter] = this.createFilterSelect(filter)
        store[filter] = []

        Object.keys(this.data).forEach((item) => {
          this.ignoreExisting(store[filter], this.data[item][filter])
        })
      }
    })

    // special case for colors
    store["Kolor"] = this.buildColors(store["Kolor"])

    // fill selects with options
    Object.keys(selects).forEach((selectFilter) => {
      this.buildOptions(selects, selectFilter, store)
    })
  }

  buildOptions(selects, selectFilter, store){

    // first empty option
    let option       = document.createElement("option")
    option.value     = ""
    option.innerText = ""
    selects[selectFilter].appendChild(option)

    store[selectFilter].forEach((item) => {
      let option       = document.createElement("option")
      option.value     = item
      option.innerText = item
      selects[selectFilter].appendChild(option)
    })
  }

  buildColors(colors){
    colors = colors.join(", ").split(", ")

    let tempColorStorage = []
    Object.keys(colors).forEach((color) => {

      // discard existing colors
      if (tempColorStorage.indexOf(colors[color]) < 0){
        tempColorStorage.push(colors[color])
      }
    })

    return tempColorStorage
  }

  createFilterSelect(filter){
    let p = document.createElement("p")
    p.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9" /></svg>`

    let label = document.createElement("label")
    label.innerText = filter

    let select = document.createElement("select")
    select.name = filter
    select.addEventListener("change", (event) => {
      event.preventDefault()
      event.stopPropagation()

      history.pushState({}, "", this.getSelections())
      this.filterProducts()
    })

    p.appendChild(label)
    p.appendChild(select)
    this.filters.appendChild(p)

    return select
  }

  ignoreExisting(arr, item){
    if (arr.indexOf(item) < 0){
      return arr.push(item)
    }
  }

  getSelections(){
    let all = document.querySelectorAll("#filters select")
    let out = []
    Array.from(all).forEach(function(el){
      let value = el[el.selectedIndex].value
      if (value !== ""){
        out.push(`${el.name}=${value}`)
      }
    })

    return `#${out.join("&")}`
  }

  decodeParams(){
    let decoded = {}
    let params = document.location.hash.split("#").pop()
    params = params.split("&")
    params.forEach((param) => {
      let key, value
      [key, value] = param.split("=")
      if (key === "Kolor"){
        decoded["_text"] = true
      }

      if (value){
        decoded[key] = decodeURIComponent(value)
      }
    })

    return decoded
  }

  preselectFilters(){
    let params = this.decodeParams()
    Object.keys(params).forEach((param) => {
      let key   = param
      let value = params[param]

      if (value){
        value = decodeURIComponent(value)
        let select = document.querySelector(`#filters select[name=${key}]`)

        if (select){
          select.value = value
        }
      }
    })
  }

  filterProducts(products){
    let filteredResults = SEARCHJS.matchArray(this.data, this.decodeParams())
    this.results.innerHTML = this.buildGallery(filteredResults)

    if (filteredResults.length > 0){
      this.hideBlankslate()
    } else {
      this.showBlankslate()
    }
  }

  hideBlankslate(){
    this.blankslate.classList.remove("visible")
  }

  showBlankslate(){
    this.blankslate.classList.add("visible")
  }

  buildGallery(products){
    let output = []
    products.forEach((product) => {
      output.push(`<li>
        <a href="/puma/products/${product.Index}.png" target="_blank" download>
          <img src="/puma/products/${product.Index}.png" loading="lazy">
          <h3>${product.Nazwa}</h3>
          <section>
            <em>${product.Sezon}</em>
            <em>${product.Sektor}</em>
          </section>
        </a>
      </li>`)
    })

    return output.join("")
  }
}

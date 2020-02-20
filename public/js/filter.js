class Filter {

  constructor(data){
    this.filters = document.querySelector("#filters .fieldset")
    this.reset   = document.querySelector("#filters input[type=reset]")
    this.results = document.querySelector("#results")
    this.data    = data

    // Array.from(this.filters).forEach((filter) => {
    //   filter.addEventListener("change", (event) => {
    //     history.pushState({}, "", this.getSelections())
    //     this.filterProducts()
    //   })
    // })

    // initial lisitng of all products
    this.buildFilters()
    this.filterProducts()
    this.preselectFilters()
  }

  buildFilters(){
    let ignore = ["Index", "Nazwa", "Zdjęcie produktu", "Data (kiedy możemy to pokazać)"]
    window.store = {}
    let selects = {}

    Object.keys(this.data[0]).forEach((filter) => {
      if (ignore.indexOf(filter) < 0){

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

        selects[filter] = select
        window.store[filter] = []

        Object.keys(this.data).forEach((item) => {
          this.ignoreExisting(window.store[filter], this.data[item][filter])
        })
      }
    })

    // special case for colors
    window.store["Kolor"] = window.store["Kolor"].join(", ")
    window.store["Kolor"] = window.store["Kolor"].split(", ")

    let tempColorStorage = []
    Object.keys(window.store["Kolor"]).forEach((color) => {
      if (tempColorStorage.indexOf(window.store["Kolor"][color]) < 0){
        tempColorStorage.push(window.store["Kolor"][color])
      }
    })
    window.store["Kolor"] = tempColorStorage

    Object.keys(selects).forEach((selectFilter) => {
      let option = document.createElement("option")
      option.value = ""
      option.innerText = ""
      selects[selectFilter].appendChild(option)

      window.store[selectFilter].forEach((item) => {
        let option = document.createElement("option")
        option.value = item
        option.innerText = item
        selects[selectFilter].appendChild(option)
      })
    })
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
  }

  buildGallery(products){
    let output = []
    products.forEach((product) => {
      output.push(`<li>
        <a href="public/images/products/${product.Index}.png" target="_blank" download>
          <img src="public/images/products/${product.Index}.png">
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

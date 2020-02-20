class Filter {

  constructor(galleryElements){
    this.filters = document.querySelectorAll("#filters select")
    this.reset   = document.querySelector("#filters input[type=reset]")
    this.results = document.querySelector("#results")

    Array.from(this.filters).forEach((filter) => {
      filter.addEventListener("change", (event) => {
        history.pushState({}, "", this.getSelections())
        this.filterProducts()
      })
    })

    // initial lisitng of all products
    this.filterProducts()
    this.preselectFilters()
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
    let filteredResults = SEARCHJS.matchArray(data, this.decodeParams())
    this.results.innerHTML = this.buildGallery(filteredResults)
  }

  buildGallery(products){
    let output = []
    products.forEach((product) => {
      output.push(`<li>
        <a href="#">
          <img src="public/images/products/${product.Index}.jpg">
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

window.addEventListener("DOMContentLoaded", () => {
  window.TealManager = new Filter()
})

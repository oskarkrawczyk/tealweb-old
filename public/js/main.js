class Teal {

  constructor(){
    this.navTrigger  = document.querySelector("#nav")
    this.navItems    = document.querySelectorAll("nav li a")
    this.pages       = document.querySelectorAll("[data-page]")
    this.hero        = document.querySelector("video")
    this.page        = document.querySelector("#page")
    this.pageMeta    = document.querySelector("#page .meta")
    this.pageBody    = document.querySelector("#page .pageBody")
    this.project     = document.querySelector("#project")
    this.projectBody = document.querySelector("#project .pageBody")
    this.body        = document.body

    this.state = {
      nav: false
    }

    // current opened overlay context, either project or page
    this.currentContext

    this.attachEvents()
    this.setDefaultPage()
  }

  attachEvents(){
    this.navTrigger.addEventListener("click", (event) => {
      this.toggleNav.call(this, event)
    })

    this.attachPagesEvents()

    Array.from(document.querySelectorAll(".pageLogo")).forEach((pageLogo) => {
      pageLogo.addEventListener("click", (event) => {
        event.stopPropagation()
        event.preventDefault()
        this.hidePage()
      })
    })

    // this.attachObserver()
  }

  attachPagesEvents(){
    // console.log("attachPagesEvents")
    let pages = document.querySelectorAll("[data-page]")

    Array.from(pages).forEach((page) => {
      page.addEventListener("click", (event) => {
        event.stopPropagation()
        event.preventDefault()
        this.fetchPage(page)
        this.state.nav = false
        this.hideNav()
      }, this)
    })
  }

  setDefaultPage(){
    if (document.location.hash.indexOf("#/") >= 0){
      let slug = document.location.hash.split("#/")[1]
      this.fetchPage(document.querySelector(`[data-page="${slug}"]`))
    }
  }

  // attachObserver(){
  //   let observer
  //   let targets = document.querySelectorAll(".workItem")
  //   let options = {
  //     root: null,
  //     threshold: 0.99
  //   }
  //
  //   let callback = (entries, observer) => {
  //     entries.forEach(entry => {
  //
  //       if (entry.isIntersecting){
  //         let items = entry.target.querySelectorAll("#project h3 span, ul span")
  //
  //         Array.from(items).forEach((item, index) => {
  //           setTimeout(() => {
  //             item.classList.add("show")
  //           }, 100 * index)
  //         })
  //
  //         observer.unobserve(entry.target)
  //       }
  //     })
  //   }
  //
  //   observer = new IntersectionObserver(callback, options)
  //
  //   targets.forEach(target => {
  //     observer.observe(target)
  //   })
  // }

  parseSlug(page){
    let filter = page.split("/").length >= 1 ? page.split("/")[1] : false
    let url = `/pages/${page.split("/")[0]}.html`

    return {
      filter: filter,
      url:    url
    }
  }

  fetchPage(trigger){
    let page    = trigger.dataset.page
    let url     = `/pages/${page}.html`
    let project = trigger.dataset.project === ""
    let filter  = this.parseSlug(page).filter

    this.currentContext = project ? "project" : "page"

    if (filter){
      url = this.parseSlug(page).url
    }

    if (this.currentContext === "project"){
      url = `/projects/${page}.html`
    }

    if (page !== ""){
      fetch(url, {
        method: "get"
      }).then(response => {
        return response.text()
      }).then(html => {
        let title

        if (this.currentContext === "project"){
          this.projectBody.innerHTML = html
          title = this.projectBody.querySelector("#project h3")
        } else {
          this.pageBody.innerHTML = html
          title = this.pageBody.querySelector("#project h3")
        }

        this.showPage(trigger, filter)

        history.pushState({}, title, `#/${page}`)
      })
      .catch(error => {
        console.log("Well shucks:", error)
      })
    } else {
      console.warn("No such page")
    }
  }

  setPageColors(page){
    let pageImage = page.querySelector(".imageCont img")

    // change page colors based on the project image
    if (pageImage){
      let imageSrc = pageImage.src

      // this.page.classList.remove("pageColors")
      Vibrant.from(pageImage).getPalette((err, palette) => {
        this.project.style.background = palette.DarkMuted.getHex()
        this.project.querySelector(".pageHeader .back").style.stroke = palette.LightMuted.getHex()
        this.project.querySelector(".pageHeader .logo").style.fill = palette.LightMuted.getHex()
        this.project.querySelector(".spacer").style.stroke = palette.LightMuted.getHex()
      })
    } else {
      this.page.style.background = "#fff"
      this.page.querySelector(".pageHeader .back").style.stroke = "#27A0BF"
      this.page.querySelector(".pageHeader .logo").style.fill = "#27A0BF"
      this.page.querySelector(".spacer").style.stroke = "#F2F2F2"
      // this.page.classList.add("pageColors")
    }
  }

  showPage(trigger, filter){
    this.hero.pause()
    if (this.currentContext === "project"){
      this.body.classList.add("projectOpened")
      this.initSlider()

    } else {
      this.body.classList.add("pageOpened")
      this.attachPagesEvents()
    }

    this.setPageColors(trigger)
    this.filterList(filter)

    setTimeout(() => {
      let items
      if (this.currentContext === "project"){
        items = this.project.querySelectorAll("#project h3, .meta span, .info p")
      } else {
        items = this.page.querySelectorAll("#project h3, .meta span, .info p")
      }

      Array.from(items).forEach((item, index) => {
        setTimeout(() => {
          item.classList.add("show")
        }, 100 * index)
      })
    }, 700, this)
  }

  filterList(filter){
    let filtersCont = document.querySelector("#filters")
    let workItems   = document.querySelectorAll("#our-work .workItem")

    if (filtersCont){
      let filters = document.querySelectorAll("#filters a")

      Array.from(filters).forEach((filter, index) => {
        filter.addEventListener("click", (event) => {
          event.stopPropagation()
          event.preventDefault()

          this.toggleVisibility(workItems, event.target.dataset.type, filtersCont)
        })
      })
    }

    if (filter){
      this.toggleVisibility(workItems, filter, filtersCont)
    }
  }

  toggleVisibility(workItems, filter, filtersCont){
    let filterItems = filtersCont.querySelectorAll("li")
    let mode

    // activate the currently picked filter
    let activeFilterItem = filtersCont.querySelector(`a[data-type=${filter}]`)

    if (activeFilterItem.parentNode.classList.contains("active")){

      // disable filtres
      Array.from(filterItems).forEach((item, index) => {
        item.classList.remove("inactive")
      })

      // toggle work items based on picked filter
      Array.from(workItems).forEach((workItem, index) => {
        workItem.classList.remove("hidden")
      })

      history.pushState({}, "title", `#/our-work`)
    } else {

      // disable filtres
      Array.from(filterItems).forEach((item, index) => {
        item.classList.add("inactive")
        item.classList.remove("active")
      })

      activeFilterItem.parentNode.classList.remove("inactive")
      activeFilterItem.parentNode.classList.add("active")

      // toggle work items based on picked filter
      Array.from(workItems).forEach((workItem, index) => {
        workItem.classList.add("hidden")

        if (workItem.dataset.type === filter){
          workItem.classList.remove("hidden")
        }
      })

      history.pushState({}, "title", `#/our-work/${filter}`)
    }
  }

  initSlider(){
    // console.log($('.slider-for'))

    $('.slider-nav').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      asNavFor: '.slider-for',
      dots: false,
      arrows: false,
      centerMode: false,
      focusOnSelect: true
    })

    $('.slider-for').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: true,
      fade: true,
      asNavFor: '.slider-nav'
    })
  }

  hidePage(){
    this.hero.play()

    if (this.currentContext === "project"){
      this.body.classList.remove("projectOpened")
      this.currentContext = "page"
    } else {
      this.body.classList.remove("pageOpened")
    }

    let items = this.page.querySelectorAll("#project h3, .meta span, .info p")
    Array.from(items).forEach((item) => {
      item.classList.remove("show")
    })
    history.pushState({}, "Project", "/")
  }

  toggleClass(item, index){
    setTimeout(() => {
      item.classList[this.navMode]("show")
    }, index * 80)
  }

  toggleNav(event){
    event.stopPropagation()
    event.preventDefault()

    this.state.nav = !this.state.nav
    this.navMode   = this.state.nav ? "add" : "remove"

    Array.from(this.navItems).forEach(this.toggleClass, this)
  }

  hideNav(){
    Array.from(this.navItems).forEach((item) => {
      item.classList.remove("show")
    }, this)
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new Teal()
})

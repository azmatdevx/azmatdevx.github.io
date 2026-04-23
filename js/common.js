document.addEventListener("DOMContentLoaded", function() {
  'use strict';

  const html = document.querySelector('html'),
    menuToggle = document.querySelector(".hamburger"),
    menuList = document.querySelector(".main-nav"),
    toggleTheme = document.querySelector(".toggle-theme"),
    btnScrollToTop = document.querySelector(".top");


  /* =======================================================
  // Menu + Theme Switcher
  ======================================================= */
  menuToggle.addEventListener("click", () => {
    menu();
  });

  // Menu
  function menu() {
    menuToggle.classList.toggle("is-open");
    menuList.classList.toggle("is-visible");
  }

  // Close search results when clicking outside
  document.addEventListener("click", (e) => {
    const heroWrap = document.querySelector(".hero__search-wrap");
    if (heroWrap && !heroWrap.contains(e.target)) {
      const results = document.getElementById("hero-results-container");
      if (results) results.innerHTML = "";
    }

    const navWrap = document.querySelector(".nav__search-wrap");
    if (navWrap && !navWrap.contains(e.target)) {
      const results = document.getElementById("nav-results-container");
      if (results) {
        results.innerHTML = "";
        results.classList.remove("is-open");
      }
    }
  });


  // Theme Switcher
  if (toggleTheme) {
    toggleTheme.addEventListener("click", () => {
      darkMode();
    });
  };

  function darkMode() {
    if (html.classList.contains('dark-mode')) {
      html.classList.remove('dark-mode');
      localStorage.setItem("theme", "light");
      document.documentElement.removeAttribute("dark");
    } else {
      html.classList.add('dark-mode');
      localStorage.removeItem("theme");
      document.documentElement.setAttribute("dark", "");
    }
  };


  /* ================================================================
  // Stop Animations During Window Resizing and Switching Theme Modes
  ================================================================ */
  let disableTransition;

  if (toggleTheme) {
    toggleTheme.addEventListener("click", () => {
      stopAnimation();
    });
  }

  window.addEventListener("resize", () => {
    stopAnimation();
  });

  function stopAnimation() {
    document.body.classList.add("disable-animation");
    clearTimeout(disableTransition);
    disableTransition = setTimeout(() => {
      document.body.classList.remove("disable-animation");
    }, 100);
  };


  const searchResultTemplate = '<a href="{url}" class="hero-result__item"><time class="hero-result__date">{date}</time><div class="hero-result__title">{title}</div><div class="hero-result__excerpt">{content}</div></a>';
  const noResultsText = '<div class="hero-result__empty">No results found</div>';

  // =====================
  // Hero Inline Search
  // =====================
  if (document.getElementById("hero-search-input") && document.getElementById("hero-results-container")) {
    SimpleJekyllSearch({
      searchInput: document.getElementById("hero-search-input"),
      resultsContainer: document.getElementById("hero-results-container"),
      json: "/search.json",
      searchResultTemplate,
      noResultsText,
      limit: 6
    });
  }

  // =====================
  // Navbar Inline Search
  // =====================
  const navSearchInput = document.getElementById("nav-search-input");
  const navResultsContainer = document.getElementById("nav-results-container");

  if (navSearchInput && navResultsContainer) {
    SimpleJekyllSearch({
      searchInput: navSearchInput,
      resultsContainer: navResultsContainer,
      json: "/search.json",
      searchResultTemplate,
      noResultsText,
      limit: 5
    });

    navSearchInput.addEventListener("input", () => {
      if (navResultsContainer.innerHTML.trim()) {
        navResultsContainer.classList.add("is-open");
      } else {
        navResultsContainer.classList.remove("is-open");
      }
    });
  }


  /* =======================
  // Responsive Videos
  ======================= */
  reframe(".post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off)");


  /* =======================
  // Random Post Image
  ======================= */
  const randomPostImage = document.querySelector(".post__image img[data-random-images]");

  if (randomPostImage) {
    try {
      const imagePool = JSON.parse(randomPostImage.dataset.randomImages);

      if (Array.isArray(imagePool) && imagePool.length > 0) {
        const selectedImage = imagePool[Math.floor(Math.random() * imagePool.length)];
        randomPostImage.setAttribute("data-src", selectedImage);
      }
    } catch (error) {
      console.error("Unable to parse random image pool.", error);
    }
  }


  /* =======================
  // LazyLoad Images
  ======================= */
  var lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy"
  })


  /* =======================
  // Zoom Image
  ======================= */
  const lightense = document.querySelector(".page__content img, .post__content img, .gallery__image img"),
  imageLink = document.querySelectorAll(".page__content a img, .post__content a img, .gallery__image a img");

  if (imageLink) {
    for (const i = 0; i < imageLink.length; i++) imageLink[i].parentNode.classList.add("image-link");
    for (const i = 0; i < imageLink.length; i++) imageLink[i].classList.add("no-lightense");
  };

  if (lightense) {
    Lightense(".page__content img:not(.no-lightense), .post__content img:not(.no-lightense), .gallery__image img:not(.no-lightense)", {
    padding: 60,
    offset: 30
    });
  };


  // =====================
  // Load More Posts
  // =====================
  var load_posts_button = document.querySelector('.load-more-posts');

  load_posts_button&&load_posts_button.addEventListener("click",function(e){e.preventDefault();var o=document.querySelector(".pagination"),e=pagination_next_url.split("/page")[0]+"/page/"+pagination_next_page_number+"/";fetch(e).then(function(e){if(e.ok)return e.text()}).then(function(e){var n=document.createElement("div");n.innerHTML=e;for(var t=document.querySelector(".grid"),a=n.querySelectorAll(".grid__post"),i=0;i<a.length;i++)t.appendChild(a.item(i));new LazyLoad({elements_selector:".lazy"});pagination_next_page_number++,pagination_next_page_number>pagination_available_pages_number&&(o.style.display="none")})});


  /* =================================
  // Smooth scroll to the tags page
  ================================= */
  document.querySelectorAll(".tag__link, .top__link").forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth"
      });
    });
  });


  /* =======================
  // Scroll Top Button
  ======================= */
  btnScrollToTop.addEventListener("click", function () {
    if (window.scrollY != 0) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      })
    }
  });

});

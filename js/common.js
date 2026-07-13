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

  // Clear hero search input + results when clicking outside
  document.addEventListener("click", (e) => {
    const heroWrap = document.querySelector(".hero__search-wrap");
    if (heroWrap && !heroWrap.contains(e.target)) {
      const input = document.getElementById("hero-search-input");
      const results = document.getElementById("hero-results-container");
      if (input) input.value = "";
      if (results) results.innerHTML = "";
    }
  });

  // =====================
  // Search Modal
  // =====================
  const searchModal    = document.getElementById("search-modal");
  const searchBackdrop = document.getElementById("search-modal-backdrop");
  const modalInput     = document.getElementById("modal-search-input");

  function openSearchModal() {
    if (!searchModal) return;
    searchModal.classList.add("is-open");
    searchModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(() => { if (modalInput) modalInput.focus(); }, 80);
  }

  function closeSearchModal() {
    if (!searchModal) return;
    searchModal.classList.remove("is-open");
    searchModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (modalInput) {
      modalInput.value = "";
      const r = document.getElementById("modal-results-container");
      if (r) r.innerHTML = "";
    }
  }

  document.querySelectorAll(".nav__search-trigger").forEach(btn => {
    btn.addEventListener("click", openSearchModal);
  });

  if (searchBackdrop) searchBackdrop.addEventListener("click", closeSearchModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchModal && searchModal.classList.contains("is-open")) {
      closeSearchModal();
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


  // =====================
  // Shared Inline Search
  // =====================
  let searchData = null;

  function searchPosts(query, limit) {
    if (!query || !searchData) return [];
    const q = query.toLowerCase().trim();
    return searchData
      .filter(p => (p.title + " " + p.content + " " + (p.tags || "")).toLowerCase().includes(q))
      .slice(0, limit);
  }

  function renderResults(posts, container, query) {
    if (!posts.length) {
      container.innerHTML = '<div class="hero-result__empty">No results found</div>';
      return;
    }
    container.innerHTML = posts.map(p =>
      `<a href="${p.url}" class="hero-result__item">
        <time class="hero-result__date">${p.date}</time>
        <div class="hero-result__title">${p.title}</div>
        <div class="hero-result__excerpt">${(p.content || "").substring(0, 100)}…</div>
      </a>`
    ).join("");
  }

  function bindSearch(inputEl, containerEl, limit, onToggle) {
    if (!inputEl || !containerEl) return;
    inputEl.addEventListener("input", () => {
      const q = inputEl.value.trim();
      if (!q) { containerEl.innerHTML = ""; if (onToggle) onToggle(false); return; }
      const results = searchPosts(q, limit);
      renderResults(results, containerEl, q);
      if (onToggle) onToggle(results.length > 0 || q.length > 0);
    });
  }

  fetch("/search.json")
    .then(r => r.json())
    .then(data => {
      searchData = data;
      bindSearch(
        document.getElementById("hero-search-input"),
        document.getElementById("hero-results-container"),
        6
      );
      bindSearch(
        document.getElementById("modal-search-input"),
        document.getElementById("modal-results-container"),
        8
      );
    })
    .catch(() => {});


  /* =======================
  // Hero Typewriter (replaced by GSAP phrase rotator in section-hero.html)
  ======================= */
  const twEl = null && document.getElementById("hero-typewriter");
  if (twEl) {
    const phrases = [
      "Performance Engineering",
      "AI-Augmented Systems",
      "Production Debugging",
      "Platform Architecture",
      "Systems Thinking",
      "Shipping Real Code"
    ];
    let phraseIdx = 0, charIdx = 0, deleting = false;

    function typeStep() {
      const phrase = phrases[phraseIdx];
      if (!deleting) {
        twEl.textContent = phrase.slice(0, ++charIdx);
        if (charIdx === phrase.length) {
          deleting = true;
          setTimeout(typeStep, 2200);
          return;
        }
        setTimeout(typeStep, 72);
      } else {
        twEl.textContent = phrase.slice(0, --charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(typeStep, 400);
          return;
        }
        setTimeout(typeStep, 38);
      }
    }
    setTimeout(typeStep, 800);
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

  /* =======================
  // Tag Filter Pills
  ======================= */
  const filterPills = document.querySelectorAll(".posts__filter-pill");
  const gridPosts   = document.querySelectorAll("#posts-grid .grid__post");

  if (filterPills.length) {
    filterPills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        filterPills.forEach(function (p) { p.classList.remove("posts__filter-pill--active"); });
        pill.classList.add("posts__filter-pill--active");

        const selected = pill.dataset.tag;

        gridPosts.forEach(function (post) {
          if (selected === "all") {
            post.classList.remove("grid__post--hidden");
          } else {
            const tags = (post.dataset.tags || "").trim().split(/\s+/);
            if (tags.includes(selected)) {
              post.classList.remove("grid__post--hidden");
            } else {
              post.classList.add("grid__post--hidden");
            }
          }
        });
      });
    });
  }

});

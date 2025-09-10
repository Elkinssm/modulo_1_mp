// Enhanced Presentation App JavaScript with Charts and Advanced Features - FIXED VERSION

class EnhancedPresentationApp {
  static injectSpinnerStyle() {
    if (!document.getElementById("presentation-spinner-style")) {
      const style = document.createElement("style");
      style.id = "presentation-spinner-style";
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        #presentation-loading-overlay {
          background: rgba(31, 184, 205, 0.10) !important;
          transition: opacity 0.35s;
        }
        #presentation-loading-overlay .loader-spinner {
          box-shadow: 0 0 0 2px #1FB8CD22;
        }
      `;
      document.head.appendChild(style);
    }
  }

  static showLoading() {
    EnhancedPresentationApp.injectSpinnerStyle();
    let loading = document.getElementById("presentation-loading-overlay");
    if (!loading) {
      loading = document.createElement("div");
      loading.id = "presentation-loading-overlay";
      loading.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(31,184,205,0.10);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.35s;
        opacity: 0;
        pointer-events: none;
      `;
      loading.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div class="loader-spinner" style="width:48px;height:48px;border:6px solid #1FB8CD;border-top:6px solid #fff;border-radius:50%;animation:spin 1s linear infinite;"></div>
          <span style="margin-top:16px;color:#134252;font-size:1.1rem;">Cargando...</span>
        </div>
      `;
      document.body.appendChild(loading);
      setTimeout(() => {
        loading.style.opacity = "1";
        loading.style.pointerEvents = "auto";
      }, 10);
    } else {
      loading.style.display = "flex";
      setTimeout(() => {
        loading.style.opacity = "1";
        loading.style.pointerEvents = "auto";
      }, 10);
    }
  }

  static hideLoading() {
    const loading = document.getElementById("presentation-loading-overlay");
    if (loading) {
      loading.style.opacity = "0";
      loading.style.pointerEvents = "none";
      setTimeout(() => {
        loading.style.display = "none";
      }, 350);
    }
  }

  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelectorAll(".slide");
    this.totalSlides = this.slides.length;
    this.charts = {};
    this.isFullscreen = false;

    console.log(`Found ${this.totalSlides} slides`);

    this.initializeElements();
    this.bindEvents();
    this.initializeCharts();
    this.updateUI();
    this.addSlideNumbers();
  }

  initializeElements() {
    // Navigation elements
    this.prevBtn = document.getElementById("prevBtn");
    this.nextBtn = document.getElementById("nextBtn");
    this.fullscreenBtn = document.getElementById("fullscreenBtn");
    this.currentSlideElement = document.getElementById("currentSlide");
    this.totalSlidesElement = document.getElementById("totalSlides");
    this.progressBar = document.getElementById("progressBar");

    // Menu elements
    this.menuToggle = document.getElementById("menuToggle");
    this.quickNav = document.getElementById("quickNav");
    this.quickNavItems = document.querySelectorAll(".quick-nav-item");

    // Set total slides correctly
    this.totalSlidesElement.textContent = this.totalSlides;

    console.log("Elements initialized:", {
      prevBtn: !!this.prevBtn,
      nextBtn: !!this.nextBtn,
      fullscreenBtn: !!this.fullscreenBtn,
      menuToggle: !!this.menuToggle,
      quickNav: !!this.quickNav,
      totalSlides: this.totalSlides,
    });
  }

  bindEvents() {
    // Navigation button events with error handling
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Previous button clicked");
        this.previousSlide();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Next button clicked");
        this.nextSlide();
      });
    }

    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Fullscreen button clicked");
        this.toggleFullscreen();
      });
    }

    // Keyboard events
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));

    // Menu events with error handling
    if (this.menuToggle) {
      this.menuToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Menu toggle clicked");
        this.toggleMenu();
      });
    }

    // Quick navigation events
    this.quickNavItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const slideIndex = parseInt(
          e.target.closest(".quick-nav-item").dataset.slide
        );
        console.log("Quick nav clicked, going to slide:", slideIndex);
        this.goToSlide(slideIndex);
        this.closeMenu();
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        this.quickNav &&
        !this.quickNav.contains(e.target) &&
        this.menuToggle &&
        !this.menuToggle.contains(e.target)
      ) {
        this.closeMenu();
      }
    });

    // Touch/swipe events for mobile
    this.bindTouchEvents();

    // Fullscreen change events
    document.addEventListener("fullscreenchange", () =>
      this.handleFullscreenChange()
    );
    document.addEventListener("webkitfullscreenchange", () =>
      this.handleFullscreenChange()
    );
    document.addEventListener("mozfullscreenchange", () =>
      this.handleFullscreenChange()
    );
    document.addEventListener("MSFullscreenChange", () =>
      this.handleFullscreenChange()
    );

    // Resize events for chart responsiveness
    window.addEventListener("resize", () => this.handleResize());
  }

  bindTouchEvents() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    let startTime = 0;

    document.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      (e) => {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        const duration = Date.now() - startTime;

        // Only process quick swipes
        if (duration < 500) {
          this.handleSwipe(startX, startY, endX, endY);
        }
      },
      { passive: true }
    );
  }

  handleSwipe(startX, startY, endX, endY) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 50;

    // Check if horizontal swipe is dominant and meets minimum distance
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > minSwipeDistance
    ) {
      if (deltaX > 0) {
        // Swipe right - previous slide
        this.previousSlide();
      } else {
        // Swipe left - next slide
        this.nextSlide();
      }
    }
  }

  handleKeyboard(e) {
    // Prevent default for presentation control keys
    const presentationKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      " ",
      "Home",
      "End",
      "Escape",
      "PageUp",
      "PageDown",
    ];
    if (presentationKeys.includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        this.previousSlide();
        break;
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
      case " ": // Spacebar
        this.nextSlide();
        break;
      case "Home":
        this.goToSlide(0);
        break;
      case "End":
        this.goToSlide(this.totalSlides - 1);
        break;
      case "Escape":
        this.closeMenu();
        if (this.isFullscreen) {
          this.exitFullscreen();
        }
        break;
      case "f":
      case "F":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.toggleFullscreen();
        }
        break;
    }
  }

  nextSlide() {
    console.log(
      `Attempting to go to next slide. Current: ${this.currentSlide}, Total: ${this.totalSlides}`
    );
    if (this.currentSlide < this.totalSlides - 1) {
      this.goToSlideWithDirection(this.currentSlide + 1, "forward");
    } else {
      console.log("Already at last slide");
    }
  }

  previousSlide() {
    console.log(
      `Attempting to go to previous slide. Current: ${this.currentSlide}`
    );
    if (this.currentSlide > 0) {
      this.goToSlideWithDirection(this.currentSlide - 1, "backward");
    } else {
      console.log("Already at first slide");
    }
  }

  goToSlide(index) {
    if (index >= 0 && index < this.totalSlides && index !== this.currentSlide) {
      this.goToSlideWithDirection(
        index,
        index > this.currentSlide ? "forward" : "backward"
      );
    }
  }

  goToSlideWithDirection(index, direction = "forward") {
    if (index >= 0 && index < this.totalSlides && index !== this.currentSlide) {
      console.log(`Going to slide ${index} (direction: ${direction})`);
      EnhancedPresentationApp.showLoading();
      const currentSlideElement = this.slides[this.currentSlide];
      const nextSlideElement = this.slides[index];
      // Remove active class from current slide
      currentSlideElement.classList.remove("active");
      // Set initial position for next slide
      if (direction === "forward") {
        nextSlideElement.style.transform = "translateX(50px)";
        nextSlideElement.style.opacity = "0";
      } else {
        nextSlideElement.style.transform = "translateX(-50px)";
        nextSlideElement.style.opacity = "0";
      }
      // Add active class to next slide and animate
      setTimeout(() => {
        this.currentSlide = index;
        nextSlideElement.classList.add("active");
        nextSlideElement.style.transform = "translateX(0)";
        nextSlideElement.style.opacity = "1";
        this.updateUI();
        this.animateSlideCounter();
        // Initialize charts if they exist on this slide
        setTimeout(() => {
          this.initializeSlideCharts();
          EnhancedPresentationApp.hideLoading();
        }, 350);
        // Track slide view
        this.trackSlideView(index);
      }, 200);
    }
  }

  updateUI() {
    // Update slide counter
    if (this.currentSlideElement) {
      this.currentSlideElement.textContent = this.currentSlide + 1;
    }

    // Update progress bar
    if (this.progressBar) {
      const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
      this.progressBar.style.width = `${progress}%`;
    }

    // Update navigation buttons
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentSlide === 0;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
    }

    // Update active quick nav item
    this.updateActiveQuickNavItem();

    // Update fullscreen button
    if (this.fullscreenBtn) {
      this.fullscreenBtn.innerHTML = this.isFullscreen ? "⤓" : "⛶";
      this.fullscreenBtn.title = this.isFullscreen
        ? "Salir de pantalla completa"
        : "Pantalla completa";
    }

    console.log(
      `UI updated - Slide ${this.currentSlide + 1}/${this.totalSlides}`
    );
  }

  updateActiveQuickNavItem() {
    // Remove active class from all quick nav items
    this.quickNavItems.forEach((item) => item.classList.remove("active"));

    // Find and activate the current section's nav item
    const currentSection = this.getCurrentSection();
    if (currentSection !== -1) {
      const activeNavItem = document.querySelector(
        `[data-slide="${currentSection}"]`
      );
      if (activeNavItem) {
        activeNavItem.classList.add("active");
      }
    }
  }

  getCurrentSection() {
    // Define slide ranges for each section (updated for 26 slides: 0-25)
    const sectionRanges = [
      { start: 0, end: 0 }, // Title
      { start: 1, end: 1 }, // Agenda
      { start: 2, end: 6 }, // Lesson 1.1 (5 slides)
      { start: 7, end: 12 }, // Lesson 1.2 (6 slides)
      { start: 13, end: 16 }, // Lesson 1.3 (4 slides)
      { start: 17, end: 21 }, // Lesson 1.4 (5 slides)
      { start: 22, end: 23 }, // Lesson 1.5 (2 slides)
      { start: 24, end: 24 }, // Summary
      { start: 25, end: 25 }, // Q&A
    ];

    for (let i = 0; i < sectionRanges.length; i++) {
      const range = sectionRanges[i];
      if (this.currentSlide >= range.start && this.currentSlide <= range.end) {
        return range.start;
      }
    }
    return -1;
  }

  toggleMenu() {
    if (!this.quickNav) {
      console.error("Quick nav element not found");
      return;
    }

    console.log("Toggling menu. Current state:", {
      hasActive: this.quickNav.classList.contains("active"),
      hasHidden: this.quickNav.classList.contains("hidden"),
    });

    const isCurrentlyActive = this.quickNav.classList.contains("active");

    if (isCurrentlyActive) {
      // Close menu
      this.quickNav.classList.remove("active");
      this.quickNav.classList.add("hidden");
      if (this.menuToggle) {
        this.menuToggle.innerHTML = "☰";
      }
      console.log("Menu closed");
    } else {
      // Open menu
      this.quickNav.classList.add("active");
      this.quickNav.classList.remove("hidden");
      if (this.menuToggle) {
        this.menuToggle.innerHTML = "✖";
      }
      console.log("Menu opened");
    }
  }

  closeMenu() {
    if (this.quickNav) {
      this.quickNav.classList.remove("active");
      this.quickNav.classList.add("hidden");
    }
    if (this.menuToggle) {
      this.menuToggle.innerHTML = "☰";
    }
    console.log("Menu force closed");
  }

  toggleFullscreen() {
    console.log(`Toggle fullscreen. Current state: ${this.isFullscreen}`);
    if (!this.isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  enterFullscreen() {
    const elem = document.documentElement;
    console.log("Attempting to enter fullscreen");

    const enterFS =
      elem.requestFullscreen ||
      elem.webkitRequestFullscreen ||
      elem.mozRequestFullScreen ||
      elem.msRequestFullscreen;

    if (enterFS) {
      enterFS
        .call(elem)
        .then(() => {
          console.log("Successfully entered fullscreen");
          this.isFullscreen = true;
          this.updateUI();
        })
        .catch((err) => {
          console.error("Failed to enter fullscreen:", err);
        });
    } else {
      console.warn("Fullscreen API not supported");
      // Fallback: try to simulate fullscreen with CSS
      document.body.style.position = "fixed";
      document.body.style.top = "0";
      document.body.style.left = "0";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
      document.body.style.zIndex = "9999";
      this.isFullscreen = true;
      this.updateUI();
    }
  }

  exitFullscreen() {
    console.log("Attempting to exit fullscreen");

    const exitFS =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen;

    if (
      exitFS &&
      (document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement)
    ) {
      exitFS
        .call(document)
        .then(() => {
          console.log("Successfully exited fullscreen");
          this.isFullscreen = false;
          this.updateUI();
        })
        .catch((err) => {
          console.error("Failed to exit fullscreen:", err);
        });
    } else {
      // Fallback: remove CSS fullscreen simulation
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.zIndex = "";
      this.isFullscreen = false;
      this.updateUI();
    }
  }

  handleFullscreenChange() {
    const isFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
    console.log("Fullscreen state changed:", isFullscreen);
    this.isFullscreen = isFullscreen;
    this.updateUI();
  }

  handleResize() {
    // Resize charts when window size changes
    Object.values(this.charts).forEach((chart) => {
      if (chart && typeof chart.resize === "function") {
        chart.resize();
      }
    });
  }

  animateSlideCounter() {
    if (this.currentSlideElement) {
      this.currentSlideElement.style.transform = "scale(1.15)";
      this.currentSlideElement.style.color = "var(--color-primary)";

      setTimeout(() => {
        this.currentSlideElement.style.transform = "scale(1)";
        this.currentSlideElement.style.color = "";
      }, 200);
    }
  }

  addSlideNumbers() {
    this.slides.forEach((slide, index) => {
      if (!slide.querySelector(".slide-number")) {
        const slideNumber = document.createElement("div");
        slideNumber.className = "slide-number";
        slideNumber.textContent = index + 1;
        slideNumber.style.cssText = `
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    width: 32px;
                    height: 32px;
                    background: var(--color-primary);
                    color: var(--color-btn-primary-text);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--font-size-sm);
                    font-weight: var(--font-weight-bold);
                    opacity: 0.8;
                    z-index: 50;
                `;
        slide.appendChild(slideNumber);
      }
    });
  }

  // Chart initialization and management
  initializeCharts() {
    // Initialize all charts on app start but don't render them yet
    this.setupChartConfigurations();
  }

  initializeSlideCharts() {
    // Destruir gráficos previos si existen
    if (this.charts.marketGrowth && this.currentSlide !== 13) {
      this.charts.marketGrowth.destroy();
      this.charts.marketGrowth = null;
    }
    if (this.charts.sector && this.currentSlide !== 14) {
      this.charts.sector.destroy();
      this.charts.sector = null;
    }
    if (this.charts.performance && this.currentSlide !== 18) {
      this.charts.performance.destroy();
      this.charts.performance = null;
    }

    // Esperar a que el slide esté visible antes de crear el gráfico
    if (this.currentSlide === 13) {
      setTimeout(() => {
        this.createMarketGrowthChart();
      }, 200);
    } else if (this.currentSlide === 14) {
      setTimeout(() => {
        this.createSectorChart();
      }, 200);
    } else if (this.currentSlide === 18) {
      setTimeout(() => {
        this.createPerformanceChart();
      }, 200);
    }
  }

  setupChartConfigurations() {
    // Chart.js default configurations
    if (typeof Chart !== "undefined") {
      Chart.defaults.font.family = "var(--font-family-base)";
      Chart.defaults.color = "#626c7c"; // --color-slate-500
      Chart.defaults.plugins.legend.labels.usePointStyle = true;
      Chart.defaults.plugins.legend.labels.padding = 20;
    }
  }

  createMarketGrowthChart() {
    const ctx = document.getElementById("marketGrowthChart");
    if (ctx && typeof Chart !== "undefined") {
      // Destruir gráfico existente si existe
      if (this.charts.marketGrowth) {
        this.charts.marketGrowth.destroy();
        this.charts.marketGrowth = null;
      }

      try {
        this.charts.marketGrowth = new Chart(ctx, {
          type: "line",
          data: {
            labels: [
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
              "2031",
              "2032",
              "2033",
            ],
            datasets: [
              {
                label: "Tamaño del Mercado (Billones USD)",
                data: [
                  1.2, 1.5, 1.8, 2.1, 2.4, 2.8, 3.3, 3.9, 4.7, 5.6, 6.7, 7.2,
                  8.0, 8.9,
                ],
                borderColor: "#1FB8CD",
                backgroundColor: "rgba(31, 184, 205, 0.1)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#1FB8CD",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Crecimiento Proyectado del Mercado Mini Programs",
                font: {
                  size: 16,
                  weight: "bold",
                },
                color: "#134252",
              },
              legend: {
                position: "bottom",
                labels: {
                  color: "#134252",
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Billones USD",
                  color: "#626c7c",
                },
                grid: {
                  color: "rgba(98, 108, 113, 0.1)",
                },
                ticks: {
                  color: "#626c7c",
                  callback: function (value) {
                    return "$" + value + "B";
                  },
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Año",
                  color: "#626c7c",
                },
                grid: {
                  color: "rgba(98, 108, 113, 0.1)",
                },
                ticks: {
                  color: "#626c7c",
                },
              },
            },
            interaction: {
              intersect: false,
              mode: "index",
            },
            animation: {
              duration: 2000,
              easing: "easeInOutQuart",
            },
          },
        });
        console.log(
          "✅ Gráfica de crecimiento del mercado creada exitosamente"
        );
      } catch (err) {
        console.error("❌ Error al crear la gráfica de crecimiento:", err);
      }
    } else {
      console.error(
        "❌ No se pudo encontrar el canvas o Chart.js no está cargado"
      );
    }
  }

  createSectorChart() {
    const ctx = document.getElementById("sectorChart");
    if (ctx && typeof Chart !== "undefined") {
      // Destruir gráfico existente si existe
      if (this.charts.sector) {
        this.charts.sector.destroy();
        this.charts.sector = null;
      }

      try {
        this.charts.sector = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: [
              "E-commerce",
              "Servicios Financieros",
              "Servicios de Ciudad",
              "Salud",
              "Entretenimiento",
              "Educación",
              "Otros",
            ],
            datasets: [
              {
                data: [40, 25, 15, 10, 5, 3, 2],
                backgroundColor: [
                  "#1FB8CD",
                  "#FFC185",
                  "#B4413C",
                  "#ECEBD5",
                  "#5D878F",
                  "#DB4545",
                  "#D2BA4C",
                ],
                borderWidth: 2,
                borderColor: "#ffffff",
                hoverBorderWidth: 3,
                hoverBorderColor: "#ffffff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Adopción de Mini Programs por Sector",
                font: {
                  size: 16,
                  weight: "bold",
                },
                color: "#134252",
              },
              legend: {
                position: "right",
                labels: {
                  color: "#134252",
                  padding: 15,
                  usePointStyle: true,
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return context.label + ": " + context.parsed + "%";
                  },
                },
              },
            },
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 2000,
            },
          },
        });
        console.log("✅ Gráfica de sectores creada exitosamente");
      } catch (err) {
        console.error("❌ Error al crear la gráfica de sectores:", err);
      }
    } else {
      console.error(
        "❌ No se pudo encontrar el canvas de sectores o Chart.js no está cargado"
      );
    }
  }

  createPerformanceChart() {
    const ctx = document.getElementById("performanceChart");
    if (ctx && typeof Chart !== "undefined") {
      // Destruir gráfico existente si existe
      if (this.charts.performance) {
        this.charts.performance.destroy();
        this.charts.performance = null;
      }

      try {
        this.charts.performance = new Chart(ctx, {
          type: "radar",
          data: {
            labels: [
              "Tiempo de Carga",
              "Facilidad de Desarrollo",
              "Costo",
              "Mantenimiento",
              "Distribución",
              "Experiencia de Usuario",
            ],
            datasets: [
              {
                label: "Mini Programs",
                data: [8, 9, 9, 8, 10, 9],
                borderColor: "#1FB8CD",
                backgroundColor: "rgba(31, 184, 205, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "#1FB8CD",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
              },
              {
                label: "Apps Nativas",
                data: [10, 6, 4, 5, 6, 10],
                borderColor: "#FFC185",
                backgroundColor: "rgba(255, 193, 133, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "#FFC185",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
              },
              {
                label: "Web Apps",
                data: [6, 8, 8, 7, 9, 6],
                borderColor: "#B4413C",
                backgroundColor: "rgba(180, 65, 60, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "#B4413C",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Comparación de Rendimiento por Tecnología",
                font: {
                  size: 16,
                  weight: "bold",
                },
                color: "#134252",
              },
              legend: {
                position: "bottom",
                labels: {
                  color: "#134252",
                  padding: 20,
                },
              },
            },
            scales: {
              r: {
                beginAtZero: true,
                max: 10,
                ticks: {
                  stepSize: 2,
                  color: "#626c7c",
                },
                grid: {
                  color: "rgba(98, 108, 113, 0.2)",
                },
                pointLabels: {
                  color: "#134252",
                  font: {
                    size: 12,
                    weight: "bold",
                  },
                },
              },
            },
            animation: {
              duration: 2000,
              easing: "easeInOutQuart",
            },
          },
        });
        console.log("✅ Gráfica de rendimiento creada exitosamente");
      } catch (err) {
        console.error("❌ Error al crear la gráfica de rendimiento:", err);
      }
    } else {
      console.error(
        "❌ No se pudo encontrar el canvas de rendimiento o Chart.js no está cargado"
      );
    }
  }

  // Utility methods
  startAutoPresentation(intervalMs = 15000) {
    this.stopAutoPresentation(); // Clear any existing interval
    this.autoInterval = setInterval(() => {
      if (this.currentSlide < this.totalSlides - 1) {
        this.nextSlide();
      } else {
        this.stopAutoPresentation();
      }
    }, intervalMs);
    console.log(`Auto presentation started (${intervalMs}ms intervals)`);
  }

  stopAutoPresentation() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
      console.log("Auto presentation stopped");
    }
  }

  printPresentation() {
    const printWindow = window.open("", "_blank");
    const slides = document.querySelectorAll(".slide");

    let printContent = `
            <html>
            <head>
                <title>Desarrollo de Mini Programas con Alipay - Módulo 1</title>
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
                        margin: 0; 
                        color: #134252;
                    }
                    .slide { 
                        page-break-after: always; 
                        padding: 40px; 
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .slide:last-child { page-break-after: auto; }
                    h1, h2, h3 { color: #1FB8CD; margin-bottom: 20px; }
                    h1 { font-size: 2.5rem; }
                    h2 { font-size: 2rem; }
                    h3 { font-size: 1.5rem; }
                    .slide-content { max-width: 800px; text-align: center; }
                    @media print { 
                        .slide { height: 100vh; }
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
        `;

    slides.forEach((slide) => {
      const slideContent = slide.querySelector(".slide-content");
      if (slideContent) {
        printContent += `<div class="slide">${slideContent.innerHTML}</div>`;
      }
    });

    printContent += "</body></html>";

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  }

  // Analytics and tracking
  trackSlideView(slideIndex) {
    // This could send analytics data to your tracking service
    console.log(
      `📊 Slide ${slideIndex + 1} viewed at ${new Date().toISOString()}`
    );
  }

  getViewingStats() {
    return {
      totalSlides: this.totalSlides,
      currentSlide: this.currentSlide + 1,
      progressPercentage: (
        ((this.currentSlide + 1) / this.totalSlides) *
        100
      ).toFixed(1),
    };
  }
}

// Additional utility functions
function createPresentationControls() {
  // Create additional control elements if needed
  const controlsContainer = document.createElement("div");
  controlsContainer.className = "presentation-controls";
  controlsContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: none; /* Hidden by default, can be shown with hotkey */
        background: var(--color-surface);
        padding: 10px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--color-border);
    `;

  // Add control buttons
  const buttons = [
    {
      text: "🏠",
      title: "Ir al inicio",
      action: () => window.presentationApp.goToSlide(0),
    },
    {
      text: "⏸️",
      title: "Pausar auto-presentación",
      action: () => window.presentationApp.stopAutoPresentation(),
    },
    {
      text: "▶️",
      title: "Iniciar auto-presentación",
      action: () => window.presentationApp.startAutoPresentation(),
    },
    {
      text: "🖨️",
      title: "Imprimir",
      action: () => window.presentationApp.printPresentation(),
    },
  ];

  buttons.forEach((btn) => {
    const button = document.createElement("button");
    button.innerHTML = btn.text;
    button.title = btn.title;
    button.style.cssText = `
            margin: 0 5px;
            padding: 8px 12px;
            border: none;
            background: var(--color-secondary);
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
        `;
    button.addEventListener("click", btn.action);
    button.addEventListener("mouseenter", () => {
      button.style.background = "var(--color-primary)";
      button.style.color = "var(--color-btn-primary-text)";
    });
    button.addEventListener("mouseleave", () => {
      button.style.background = "var(--color-secondary)";
      button.style.color = "var(--color-text)";
    });
    controlsContainer.appendChild(button);
  });

  document.body.appendChild(controlsContainer);
  return controlsContainer;
}

// Accessibility enhancements
function enhanceAccessibility() {
  // Add ARIA labels and roles
  const slides = document.querySelectorAll(".slide");
  slides.forEach((slide, index) => {
    slide.setAttribute("role", "article");
    slide.setAttribute("aria-label", `Slide ${index + 1} of ${slides.length}`);
    slide.setAttribute("tabindex", "-1");
  });

  // Add skip navigation
  const skipNav = document.createElement("a");
  skipNav.href = "#main-content";
  skipNav.textContent = "Saltar navegación";
  skipNav.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--color-primary);
        color: var(--color-btn-primary-text);
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
    `;
  skipNav.addEventListener("focus", () => {
    skipNav.style.top = "6px";
  });
  skipNav.addEventListener("blur", () => {
    skipNav.style.top = "-40px";
  });

  document.body.insertBefore(skipNav, document.body.firstChild);

  // Add main content landmark
  const slidesWrapper = document.querySelector(".slides-wrapper");
  if (slidesWrapper) {
    slidesWrapper.id = "main-content";
    slidesWrapper.setAttribute("role", "main");
    slidesWrapper.setAttribute("aria-live", "polite");
    slidesWrapper.setAttribute("aria-label", "Presentación de Mini Programas");
  }
}

// Keyboard shortcuts help
function createKeyboardShortcutsHelp() {
  const helpModal = document.createElement("div");
  helpModal.id = "keyboard-help";
  helpModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;

  const helpContent = document.createElement("div");
  helpContent.style.cssText = `
        background: var(--color-surface);
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        box-shadow: var(--shadow-lg);
    `;

  helpContent.innerHTML = `
        <h3 style="color: var(--color-primary); margin-bottom: 1rem;">Atajos de Teclado</h3>
        <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
            <div><strong>← / ↑ / Page Up:</strong> Slide anterior</div>
            <div><strong>→ / ↓ / Page Down / Espacio:</strong> Siguiente slide</div>
            <div><strong>Home:</strong> Primer slide</div>
            <div><strong>End:</strong> Último slide</div>
            <div><strong>Ctrl/Cmd + F:</strong> Pantalla completa</div>
            <div><strong>Escape:</strong> Cerrar menú / Salir pantalla completa</div>
            <div><strong>? o h:</strong> Mostrar/ocultar esta ayuda</div>
            <div><strong>Ctrl + Shift + C:</strong> Mostrar controles avanzados</div>
        </div>
        <button onclick="document.getElementById('keyboard-help').style.display='none'" 
                style="margin-top: 1rem; padding: 8px 16px; background: var(--color-primary); 
                       color: var(--color-btn-primary-text); border: none; border-radius: 6px; cursor: pointer;">
            Cerrar
        </button>
    `;

  helpModal.appendChild(helpContent);
  document.body.appendChild(helpModal);

  // Show help with '?' or 'h' key
  document.addEventListener("keydown", (e) => {
    if (e.key === "?" || e.key === "h") {
      helpModal.style.display =
        helpModal.style.display === "flex" ? "none" : "flex";
    }
  });

  // Close help when clicking outside
  helpModal.addEventListener("click", (e) => {
    if (e.target === helpModal) {
      helpModal.style.display = "none";
    }
  });
}

// Initialize the enhanced presentation when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Initializing Enhanced Presentation App");

  try {
    // Initialize the main presentation app
    window.presentationApp = new EnhancedPresentationApp();

    // Create additional features
    const presentationControls = createPresentationControls();

    // Enhance accessibility
    enhanceAccessibility();

    // Create keyboard shortcuts help
    createKeyboardShortcutsHelp();

    // Add print functionality (Ctrl+P override)
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        window.presentationApp.printPresentation();
      }

      // Show/hide advanced controls with Ctrl+Shift+C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        presentationControls.style.display =
          presentationControls.style.display === "block" ? "none" : "block";
      }
    });

    // Handle visibility change (when user switches tabs/apps)
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        // Pause any auto-presentation when tab is not visible
        window.presentationApp.stopAutoPresentation();
      }
    });

    // Add resize handler for responsive updates
    let resizeTimeout;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (window.presentationApp) {
          window.presentationApp.updateUI();
        }
      }, 150);
    });

    // Prevent context menu on presentation area
    const slidesWrapper = document.querySelector(".slides-wrapper");
    if (slidesWrapper) {
      slidesWrapper.addEventListener("contextmenu", function (e) {
        e.preventDefault();
      });
    }

    // Add loading completion
    document.body.classList.add("presentation-loaded");

    // Log successful initialization
    console.log(
      "✅ Presentación de Mini Programas de Alipay inicializada correctamente"
    );
    console.log(
      `📊 Total de diapositivas: ${window.presentationApp.totalSlides}`
    );
    console.log("⌨️  Controles disponibles:");
    console.log("   • Navegación: ← → ↑ ↓ Espacio PgUp PgDn Home End");
    console.log("   • Pantalla completa: Ctrl/Cmd+F o botón ⛶");
    console.log("   • Menú: Botón ☰ o clic en esquina superior izquierda");
    console.log("   • Ayuda: Tecla ? o h");
    console.log("   • Controles avanzados: Ctrl+Shift+C");
    console.log("   • Imprimir: Ctrl/Cmd+P");

    // Inicializar gráficos de la slide activa al cargar
    window.presentationApp.initializeSlideCharts();

    // Track initial slide view
    window.presentationApp.trackSlideView(0);
  } catch (error) {
    console.error("❌ Error initializing presentation:", error);

    // Show error message to user
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--color-error);
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
        `;
    errorDiv.innerHTML = `
            <h3>Error de Inicialización</h3>
            <p>Hubo un problema al cargar la presentación. Por favor, recarga la página.</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: white; color: var(--color-error); border: none; border-radius: 4px; cursor: pointer;">
                Recargar
            </button>
        `;
    document.body.appendChild(errorDiv);
  }
});

// Export for external use if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = EnhancedPresentationApp;
}

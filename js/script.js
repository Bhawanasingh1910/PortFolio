(function () {
  var hero = document.getElementById("hero");
  var card = document.getElementById("card");
  var hc = hero.querySelector(".hc");
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  var themeButton = document.getElementById("theme-toggle");
  var root = document.documentElement;
  var initialTheme =
    root.dataset.theme ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  function updateTheme(theme, savePreference) {
    root.dataset.theme = theme;
    themeButton.textContent = theme === "dark" ? "☼" : "☾";
    themeButton.setAttribute(
      "aria-label",
      "Switch to " + (theme === "dark" ? "light" : "dark") + " theme",
    );
    if (savePreference) {
      try {
        localStorage.setItem("portfolio-theme", theme);
      } catch (error) {
        console.error("Could not save the theme preference.", error);
      }
    }
  }

  updateTheme(initialTheme, false);
  themeButton.addEventListener("click", function () {
    updateTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  });

  /* ---- photo follows the cursor (always on) ---- */
  window.addEventListener("pointermove", function (e) {
    var x = (e.clientX / window.innerWidth) * 2 - 1; /* -1 left ... +1 right */
    var y =
      (e.clientY / window.innerHeight) * 2 - 1; /* -1 top  ... +1 bottom */
    hero.style.setProperty("--px", x);
    hero.style.setProperty("--py", y);
    card.style.transform =
      "rotateY(" + x * 24 + "deg) rotateX(" + -y * 18 + "deg)";
    var r = card.getBoundingClientRect();
    card.style.setProperty(
      "--sx",
      ((e.clientX - r.left) / r.width) * 100 + "%",
    );
    card.style.setProperty(
      "--sy",
      ((e.clientY - r.top) / r.height) * 100 + "%",
    );
  });
  document.addEventListener("mouseleave", function () {
    hero.style.setProperty("--px", 0);
    hero.style.setProperty("--py", 0);
    card.style.transform = "rotateY(0deg) rotateX(0deg)";
  });

  /* ---- cards tilt on hover ---- */
  if (!reduce) {
    document
      .querySelectorAll(".tilt, .skills > div, .ach > div")
      .forEach(function (c) {
        c.addEventListener("pointermove", function (e) {
          if (e.pointerType === "touch") return;
          var r = c.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          c.style.transform =
            "rotateY(" +
            x * 10 +
            "deg) rotateX(" +
            -y * 10 +
            "deg) translateY(-3px) translateZ(10px)";
        });
        c.addEventListener("pointerleave", function () {
          c.style.transform = "";
        });
      });
  }

  /* ---- photo slides down, shrinks and fades while scrolling ---- */
  /* ---- photo drifts down, shrinks and fades while scrolling (smoothed) ---- */
  if (reduce) return;
  var current = window.scrollY,
    running = false;
  function ease(t) {
    return t * t * (3 - 2 * t);
  }
  function render() {
    var target = window.scrollY;
    current += (target - current) * 0.1;
    if (Math.abs(target - current) < 0.3) current = target;
    var H = hero.offsetHeight;
    var s = clamp(current, 0, H);
    var p = clamp(s / (H * 0.85), 0, 1);
    var y = s * (window.innerWidth < 900 ? 0 : 1.15);
    var sc = 1 - 0.35 * ease(p);
    var op = 1 - ease(clamp((p - 0.45) / 0.5, 0, 1));
    hc.style.transform =
      "translate3d(0," + y.toFixed(1) + "px,0) scale(" + sc.toFixed(3) + ")";
    hc.style.opacity = op.toFixed(3);
    hc.style.visibility = op <= 0.001 ? "hidden" : "visible";
    if (current !== target) requestAnimationFrame(render);
    else running = false;
  }
  function kick() {
    if (!running) {
      running = true;
      requestAnimationFrame(render);
    }
  }
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  render();
})();

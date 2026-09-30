// Client-side behavior (vanilla JS). No secrets here: everything is public.
(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Theme toggle: flips the theme currently in effect and remembers the choice.
  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  // Home headline: cycle through the phrases (markup in layouts/home.html, styles in _motion.scss).
  // Skipped with reduced motion: the first phrase stays put.
  var rotator = document.querySelector("[data-rotator]");
  if (rotator && !reduceMotion.matches) {
    var items = Array.prototype.slice.call(rotator.children);
    if (items.length > 1) {
      var index = 0;
      rotator.classList.add("is-live");
      items[0].classList.add("is-active");

      var advance = function () {
        var current = items[index];
        index = (index + 1) % items.length;
        var next = items[index];
        // Park the incoming phrase below the mask without animating, then slide it in.
        next.classList.add("no-anim");
        next.classList.remove("is-past");
        void next.offsetWidth;
        next.classList.remove("no-anim");
        next.classList.add("is-active");
        current.classList.remove("is-active");
        current.classList.add("is-past");
      };

      // Let the intro finish on the first visit of the session.
      var start = root.classList.contains("intro") ? 3600 : 3000;
      setTimeout(function () {
        advance();
        setInterval(advance, 3200);
      }, start);
    }
  }

  // Project list: filter by language + search. Remaining rows glide to their new
  // position (FLIP), new rows fade in.
  var listing = document.querySelector("[data-project-list]");
  if (!listing) return;

  var list = listing.querySelector("[data-list]");
  var rows = Array.prototype.slice.call(list.children);
  var chips = Array.prototype.slice.call(listing.querySelectorAll("[data-filter]"));
  var input = listing.querySelector("[data-search-input]");
  var status = listing.querySelector("[data-status]");
  var empty = listing.querySelector("[data-empty]");
  var reset = listing.querySelector("[data-reset]");
  var language = "";

  function matches(row) {
    var byLanguage = !language || row.getAttribute("data-language") === language;
    var query = input.value.trim().toLowerCase();
    var bySearch = !query || row.getAttribute("data-search").indexOf(query) !== -1;
    return byLanguage && bySearch;
  }

  // Count templates come from _data/i18n.yml through data attributes (%n%, %total%).
  var labels = {
    one: listing.getAttribute("data-label-one"),
    other: listing.getAttribute("data-label-other"),
    of: listing.getAttribute("data-label-of")
  };

  function label(count) {
    var template = count === rows.length ? (count === 1 ? labels.one : labels.other) : labels.of;
    return template.replace("%n%", count).replace("%total%", rows.length);
  }

  function update() {
    var animate = !reduceMotion.matches;
    var before = new Map();
    if (animate) {
      rows.forEach(function (row) {
        if (!row.hidden) before.set(row, row.getBoundingClientRect().top);
      });
    }

    var visible = 0;
    rows.forEach(function (row) {
      row.hidden = !matches(row);
      if (!row.hidden) visible++;
    });

    if (animate) {
      rows.forEach(function (row) {
        if (row.hidden) return;
        var easing = "cubic-bezier(0.2, 0.8, 0.2, 1)";
        if (before.has(row)) {
          var delta = before.get(row) - row.getBoundingClientRect().top;
          if (delta) {
            row.animate(
              [{ transform: "translateY(" + delta + "px)" }, { transform: "none" }],
              { duration: 450, easing: easing }
            );
          }
        } else {
          row.animate(
            [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
            { duration: 350, easing: easing }
          );
        }
      });
    }

    status.textContent = label(visible);
    empty.hidden = visible !== 0;
    list.hidden = visible === 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      language = chip.getAttribute("data-filter");
      chips.forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === chip));
      });
      update();
    });
  });

  input.addEventListener("input", update);

  reset.addEventListener("click", function () {
    language = "";
    input.value = "";
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.getAttribute("data-filter") === ""));
    });
    update();
    input.focus();
  });
})();

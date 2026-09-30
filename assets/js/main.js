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

  // Dashboard: filter by language + search. Remaining rows glide to their new
  // position (FLIP), new rows fade in.
  var dashboard = document.querySelector("[data-dashboard]");
  if (!dashboard) return;

  var list = dashboard.querySelector("[data-list]");
  var rows = Array.prototype.slice.call(list.children);
  var chips = Array.prototype.slice.call(dashboard.querySelectorAll("[data-filter]"));
  var input = dashboard.querySelector("[data-search-input]");
  var status = dashboard.querySelector("[data-status]");
  var empty = dashboard.querySelector("[data-empty]");
  var reset = dashboard.querySelector("[data-reset]");
  var language = "";

  function matches(row) {
    var byLanguage = !language || row.getAttribute("data-language") === language;
    var query = input.value.trim().toLowerCase();
    var bySearch = !query || row.getAttribute("data-search").indexOf(query) !== -1;
    return byLanguage && bySearch;
  }

  function label(count) {
    var noun = count === 1 ? "progetto" : "progetti";
    return count === rows.length
      ? count + " " + noun
      : count + " di " + rows.length + " progetti";
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

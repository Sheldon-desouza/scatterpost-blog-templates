// Loads each template's preview video only once its card nears the
// viewport, and leaves it unloaded entirely under reduced motion (the
// poster image shown by CSS is enough there). Kept out of index.html
// so an inline script is never required: no onerror or other inline
// handler on any element, every fallback lives here instead.
(function () {
  "use strict";

  function showPlaceholder(posterImg) {
    var preview = posterImg.closest(".card-preview");
    if (preview) {
      preview.classList.add("placeholder");
    }
    posterImg.remove();
  }

  // If the poster image itself fails to load, fall back to the
  // placeholder label rather than showing a broken image.
  [].forEach.call(document.querySelectorAll(".card-poster"), function (posterImg) {
    posterImg.addEventListener("error", function () {
      showPlaceholder(posterImg);
    });
  });

  // If a preview video fails to load or play, fall back to its poster
  // image: hide the video and let the poster (already in the DOM,
  // behind it) show through.
  [].forEach.call(document.querySelectorAll(".card-video"), function (video) {
    video.addEventListener("error", function () {
      video.style.display = "none";
    });
  });

  function loadVideo(video) {
    var sources = video.querySelectorAll("source[data-src]");
    for (var i = 0; i < sources.length; i++) {
      sources[i].src = sources[i].getAttribute("data-src");
    }
    video.load();
    video.play().catch(function () {
      // Autoplay can be blocked; the poster stays visible, which is fine.
    });
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    return;
  }

  var videos = document.querySelectorAll(".card-video");

  if (!("IntersectionObserver" in window)) {
    videos.forEach ? videos.forEach(loadVideo) : [].forEach.call(videos, loadVideo);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadVideo(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "200px" }
  );

  [].forEach.call(videos, function (video) {
    observer.observe(video);
  });
})();

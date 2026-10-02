// Loads each template's preview video only once its card nears the
// viewport, and leaves it unloaded entirely under reduced motion (the
// poster image shown by CSS is enough there). Kept out of index.html
// so an inline script is never required.
(function () {
  "use strict";

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

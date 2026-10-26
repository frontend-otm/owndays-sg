/* Tailwind Play CDN config (from Renewal partials/tailwind) */
if (window.tailwind) {
  window.tailwind.config = {
    corePlugins: {
      preflight: false, container: false,
    },
    theme: {
      extend: {
        screens: {
          xl: '1296px', xxl: '1440px', xxxl: '1600px',
        },
      }
    }
  };
}

/*
 * The hero opening (light swing + elements fading in) plays only when the page opens at the top. It is skipped (end state shown) when
 * the page opens on an anchor, or is reloaded / revisited from a scrolled position (the browser restores that position after paint,
 * so the scroll position is saved on leaving the page). This file is loaded in <head>, so the class is set before the hero is painted.
 */
try {
  var mfScrollKey = 'mf-scroll-y:' + location.pathname;
  var mfNav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  var mfRestoring = mfNav && (mfNav.type === 'reload' || mfNav.type === 'back_forward');
  // Reload / back-forward: judged by the saved scroll position only (the lineup links put a #hash in the URL even after scrolling back up)
  if (mfRestoring ? Number(sessionStorage.getItem(mfScrollKey)) > 10 : location.hash) {
    document.documentElement.classList.add('mf-opening-skip');
  }
  window.addEventListener('pagehide', function () {
    sessionStorage.setItem(mfScrollKey, String(window.pageYOffset));
  });
} catch (e) {}

/*
 * On the CMS, this page's <link> stylesheets (global.css, specials.css, specials-mickey-and-friends.css ...) are rendered
 * inside <body>, i.e. AFTER the Tailwind CDN <style> in <head>, so they would beat Tailwind utilities of equal specificity.
 * Move Tailwind's <style> to the end of <body> so the cascade order is the same as when the page is opened on its own.
 * The CDN keeps updating the same element after it is moved.
 */
(function keepTailwindStyleLast() {
  var isTailwindStyle = function (node) {
    return node.nodeName === 'STYLE' && node.textContent.indexOf('--tw-border-spacing-x') !== -1;
  };
  var findInHead = function () {
    return Array.prototype.slice.call(document.querySelectorAll('head style')).filter(isTailwindStyle)[0];
  };
  var moveToBody = function (style) {
    if (document.body && style.parentNode !== document.body) {
      document.body.appendChild(style);
    }
  };
  var tryMove = function () {
    var style = findInHead();
    if (style && document.body) {
      moveToBody(style);
      return true;
    }
    return false;
  };
  if (tryMove()) {
    return;
  }
  // The CDN may inject its <style> later, and <body> may not exist yet when this runs from <head>
  var observer = new MutationObserver(function () {
    if (tryMove()) {
      observer.disconnect();
    }
  });
  observer.observe(document.head, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', function () {
    if (tryMove()) {
      observer.disconnect();
    }
  });
})();

(function () {
  var initMickeyAndFriends = function () {
    var page = document.querySelector('.js-mf-page');
    if (!page) {
      return;
    }
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    page.classList.add('mf-js');

    // Split titles into characters for the vertical-axis flip (screen readers keep the original text via aria-label)
    page.querySelectorAll('.js-mf-chars').forEach(function (el) {
      var index = 0;
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      var split = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var fragment = document.createDocumentFragment();
            Array.prototype.forEach.call(child.textContent, function (ch) {
              var span = document.createElement('span');
              span.className = 'mf-char';
              span.setAttribute('aria-hidden', 'true');
              span.textContent = ch;
              span.style.setProperty('--i', index++);
              fragment.appendChild(span);
            });
            node.replaceChild(fragment, child);
          } else if (child.nodeType === 1 && child.tagName !== 'BR') {
            split(child);
          }
        });
      };
      split(el);
    });

    // Scroll-triggered motion (once)
    var targets = page.querySelectorAll('.js-mf-chars, .js-mf-fade, .js-mf-diagonal, .js-mf-glint');
    if ('IntersectionObserver' in window && !reduceMotion) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px' });
      targets.forEach(function (el) { observer.observe(el); });
    } else {
      targets.forEach(function (el) { el.classList.add('is-inview'); });
    }

    // Lineup nav: smooth-scroll to section anchors (#mf-sunglasses / #mf-glasses / #mf-accessories) without touching the URL
    page.querySelectorAll('a[href^="#mf-"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href').slice(1);
        var target = id ? document.getElementById(id) : null;
        if (!target) {
          return;
        }
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });

    // Color tabs
    page.querySelectorAll('.js-mf-tabs').forEach(function (group) {
      var tabs = Array.prototype.slice.call(group.querySelectorAll('.js-mf-tab'));
      var panelOf = function (t) { return document.getElementById(t.getAttribute('aria-controls')); };
      var select = function (tab) {
        var entering = null;
        var hideOthers = function () {
          tabs.forEach(function (t) {
            if (t !== tab) { panelOf(t).hidden = true; }
          });
        };
        tabs.forEach(function (t) {
          var selected = t === tab;
          t.setAttribute('aria-selected', selected ? 'true' : 'false');
          t.tabIndex = selected ? 0 : -1;
          if (selected && panelOf(t).hidden) {
            entering = panelOf(t);
            entering.hidden = false;
          } else if (!selected) {
            panelOf(t).classList.remove('is-entering');
          }
        });
        // Cross-fade: the new panel fades in on top of the old one (.is-entering), then the old one is hidden
        if (!entering || reduceMotion) {
          hideOthers();
          return;
        }
        entering.classList.remove('is-entering');
        void entering.offsetWidth;
        entering.classList.add('is-entering');
        var timer = null;
        var done = function (e) {
          if (e && e.target !== entering) { return; }
          entering.removeEventListener('animationend', done);
          clearTimeout(timer);
          if (tab.getAttribute('aria-selected') === 'true') { hideOthers(); }
        };
        entering.addEventListener('animationend', done);
        // Fallback in case animationend never fires (the fade is 400ms)
        timer = setTimeout(done, 600);
      };
      // Load the hidden panel's lazy images before the first switch, so the new color is not blank while loading
      var preload = function () {
        group.querySelectorAll('[role="tabpanel"][hidden] img[loading="lazy"]').forEach(function (img) {
          img.loading = 'eager';
        });
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            preload();
            io.disconnect();
          }
        }, { rootMargin: '400px 0px' });
        io.observe(group);
      } else {
        preload();
      }
      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { select(tab); });
        tab.addEventListener('keydown', function (e) {
          var next = null;
          if (e.key === 'ArrowRight') { next = tabs[(i + 1) % tabs.length]; }
          if (e.key === 'ArrowLeft') { next = tabs[(i - 1 + tabs.length) % tabs.length]; }
          if (e.key === 'Home') { next = tabs[0]; }
          if (e.key === 'End') { next = tabs[tabs.length - 1]; }
          if (next) {
            e.preventDefault();
            select(next);
            next.focus();
          }
        });
      });
    });

    // Arc sliders: every slide rotates 15deg per step around a pivot below the frame
    page.querySelectorAll('.js-mf-slider').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.js-mf-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.js-mf-dot'));
      var total = slides.length;
      if (total < 2) { return; }
      var maxVisible = slider.getAttribute('data-peek') === 'false' ? 0 : 1;
      var current = 0;
      // With 2 slides the other slide has no fixed side: it sits on the side it left from (step = direction of the last move)
      var step = -1;
      var offsetOf = function (i) {
        if (total === 2) { return i === current ? 0 : -step; }
        var o = ((i - current) % total + total) % total;
        return o > total / 2 ? o - total : o;
      };
      var render = function () {
        slides.forEach(function (slide, i) {
          var o = offsetOf(i);
          var prev = parseFloat(slide.style.getPropertyValue('--o') || slide.getAttribute('data-o'));
          slide.classList.toggle('no-transition', Math.abs(o - prev) > 1);
          slide.style.setProperty('--o', o);
          slide.classList.toggle('is-far', Math.abs(o) > maxVisible);
          slide.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
        });
        dots.forEach(function (dot, i) {
          dot.setAttribute('aria-current', i === current ? 'true' : 'false');
        });
      };
      var go = function (index, dir) {
        index = (index + total) % total;
        if (index === current) { return; }
        step = dir || (index > current ? 1 : -1);
        if (total === 2) {
          // The incoming slide must enter from the side it moves in from: put it there first without a transition
          var incoming = slides[index];
          incoming.classList.add('no-transition');
          incoming.style.setProperty('--o', step);
          incoming.classList.toggle('is-far', maxVisible < 1);
          void incoming.offsetWidth;
        }
        current = index;
        render();
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { go(i); });
      });
      // Swipe / drag, or tap (click) to go to the next slide (the dots handle their own clicks).
      // data-rewind (accessories): tapping the last slide goes back to the first one, moving left to right
      var rewind = slider.hasAttribute('data-rewind');
      var startX = null;
      slider.addEventListener('pointerdown', function (e) {
        startX = e.button === 0 && !e.target.closest('.js-mf-dot') ? e.clientX : null;
      });
      slider.addEventListener('pointerup', function (e) {
        if (startX === null) { return; }
        var dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) {
          go(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        } else if (Math.abs(dx) < 10) {
          if (rewind && current === total - 1) {
            go(0, -1);
          } else {
            go(current + 1, 1);
          }
        }
      });
      slider.addEventListener('pointercancel', function () { startX = null; });
      render();
    });

    // Points (mobile): one point per view with prev / next buttons
    page.querySelectorAll('.js-mf-points').forEach(function (wrap) {
      var track = wrap.querySelector('.js-mf-points-track');
      var prev = wrap.querySelector('.js-mf-points-prev');
      var next = wrap.querySelector('.js-mf-points-next');
      var update = function () {
        var max = track.scrollWidth - track.clientWidth;
        prev.disabled = track.scrollLeft <= 1;
        next.disabled = track.scrollLeft >= max - 1;
      };
      var scrollByOne = function (dir) {
        track.scrollBy({ left: dir * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
      };
      prev.addEventListener('click', function () { scrollByOne(-1); });
      next.addEventListener('click', function () { scrollByOne(1); });
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    });

    // Photos: cross-fade every 4 seconds while the photo box is on screen (starts on scroll-in, pauses on scroll-out)
    if (!reduceMotion) {
      page.querySelectorAll('.js-mf-photos').forEach(function (box) {
        var photos = box.querySelectorAll('.js-mf-photo');
        if (photos.length < 2) {
          return;
        }
        var shown = 0;
        var timer = null;
        var tick = function () {
          photos[shown].classList.replace('opacity-100', 'opacity-0');
          shown = (shown + 1) % photos.length;
          photos[shown].classList.replace('opacity-0', 'opacity-100');
        };
        var start = function () { timer = timer || setInterval(tick, 4000); };
        var stop = function () { clearInterval(timer); timer = null; };
        if (!('IntersectionObserver' in window)) {
          start();
          return;
        }
        new IntersectionObserver(function (entries) {
          entries[entries.length - 1].isIntersecting ? start() : stop();
        }, { threshold: 0.3 }).observe(box);
      });
    }

    // Sticky CTA bar: fades in once the page has been scrolled (30% of the viewport height), pinned to the viewport bottom,
    // and rests in its slot at the end of the NOTES section
    // (position: sticky is not usable here because the site layout wraps the page in overflow:hidden containers)
    var cta = page.querySelector('.js-mf-cta');
    var slot = page.querySelector('.js-mf-cta-slot');
    if (cta && slot) {
      var pin = function () {
        var gap = window.innerWidth >= 1024 ? 24 : 16;
        var pinned = slot.getBoundingClientRect().bottom > window.innerHeight - gap;
        cta.style.position = pinned ? 'fixed' : '';
        cta.style.bottom = pinned ? gap + 'px' : '';
        cta.style.left = cta.style.right = pinned ? '0' : '';
        cta.classList.toggle('is-hidden', pinned && window.pageYOffset < window.innerHeight * 0.3);
      };
      window.addEventListener('scroll', pin, { passive: true });
      window.addEventListener('resize', pin);
      // First state without the fade, so the bar does not flash and fade out on load
      cta.style.transition = 'none';
      pin();
      void cta.offsetWidth;
      cta.style.transition = '';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMickeyAndFriends);
  } else {
    initMickeyAndFriends();
  }
})();

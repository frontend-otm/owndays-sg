/*
 * OWNDAYS Brand Ambassador TZUYU (SG). Based on public/web/js/specials-ambassador-tzuyu.js (Renewal preview branch), MY version.
 * Loaded in <head> right after the Tailwind Play CDN, so the Tailwind config is set before the first build.
 * Removed for SG: the TW lens-selection modal / stock check (Renewal API), the <html lang> guard and the Bootstrap modal hooks.
 * Images use native loading="lazy" instead of lazysizes.
 */

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
 * On the CMS, this page's <link> stylesheets (global.css, specials.css, specials-ambassador-tzuyu.css ...) are rendered
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
  var tryMove = function () {
    var style = findInHead();
    if (style && document.body) {
      document.body.appendChild(style);
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

/* --body-w: the page width without the scrollbar (used by --edge on wide screens) */
(function () {
  var setBodyWidth = function () {
    if (document.body) {
      document.documentElement.style.setProperty('--body-w', document.body.clientWidth + 'px');
    }
  };
  document.addEventListener('DOMContentLoaded', setBodyWidth);
  window.addEventListener('resize', setBodyWidth);
})();

$(function () {
  const page = document.querySelector('.l-ambassador-tzuyu');
  if (!page) {
    return;
  }

  const html = document.documentElement;

  // section titles: one span per character for the reveal
  page.querySelectorAll('.title[data-aos="title-reveal"]').forEach((title) => {
    const text = title.textContent.trim();
    title.setAttribute('aria-label', text);
    title.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'title__char';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', i);
      span.textContent = ch === ' ' ? ' ' : ch;
      title.appendChild(span);
    });
  });

  // lineup title / description: split into words and characters
  if (window.Intl && Intl.Segmenter) {
    const lang = (html.getAttribute('lang') || 'en').split('-')[0];
    const words = new Intl.Segmenter(lang, { granularity: 'word' });
    const graphemes = new Intl.Segmenter(lang, { granularity: 'grapheme' });
    page.querySelectorAll('.js-split').forEach((el) => {
      let i = 0;
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      const splitNode = (node) => {
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            splitNode(child);
            return;
          }
          if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) {
            return;
          }
          const frag = document.createDocumentFragment();
          [...words.segment(child.textContent.replace(/\s+/g, ' '))].forEach(({ segment }) => {
            if (segment === ' ') {
              frag.appendChild(document.createTextNode(' '));
              return;
            }
            const word = document.createElement('span');
            word.className = 'split-word';
            word.setAttribute('aria-hidden', 'true');
            [...graphemes.segment(segment)].forEach(({ segment: g }) => {
              const ch = document.createElement('span');
              ch.className = 'split-char';
              ch.style.setProperty('--i', i++);
              ch.textContent = g;
              word.appendChild(ch);
            });
            frag.appendChild(word);
          });
          child.replaceWith(frag);
        });
      };
      splitNode(el);
      el.style.setProperty('--n', i);
    });

    const setSplitLines = () => {
      page.querySelectorAll('.js-split:not(.js-split--fade)').forEach((el) => {
        let line = -1;
        let top = null;
        el.querySelectorAll('.split-word').forEach((word) => {
          if (top === null || Math.abs(word.offsetTop - top) > 2) {
            top = word.offsetTop;
            line++;
          }
          word.style.setProperty('--l', line);
        });
      });
    };
    setSplitLines();
    window.addEventListener('resize', setSplitLines);
  }

  // concept video: the PLAY button is a lens that refracts the video behind it (canvas), and follows the mouse on desktop
  const LENS = {
    bezel: 0.6,
    strength: 1.25,
    curve: 2,
    zoom: 1,
    aberration: [1, 1.04, 1.08],
  };
  const buildLensMap = (n) => {
    const map = [new Float32Array(n * n * 2), new Float32Array(n * n * 2), new Float32Array(n * n * 2)];
    const inside = new Uint8Array(n * n);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const vx = (x + 0.5 - n / 2) / (n / 2);
        const vy = (y + 0.5 - n / 2) / (n / 2);
        const d = Math.hypot(vx, vy);
        const i = y * n + x;
        if (d >= 1) {
          continue;
        }
        inside[i] = 1;
        let shift = d * (LENS.zoom - 1);
        const fromEdge = (1 - d) / LENS.bezel;
        if (fromEdge < 1) {
          shift -= LENS.strength * Math.pow(1 - fromEdge, LENS.curve);
        }
        LENS.aberration.forEach((k, c) => {
          const f = d > 0 ? 1 + (shift * k) / d : 1;
          map[c][i * 2] = vx * f;
          map[c][i * 2 + 1] = vy * f;
        });
      }
    }
    return { n, map, inside };
  };

  const playFollowMql = window.matchMedia('(min-width: 1024px) and (hover: hover)');
  page.querySelectorAll('.js-video-link').forEach((link) => {
    const btn = link.querySelector('.js-video-play');
    const main = link.querySelector('video');
    const canvas = link.querySelector('.js-video-lens');
    const ctx = canvas.getContext('2d');
    const src = document.createElement('canvas');
    const srcCtx = src.getContext('2d', { willReadFrequently: true });
    let lensMap = null;
    let visible = false;
    let broken = false;
    let cur = null;
    let target = null;
    let raf = 0;

    const draw = () => {
      if (broken || !main.videoWidth) {
        return;
      }
      const vr = main.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      const n = Math.round(br.width * Math.min(2, window.devicePixelRatio || 1));
      if (!lensMap || lensMap.n !== n) {
        lensMap = buildLensMap(n);
        canvas.width = n;
        canvas.height = n;
      }

      const r = br.width / 2;
      const cx = br.left + r - vr.left;
      const cy = br.top + r - vr.top;
      const k = n / br.width;
      const reach = r * 1.4;
      const x0 = Math.max(0, cx - reach);
      const y0 = Math.max(0, cy - reach);
      const x1 = Math.min(vr.width, cx + reach);
      const y1 = Math.min(vr.height, cy + reach);
      const w = Math.round((x1 - x0) * k);
      const h = Math.round((y1 - y0) * k);
      if (w <= 0 || h <= 0) {
        return;
      }
      if (src.width !== w || src.height !== h) {
        src.width = w;
        src.height = h;
      }
      const vsx = main.videoWidth / vr.width;
      const vsy = main.videoHeight / vr.height;
      let px;
      try {
        srcCtx.drawImage(main, x0 * vsx, y0 * vsy, (x1 - x0) * vsx, (y1 - y0) * vsy, 0, 0, w, h);
        px = srcCtx.getImageData(0, 0, w, h).data;
      } catch (e) {
        broken = true;
        return;
      }
      const out = ctx.createImageData(n, n);
      const o = out.data;
      const { map, inside } = lensMap;
      for (let i = 0; i < n * n; i++) {
        if (!inside[i]) {
          continue;
        }
        for (let c = 0; c < 3; c++) {
          let x = Math.round((cx + map[c][i * 2] * r - x0) * k);
          let y = Math.round((cy + map[c][i * 2 + 1] * r - y0) * k);
          x = x < 0 ? 0 : (x >= w ? w - 1 : x);
          y = y < 0 ? 0 : (y >= h ? h - 1 : y);
          o[i * 4 + c] = px[(y * w + x) * 4 + c];
        }
        o[i * 4 + 3] = 255;
      }
      ctx.putImageData(out, 0, 0);
    };
    const loop = () => {
      if (!visible) {
        return;
      }
      draw();
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was) {
        requestAnimationFrame(loop);
      }
    }).observe(link);

    const tick = () => {
      cur.x += (target.x - cur.x) * 0.2;
      cur.y += (target.y - cur.y) * 0.2;
      link.style.setProperty('--play-x', `${cur.x}px`);
      link.style.setProperty('--play-y', `${cur.y}px`);
      if (Math.abs(target.x - cur.x) > 0.5 || Math.abs(target.y - cur.y) > 0.5) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        if (target.home) {
          link.style.removeProperty('--play-x');
          link.style.removeProperty('--play-y');
          cur = null;
        }
      }
    };
    const moveTo = (x, y, home = false) => {
      const lr = link.getBoundingClientRect();
      cur = cur || { x: lr.width / 2, y: lr.height / 2 };
      target = { x, y, home };
      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    link.addEventListener('mousemove', (e) => {
      if (!playFollowMql.matches) {
        return;
      }
      const lr = link.getBoundingClientRect();
      moveTo(e.clientX - lr.left, e.clientY - lr.top);
    });
    link.addEventListener('mouseleave', () => {
      if (!cur) {
        return;
      }
      const lr = link.getBoundingClientRect();
      moveTo(lr.width / 2, lr.height / 2, true);
    });
  });

  // product color: one slide per color, the color buttons drive the slider
  // and the selected color's product page goes to the card's button
  const selectProductColor = ($card, index) => {
    const $btns = $card.find('.js-color-btn');
    const $this = $btns.eq(index);

    $btns.attr('aria-pressed', 'false');
    $this.attr('aria-pressed', 'true');
    $card.find('.js-product-link').attr('href', $this.data('href'));
  };

  $(page).find('.js-product-card').each(function () {
    const $card = $(this);
    const el = $card.find('.js-product-swiper')[0];
    if (!el) {
      return;
    }

    const swiper = new Swiper(el, {
      initialSlide: Number(el.dataset.initialSlide) || 0,
      loop: true,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 500,
      on: {
        slideChange: (s) => selectProductColor($card, s.realIndex),
      },
    });

    $card.find('.js-color-btn').on('click', function () {
      swiper.slideToLoop($(this).index());
    });
  });

  // lens color accordion: animate <details> open / close (re-clicking mid-animation continues from the current height)
  const reduceMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
  page.querySelectorAll('.js-lens-details').forEach((details) => {
    const summary = details.querySelector('summary');
    const body = details.querySelector('.js-lens-details-body');
    let anim = null;

    const run = (to, onDone) => {
      const from = anim ? body.offsetHeight : (to === 0 ? body.scrollHeight : 0);
      if (anim) {
        anim.cancel();
      }
      const target = to === 0 ? 0 : body.scrollHeight;
      anim = body.animate(
        { height: [from + 'px', target + 'px'], opacity: [from ? from / body.scrollHeight : 0, to === 0 ? 0 : 1] },
        { duration: reduceMotionMql.matches ? 0 : 300, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }
      );
      anim.onfinish = () => {
        anim = null;
        if (onDone) {
          onDone();
        }
      };
    };

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (details.classList.contains('is-open')) {
        details.classList.remove('is-open');
        run(0, () => { details.open = false; });
      } else {
        details.open = true;
        details.classList.add('is-open');
        run(1);
      }
    });

    // fast repeated clicks must not select the title text (no user-select: none)
    summary.addEventListener('mousedown', (e) => {
      if (e.detail > 1) {
        e.preventDefault();
      }
    });
  });

  // lineup hero: cross-fade image 1 <-> 2 every 4s
  page.querySelectorAll('.js-hero-fade').forEach((el) => {
    const next = el.querySelector('.js-hero-fade-2');
    setInterval(() => next.classList.toggle('is-show'), 4000);
  });

  // lineup details (lg+): sticky, centred in the viewport (the SG site header is not fixed, so nothing to clear above it)
  const lineupStickies = page.querySelectorAll('.js-lineup-sticky');
  const minGap = 15; // space at the top when the box is taller than the viewport
  const updateStickyTop = () => {
    lineupStickies.forEach((el) => {
      const top = window.innerHeight / 2 - el.offsetHeight / 2;
      el.style.setProperty('--sticky-top', Math.max(minGap, top) + 'px');
    });
  };
  if (lineupStickies.length) {
    updateStickyTop();
    const ro = new ResizeObserver(updateStickyTop);
    lineupStickies.forEach((el) => ro.observe(el));
    window.addEventListener('resize', updateStickyTop);
  }

  // lineup nav: smooth scroll to the section (jQuery has no easeOutQuart without jQuery UI)
  if (!$.easing.easeOutQuart) {
    $.easing.easeOutQuart = (p) => 1 - Math.pow(1 - p, 4);
  }

  $(page).find("a[href^='#']").on('click', function (e) {
    const $this = $(this);
    const $target = $($this.attr('href'));

    if ($target.length === 0) {
      return;
    }

    const duration = Number($this.attr('data-scroll-duration') || 1000);
    const offset = Number($this.attr('data-scroll-offset') || 15);

    e.preventDefault();

    $('html, body').animate({
      scrollTop: $target.offset().top - offset
    }, {
      duration,
      easing: 'easeOutQuart',
      step: (now, fx) => {
        const realPos = $target.offset().top - offset;
        if (fx.end !== realPos) {
          fx.end = realPos;
        }
      },
    });
  });

  // AOS last: the titles / descriptions are split above, so the positions it measures are final
  AOS.init({
    once: true,
    duration: 1000,
    easing: 'ease-out-quart',
  });

  // Re-measure whenever the page height changes afterwards (lazy images, fonts, the site header / footer loading)
  let refreshTimer;
  new ResizeObserver(() => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => AOS.refresh(), 100);
  }).observe(page);
});

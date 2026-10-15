/* Tailwind Play CDN config (was inline in <head>) */
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
  }
}

/* full-width helpers (was inline at the end of <body>) */
function getBodyWidth() {
  document.documentElement.style.setProperty('--body-w', document.body.clientWidth + 'px');
}
getBodyWidth();
window.addEventListener('resize', getBodyWidth);

/* page top offset + KV padding on SP (was inline after the breadcrumbs) */
function setPageTopOffset() {
  const els = ['#top-information', '#sticky-wrapper', '#header-wrapper', '.c-breadcrumb', '.breadcrumbs'].map((sel) => document.querySelector(sel));
  const pageTopOffset = Math.max(els.reduce((sum, el) => sum + (el?.offsetHeight || 0), 0), 103);
  document.documentElement.style.setProperty('--page-top-offset', pageTopOffset + 'px');
  return els;
}

function setKvSpPaddingTop() {
  const kv = document.getElementById('kv');
  const layout = kv?.querySelector('.kv-layout');
  if (!kv || !layout) return;
  if (window.matchMedia('(min-width: 1024px)').matches) {
    kv.style.setProperty('--kv-pt', '0px');
    return;
  }
  kv.style.setProperty('--kv-pt', '0px');
  const pageTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-top-offset')) || 0;
  const pb = parseFloat(getComputedStyle(kv).paddingBottom) || 0;
  const pt = Math.max(0, (window.innerHeight - pageTop - pb - layout.offsetHeight) / 2) + 10;
  kv.style.setProperty('--kv-pt', `${pt}px`);
}
const pageTopEls = setPageTopOffset();
const onPageTopResize = () => {
  setPageTopOffset();
  setKvSpPaddingTop();
};
window.addEventListener('resize', onPageTopResize);
window.addEventListener('load', onPageTopResize);
if (window.ResizeObserver) {
  const ro = new ResizeObserver(onPageTopResize);
  pageTopEls.forEach((el) => el && ro.observe(el));
}
const initKvSpPaddingTop = () => {
  setKvSpPaddingTop();
  const kvLayout = document.querySelector('#kv .kv-layout');
  if (window.ResizeObserver && kvLayout) {
    new ResizeObserver(setKvSpPaddingTop).observe(kvLayout);
  }
  document.querySelectorAll('#kv img').forEach((img) => img.addEventListener('load', setKvSpPaddingTop));
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initKvSpPaddingTop);
} else {
  initKvSpPaddingTop();
}

function orderArcPaths(paths, pathOrder) {
  const list = Array.from(paths);
  if (pathOrder === 'reverse') list.reverse();
  return list;
}

$(function () {
  /*
   * Responsive uk-parallax (PC = md ≥768):
   * - data-parallax-sp / data-parallax-pc  full uk-parallax option strings
   *   e.g. data-parallax-sp="y:0,200px; target:#kv; end:25%;"
   */
  const parallaxMq = window.matchMedia('(min-width: 768px)');
  const applyParallax = () => {
    document.querySelectorAll('[data-parallax-sp]').forEach((el) => {
      const value = parallaxMq.matches
        ? (el.dataset.parallaxPc || el.dataset.parallaxSp)
        : el.dataset.parallaxSp;
      if (!value) {
        return;
      }
      el.setAttribute('uk-parallax', value);
    });
    if (window.UkParallax && typeof window.UkParallax.refresh === 'function') {
      window.UkParallax.refresh();
    }
  };
  applyParallax();
  if (parallaxMq.addEventListener) {
    parallaxMq.addEventListener('change', applyParallax);
  } else if (parallaxMq.addListener) {
    parallaxMq.addListener(applyParallax);
  }

  /*
   * .svg-text-animation data options (on the <svg> root):
   * - data-stagger-delay   ms between each path (default 50)
   * - data-stagger-start   ms before the first path (default 0)
   * - data-line-gap-delay  extra ms when a break index is hit (default 200)
   * - data-break-at        1-based path indexes to add line gap, comma-separated
   * - data-path-order      "reverse" to reverse path order
   * Formula: delay = start + i * stagger + lineGapExtra
   */
  document.querySelectorAll('.svg-text-animation').forEach((root) => {
    const stagger = Number(root.dataset.staggerDelay) || 50;
    const start = Number(root.dataset.staggerStart) || 0;
    const lineGap = Number(root.dataset.lineGapDelay) || 200;
    const breaks = new Set(
      (root.dataset.breakAt || '').split(',').map((s) => Number(s.trim())).filter(Boolean)
    );
    let extra = 0;
    orderArcPaths(root.querySelectorAll('path'), root.dataset.pathOrder).forEach((path, i) => {
      if (breaks.has(i + 1)) extra += lineGap;
      path.style.transitionDelay = (start + i * stagger + extra) + 'ms';
    });
    root.style.opacity = '1';
  });

  /*
   * data-aos-after-split + data-after-split-delay (ms, default 500)
   * previous sibling must be .text-animate with .text-split already built:
   * - on .text-animate → start this root's .text-split at lastDelay + gap
   * - otherwise → set el.style.transitionDelay (e.g. "model") — not data-aos-delay
   */
  function afterSplitStartSec(el) {
    const prev = el.previousElementSibling;
    if (!prev || !prev.classList.contains('text-animate')) {
      return null;
    }
    const splits = prev.querySelectorAll('.text-split');
    if (!splits.length) {
      return null;
    }
    const lastSec = parseFloat(splits[splits.length - 1].style.transitionDelay) || 0;
    const offset = Number(el.dataset.afterSplitDelay);
    const gapSec = (Number.isFinite(offset) ? offset : 500) / 1000;
    return lastSec + gapSec;
  }

  document.querySelectorAll('.text-animate').forEach((root) => {
    const step = Number(root.dataset.stagger) || 0.06;
    let delay = 0;
    if (root.hasAttribute('data-aos-after-split')) {
      const start = afterSplitStartSec(root);
      if (start != null) {
        delay = start;
      }
    }

    root.querySelectorAll(':scope > span').forEach((line) => {
      const frag = document.createDocumentFragment();
      line.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          for (const ch of node.textContent) {
            const span = document.createElement('span');
            span.className = 'text-split';
            span.textContent = ch;
            span.style.transitionDelay = delay + 's';
            delay += step;
            frag.appendChild(span);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
          frag.appendChild(document.createElement('br'));
        }
      });
      line.replaceChildren(frag);
    });
  });

  document.querySelectorAll('[data-aos-after-split]:not(.text-animate)').forEach((el) => {
    const start = afterSplitStartSec(el);
    if (start == null) {
      return;
    }
    el.style.transitionDelay = start + 's';
  });

  AOS.init({
    once: true,
    duration: 1000,
    easing: 'ease-in-out',
  });
  document.querySelectorAll('img').forEach((img) => img.addEventListener('load', () => AOS.refresh()));

  setTimeout(() => {
    document.querySelectorAll('#kv .svg-text-animation').forEach((el) => el.classList.add('aos-animate'));
  }, 0);

  const headerEl = document.querySelector('.l-header, header');
  // fallback = SG site header height (same values as the platform's helper.js)
  const getHeaderHeight = () => (headerEl ? headerEl.offsetHeight : (window.innerWidth < 1024 ? 56 : 124));

  $.fn.hasAttr = function(name) {
    return this.attr(name) !== undefined;
  };

  $(".l-popmart-molly a[href^='#']").not('a.nav-link').on('click', function (e) {
    const $this = $(this);
    const $targetId = $this.attr('href');
    const $target = $($targetId);

    if ($target.length === 0) {
      return;
    }

    const $duration = $this.hasAttr('data-scroll-duration') ? $this.attr('data-scroll-duration') : 1000;
    const $offset = $this.hasAttr('data-scroll-offset') ? $this.attr('data-scroll-offset') : 15;
    const $scrollPosition = $target.offset().top - getHeaderHeight() - $offset;

    e.preventDefault();

    $('html, body').animate({
      scrollTop: $scrollPosition
    }, {
      duration: parseInt($duration),
      easing: 'swing',
      step: (now, fx) => {
        const $realPos = $target.offset().top - getHeaderHeight() - $offset;
        if (fx.end !== $realPos) {
          fx.end = $realPos;
        }
      },
    });
  });

  $('.c-tab').each(function () {
    const $tab = $(this);
    $tab.on('click', '.nav-link[data-toggle="pill"]', function (e) {
      e.preventDefault();
      const $link = $(this);
      const $pane = $tab.find($link.attr('href'));
      if (!$pane.length) {
        return;
      }
      $tab.find('.nav-link').removeClass('active');
      $link.addClass('active');
      $tab.find('.tab-pane').removeClass('show active');
      $pane.addClass('show active');

      const url = $link.data('url');
      if (url) {
        $tab.find('.button-more-detail').attr('href', url);
      }
    });
  });

  $(".product-slider--glasses").each(function (index, element) {
    const $el = $(element);
    new Swiper(element, {
      slidesPerView: 'auto',
      spaceBetween: 0,
      centeredSlides: true,
      loop: true,
      pagination: {
        el: $el.find(".swiper-pagination")[0],
        clickable: true,
      },
      navigation: {
        prevEl: $el.find(".product-slider-button-prev")[0],
        nextEl: $el.find(".product-slider-button-next")[0],
      },
      breakpoints: {
        768: {
          spaceBetween: 40,
        },
      },
    });
  });

  $(".product-slider--accessories").each(function (index, element) {
    const $el = $(element);
    new Swiper(element, {
      slidesPerView: 'auto',
      spaceBetween: 0,
      centeredSlides: true,
      loop: true,
      pagination: {
        el: $el.find(".swiper-pagination")[0],
        clickable: true,
      },
      navigation: {
        prevEl: $el.find(".product-slider-button-prev")[0],
        nextEl: $el.find(".product-slider-button-next")[0],
      },
      breakpoints: {
        768: {
          spaceBetween: 80,
        },
      },
    });
  });

  const stickyNavPc = document.querySelector('[data-sticky-nav-pc]');
  if (stickyNavPc) {
    const updateStickyNavPcTop = () => {
      const navH = stickyNavPc.offsetHeight;
      if (!navH) return;
      const headerH = getHeaderHeight();
      const top = headerH + (window.innerHeight - headerH) / 2 - navH / 2;
      document.documentElement.style.setProperty('--sticky-nav-pc-top', `${Math.max(headerH, top)}px`);
    };

    let stickyNavPcResizeTimer;
    const scheduleStickyNavPcUpdate = () => {
      clearTimeout(stickyNavPcResizeTimer);
      stickyNavPcResizeTimer = setTimeout(updateStickyNavPcTop, 100);
    };

    updateStickyNavPcTop();
    stickyNavPc.querySelectorAll('img').forEach((img) => {
      img.addEventListener('load', updateStickyNavPcTop);
    });
    window.addEventListener('resize', scheduleStickyNavPcUpdate);
    window.addEventListener('orientationchange', updateStickyNavPcTop);
  }

  const stickyNavSp = document.querySelector('#sticky-nav-sp');
  const stickyNavPcLinks = stickyNavPc
    ? stickyNavPc.querySelectorAll('a[href^="#"]')
    : [];
  const stickyNavSpLinks = stickyNavSp
    ? stickyNavSp.querySelectorAll('a[href^="#"]')
    : [];
  const spyLinkSource = stickyNavSpLinks.length ? stickyNavSpLinks : stickyNavPcLinks;

  if (spyLinkSource.length) {
    const activeBg = 'bg-[image:var(--sticky-nav-pc-active)]';
    const inactiveBg = 'bg-[image:var(--sticky-nav-pc-inactive)]';
    const spyIds = [...spyLinkSource].map((a) => a.getAttribute('href').slice(1)).concat('case-cleaning-cloth');
    const sections = spyIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .sort((a, b) => a.offsetTop - b.offsetTop);

    const setStickyNavActive = () => {
      let line;
      if (stickyNavSp && stickyNavSp.offsetParent !== null) {
        line = stickyNavSp.getBoundingClientRect().bottom + 100;
      } else if (stickyNavPc) {
        line = stickyNavPc.getBoundingClientRect().bottom - 150;
      } else {
        return;
      }
      let current = null;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= line) {
          current = section;
        }
      });
      const activeId = current && current.id !== 'case-cleaning-cloth' ? current.id : null;

      stickyNavSpLinks.forEach((link) => {
        link.classList.toggle('opacity-40', link.getAttribute('href').slice(1) !== activeId);
      });

      stickyNavPcLinks.forEach((link) => {
        const isActive = link.getAttribute('href').slice(1) === activeId;
        link.classList.toggle(activeBg, isActive);
        link.classList.toggle(inactiveBg, !isActive);
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setStickyNavActive();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    setStickyNavActive();
  }

  const pageBg = document.querySelector('.page-bg');
  const pageBgBottomMq = window.matchMedia('(min-width: 768px)');
  const setPageBgBottomPos = () => {
    if (!pageBg) return;
    if (pageBgBottomMq.matches) {
      pageBg.style.removeProperty('--page-bg-bottom-pos');
      return;
    }
    const start = -0.25 * window.innerHeight;
    const end = -60;
    const t = Math.min(1, Math.max(0, window.scrollY / 300));
    pageBg.style.setProperty('--page-bg-bottom-pos', `${start + (end - start) * t}px`);
  };
  let pageBgBottomTicking = false;
  const onPageBgBottomScroll = () => {
    if (pageBgBottomTicking) return;
    pageBgBottomTicking = true;
    requestAnimationFrame(() => {
      setPageBgBottomPos();
      pageBgBottomTicking = false;
    });
  };
  window.addEventListener('scroll', onPageBgBottomScroll, { passive: true });
  window.addEventListener('resize', onPageBgBottomScroll);
  if (pageBgBottomMq.addEventListener) {
    pageBgBottomMq.addEventListener('change', setPageBgBottomPos);
  } else if (pageBgBottomMq.addListener) {
    pageBgBottomMq.addListener(setPageBgBottomPos);
  }
  setPageBgBottomPos();
});

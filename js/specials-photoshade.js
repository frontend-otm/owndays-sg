/*
 * OWNDAYS PhotoShade (SG). Based on public/web/js/specials-photoshade.js (Renewal preview branch).
 * Removed for SG: the MINNIE sections (exclusive video / gift box slider / about photos are commented out in the blade)
 * and the "#" link auto-scroll (no in-page links here; it would also catch the site header links).
 * Bootstrap is not loaded on SG, so the lens tabs are switched by handleLensTabs().
 */
$(function () {
  var rellax = new Rellax('.rellax', {
    center: true,
    speed: 0.5,
  });

  window.addEventListener('resize', () => {
    rellax.refresh();
  });

  // Build the lens slider before AOS measures the page: until slick runs, its 6 slides are stacked (~4000px), so AOS
  // would record the Lineup far below where it ends up and never fire it (until a resize, e.g. opening DevTools).
  handleSelectedColor();
  handleColorSwipe();
  setAnimationTitle();
  handleLensTabs();
  handleCollection();

  if (window.innerWidth < 1024) {
    $('.recommends__list [data-aos-delay]').removeAttr('data-aos-delay');
  }

  AOS.init({
    once: true,
    duration: 1000,
  });

  // Re-measure whenever the page height changes afterwards (images, fonts, the site header / footer loading)
  let refreshTimer;
  new ResizeObserver(() => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => AOS.refresh(), 100);
  }).observe(document.querySelector('.l-photoshade'));
});

function handleSelectedColor() {
  // Fetch the other colours once the page is loaded, so a swatch click swaps the photo without waiting
  $(window).on('load', function () {
    $('.recommends__colors li:not(.active) span').each(function () {
      new Image().src = $(this).data('image');
    });
  });

  $('.recommends__colors span').on('click', function () {
    const $this = $(this);
    const $item = $this.closest('.recommends__item');

    $this.closest('ul').find('li').removeClass('active');
    $this.parent().addClass('active');

    $item.find('img')
      .attr('src', $this.data('image'))
      .attr(
        'alt',
        `${$this.data('product-name')} ${$this.data('product-number')} ${$this.data('color')}`
      );

    $item.find('h3').text(
      `${$this.data('product-name')} ${$this.data('product-number')} ${$this.data('color')}`
    );

    $item.find('.recommends__item__product-number')
      .text($this.data('product-number'));

    $item.find('.recommends__item__price')
      .text($this.data('price'));

    $item.find('.btn')
      .attr('href', $this.data('url'));

    $item.find('.recommends__item__selected-tag')
      .toggle(String($this.data('is-show-tag')) === 'true');
  });
}

function handleColorSwipe() {
  const swipeThreshold = 40;

  $('.recommends__item').each(function () {
    const $item = $(this);
    const $swipeArea = $item.find('img');

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    $swipeArea.on('pointerdown', function (event) {
      startX = event.clientX;
      startY = event.clientY;
      isDragging = true;

      this.setPointerCapture?.(event.pointerId);
    });

    $swipeArea.on('pointerup pointercancel', function (event) {
      if (!isDragging) return;

      const diffX = event.clientX - startX;
      const diffY = event.clientY - startY;

      isDragging = false;

      // Ignore vertical scrolling
      if (
        Math.abs(diffX) < swipeThreshold ||
        Math.abs(diffX) <= Math.abs(diffY)
      ) {
        return;
      }

      const $colors = $item.find('.recommends__colors li');
      const currentIndex = $colors.filter('.active').index();

      let nextIndex;

      if (diffX < 0) {
        // Swipe left: next colour
        nextIndex = (currentIndex + 1) % $colors.length;
      } else {
        // Swipe right: previous colour
        nextIndex = (currentIndex - 1 + $colors.length) % $colors.length;
      }

      $colors.eq(nextIndex).find('span').trigger('click');
    });
  });
}

function setAnimationTitle() {
  const segmenter = new Intl.Segmenter('en', {
    granularity: 'grapheme',
  });

  document.querySelectorAll('.l-photoshade [data-aos="char-up"]').forEach((target) => {
    if (target.dataset.charUpInit === 'true') return;
    target.dataset.charUpInit = 'true';

    let index = 0;

    const wrapTextNode = (node) => {
      // Treat whitespace like the browser does: a formatting-only node (line break + indent) is dropped, and runs
      // collapse to one space. Otherwise every indent space becomes a .char-up-space and widens the title (and its
      // dotted underline).
      const text = node.textContent.replace(/\s+/g, ' ');
      if (!text.trim()) return;

      const fragment = document.createDocumentFragment();

      const characters = [...segmenter.segment(text)]
        .map(({ segment }) => segment);

      characters.forEach((char) => {
        if (char === ' ') {
          const space = document.createElement('span');
          space.className = 'char-up-space';
          space.innerHTML = '&nbsp;';
          fragment.appendChild(space);
          return;
        }

        const mask = document.createElement('span');
        mask.className = 'char-up-mask';

        const span = document.createElement('span');
        span.className = 'char-up-text';
        span.style.setProperty('--delay', `${(index * 0.02).toFixed(2)}s`);
        span.textContent = char;

        mask.appendChild(span);
        fragment.appendChild(mask);

        index++;
      });

      node.replaceWith(fragment);
    };

    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          wrapTextNode(child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };

    target.classList.add('char-up-line');
    walk(target);
  });

  if (window.AOS) {
    AOS.refreshHard();
  }
}

// Replaces Bootstrap's tab plugin: same classes (.active / .show) and a 'shown.tab' event for the slider refresh
function handleLensTabs() {
  const $buttons = $('#lensTab [data-target]');

  $buttons.on('click', function () {
    const $button = $(this);
    if ($button.hasClass('active')) return;

    const $pane = $($button.data('target'));

    $buttons.removeClass('active').attr('aria-selected', 'false');
    $button.addClass('active').attr('aria-selected', 'true');

    $pane.siblings('.tab-pane').removeClass('active show');
    $pane.addClass('active');
    void $pane[0].offsetWidth;
    $pane.addClass('show');

    $button.trigger('shown.tab');
  });
}

function handleCollection() {
  $('.specs__lens__collection__wrap').each(function () {
    const $wrap = $(this);
    const $pane = $wrap.closest('.tab-pane');
    const $slider = $wrap.find('.specs__lens__collection');
    const $lens = $pane.find('.specs__lens__colors > li');
    const $arrows = $wrap.find('.specs__lens__collection__arrows');

    const setArrowPosition = () => {
      const imgWrapHeight = $slider
        .find('.slick-current .specs__lens__collection__item__img')
        .outerHeight();

      if (!imgWrapHeight) return;

      $arrows.css({
        top: window.innerWidth < 768 ? imgWrapHeight + 20 : imgWrapHeight / 2,
      });
    };

    $slider.on('init afterChange', function (event, slick, currentSlide) {
      const index = typeof currentSlide === 'number'
        ? currentSlide
        : slick.currentSlide;

      $lens
        .removeClass('is-selected')
        .eq(index)
        .addClass('is-selected');

      setArrowPosition();
    });

    $slider.on('setPosition', function () {
      setArrowPosition();
    });

    if (!$slider.hasClass('slick-initialized')) {
      $slider.slick({
        arrows: false,
        dots: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
      });
    }

    $wrap.find('.js-specs-prev').on('click', function () {
      $slider.slick('slickPrev');
    });

    $wrap.find('.js-specs-next').on('click', function () {
      $slider.slick('slickNext');
    });

    $lens.on('click', function () {
      const index = Number($(this).data('index'));

      $slider.slick('slickGoTo', index);

      $lens
        .removeClass('is-selected')
        .eq(index)
        .addClass('is-selected');
    });

    $(window).on('resize', setArrowPosition);

    setTimeout(setArrowPosition, 100);
  });

  // A slider built inside a hidden tab has no width until its tab is shown
  $('#lensTab [data-target]').on('shown.tab', function () {
    const $slider = $($(this).data('target')).find('.specs__lens__collection');

    $slider.slick('setPosition');

    const current = $slider.slick('slickCurrentSlide');
    $slider.slick('slickGoTo', current, true);
  });
}

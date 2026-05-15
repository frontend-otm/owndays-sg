const BREAKPOINT_LG = 1024;

const AOS_OFFSET_RATIO = 0.5;

const SPECIAL_SCROLL_TARGETS = [
  '#star-wars-hand-case',
  '#cylinder-case',
  '#grogu-hard-case',
];

const PRODUCT_HEADER_SELECTOR = [
  '.product__header__name',
  '.product__header__number',
  '.product__header__price',
].join(', ');

const RANDOM_DELAY_LIST = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];

$(function () {
  initAOS();
  initImageAOSRefresh();
  initLineupMarquee();

  setPeriod();
  setLineupNav();
  setInspiredName();
  setProductHeader();
  updateProductButtonText();

  onClickAutoScroll();
  onLinkHash();

  setProductSlider();
  starrySky();
  splitLinesAll();
});

window.addEventListener('load', () => {
  starrySky();
  AOS.refreshHard();
});

let resizeTimer;

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    starrySky();
  }, 300);
});

document.addEventListener('DOMContentLoaded', starrySky);

function isMobile() {
  return window.innerWidth < BREAKPOINT_LG;
}

function initAOS() {
  AOS.init({
    once: true,
    duration: 1000,
    offset: window.innerHeight * AOS_OFFSET_RATIO,
  });

  syncDescriptionWithHeader();
}

function initImageAOSRefresh() {
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('load', () => {
      AOS.refresh();
    });
  });
}

function getOffset(target) {
  if (SPECIAL_SCROLL_TARGETS.includes(target)) {
    return isMobile() ? 280 : 400;
  }

  return isMobile() ? 100 : 150;
}

function smoothScrollTo(target, callback) {
  const $el = $(target);

  if (!$el.length) return;

  $('html, body').animate(
    {
      scrollTop: $el.offset().top - getOffset(target),
    },
    600,
    () => {
      if (typeof callback === 'function') callback();
    }
  );
}

function onClickAutoScroll() {
  $('a[href^="#"]').on('click', function (e) {
    const hash = $(this).attr('href');

    if (!hash || hash === '#') return;

    e.preventDefault();

    history.pushState(null, null, `${window.location.pathname}${hash}`);
    smoothScrollTo(hash);
  });
}

function setPeriod() {
  const reservePeriod = document.getElementById("reservePeriod");

  // Singapore Time (SGT) = UTC+8
  const now = new Date();

  // 14 June 2026 23:59:59 SGT
  const deadlineSGT = new Date("2026-06-14T23:59:59+08:00");

  if (now > deadlineSGT) {
    reservePeriod.textContent =
      "Reserve from 26 MAY 26 - 14 JUNE 26";
  }
}

function onLinkHash() {
  if (!window.location.hash) return;

  setTimeout(() => {
    smoothScrollTo(window.location.hash);
  }, 200);
}

function setLineupNav() {
  const lineupNavs = [
    ['hard-case-film', 'DN-CASE09-6S.webp', 'HARD CASE', 'STAR WARS COLLECTION'],
    ['cleaning-cloth-film', 'DN-CLOTH07-6S.webp', 'CLEANING CLOTH', 'STAR WARS COLLECTION'],
    ['double-case', 'DN-CASE10-6S.webp', 'DOUBLE CASE', 'STAR WARS COLLECTION'],
    ['cylinder-case', 'DN-CASE11-6S_C1.webp', 'CYLINDER CASE', 'STAR WARS COLLECTION'],
    ['hard-case-character', 'DN-CASE14-6S_C1.webp', 'HARD CASE', 'STAR WARS COLLECTION'],
    ['soft-case', 'DN-CASE16-6S_C1.webp', 'SOFT CASE', 'STAR WARS COLLECTION'],
    ['zipper-case', 'DN-CASE18-6S_C1.webp', 'ZIPPER CASE', 'STAR WARS COLLECTION'],
    ['cleaning-cloth-character', 'DN-CLOTH08-6S_C1.webp', 'CLEANING CLOTH', 'STAR WARS COLLECTION'],
    ['hard-case-grogu', 'DN-CASE20-6S.webp', 'HARD CASE', 'GROGU COLLECTION'],
    ['cleaning-cloth-grogu', 'DN-CLOTH06-6S.webp', 'CLEANING CLOTH', 'GROGU COLLECTION'],
  ];

  document.querySelectorAll('.lineup__navs').forEach((list) => {
    const repeat = Number(list.dataset.repeat || 1);
    const basePath = 'https://storage.owndays.com/news/starwars/products/';

    list.innerHTML = Array.from({ length: repeat }, (_, repeatIndex) =>
      lineupNavs.map(([id, image, name, collection]) => `
        <li${repeatIndex > 1 ? ' aria-hidden="true"' : ''}>
          <a href="#${id}">
            <div>
              <div class="lineup__navs__box">
                <img src="${basePath}${image}" alt="${name} ${collection}">
              </div>
              <p class="lineup__navs__title">${name} <br>${collection}</p>
            </div>
          </a>
        </li>
      `).join('')
    ).join('');
  });
}

function splitLinesAll() {
  document.querySelectorAll('.js-split-lines').forEach(splitLines);
}

function splitLines(el) {
  const text = el.querySelector('span');

  if (!text || text.classList.contains('is-splitted')) return;

  text.classList.add('is-splitted');

  const lines = text.innerHTML.split(/<br\s*\/?>/i);

  text.innerHTML = lines
    .map((line, index) => {
      return `
        <span class="line">
          <span
            class="line-inner"
            style="animation-delay:${index * 0.18}s"
          >
            ${line}
          </span>
        </span>
      `;
    })
    .join('');
}

function initLineupMarquee(selector = '.lineup__navs', speed = 0.8) {
  const el = document.querySelector(selector);
  if (!el) return;

  let x = 0;
  let rafId = null;
  let setWidth = 0;
  let isDragging = false;
  let startX = 0;
  let startTranslate = 0;

  const originalItems = Array.from(el.children);

  originalItems.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    el.appendChild(clone);
  });

  function measure() {
    const gap = parseFloat(getComputedStyle(el).gap || 0);

    setWidth = originalItems.reduce((total, item, index) => {
      return total + item.getBoundingClientRect().width + (index < originalItems.length - 1 ? gap : 0);
    }, 0);
  }

  function normalize() {
    if (x <= -setWidth) x += setWidth;
    if (x > 0) x -= setWidth;
  }

  function render() {
    normalize();
    el.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  function loop() {
    if (!isDragging) {
      x -= speed;
      render();
    }

    rafId = requestAnimationFrame(loop);
  }

  function getPointX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function onDragStart(e) {
    isDragging = true;
    startX = getPointX(e);
    startTranslate = x;
    el.classList.add('is-dragging');
  }

  function onDragMove(e) {
    if (!isDragging) return;
    x = startTranslate + (getPointX(e) - startX);
    render();
  }

  function onDragEnd() {
    isDragging = false;
    el.classList.remove('is-dragging');
  }

  function start() {
    cancelAnimationFrame(rafId);
    measure();
    render();
    rafId = requestAnimationFrame(loop);
  }

  el.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);

  el.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('touchmove', onDragMove, { passive: true });
  window.addEventListener('touchend', onDragEnd);

  window.addEventListener('load', start);
  window.addEventListener('resize', start);

  start();
}

function updateProductButton($data, optionIndex) {
  const $options = $data.find('.product__options');
  const $button = $data.find('.js-product-link');

  if (!$options.length || !$button.length) return;

  const $realOptions = getRealOptionSlides($options);
  const $target = $realOptions.eq(optionIndex);

  const productNumber = getOptionData($target, 'product-number');

  const url = getProductUrl(productNumber);

  $button.attr('data-base-url', url);

  $button.each(function () {
    this.href = url;
  });

  updateProductMeta($data, $target, productNumber);
}

function updateProductButtonText() {
  const buttons = document.querySelectorAll(".js-product-link");

  // Singapore Time (UTC+8)
  const now = new Date();

  const preorderEnd = new Date("2026-06-14T23:59:59+08:00");
  const availableEnd = new Date("2026-07-31T23:59:59+08:00");

  let text = "";
  let isAvailableState = false;

  if (now <= preorderEnd) {
    text = "PRE-ORDER NOW";
  } else if (now <= availableEnd) {
    text = "AVAILABLE FROM 1 AUG 26";
    isAvailableState = true;
  } else {
    text = "ONLINE STORE";
  }

  buttons.forEach(button => {
    const span = button.querySelector("span");

    if (span) {
      span.textContent = text;
    } else {
      button.textContent = text;
    }

    if (isAvailableState) {
      button.style.backgroundColor = "#999999";
      button.style.color = "#000000";
      button.style.cursor = "not-allowed";
      button.style.pointerEvents = "none";

      if (span) {
        span.style.color = "#000000";
      }

      // accessibility
      button.setAttribute("aria-disabled", "true");
      button.setAttribute("tabindex", "-1");
    }
  });
}

function getRealOptionSlides($options) {
  return $options.hasClass('slick-initialized')
    ? $options.find('.slick-slide:not(.slick-cloned)')
    : $options.find('li');
}

function getOptionData($target, key) {
  return $target.find('li').data(key) || $target.data(key);
}

function updateProductLink($button, sku, productNumber) {
  if (!sku || !productNumber) return;

  const baseUrl = $button.data('base-url');

  if (!baseUrl) return;

  const updatedUrl = baseUrl.replace(
    /\/products\/[^/?]+/,
    `/products/${productNumber}`
  );

  $button.attr('href', `${updatedUrl}?sku=${sku}`);
}

function updateProductMeta($data, $target, productNumber) {
  if (!productNumber) return;

  const productId = $data.data('id');

  $(`.product__header__number[data-id="${productId}"]`).html(productNumber);

  const caption =
    $target.find('[data-caption]').data('caption') ??
    $target.data('caption') ??
    '';

  $(`.product__caption[data-id="${productId}"]`)
    .text(caption)
    .toggle(!!caption);
}

function setProductSlider() {
  const syncing = {};

  $('.product__data').each(function (index) {
    initProductSlider($(this), index, syncing);
  });
}

function initProductSlider($data, index, syncing) {
  const productId = $data.data('id');
  const $image = $data.find('.product__image__slider');
  const $options = $data.find('.product__options');

  if (!$image.length) return;

  $image.data('all-slides', $image.children().clone());

  $image.addClass(`product-image-slider-${index}`);

  if ($options.length) {
    $options.addClass(`product-options-slider-${index}`);
  }

  bindImageSliderEvents($data, $image, $options, productId, syncing);
  initImageSlider($image);
  initOptionSlider($data, $image, $options);
  showOptionImages($image, 0);
  updateActiveOption($options, 0);
  refreshSlickOnImageLoad($image);
}

function showOptionImages($image, optionIndex) {
  const $allSlides = $image.data('all-slides');

  const $selectedSlides = $allSlides.filter(function () {
    return Number($(this).data('option-index')) === optionIndex;
  }).clone();

  if ($image.hasClass('slick-initialized')) {
    $image.slick('unslick');
  }

  $image.empty().append($selectedSlides);

  initImageSlider($image);
}

function bindImageSliderEvents($data, $image, $options, productId, syncing) {
  $image.on('init afterChange', function (event, slick, currentSlide) {
    if (event.type !== 'afterChange') return;
    if (syncing[productId]) return;

    syncing[productId] = true;
    syncSameProductSliders($data, productId, currentSlide || 0);
    syncing[productId] = false;
  });
}

function getImagesPerOption(slick, $options) {
  if (!$options.length) return 1;

  const totalImages = slick.slideCount;
  const totalOptions = getRealOptionSlides($options).length;

  if (!totalOptions || totalImages === totalOptions) return 1;

  return totalImages / totalOptions;
}

function updateActiveOption($options, optionIndex) {
  if (!$options.length) return;

  const $realOptions = getRealOptionSlides($options);

  $realOptions.removeClass('is-active');
  $realOptions.eq(optionIndex).addClass('is-active');
}

function syncSameProductSliders($currentData, productId, targetIndex) {
  $('.product__data').each(function () {
    const $sameData = $(this);

    if ($sameData.data('id') !== productId) return;
    if ($sameData.is($currentData)) return;

    const $sameImage = $sameData.find('.product__image__slider');

    if ($sameImage.hasClass('slick-initialized')) {
      $sameImage.slick('slickGoTo', targetIndex, true);
    }
  });
}

function initImageSlider($image) {
  const totalSlides = $image.find('> *').length;

  $image.slick({
    dots: totalSlides > 1,
    arrows: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: false,
  });
}

function initOptionSlider($data, $image, $options) {
  if (!$options.length) return;

  $options.slick({
    dots: false,
    arrows: false,
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    focusOnSelect: false,
    responsive: [
      {
        breakpoint: 99999,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1316,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
    ],
  });

  $options
    .off('click.productOption')
    .on('click.productOption', '.slick-slide:not(.slick-cloned)', function (e) {
      e.preventDefault();

      let optionIndex = Number($(this).attr('data-slick-index'));

      if (Number.isNaN(optionIndex) || optionIndex < 0) {
        optionIndex = 0;
      }

      showOptionImages($image, optionIndex);
      updateActiveOption($options, optionIndex);
      updateProductButton($data, optionIndex);
    });
}

function refreshSlickOnImageLoad($image) {
  $image.find('img').on('load', function () {
    if ($image.hasClass('slick-initialized')) {
      $image.slick('setPosition');
    }
  });
}

function starrySky() {
  const sky = document.getElementById('starry_sky');
  if (!sky) return;

  const oldBg = sky.querySelector('.starry_sky__fixed');
  if (oldBg) oldBg.remove();

  const totalStars = isMobile() ? 250 : 1000;
  const starBg = document.createElement('div');

  starBg.classList.add('starry_sky__fixed');
  sky.prepend(starBg);

  for (let i = 0; i < totalStars; i++) {
    starBg.appendChild(createStar());
  }
}

function createStar() {
  const star = document.createElement('div');

  const size = isMobile()
    ? Math.random() * 2 + 1
    : Math.random() * 4;

  star.classList.add('star');

  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  star.style.top = `${Math.random() * 100}%`;
  star.style.left = `${Math.random() * 100}%`;
  star.style.opacity = Math.random() > 0.5 ? 0.25 : 0.4;
  star.style.animationDuration = `${Math.random() * 2 + 1.5}s`;

  return star;
}

function setInspiredName() {
  document.querySelectorAll('.js-stroke-split').forEach((el) => {
    if (el.classList.contains('is-splitted')) return;

    el.classList.add('is-splitted');

    const text = el.textContent.trim();

    el.setAttribute('aria-label', text);
    el.innerHTML = '';

    const chars = [...text];
    const visibleChars = chars
      .map((char, index) => ({ char, index }))
      .filter((item) => item.char !== ' ');

    const centerIndex = Math.floor((visibleChars.length - 1) / 2);

    const ordered = [];

    ordered.push(visibleChars[centerIndex]);

    for (let i = 1; i <= centerIndex + 1; i++) {
      if (visibleChars[centerIndex - i]) {
        ordered.push(visibleChars[centerIndex - i]);
      }

      if (visibleChars[centerIndex + i]) {
        ordered.push(visibleChars[centerIndex + i]);
      }
    }

    const delayMap = new Map();

    ordered.forEach((item, orderIndex) => {
      const group = orderIndex % 3;

      let delay = 0;

      if (group === 1) delay = 300;
      if (group === 2) delay = 600;

      delayMap.set(item.index, delay + Math.floor(orderIndex / 3) * 180);
    });

    chars.forEach((char, index) => {
      el.appendChild(createInspiredChar(char, delayMap.get(index) || 0));
    });
  });
}

function createInspiredChar(char, delay) {
  if (char === ' ') {
    const space = document.createElement('span');
    space.className = 'inspired-name__space';
    return space;
  }

  const wrapper = document.createElement('span');

  wrapper.className = 'inspired-name__char';
  wrapper.dataset.txt = char;
  wrapper.style.setProperty('--animation-delay', `${delay}ms`);

  wrapper.innerHTML = `<span>${char}</span>`;

  return wrapper;
}

function setProductHeader() {
  document.querySelectorAll('.js-random-split-group').forEach((group) => {
    group.querySelectorAll(PRODUCT_HEADER_SELECTOR).forEach(splitElementText);
  });

  requestAnimationFrame(() => {
    AOS.refreshHard();
  });
}

function splitElementText(el) {
  if (el.classList.contains('is-splitted')) return;

  el.classList.add('is-splitted');

  const temp = document.createElement('div');
  temp.innerHTML = el.innerHTML.trim();

  el.innerHTML = '';

  [...temp.childNodes].forEach((node) => {
    splitNode(node, el);
  });
}

function splitNode(node, parent) {
  if (node.nodeType === Node.TEXT_NODE) {
    splitTextNode(node, parent);
    return;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    splitElementNode(node, parent);
  }
}

function splitTextNode(node, parent) {
  const text = node.textContent.replace(/\s+/g, ' ');

  if (!text.trim()) return;

  [...text].forEach((char) => {
    parent.appendChild(createRandomSplitChar(char));
  });
}

function splitElementNode(node, parent) {
  if (node.tagName === 'BR') {
    parent.appendChild(document.createElement('br'));
    return;
  }

  const cloned = node.cloneNode(false);

  [...node.childNodes].forEach((child) => {
    splitNode(child, cloned);
  });

  parent.appendChild(cloned);
}

function createRandomSplitChar(char) {
  const span = document.createElement('span');

  span.className = 'js-random-split__char';
  span.style.animationDelay = `${getRandomDelay()}s`;
  span.textContent = char;

  return span;
}

function getRandomDelay() {
  return RANDOM_DELAY_LIST[
    Math.floor(Math.random() * RANDOM_DELAY_LIST.length)
  ];
}

function syncDescriptionWithHeader() {
  if (window.innerWidth < 1024) return;

  const observer = new MutationObserver(() => {
    document
      .querySelectorAll(
        '.js-random-split-group[data-aos="product-header-text"].aos-animate'
      )
      .forEach((header) => {
        const productData = header.closest('.product__data');

        if (!productData) return;

        const description = productData.querySelector(
          '.product__description'
        );

        if (!description) return;

        if (!description.classList.contains('aos-animate')) {
          description.classList.add('aos-animate');
        }
      });
  });

  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
}

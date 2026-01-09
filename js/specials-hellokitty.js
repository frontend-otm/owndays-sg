$(function () {
  AOS.init({
    once: true,
    duration: 600,
  });

  document.querySelectorAll('img').forEach((img) =>
    img.addEventListener('load', () =>
      AOS.refresh()
    )
  );

  onClickAutoScroll();
  onLinkHash();
  setCaseCarousel();

  setLineupProducts();
  setAccessoriesProducts();
  setLimitedProducts();
  setPreOrderLimitedModal();

  const target = document.querySelector('.concept__apples-icon');

  const observer = new IntersectionObserver((entries, observer) => {
    if (entries[0].isIntersecting) {
      applesIconAnimation();
      observer.unobserve(target);
    }
  }, { threshold: 0.3 });

  observer.observe(target);
});

function getOffset(target) {
  const isMobile = window.innerWidth < 1024;

  const sectionOffset = isMobile ? 56 : 124;
  const baseOffset = isMobile ? 100 : 200;

  const sections = [
    '#limited',
    '#novelty',
    '#ribbon-mini',
    '#relax-mini',
    '#accessories'
  ];

  return sections.includes(target) ? sectionOffset : baseOffset;
}

function smoothScrollTo(target) {
  const $el = $(target);
  if (!$el.length) return;

  const offset = getOffset(target);

  $('html, body').animate(
    {
      scrollTop: $el.offset().top - offset
    },
    600,
    () => {
      if (typeof callback === 'function') callback();
    }
  );
}

function onClickAutoScroll() {
  $('a[href^="#"]').on('click', function (e) {
    e.preventDefault();
    
    const hash = $(this).attr('href');
    const url = window.location.pathname + hash;
    history.pushState(null, null, url);

    smoothScrollTo(hash);
  });
}

function onLinkHash() {
  if (window.location.hash) {
    setTimeout(() => {
      smoothScrollTo(window.location.hash);
    }, 200);
  }
}

function setCaseCarousel() {
  $('.case__carousel').slick({
    arrows: false,
    dots: true,
    slidesToShow: 1,
    slidesToScroll: 1,
  });
}

function applesIconAnimation() {
  const options = document.querySelectorAll('.concept__apples-icon__option');
  options.forEach((el, i) => {
    setTimeout(() => el.classList.add('gudetama-dance'), i * 500);
  });

  setTimeout(() => {
    options.forEach(el => {
      el.classList.remove('gudetama-dance');
      el.classList.add('shake');
    });
  }, 3000);

  setTimeout(() => {
    options.forEach(el => el.classList.remove('shake'));
  }, 3600);
}


function setSlider(selector) {
  $(selector).slick({
    arrows: true,
    dots: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    variableWidth: true,
    responsive: [
      {
        breakpoint: 1023,
        settings: {
          arrows: false,
        },
      },
    ],
  });
}

function onSelectColor(colorBtnList, productImages, productSku) {
  colorBtnList.forEach((li) => {
    li.addEventListener('click', () => {
      colorBtnList.forEach((item) => item.classList.remove('selected'));
      li.classList.add('selected');

      const colorName = li.dataset.name;
      const newSku = li.dataset.sku;

      productImages.forEach((img) => {
        let src = img.src;
        let alt = img.alt;

        src = src.replace(/_C\d+_/i, `_${colorName}_`);
        alt = alt.replace(/C\d+/i, colorName);

        img.src = src;
        img.alt = alt;
      });

      productSku.href = productSku.href.replace(
        /-c\d+-/i,
        `-${colorName.toLowerCase()}-`
      );
    });
  });
}

function setLineupProducts() {
  setSlider('.lineup__products__preview__normal__list');
  setSlider('.lineup__products__preview__store-only__list');

  const colorSections = [
    'ribbon-main-normal',
    'ribbon-sub-normal',
    'going-out-main-normal',
    'relax-main-normal',
    'relax-sub-normal',
    'face-main-normal',
    'y2k-main-normal',
    'neo-main-normal'
  ];
  
  colorSections.forEach(prefix => {
    onSelectColor(
      document.querySelectorAll(`.${prefix}-color-btn-list li`),
      document.querySelectorAll(`.${prefix}-list li img`),
      document.querySelector(`.${prefix}-btn a`)
    );
  });
}

function setAccessoriesProducts() {
  $('.accessories__products__item__list').each(function() {
    const $slider = $(this);
    const $wrapper = $slider.closest('.accessories__products__item__slider-wrapper');
    const $prevBtn = $wrapper.find('.accessories__products__item__nav-btn--prev');
    const $nextBtn = $wrapper.find('.accessories__products__item__nav-btn--next');

    $slider.slick({
      arrows: false,
      dots: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      centerMode: true,
      variableWidth: true,
    });

    $prevBtn.on('click', function() {
      $slider.slick('slickPrev');
    });

    $nextBtn.on('click', function() {
      $slider.slick('slickNext');
    });
  });
}

function setLimitedProducts() {
  $('.limited__modal__content__list').slick({
    arrows: true,
    dots: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    variableWidth: true,
  });

  const limitedModals = [
    '#limited-ribbon',
    '#limited-ribbon-mini',
    '#limited-relax',
    '#limited-relax-mini',
    '#limited-neo',
    '#limited-y2k',
    '#limited-face',
    '#limited-going-out'
  ];

  limitedModals.forEach(modalId => {
    $(modalId).on('shown.bs.modal', function () {
      const $slider = $('.limited__modal__content__list');
      $slider.slick('slickGoTo', 0, true);
      $slider.slick('setPosition');
    });
  });

}


function setPreOrderLimitedModal() {
  // JST (UTC+9)
  const preOrderStart = window.APP_ENV !== 'testing' ? new Date('2025-11-27T10:00:00+09:00') : new Date();
  const preOrderEnd   = new Date('2025-12-04T09:59:00+09:00');

  const now = new Date();
  const modalKey = 'preOrderLimitedHelloKittyModalShown';

  if (now >= preOrderStart && now <= preOrderEnd) {
    if (!localStorage.getItem(modalKey)) {
      $('#pre-order-limited-modal').modal('show');
      localStorage.setItem(modalKey, 'true');
    }
  }

  $('.pre-order-limited__modal__close-btn').on('click', function () {
    $('#pre-order-limited-modal').modal('hide');
  });

  
  $('.pre-order-limited__btn-scroll').on('click', function () {

    $('#pre-order-limited-modal').modal('hide');

    setTimeout(function () {
      $('html, body').animate({
        scrollTop: $('#limited').offset().top
      }, 600);
    }, 300);
  });
}

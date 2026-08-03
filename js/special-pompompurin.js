$(function () {
  AOS.init({
    once: true,
    duration: 1000,
  });

  document.querySelectorAll('img').forEach((img) =>
    img.addEventListener('load', () =>
      AOS.refresh()
    )
  );

  onClickAutoScroll();
  onLinkHash();
  onScrollMain();
  onScrollLineupNavs();
  setAccessoriesCase();
  setAccessoriesCaseNavs();
  setLineupProducts();

  $(window).on('resize', () => {
    onScrollLineupNavs();
    setAccessoriesCase();
  });
});

function getOffset(target) {
  // nav ถูกลบออก → ไม่ต้องเผื่อความสูง nav อีก, scroll ให้ตรงหัว section พอดี
  // (เดิม isMobile ? 70 : 75 = ความสูง nav เก่า)
  return 0;
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

function onScrollMain() {
  const main = document.querySelector('.main');
  if (!main) return;

  const handleScroll = () => {
    if (window.scrollY >= main.offsetHeight) {
      main.classList.add('is-scrolled');
    } else {
      main.classList.remove('is-scrolled');
    }
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll);
}

function onScrollLineupNavs() {
  const $slider = $('.lineup-navs__list');

  if (window.matchMedia('(min-width: 768px)').matches) {
    if (!$slider.hasClass('slick-initialized')) {
      $slider.slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 0,
        speed: 8000,
        cssEase: 'linear',
        arrows: false,
        dots: false,
        pauseOnHover: false,
        pauseOnFocus: false,
        variableWidth: true,
      });
    }
  } else {
    if ($slider.hasClass('slick-initialized')) {
      $slider.slick('unslick');
    }
  }
}

function setAccessoriesCase() {
  const $caseList = $('.accessories__case-list');

  if (window.matchMedia('(min-width: 1024px)').matches) {
    if ($caseList.hasClass('slick-initialized')) {
      $caseList.slick('unslick');
    }
  } else {
    if (!$caseList.hasClass('slick-initialized')) {
      $caseList.slick({
        arrows: false,
        dots: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        variableWidth: true,
      });
    }
  }
}

function setAccessoriesCaseNavs() {
  const caseList = document.querySelector('.accessories__case-list');
  const navs = document.querySelector('.accessories__case-navs');

  if (!caseList || !navs) return;

  const prevBtn = navs.querySelector('.btn-accessories-nav[data-key="prev"]');
  const nextBtn = navs.querySelector('.btn-accessories-nav[data-key="next"]');

  if (!prevBtn || !nextBtn) return;

  const getScrollAmount = () => {
    const item = caseList.querySelector('li');
    if (!item) return 0;

    const gap = parseFloat(getComputedStyle(caseList).gap) || 0;
    return item.offsetWidth + gap;
  };

  prevBtn.addEventListener('click', () => {
    caseList.scrollBy({
      left: -getScrollAmount(),
      behavior: 'smooth',
    });
  });

  nextBtn.addEventListener('click', () => {
    caseList.scrollBy({
      left: getScrollAmount(),
      behavior: 'smooth',
    });
  });
}

function setLineupProducts() {
  const $points = $('.lineup-products__primary__points');
  const $secondary = $('.lineup-products__secondary__list');

  $points.slick({
    arrows: true,
    dots: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    variableWidth: true,
  });

  $secondary.slick({
    arrows: true,
    dots: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    variableWidth: true,
  });

  $('.lineup-products__secondary__item__colors > span').on('click', function () {
    const $this = $(this);
  
    const urlKey = $this.data('url-key');
    const productNumber = $this.data('product-number');
    const index = $this.data('index');
  
    const $container = $this.closest('.lineup-products__secondary__container');
    const $colors = $this.closest('.lineup-products__secondary__item__colors');
    const $list = $container.find('.lineup-products__secondary__list');
    const $btn = $container.find('.btn');
  
    $colors.find('span').removeClass('active');
    $this.addClass('active');
  

    $list.find('.lineup-products__secondary__item__img img').each(function () {
      const $img = $(this);
  
      const newSrc = $img
        .attr('src')
        .replace(/\/[^/]+_C\d+\//, `/${productNumber}_C${index}/`);
  
      $img.attr({
        src: newSrc,
        alt: `${productNumber} C${index}`,
      });
    });
  
    // update href
    if (urlKey) {
      $btn.attr('href', `/sg/en/${urlKey}.html`);
    }
  });

  const sections = document.querySelectorAll('.lineup-products__section__container');
  const topOffset = 0; /* nav ถูกตัดออก → sticky ติด top:0 (เดิม 75 = ความสูง nav) */

  function reset(el) {
    el.style.position = '';
    el.style.top = '';
    el.style.left = '';
    el.style.bottom = '';
    el.style.width = '';
  }

  function updatePomSticky() {
    sections.forEach((section) => {
      const stickyEl = section.querySelector('.lineup-products__pom__container');
      if (!stickyEl) return;

      if (window.innerWidth < 1024) {
        reset(stickyEl);
        return;
      }

      const sectionRect = section.getBoundingClientRect();
      const colRect = stickyEl.parentElement.getBoundingClientRect();
      const stickyHeight = stickyEl.offsetHeight;

      if (sectionRect.top <= topOffset && sectionRect.bottom > stickyHeight + topOffset) {
        stickyEl.style.position = 'fixed';
        stickyEl.style.top = `${topOffset}px`;
        stickyEl.style.left = `${sectionRect.left}px`;
        stickyEl.style.width = `${colRect.width * 0.4639}px`;
        stickyEl.style.bottom = '';
      } else if (sectionRect.bottom <= stickyHeight + topOffset) {
        stickyEl.style.position = 'absolute';
        stickyEl.style.top = 'auto';
        stickyEl.style.left = '0';
        stickyEl.style.bottom = '0';
        stickyEl.style.width = '46.39%';
      } else {
        reset(stickyEl);
      }
    });
  }

  window.addEventListener('scroll', updatePomSticky);
  window.addEventListener('resize', updatePomSticky);
  updatePomSticky();
}

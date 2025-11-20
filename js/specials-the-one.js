$(function () {
  let $modalProductImgW = 0;
  let $modalProductImgH = 0;

  /* SET BODY WIDTH CUSTOM PROPERTY */
  function getBodyWidth() {
    document.documentElement.style.setProperty('--body-w', document.body.clientWidth + 'px');
  }
  getBodyWidth();
  window.addEventListener('resize', getBodyWidth);

  /* AOS */
  AOS.init({
    once: true,
    duration: 1200,
  });
  document.querySelectorAll('img').forEach((img) => img.addEventListener('load', () => AOS.refresh()));

  /* SET LINEUP GROUP TITLE HEIGHT */
  function setLineupGroupTitleHeight() {
    $('.lineup__group').each(function () {
      const $this = $(this);
      const $titleGroup = $this.find('.lineup__group-title');
      const $titleGroupH = $titleGroup.outerHeight();

      $this.css('--title-h', $titleGroupH + 'px');
    });
  }
  setLineupGroupTitleHeight();

  Fancybox.bind("[data-fancybox]", {
    keyboard: {
      Escape: false,
    }
  });

  $('#modal_product').modal({
    backdrop: 'static',
    keyboard: false,
    show: false,
  });

  function getProductImgSize() {
    $modalProductImgW = $('.product-fancybox .f-panzoom__viewport img').outerWidth();
    $modalProductImgH = $('.product-fancybox .f-panzoom__viewport img').outerHeight();
    if ($modalProductImgW > 0 && $modalProductImgH > 0) {
      $('html').css({
        '--modal-product-img-w': $modalProductImgW + 'px',
        '--modal-product-img-h': $modalProductImgH + 'px'
      });

      if (!$('#modal_product').hasClass('show')) {
        $('#modal_product').modal('show');
      }
    } else {
      setTimeout(() => {
        getProductImgSize();
      }, 100);
    }
  }

  $('.open-modal-product').on('click', function () {
    const $this = $(this);
    const $group = $this.closest('.group');
    const $productName = $this.data('product-name');
    const $checkbox = $('#checkbox_' + $productName);

    $('.item-selected').removeClass('item-selected');
    $group.addClass('item-selected');
    $this.addClass('opacity-0').closest('.group').addClass('pointer-events-none');
    $checkbox.prop('checked', true);

    setTimeout(() => {
      $('.fancybox__dialog').addClass('product-fancybox');
      /*  $('input[name="modal-product"]:checked').closest('.product-slider__group').find('img.lazyload').each(function () {
         lazySizes.loader.unveil($(this)[0])
       }); */
    }, 0);

    setTimeout(() => {
      $('.product-fancybox').appendTo('.l-the-one');
    }, 100);

    setTimeout(() => {
      getProductImgSize();
    }, 600);
  });

  $('#modal_product').on('show.bs.modal', function () {
    $('input[name="modal-product"]:checked').closest('.product-slider__group').find('[data-aos]').removeClass('aos-animate');
  });

  $('#modal_product').on('shown.bs.modal', function () {
    const $this = $(this);
    $('.modal-backdrop.show').remove();
    $('input[name="modal-product"]:checked').closest('.product-slider__group').find('[data-aos]').addClass('aos-animate');
    $('[data-close="modal"]').addClass('aos-animate');
    setTimeout(() => {
      $this.find('.modal-content').removeClass('opacity-0 pointer-events-none');
    }, 100);
  });

  $('[data-close="modal"]').on('click', function () {
    $('#modal_product .aos-animate').removeClass('aos-animate');

    setTimeout(function () {
      $('#modal_product').modal('hide');
    }, 350);
  });

  $('#modal_product').on('hidden.bs.modal', function () {
    setTimeout(() => {
      Fancybox.close();
      $('.item-selected').removeClass('item-selected');
    }, 150);

    setTimeout(() => {
      $('.open-modal-product').removeClass('opacity-0').closest('.group').removeClass('pointer-events-none');
      $fancyboxOffset = 0;
    }, 500);
  });
  /* END MODAL PRODUCT */

  /* ACCORDION */
  const $accordionTitles = $(".c-accordion__title");
  $('.c-accordion-open .c-accordion__content').show();

  $accordionTitles.on("click", function () {
    const $this = $(this);
    const $parent = $this.closest(".c-accordion-container");
    const $li = $this.closest("li");
    const $content = $this.next(".c-accordion__content");

    $li.toggleClass("c-accordion-open");

    if ($parent.data("acc-toggle")) {
      $parent.find(".c-accordion__content").not($content).stop(true, false).slideUp();
      $parent.find(".c-accordion-open").not($li).removeClass("c-accordion-open");
      $content.stop(true, false).slideToggle();
    } else {
      $content.stop(true, false).slideToggle();
    }
  });

  $accordionTitles.on("mousedown", function (e) {
    e.preventDefault();
  });
  /* END ACCORDION */

  /* FADE OUT LINEUP ITEMS */
  function checkElementSnapTop() {
    const windowTop = $(window).scrollTop();
    const className = 'opacity-0 pointer-events-none';

    $('.lineup__item').each(function () {
      const $item = $(this);
      const itemTop = $item.offset().top;
      let offsetPercent = 0;

      if (screen.width >= 768) {
        offsetPercent = $item.data('offset-percent-pc') || 0;
      } else {
        offsetPercent = $item.data('offset-percent-sp') || 0;
      }

      const itemHeight = $item.outerHeight();
      const offset = (offsetPercent / 100) * itemHeight;

      const snapPoint = itemTop - offset - $('.l-header').outerHeight();

      if (windowTop >= snapPoint) {
        $item.addClass(className);
      } else {
        $item.removeClass(className);
      }
    });
  }

  checkElementSnapTop();
  /* END FADE OUT LINEUP ITEMS */

  /* SCROLL BAR */
  function updateScrollBar() {
    var $scrollBarTrack = $('.scroll-bar-track');
    var $scrollBarContainer = $('.scroll-bar');
    var $scrollBarLine = $('.scroll-bar-line');
    var $sectionShareH = $('.share').outerHeight();
    var $sectionFooterH = $('.l-footer').outerHeight() || 167;
    var $scrollBarTrackCloneTop = $('.scroll-bar-track-clone-top');
    var $scrollBarTrackCloneBottom = $('.scroll-bar-track-clone-bottom');

    if ($scrollBarTrack.length && $scrollBarContainer.is(':visible')) {
      var containerHeight = $(window).height();
      var docHeight = $(document).height();
      var scrollTop = $(window).scrollTop();
      var trackHeight = $scrollBarTrack.outerHeight();
      var barLine = $scrollBarLine.height() || 300;
      var maxTrackMove = barLine - trackHeight;
      var maxScroll = docHeight - containerHeight;
      var percent = maxScroll > 0 ? scrollTop / maxScroll : 0;
      percent = Math.max(0, Math.min(1, percent));
      var translateY = percent * maxTrackMove;

      $scrollBarTrack.removeClass('opacity-0');
      $scrollBarTrackCloneTop.addClass('opacity-0');
      $scrollBarTrackCloneBottom.addClass('opacity-0');

      if (scrollTop === 0) {
        $scrollBarTrack.css({ 'transform': 'translateY(0)' }).addClass('opacity-0');
        $scrollBarTrackCloneTop.removeClass('opacity-0');
        return;
      }

      if (scrollTop < (containerHeight)) {
        $scrollBarTrack.addClass('opacity-0');
        $scrollBarTrackCloneTop.removeClass('opacity-0');
        return;
      }

      if (scrollTop >= maxScroll - $sectionShareH - $sectionFooterH) {
        $scrollBarTrack.addClass('opacity-0');
        $scrollBarTrackCloneBottom.removeClass('opacity-0');
        return;
      }

      if (scrollTop > containerHeight && maxScroll > 0) {
        $scrollBarTrack.css({ 'transform': 'translateY(' + (translateY - 30) + 'px)' }).removeClass('opacity-0');
      }
    }
  }

  if (window.innerWidth >= 1024) {
    updateScrollBar();
  }
  /* END SCROLL BAR */

  /* SPLIT TEXT */
  $(".c-text-animate-typing > span").each(function () {
    let contents = $(this).contents();
    let newText = "";

    contents.each(function () {
      if (this.nodeType === 3) {
        let text = $(this).text();
        for (let i = 0; i < text.length; i++) {
          newText += '<span class="text-split">' + text[i] + '</span>';
        }
      } else if (this.nodeType === 1 && this.tagName.toLowerCase() === 'br') {
        newText += '<br>';
      }
    });
    $(this).html(newText);
  });

  $(".text-split").each(function () {
    if ($(this).text().trim() === "") {
      $(this).html("&nbsp;");
    }
  });

  $(".c-text-animate-typing").each(function () {
    let transitionDelay = 0;
    $(this).find(".text-split").each(function () {
      $(this).css("transition-delay", transitionDelay + "s");
      transitionDelay += 0.05;
    });
  });
  /* END SPLIT TEXT */


  /* PRODUCT SLIDER */
  $(".product-slider").each(function (index, element) {
    const productSlider = new Swiper(element, {
      slidesPerView: 1,
      spaceBetween: 15,
      loop: true,
      /* pagination: {
        el: ".product-slider__pagination",
        clickable: true,
      }, */
      navigation: {
        nextEl: ".product-slider__button-next",
        prevEl: ".product-slider__button-prev",
      },
    });

    const $this = $(element);
    const $root = $this.closest('.product-slider__group');
    const $parent = $this.closest('.tab-pane');
    const $btnSlideNext = $parent.find('.btn-slide-next');
    const $btnSlidePrev = $parent.find('.btn-slide-prev');
    const $swiperBtnNext = $parent.find('.product-slider__button-next');
    const $swiperBtnPrev = $parent.find('.product-slider__button-prev');
    const $currentSlide = $parent.find('.current-slide');


    $btnSlideNext.on('click', function () {
      $swiperBtnNext.trigger('click');
    });

    $btnSlidePrev.on('click', function () {
      $swiperBtnPrev.trigger('click');
    });

    function updateProductImages($group) {
      const $currentSelectedTab = $group.find('.tab-pane.active');
      const $currentSelectedNumber = $currentSelectedTab.find('.current-slide').text();
      const $currentSelectedImg = $currentSelectedTab.find('.swiper-slide-active img').attr('src');

      const $itemSelected = $('.item-selected');
      $itemSelected.find('.lineup__image img').attr('src', $currentSelectedImg);
      $itemSelected.find('[data-fancybox]').attr('data-src', $currentSelectedImg);
      $('.product-fancybox .f-panzoom__content').attr('src', $currentSelectedImg);
      $itemSelected.find('.current-slide').text($currentSelectedNumber);
    }

    $('.nav-link').on('click', function () {
      const $parent = $(this).closest('.product-slider__group');
      setTimeout(() => {
        updateProductImages($parent);
      }, 100);
    });

    productSlider.on('slideChange', function () {
      $currentSlide.text(String(productSlider.realIndex + 1));
      setTimeout(() => {
        updateProductImages($root);
      }, 100);
    });
  });

  /* SET DEFAULT URL FOR BUTTON ONLINE STORE */
  $(".button-online-store").each(function () {
    const $this = $(this);
    const $parent = $this.closest('.product-slider__group');
    const $navActiveUrl = $parent.find('.product-slider__color-nav .nav-link.active').data('url');
    $this.attr('href', $navActiveUrl);
  });

  /* UPDATE URL FOR BUTTON ONLINE STORE WHEN CLICK ON COLOR NAV */
  $(".product-slider__color-nav .nav-link").on('click', function () {
    const $this = $(this);
    const $parent = $this.closest('.product-slider__group');
    const $url = $(this).data('url');
    $parent.find(".button-online-store").attr('href', $url);
  });

  if ($('body[data-aos-easing]').length < 1) {
    $('.product-slider__color-nav').removeAttr('data-aos');
  }

  function handleScroll(targetSelector, actionCallback) {
    $(targetSelector).each(function () {
      const $target = $(this);

      if ($target.hasClass('aos-animate') && !$target.hasClass('is-shown')) {
        $target.addClass('is-shown');
        actionCallback($target);
      }
    });
  }

  /* WINDOW SCROLL */
  $(window).on('scroll', function () {
    checkElementSnapTop();
    if (window.innerWidth >= 1296) {
      updateScrollBar();
    }

    handleScroll('.lineup', function () {
      $('#modal_product').find('img.lazyload').each(function () {
        lazySizes.loader.unveil($(this)[0])
      });
    });
  });

  /* WINDOW RESIZE */
  $(window).on('resize', function () {
    setLineupGroupTitleHeight();

    if ($('.product-fancybox').length > 0) {
      getProductImgSize();
    }

    if (window.innerWidth >= 1296) {
      updateScrollBar();
    }
  });
});

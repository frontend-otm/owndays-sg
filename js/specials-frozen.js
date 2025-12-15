$(function () {
  // AOS
  AOS.init({
    once: true,
    duration: 1200,
    offset: 100,
  });
  document.querySelectorAll('img').forEach((img) => img.addEventListener('load', () => AOS.refresh()));

  $(".point-slider").each(function (index, element) {
    const slider = new Swiper(element, {
      slidesPerView: 'auto',
      spaceBetween: 32,
      centeredSlides: true,
      loop: true,
      pagination: {
        el: ".slider-point-pagination",
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 1,
          spaceBetween: 20,
          centeredSlides: false,
        },
      },
    });
  });

  $(".product-slider").each(function (index, element) {
    const $slider = new Swiper(element, {
      slidesPerView: 'auto',
      spaceBetween: 12,
      centeredSlides: true,
      loop: true,
      breakpoints: {
        768: {
          slidesPerView: 1,
          centeredSlides: false,
        },
      },
    });

    const $this = $(this);
    const $parent = $this.closest('.product-slider-wrapper');
    const $btnSlideNext = $parent.find('.btn-next-product-slider');
    const $btnSlidePrev = $parent.find('.btn-prev-product-slider');

    $btnSlideNext.on('click', function () {
      $slider.slideNext();
    });

    $btnSlidePrev.on('click', function () {
      $slider.slidePrev();
    });
  });

  $(".case-slider").each(function (index, element) {
    const slider = new Swiper(element, {
      slidesPerView: 1,
      spaceBetween: 10,
      loop: true,
      pagination: {
        el: ".slider-case-pagination",
        clickable: true,
      },
      autoplay: {
        delay: 3000,
      },
    });
  });

  
  const $lHeader = $(".l-header");
  const $lHeaderHeight = $lHeader.height();

  $.fn.hasAttr = function(name) {
    return this.attr(name) !== undefined;
  };

  $(".l-content a[href^='#']").not('a.nav-link').on("click", function (e) {
    const $this = $(this);
    const $targetId = $this.attr("href");
    const $target = $($targetId);
    const $duration = $this.hasAttr('data-scroll-duration') ? $this.attr("data-scroll-duration") : 1000;
    const $offset = $this.hasAttr('data-scroll-offset') ? $this.attr("data-scroll-offset") : 15;
    const $scrollPosition = $target.offset().top - $lHeaderHeight - $offset;

    if ($target.length === 0) {
      return;
    }

    e.preventDefault();

    $('html, body').animate({
      scrollTop: $scrollPosition
    }, {
      duration: parseInt($duration),
      easing: 'swing',
      step: (now, fx) => {
        const $realPos = $target.offset().top - $lHeaderHeight - $offset;
        if (fx.end !== $realPos) {
          fx.end = $realPos;
        }
      },
    });
  });

  $(".text-animate-typing > span").each(function () {
    const $this = $(this);
    let contents = $this.contents();
    let newText = "";

    contents.each(function() {
      if (this.nodeType === 3) {
        let text = $(this).text();
        for (let i = 0; i < text.length; i++) {
          newText += '<span class="text-split">' + text[i] + '</span>';
        }
      } else if (this.nodeType === 1 && this.tagName.toLowerCase() === 'br') {
        newText += '<br>';
      }
    });
    $this.html(newText);
  });

  /* $(".text-animate-typing .text-split").each(function () {
    const $this = $(this);
    const THcharacters = ["่", "้", "๊", "๋", "็", "์", "ั", "ู", "ุ", "ิ", "ี", "ื", "ึ", "ำ"];
    const KHcharacters = ["ា", "ិ", "ុ", "ី", "ឹ", "ឺ", "ូ", "ួ", "ើ", "ឿ", "ៀ", "េ", "ែ", "ៃ", "ោ", "ៅ", "ំ", "ះ", "ៈ", "៉", "៊", "់", "៌", "៍", "៎", "៏", "័", "៑", "៓", "។", "៕", "៖", "ៗ", "៘", "៙", "៚", "៛", "ៜ", "៝", "៞", "៟", "០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    const KHcharacters2 = ["្"];
    if (THcharacters.includes($(this).text().trim()) || KHcharacters.includes($(this).text().trim())) {
      const $prev = $(this).prev();
      $prev.text($prev.text() + $(this).text());
      $this.remove();
    }
    if (KHcharacters2.includes($this.text().trim())) {
      const $txt = $this.text();
      const $prev = $this.prev();
      const $next = $this.next();

      $prev.append($txt + $next.text());
      $prev.text($prev.text());
      $next.remove();
      $this.remove();
    }
  }); */

  $(".text-animate-typing").each(function () {
    const $this = $(this);
    let transitionDelay = parseFloat($this.attr('data-aos-delay')) ? parseFloat($this.attr('data-aos-delay')) / 1000 : 0;
    $this.find(".text-split").each(function () {
      const $this = $(this);
      $this.css("transition-delay", transitionDelay + "s");
      transitionDelay += 0.09;

      if ($this.text().trim() === "") {
        $this.append("&nbsp;");
      }
    });
  });
  
});

document.addEventListener("mousemove", (event) => {
  createSnowflake(event.clientX, event.clientY);
});

function createSnowflake(x, y) {
  const snowflake = document.createElement("div");
  snowflake.className = "snowflake";
  snowflake.style.left = `${x}px`;
  snowflake.style.top = `${y}px`;

  const size = Math.random() * 8 + 2;
  snowflake.style.width = `${size}px`;
  snowflake.style.height = `${size}px`;
  snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;

  document.body.appendChild(snowflake);
  setTimeout(() => {
    snowflake.remove();
  }, 3000);
}

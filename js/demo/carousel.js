$(function () {
  const cards = document.querySelectorAll(".card");
  const dotsContainer = document.querySelector(".dots");

  let active = 0;

  // 🔥 create dots
  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.classList.add("dot");

    dot.addEventListener("click", () => {
      active = i;
      update();
    });

    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".dot");

  function update() {
    const total = cards.length;

    cards.forEach((card, i) => {
      card.className = "card";

      let offset = i - active;

      // 🔥 loop fix
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      if (offset === 0) card.classList.add("center");
      if (offset === 1) card.classList.add("r1");
      if (offset === 2) card.classList.add("r2");
      if (offset === -1) card.classList.add("l1");
      if (offset === -2) card.classList.add("l2");
    });

    // 🔥 sync dot
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === active);
    });
  }

  update();

  // 🔥 autoplay
  let interval = setInterval(() => {
    active = (active + 1) % cards.length;
    update();
  }, 2500);

  
});



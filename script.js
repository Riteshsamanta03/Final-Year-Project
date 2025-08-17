document.querySelectorAll(".service-card").forEach((card) => {
  card.addEventListener("mouseover", () => {
    card.style.background = "#e0f0ff";
  });
  card.addEventListener("mouseout", () => {
    card.style.background = "#f4f9ff";
  });
});

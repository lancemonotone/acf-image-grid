document.addEventListener("DOMContentLoaded", () => {
  const blocks = document.querySelectorAll(".example-block");
  if (!blocks.length) return;

  blocks.forEach((block) => {
    // Example of adding interaction
    block.addEventListener("click", () => {
      block.classList.toggle("is-active");
    });
  });
});

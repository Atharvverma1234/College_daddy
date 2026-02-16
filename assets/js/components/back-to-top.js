document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.toLowerCase();
  const isHomePage =
    path === "/" ||
    path.endsWith("/index.html") ||
    path.endsWith("/index.htm");

  if (isHomePage) {
    return;
  }

  const existingButton = document.getElementById("scrollToTopBtn");
  if (existingButton) {
    existingButton.remove();
  }

  if (!document.getElementById("backToTopStyles")) {
    const style = document.createElement("style");
    style.id = "backToTopStyles";
    style.textContent = `
      .back-to-top-btn {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        width: 2.75rem;
        height: 2.75rem;
        border: 2px solid var(--primary-color, #009dff);
        border-radius: 999px;
        background: var(--bg-darker, #0a0a0a);
        color: var(--text-light, #ffffff);
        font-size: 1.1rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transform: translateY(8px);
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
        z-index: 1000;
      }

      .back-to-top-btn.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .back-to-top-btn:hover {
        background: var(--card-bg, #181818);
      }

      .back-to-top-btn:focus-visible {
        outline: 2px solid var(--primary-color, #009dff);
        outline-offset: 3px;
      }

      @media (max-width: 768px) {
        .back-to-top-btn {
          right: 0.85rem;
          bottom: 0.85rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top-btn";
  button.setAttribute("aria-label", "Back to top");
  button.setAttribute("title", "Back to top");
  button.innerHTML = '<span aria-hidden="true">\u2191</span>';

  const updateVisibility = () => {
    const shouldShow = window.scrollY > 220;
    button.classList.toggle("visible", shouldShow);
    button.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });

  document.body.appendChild(button);
  window.addEventListener("scroll", updateVisibility, { passive: true });
  updateVisibility();
});

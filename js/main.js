(() => {
  const root = document.documentElement;
  root.classList.remove("no-js", "js-pending");
  root.classList.add("js");

  const THEME_KEY = "eternalRestTheme";
  const THEME_VERSION = 1;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeAuto = document.querySelector("[data-theme-auto]");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const getStoredTheme = () => {
    try {
      const raw = localStorage.getItem(THEME_KEY);
      if (!raw) return { version: THEME_VERSION, mode: "auto" };
      const data = JSON.parse(raw);
      if (data.version !== THEME_VERSION) {
        return { version: THEME_VERSION, mode: "auto" };
      }
      return data;
    } catch (error) {
      return { version: THEME_VERSION, mode: "auto" };
    }
  };

  const storeTheme = (mode) => {
    try {
      localStorage.setItem(
        THEME_KEY,
        JSON.stringify({ version: THEME_VERSION, mode })
      );
    } catch (error) {
      // Keep theme switching available when storage writes fail.
    }
  };

  const applyTheme = (mode) => {
    if (mode === "auto") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", mode);
    }
    if (themeToggle) {
      const isDark = mode === "dark" || (mode === "auto" && mediaQuery.matches);
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Włącz jasny motyw" : "Włącz ciemny motyw"
      );
      themeToggle.dataset.theme = isDark ? "dark" : "light";
    }
    if (themeAuto) {
      themeAuto.setAttribute("aria-pressed", String(mode === "auto"));
    }
  };

  // partials/disclosure-init.html already applied the stored light or dark mode to
  // html[data-theme] before the first paint; this repeats it to set the control state.
  let themeState = getStoredTheme();
  applyTheme(themeState.mode);

  if (themeToggle) {
    // Enable icon transitions only after the initial theme has been painted.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        themeToggle.classList.add("theme-toggle--ready");
      });
    });
    themeToggle.addEventListener("click", () => {
      // Switch from the theme in view, as the label says, also in system mode.
      const nextMode = themeToggle.dataset.theme === "dark" ? "light" : "dark";
      themeState = { version: THEME_VERSION, mode: nextMode };
      storeTheme(nextMode);
      applyTheme(nextMode);
    });
  }

  if (themeAuto) {
    themeAuto.addEventListener("click", () => {
      themeState = { version: THEME_VERSION, mode: "auto" };
      storeTheme("auto");
      applyTheme("auto");
    });
  }

  mediaQuery.addEventListener("change", () => {
    if (themeState.mode === "auto") {
      applyTheme("auto");
    }
  });

  const header = document.querySelector("[data-site-header]");
  let lastScroll = 0;
  let ticking = false;

  const onScroll = () => {
    lastScroll = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (header) {
          header.classList.toggle("site-header--compact", lastScroll > 40);
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  const menuButton = document.querySelector("[data-menu-button]");
  const menuPanel = document.querySelector("[data-menu-panel]");
  let lastFocused = null;
  // Matches the one-row desktop header in css/components.css.
  const desktopQuery = window.matchMedia("(min-width: 1152px)");

  const closeMenu = () => {
    if (!menuPanel || !menuButton) return;
    menuPanel.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-menu-open");
    if (!desktopQuery.matches) {
      menuPanel.setAttribute("aria-hidden", "true");
    }
    if (lastFocused) lastFocused.focus();
  };

  const openMenu = () => {
    if (!menuPanel || !menuButton) return;
    lastFocused = document.activeElement;
    menuPanel.classList.add("is-open");
    menuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-menu-open");
    menuPanel.setAttribute("aria-hidden", "false");
    const focusables = menuPanel.querySelectorAll(
      "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    if (focusables.length) focusables[0].focus();
  };

  if (menuButton && menuPanel) {
    const syncMenuState = () => {
      if (desktopQuery.matches) {
        menuPanel.classList.remove("is-open");
        menuPanel.setAttribute("aria-hidden", "false");
        document.body.classList.remove("is-menu-open");
        menuButton.setAttribute("aria-expanded", "false");
      } else if (!menuPanel.classList.contains("is-open")) {
        menuPanel.setAttribute("aria-hidden", "true");
      }
    };

    syncMenuState();
    desktopQuery.addEventListener("change", syncMenuState);

    menuButton.addEventListener("click", () => {
      if (menuPanel.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuPanel.classList.contains("is-open")) {
        closeMenu();
      }
      if (event.key === "Tab" && menuPanel.classList.contains("is-open")) {
        // The menu button stays in the cycle so the menu can also be closed from it.
        const focusables = [
          menuButton,
          ...menuPanel.querySelectorAll(
            "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
          ),
        ];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    document.addEventListener("click", (event) => {
      if (
        menuPanel.classList.contains("is-open") &&
        !menuPanel.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Hero photographs (about, services, pricing, guide and contact pages): a soft light follows
  // a mouse over each one.
  // The query matches the one that draws the light in css/components.css, so touch input and
  // reduced motion are skipped.
  const spotlights = document.querySelectorAll("[data-spotlight]");
  if (spotlights.length) {
    const spotlightQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );

    const isSpotlightPointer = (event) =>
      event.pointerType === "mouse" && spotlightQuery.matches;

    // Each photograph keeps its own pointer position and pending frame.
    const initSpotlight = (spotlight) => {
      let pointerX = 0;
      let pointerY = 0;
      let spotlightFrame = 0;

      // One measurement and one write per frame, however often the pointer moves.
      const moveSpotlight = () => {
        spotlightFrame = 0;
        const { left, top } = spotlight.getBoundingClientRect();
        spotlight.style.setProperty("--spotlight-x", `${pointerX - left}px`);
        spotlight.style.setProperty("--spotlight-y", `${pointerY - top}px`);
      };

      spotlight.addEventListener("pointerenter", (event) => {
        if (!isSpotlightPointer(event)) return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        // Placed before the fade-in, so the light appears under the pointer.
        moveSpotlight();
        spotlight.classList.add("is-lit");
      });

      spotlight.addEventListener("pointermove", (event) => {
        if (!isSpotlightPointer(event)) return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!spotlightFrame) {
          spotlightFrame = requestAnimationFrame(moveSpotlight);
        }
      });

      // The light fades where it is; a frame still pending would only move it after leaving.
      spotlight.addEventListener("pointerleave", () => {
        cancelAnimationFrame(spotlightFrame);
        spotlightFrame = 0;
        spotlight.classList.remove("is-lit");
      });
    };

    spotlights.forEach(initSpotlight);
  }

  const getDisclosurePanel = (trigger) => {
    const panelId = trigger.getAttribute("aria-controls");
    return panelId ? document.getElementById(panelId) : null;
  };

  const toggleDisclosure = (trigger) => {
    const panel = getDisclosurePanel(trigger);
    if (!panel) return null;
    const isExpanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!isExpanded));
    panel.hidden = isExpanded;
    return !isExpanded;
  };

  // Panels are open in the markup so they stay readable without JavaScript;
  // each one now takes the state declared by its trigger's aria-expanded.
  document
    .querySelectorAll("[data-accordion-trigger], [data-details-toggle]")
    .forEach((trigger) => {
      const panel = getDisclosurePanel(trigger);
      if (panel) {
        panel.hidden = trigger.getAttribute("aria-expanded") !== "true";
      }
    });

  document.querySelectorAll("[data-accordion]").forEach((accordion) => {
    accordion.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-accordion-trigger]");
      if (!trigger) return;
      toggleDisclosure(trigger);
    });
  });

  const pricingFilter = document.querySelector("[data-pricing-filter]");
  const pricingStatus = document.querySelector("[data-pricing-status]");
  if (pricingFilter) {
    pricingFilter.addEventListener("change", (event) => {
      const value = event.target.value;
      const cards = document.querySelectorAll("[data-pricing-card]");
      cards.forEach((card) => {
        const category = card.dataset.category;
        const shouldShow = value === "all" || value === category;
        card.classList.toggle("is-hidden", !shouldShow);
      });
      if (pricingStatus) {
        const visibleCount = Array.from(cards).filter(
          (card) => !card.classList.contains("is-hidden")
        ).length;
        pricingStatus.textContent = `Wyświetlane pakiety: ${visibleCount} z ${cards.length}`;
      }
    });
  }

  document.querySelectorAll("[data-details-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const isExpanded = toggleDisclosure(button);
      if (isExpanded === null) return;
      button.textContent = isExpanded ? "Ukryj szczegóły" : "Pokaż szczegóły";
    });
  });

  const form = document.querySelector("[data-validate-form]");
  if (form) {
    const success = form.querySelector("[data-form-success]");
    const failure = form.querySelector("[data-form-failure]");
    const submitButton = form.querySelector('[type="submit"]');
    const submitLabel = submitButton ? submitButton.textContent : "";
    const SUBMIT_TIMEOUT = 15000;
    let isSubmitting = false;

    const setSubmitting = (state) => {
      isSubmitting = state;
      form.setAttribute("aria-busy", String(state));
      if (submitButton) {
        // aria-disabled keeps the focused button focusable, unlike disabled.
        submitButton.setAttribute("aria-disabled", String(state));
        submitButton.textContent = state ? "Wysyłanie…" : submitLabel;
      }
    };

    const showMessage = (message) => {
      if (!message) return;
      message.hidden = false;
      message.focus();
    };

    const sendForm = async () => {
      setSubmitting(true);
      let isSent = false;
      try {
        // Netlify Forms accepts URL-encoded POSTs that carry the form-name field.
        const response = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(form)).toString(),
          signal:
            typeof AbortSignal.timeout === "function"
              ? AbortSignal.timeout(SUBMIT_TIMEOUT)
              : undefined,
        });
        isSent = response.ok;
      } catch (error) {
        // Network failures and timeouts are reported like HTTP errors below.
      }
      // aria-busy is cleared first so the status or alert is not suppressed.
      setSubmitting(false);
      if (isSent) {
        form.reset();
        showMessage(success);
      } else {
        // Entered values stay in the form so the user can retry.
        showMessage(failure);
      }
    };

    const getFieldError = (field) => {
      if (!field.value.trim()) {
        return "To pole jest wymagane.";
      }
      if (field.type === "email" && field.validity.typeMismatch) {
        return "Podaj poprawny adres e-mail.";
      }
      return "";
    };
    const setFieldError = (field, message) => {
      const errorId = field.getAttribute("aria-describedby");
      const errorEl = errorId ? document.getElementById(errorId) : null;
      if (message) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
      if (errorEl) {
        errorEl.textContent = message;
      }
    };
    form.addEventListener("input", (event) => {
      const field = event.target;
      if (
        field.matches("[data-required]") &&
        field.getAttribute("aria-invalid") === "true"
      ) {
        setFieldError(field, getFieldError(field));
      }
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (isSubmitting) return;
      if (success) {
        success.hidden = true;
      }
      if (failure) {
        failure.hidden = true;
      }
      let firstInvalid = null;
      const fields = form.querySelectorAll("[data-required]");
      fields.forEach((field) => {
        const message = getFieldError(field);
        setFieldError(field, message);
        if (message && !firstInvalid) {
          firstInvalid = field;
        }
      });
      if (firstInvalid) {
        firstInvalid.focus();
      } else {
        sendForm();
      }
    });
    // Without this handler the form submits natively, with browser constraint validation;
    // that validation is turned off only once the handler is attached to replace it.
    form.noValidate = true;
    const fallback = document.querySelector("[data-form-fallback]");
    if (fallback) {
      fallback.hidden = true;
    }
  }

  const backToTop = document.querySelector("[data-back-to-top]");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 500);
    });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    });
  }
})();

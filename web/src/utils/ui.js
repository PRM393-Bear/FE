/**
 * EcoCycle – Shared UI Utilities
 */

/* ── Toast helper ── */
export function showToast(message, type = "error") {
  let el = document.getElementById("ecocycle-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "ecocycle-toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast toast--${type}`;
  requestAnimationFrame(() => el.classList.add("toast--visible"));
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("toast--visible"), 3500);
}

/* ── Field validation helper ── */
export function setFieldError(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add("is-error");
    inputEl.classList.remove("is-valid");
    errorEl.textContent = message;
    errorEl.classList.add("visible");
    return false;
  } else {
    inputEl.classList.remove("is-error");
    inputEl.classList.add("is-valid");
    errorEl.textContent = "";
    errorEl.classList.remove("visible");
    return true;
  }
}

(() => {
  const PROPERTY = '--tint';

  const resolve = (target) =>
    typeof target === 'string' ? document.querySelectorAll(target) : target instanceof Element ? [target] : target;

  function apply(target, color) {
    for (const el of resolve(target)) {
      if (color) el.style.setProperty(PROPERTY, color);
      else el.style.removeProperty(PROPERTY);
    }
  }

  const reset = (target) => apply(target, null);

  async function load(el) {
    const response = await fetch(el.dataset.src);
    if (!response.ok) throw new Error(`${el.dataset.src}: ${response.status}`);
    el.innerHTML = await response.text();
  }

  async function scan(root = document) {
    await Promise.all([...root.querySelectorAll('[data-src]')].map(load));
    root.querySelectorAll('[data-tint]').forEach((el) => apply(el, el.dataset.tint));
  }

  window.tint = { apply, reset, load, scan };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan());
  else scan();
})();

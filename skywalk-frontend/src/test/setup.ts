import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement scrollIntoView; several components (Combobox, dropdown lists…) call it.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

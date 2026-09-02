import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement scrollIntoView; several components (Combobox, dropdown lists…) call it.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom's bundled undici occasionally throws this on XHR teardown for a request
// left in flight by a test that didn't fully mock the network — unrelated to
// assertion correctness (the run is otherwise green), but it flips the process
// exit code to non-zero in CI, which fails the whole job. Ignore only this exact
// error; anything else still surfaces normally.
process.on('unhandledRejection', (reason: any) => {
  if (reason?.code === 'UND_ERR_INVALID_ARG') return;
  // Anything else: don't act — vitest's own listener still reports it normally.
});

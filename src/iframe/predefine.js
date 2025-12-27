window._ = window.parent._;
Object.defineProperty(window, 'SillyTavern', {
  get: () => _.get(window.parent, 'SillyTavern').getContext(),
});
const iframeId = window.frameElement?.id || window.name;
if (iframeId) {
  // Cache the iframe id in case frameElement disappears (e.g., Firefox removing srcdoc iframes on navigation)
  // and also put it on window.name so it survives DOM removal.
  window.__TH_IFRAME_ID = iframeId;
  if (!window.name) {
    window.name = iframeId;
  }
}
let result = _(window);
result = result.merge(_.pick(window.parent, ['EjsTemplate', 'TavernHelper', 'YAML', 'showdown', 'toastr', 'z']));
result = result.merge(_.omit(_.get(window.parent, 'TavernHelper'), '_bind'));
result = result.merge(
  ...Object.entries(_.get(window.parent, 'TavernHelper')._bind).map(([key, value]) => ({
    [key.replace('_', '')]: value.bind(window),
  })),
);
result.value();

// Actually, waitGlobalInitialized should be used to wait for Mvu to finish initializing; window.Mvu is set here only for compatibility.
if (_.has(window.parent, 'Mvu')) {
  Object.defineProperty(window, 'Mvu', {
    get: () => _.get(window.parent, 'Mvu'),
    // The Mvu script itself will also call `_.set()` on its own variables, so an empty setter is defined here.
    set: () => {},
    configurable: true,
  });
}

$(window).on('pagehide', () => {
  eventClearAll();
});

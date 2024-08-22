

function log(msg){
  Zotero.debug("keepzot: " + msg);
}

var pref_window = null;

export async function prefinit(_window) {
  if (!pref_window) {
    pref_window = _window;
    // initUI();
    // bindPrefEvents();
  };

  const close_enable_cb = _window.document.querySelector('prefpane-customkey-close-enable');
  const min_enable_cb = _window.document.querySelector('prefpane-customkey-min-enable');

  close_enable_cb.checked = Zotero.Prefs.get('extension.keepzot.shortcut.close.enable', true);
  min_enable_cb.checked = Zotero.Prefs.get('extension.keepzot.shortcut.min.enable', true);

  close_enable_cb.addEventListener("command", (e) => {
    log("close enable change ");
    log(e.target.checked)
    // updateenalbe("close", e.target.checked);
  });
  min_enable_cb.addEventListener("command", (e) => {
    log("min enable change ");
    log(e.target.checked)
    // updateenalbe("min", e.target.checked);
  });

}

// async function initUI() {
//     const renderLock = Zotero.Promise.defer();
//     if (!isWindowAlive(pref_window)) return;
// }

// function updateEnalbe(key,value) {
//     Zotero.Prefs.set(`extension.keepzot.shortcut.${key}.enable`, value, true);
//     // Zotero.KeepZot.changeenable(key,value);
// }



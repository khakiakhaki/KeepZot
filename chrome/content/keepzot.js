
Zotero.KeepZot = {
    closeFunc: null,
    mainwindow : null,
    pref_window: null,

    init() {
        if (!this.mainwindow) {
            this.getWindow()
        }
        this.closeFunc = this.mainwindow.close;
    },

    redirectClose() {
        this.mainwindow.close = this.mainwindow.minimize;
    }, 

    cancelRedirect() {
        if (!this.mainwindow) {
            return;
        }
        this.mainwindow.close = this.closeFunc;
        this.closeFunc = null;
        this.mainwindow = null;
    },

    getWindow() {
        this.mainwindow = Zotero.getMainWindow();
    },

    directClose() {
        this.mainwindow.close = this.closeFunc;
        this.mainwindow.close();
    },

    async onPrefsEvent(type , data){
        switch (type) {
            case "load":
                prefinit(data.window);
                break;
            default:
                return;
        }
    }


};




async function prefinit(_window) {

    Zotero.KeepZot.pref_window = _window;
  
    const close_enable_cb = _window.document.querySelector('#cb-pref-ckey-close-enable');
    const min_enable_cb = _window.document.querySelector('#cb-pref-ckey-min-enable');

    const bt_close_str = _window.document.querySelector('#bt-pref-keepzot-set-close');
    const bt_min_str = _window.document.querySelector('#bt-pref-keepzot-set-min');

    bt_close_str.textContent = Zotero.Prefs.get("extension.keepzot.shortcut.close", true) ? Zotero.Prefs.get("extension.keepzot.shortcut.close", true) : "None";
    bt_min_str.textContent = Zotero.Prefs.get("extension.keepzot.shortcut.min", true) ? Zotero.Prefs.get("extension.keepzot.shortcut.close", true) : "None";

    bt_close_str.addEventListener('click', (ev) => {
        // Record pressed key
        const curbutton = ev.target;
        const win = Zotero.KeepZot.pref_window;

        const keyDownListener = (event) => {
            event.preventDefault();
            event.stopPropagation();

            const modifiers = [];
            if (event.altKey) modifiers.push('Alt');
            if (event.ctrlKey) modifiers.push('Ctrl');
            if (event.shiftKey) modifiers.push('Shift');
            if (event.metaKey) modifiers.push('Meta');

            const key = !["Shift", "Meta", "Ctrl", "Alt", "Control"].includes(event.key) ? event.key : '';
            const keyStr = [...modifiers, key].filter(Boolean).join('+');

            curbutton.textContent =  `${keyStr}`;
        };

        const keyUpListener = (event) => {
            event.preventDefault();
            event.stopPropagation();
            win.removeEventListener("keydown", keyDownListener);
            win.removeEventListener("keyup", keyUpListener);
        };
    win.addEventListener("keydown", keyDownListener);
    win.addEventListener("keyup", keyUpListener);
});

    // bt_close_str.addEventListener("change", (e) => {
    //     popinfo("shortcut close change");
    // });

    // bt_min_str.addEventListener("change", (e) => {
    //     popinfo("shortcut min change");
    // });

    close_enable_cb.addEventListener("command", (e) => {
        popinfo("shortcut close window enable");
    });

    min_enable_cb.addEventListener("command", (e) => {
        popinfo("shortcut minimize window enable");
    });
}

function popinfo(msg, lasttime = 2000) {
    const popMsg = new Zotero.ProgressWindow({ closeOnClick: true });
    popMsg.changeHeadline("[KeepZot]", "", "");
    popMsg.addDescription(`[${msg}]`);
    popMsg.show();
    popMsg.startCloseTimer(lasttime); 
}
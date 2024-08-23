
Zotero.KeepZot = {
    closeFunc: null,
    mainwindow : null,
    pref_window: null,
    shortcuts: {
        close: '',
        min: ''
    },


    init() {
        if (!this.mainwindow) {
            this.getWindow()
        }
        this.closeFunc = this.mainwindow.close;
        this.updateshortcut(['close','min']);
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
    },

    updateshortcut(keys) {
        if (!keys || !Array.isArray(keys)) {
            return;
        }
        keys.forEach(key => {
            let value = prefsGet(key);
            if (value && value !== this.shortcuts[key]) {
                this.shortcuts[key] = value;
            };
        });
    },

    initshortcut() {
        let needEnable = false;
        for (const key of ['min', 'close']) {
            const value = Boolean(prefsGet(key + ".enable") && this.shortcuts[key]);
            if (value) {
                needEnable = ture;
                break;
            }
        }
        if (needEnable && this.mainwindow.ZoteroPane ) {
            this.mainwindow.addEventListener("keydown", this.keydownListener);
        }
    },

    keydownListener(event){

        const modifiers = [];
        if (event.altKey) modifiers.push('Alt');
        if (event.ctrlKey) modifiers.push('Ctrl');
        if (event.shiftKey) modifiers.push('Shift');
        if (event.metaKey && Zotero.isMac) modifiers.push('Meta');

        let key = event.key === ' ' ? 'space' : event.key;
        key = !["Shift", "Meta", "Ctrl", "Alt", "Control"].includes(event.key) ? key : '';

        const keyStr = [...modifiers, key].filter(Boolean).join('+');

        if (keyStr === this.shortcuts.min && prefsGet("min.enable") ) {
            this.mainwindow.minimize()
            event.preventDefault();
            event.stopPropagation();
        } else if (keyStr === this.shortcuts.close && prefsGet("close.enable") ) {
            this.mainwindow.close();
            event.preventDefault();
            event.stopPropagation();
        }
    }
};




async function prefinit(_window) {

    Zotero.KeepZot.pref_window = _window;

    function setupKeyListener(callback) {
        const keyDownListener = (event) => {
            event.preventDefault();
            event.stopPropagation();

            const modifiers = [];
            if (event.altKey) modifiers.push('Alt');
            if (event.ctrlKey) modifiers.push('Ctrl');
            if (event.shiftKey) modifiers.push('Shift');
            if (event.metaKey) modifiers.push('Meta');

            let key = event.key === ' ' ? 'space' : event.key;
            key = !["Shift", "Meta", "Ctrl", "Alt", "Control"].includes(event.key) ? key : '';
            const keyStr = [...modifiers, key].filter(Boolean).join('+');

            callback(keyStr);
        };

        const keyUpListener = (event) => {
            event.preventDefault();
            event.stopPropagation();
            Zotero.KeepZot.pref_window.removeEventListener("keydown", keyDownListener);
            Zotero.KeepZot.pref_window.removeEventListener("keyup", keyUpListener);
        };

        Zotero.KeepZot.pref_window.addEventListener("keydown", keyDownListener);
        Zotero.KeepZot.pref_window.addEventListener("keyup", keyUpListener);
    };

    const close_enable_cb = _window.document.querySelector('#cb-pref-ckey-close-enable');
    const min_enable_cb = _window.document.querySelector('#cb-pref-ckey-min-enable');

    const bt_close_str = _window.document.querySelector('#bt-pref-keepzot-set-close');
    const bt_min_str = _window.document.querySelector('#bt-pref-keepzot-set-min');

    Zotero.KeepZot.updateshortcut();
    bt_close_str.textContent = Zotero.KeepZot.shortcuts.close;
    bt_min_str.textContent = Zotero.KeepZot.shortcuts.min;

    bt_close_str.addEventListener('click', (ev) => {
        // Record pressed key
        bt_close_str.textContent = "[Press any key]";
        setupKeyListener((keyStr) => {
            bt_close_str.textContent = `${keyStr}`; // 更新按钮文本
            prefsSet("close", keyStr);
            Zotero.KeepZot.updateshortcut(["close"]);
        });
    });

    bt_min_str.addEventListener("click", (event) => {
        bt_min_str.textContent = "[Press any key]";
        setupKeyListener((keyStr) => {
            bt_min_str.textContent = `${keyStr}`; // 更新按钮文本
            prefsSet("min", keyStr);
            Zotero.KeepZot.updateshortcut(["min"]);
        });
    });

    // enable  close
    close_enable_cb.addEventListener("command", (e) => {
        popinfo("shortcut close window enable");
    });

    // enable min
    min_enable_cb.addEventListener("command", (e) => {
        popinfo("shortcut minimize window enable");
    });

};

function popinfo(msg) {
    const popMsg = new Zotero.ProgressWindow({ closeOnClick: true });
    popMsg.changeHeadline("[KeepZot]", "", "");
    popMsg.addDescription(`[${msg}]`);
    popMsg.show();
    popMsg.startCloseTimer(1000); 
};

function prefsSet(key,value) {
    return Zotero.Prefs.set("extension.keepzot.shortcut." + key, value, true);
}

function prefsGet(key) {
    return Zotero.Prefs.get("extension.keepzot.shortcut." + key, true);
}

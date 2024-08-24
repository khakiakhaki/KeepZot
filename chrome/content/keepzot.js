Zotero.KeepZot = {
    closeFunc: null,
    mainwindow: null,
    prefWindow: null,
    enableListen: false,

    init(window) {
        if (window) {
            this.mainwindow = window;
        } else {
            this.getWindow();
        }
        this.closeFunc = this.mainwindow.close;
        this.initShortcut();
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

    async onPrefsEvent(type, data) {
        switch (type) {
            case "load":
                prefinit(data.window);
                break;
            default:
                return;
        }
    },

    // initshortccut
    initShortcut() {
        if (this.needEnable() && !this.enableListen) {
            if (this.mainwindow.ZoteroPane) {
                this.mainwindow.addEventListener(
                    "keydown",
                    this.keydownListener
                );
                this.enableListen = true;

                const closelisten = (e) => {
                    this.mainwindow.removeEventListener(
                        "keydown",
                        this.keydownListener
                    );
                    this.mainwindow.removeEventListener("close", closelisten);
                    this.enableListen = false; // 可能需要重置为 false
                };

                this.mainwindow.addEventListener("close", closelisten);
            }
        } else if (!this.needEnable && this.enableListen) {
            if (this.mainwindow.ZoteroPane) {
                this.mainwindow.removeEventListener(
                    "keydown",
                    this.keydownListener
                );
            }
            this.enableListen = false;
        }
    },

    // remove eventlisten
    removeShortcut() {
        if (this.enableListen) {
            this.enableListen = false;
            this.mainwindow.removeEventListener(
                "keydown",
                this.keydownListener
            );
        }
    },

    // check if need enable ths eventlisten
    needEnable() {
        for (const key of ["min", "close"]) {
            const value = Boolean(prefsGet(key + ".enable") && prefsGet(key));
            if (value) {
                return true;
            }
        }
    },

    keydownListener(event) {
        const modifiers = [];
        if (event.altKey) modifiers.push("Alt");
        if (event.ctrlKey) modifiers.push("Ctrl");
        if (event.shiftKey) modifiers.push("Shift");
        if (event.metaKey && Zotero.isMac) modifiers.push("Meta");

        let key = event.key === " " ? "space" : event.key;
        key = !["Shift", "Meta", "Ctrl", "Alt", "Control"].includes(event.key)
            ? key
            : "";

        const keyStr = [...modifiers, key]
            .filter(Boolean)
            .join("+")
            .toLowerCase();

        if (keyStr === prefsGet("min") && prefsGet("min.enable")) {
            event.currentTarget.minimize();
            event.preventDefault();
            event.stopPropagation();
        } else if (keyStr === prefsGet("close") && prefsGet("close.enable")) {
            // goQuitApplication("1");
            Services.startup.quit(Services.startup.eForceQuit);
            event.preventDefault();
            event.stopPropagation();
        }
    },
};

async function prefinit(_window) {
    Zotero.KeepZot.prefWindow = _window;

    const shortcuts = {
        close: prefsGet("close"),
        min: prefsGet("min"),
        // exampleKey: prefsGet("exampleKey")
    };

    let currentKeyListeners = null;

    function setupKeyListener(callback) {
        const keyDownListener = (event) => {
            event.preventDefault();
            event.stopPropagation();

            const modifiers = [];
            if (event.altKey) modifiers.push("Alt");
            if (event.ctrlKey) modifiers.push("Ctrl");
            if (event.shiftKey) modifiers.push("Shift");
            if (event.metaKey && Zotero.isMac) modifiers.push("Meta");

            let key = event.key === " " ? "space" : event.key;
            key = !["Shift", "Meta", "Ctrl", "Alt", "Control"].includes(
                event.key
            )
                ? key
                : "";
            const keyStr = [...modifiers, key]
                .filter(Boolean)
                .join("+")
                .toLocaleLowerCase();

            callback(keyStr);
        };

        const keyUpListener = (event) => {
            Zotero.KeepZot.prefWindow.removeEventListener(
                "keydown",
                keyDownListener
            );
            Zotero.KeepZot.prefWindow.removeEventListener(
                "keyup",
                keyUpListener
            );
            event.preventDefault();
            event.stopPropagation();
        };

        Zotero.KeepZot.prefWindow.addEventListener("keydown", keyDownListener);
        Zotero.KeepZot.prefWindow.addEventListener("keyup", keyUpListener);

        return { keyDownListener, keyUpListener }; // 返回监听器
    }

    function setupShortcutButton(button, preferenceKey) {
        button.addEventListener("click", () => {
            let prevalue = button.textContent;
            button.textContent = "[Press any key]";

            const blurListener = () => {
                prefsSet(preferenceKey, "");
                button.textContent = "[None]";
                Zotero.KeepZot.initShortcut();
                Zotero.KeepZot.prefWindow.removeEventListener(
                    "keydown",
                    keyDownListener
                );
                Zotero.KeepZot.prefWindow.removeEventListener(
                    "keyup",
                    keyUpListener
                );
                button.removeEventListener("blur", blurListener);
            };

            button.addEventListener("blur", blurListener);
            const { keyDownListener, keyUpListener } = setupKeyListener(
                (keyStr) => {
                    const conflictingKeys = Object.keys(shortcuts).filter(
                        (key) =>
                            key !== preferenceKey && shortcuts[key] === keyStr
                    );

                    button.removeEventListener("blur", blurListener);
                    if (conflictingKeys.length === 0) {
                        button.textContent = keyStr;
                        prefsSet(preferenceKey, keyStr);
                        shortcuts[preferenceKey] = keyStr;
                        Zotero.KeepZot.initShortcut();
                    } else {
                        button.textContent =
                            "[conflict] still " +
                            prevalue.replace(/^\[conflict\] still\s*/, "");
                    }
                    button.removeEventListener("blur", blurListener);
                }
            );
        });
    }

    const close_enable_cb = _window.document.querySelector(
        "#cb-pref-ckey-close-enable"
    );
    const min_enable_cb = _window.document.querySelector(
        "#cb-pref-ckey-min-enable"
    );

    const bt_close_str = _window.document.querySelector(
        "#bt-pref-keepzot-set-close"
    );
    const bt_min_str = _window.document.querySelector(
        "#bt-pref-keepzot-set-min"
    );

    let value = prefsGet("close");
    bt_close_str.textContent = value ? value : "[None]";
    value = prefsGet("min");
    bt_min_str.textContent = value ? value : "[None]";

    // settting one
    setupShortcutButton(bt_close_str, "close");
    setupShortcutButton(bt_min_str, "min");

    // enable  close
    close_enable_cb.addEventListener("command", (e) => {
        Zotero.KeepZot.initShortcut();
        popinfo("shortcut close window enable");
    });

    // enable min
    min_enable_cb.addEventListener("command", (e) => {
        Zotero.KeepZot.initShortcut();
        popinfo("shortcut minimize window enable");
    });
}

function popinfo(msg) {
    const popMsg = new Zotero.ProgressWindow({ closeOnClick: true });
    popMsg.changeHeadline("[KeepZot]", "", "");
    popMsg.addDescription(`[${msg}]`);
    popMsg.show();
    popMsg.startCloseTimer(3000);
}

function prefsSet(key, value) {
    return Zotero.Prefs.set("extension.keepzot.shortcut." + key, value, true);
}

function prefsGet(key) {
    return Zotero.Prefs.get("extension.keepzot.shortcut." + key, true);
}

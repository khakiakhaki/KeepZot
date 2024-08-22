
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

    const ck_close_str = _window.document.querySelector('#prefpane-keepzot-set-close');
    const ck_min_str = _window.document.querySelector('#prefpane-keepzot-set-min');

    ck_close_str.addEventListener("change", (e) => {
        popinfo("shortcut close change");
    });

    ck_min_str.addEventListener("change", (e) => {
        popinfo("shortcut min change");
    });

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
    popMsg.startCloseTimer(lasttime); // 毫秒
}
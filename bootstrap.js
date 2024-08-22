// Components.utils.import("resource://gre/modules/Services.jsm");

var chromeHandle;


function log(msg){
    Zotero.debug("keepzot: " + msg);
}

function install() {
    log("installed 0.1");
}

async function startup({ id, version, resourceURI, rootURI }, reason) {
    log("starup 0.1");
    await Zotero.initializationPromise;

    // String 'rootURI' introduced in Zotero 7
    if (!rootURI) {
        rootURI = resourceURI.spec;
    }

    Zotero.PreferencePanes.register({
        pluginID: 'keepzot@kk',
        src: rootURI + 'chrome/content/preference.xhtml',
    });

    var aomStartup = Components.classes[
        "@mozilla.org/addons/addon-manager-startup;1"
    ].getService(Components.interfaces.amIAddonManagerStartup);
    var manifestURI = Services.io.newURI(rootURI + 'manifest.json');
    Services.scriptloader.loadSubScript(rootURI + 'chrome/content/keepzot.js');
    chromeHandle = aomStartup.registerChrome(manifestURI, [
        ["content", "keepzot", rootURI + "chrome/content/"]
    ]);

    Zotero.KeepZot.init();
    Zotero.KeepZot.redirectClose();
}

async function onMainWindowLoad({ window }, reason) {
    log("load");
    Zotero.KeepZot.init();
    Zotero.KeepZot.redirectClose();
}

async function onMainWindowUnload({ window }, reason) {
    log("unload");
    Zotero.KeepZot.cancelRedirect();
}

function shutdown({ id, version, resourceURI, rootURI }, reason) {
    log("on main shutdown");
    if (reason === APP_SHUTDOWN) {
        return;
    }
    Zotero.KeepZot.cancelRedirect(null);
    mainwindow = null;

    if (typeof Zotero === "undefined") {
        Zotero = Components.classes["@zotero.org/Zotero;1"].getService(
        Components.interfaces.nsISupports,
        ).wrappedJSObject;
    }

    Cc["@mozilla.org/intl/stringbundle;1"]
        .getService(Components.interfaces.nsIStringBundleService)
        .flushBundles();

    Cu.unload(`${rootURI}/chrome/content/keepzotero.js`);
    if (chromeHangle) {
        chromeHandle.destruct();
        chromeHandle = null;
    }
}

function uninstall(data, reason) {
    Zotero.KeepZot.cancelRedirect();
    log("uninstalled 0.1");
}
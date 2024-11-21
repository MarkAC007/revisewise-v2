import { a as u, l as s } from "./logger.C_sQt7f9.js";
const h = "https://revisewise-api.azurewebsites.net";
class a {
  constructor() {
  }
  static getInstance() {
    return a.instance || (a.instance = new a()), a.instance;
  }
  async getAuthToken() {
    const t = u.currentUser;
    if (!t)
      throw new Error("User not authenticated");
    return t.getIdToken();
  }
  async fetchWithAuth(t, e = {}) {
    try {
      const n = await this.getAuthToken(), o = await fetch(`${h}${t}`, {
        ...e,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${n}`,
          ...e.headers
        }
      }), i = await o.json();
      if (!o.ok)
        throw new Error(i.error || "API request failed");
      return { success: !0, data: i };
    } catch (n) {
      return await s.error("API request failed", {
        endpoint: t,
        method: e.method || "GET"
      }, n), {
        success: !1,
        error: n instanceof Error ? n.message : "Unknown error occurred"
      };
    }
  }
  async processQuery(t) {
    return this.fetchWithAuth("/api/query", {
      method: "POST",
      body: JSON.stringify({ text: t })
    });
  }
  async getQueryHistory() {
    return this.fetchWithAuth("/api/queries/history");
  }
}
const c = a.getInstance();
chrome.runtime.onInstalled.addListener(async (r) => {
  try {
    chrome.contextMenus.create({
      id: "revisewise-context",
      title: "Ask ReviseWise",
      contexts: ["selection"]
    }), r.reason === "install" ? (await s.info("Extension installed", {
      version: chrome.runtime.getManifest().version
    }), chrome.storage.local.set({
      installDate: (/* @__PURE__ */ new Date()).toISOString(),
      settings: {
        notifications: !0,
        theme: "light"
      }
    })) : r.reason === "update" && await s.info("Extension updated", {
      previousVersion: r.previousVersion,
      currentVersion: chrome.runtime.getManifest().version
    });
  } catch (t) {
    await s.error("Error during installation/update", {
      reason: r.reason,
      version: chrome.runtime.getManifest().version
    }, t);
  }
});
chrome.contextMenus.onClicked.addListener(async (r, t) => {
  try {
    if (r.menuItemId === "revisewise-context" && r.selectionText) {
      await s.info("Context menu item clicked", {
        textLength: r.selectionText.length
      });
      const e = await c.processQuery(r.selectionText);
      if (e.success)
        t != null && t.id && chrome.tabs.sendMessage(t.id, {
          type: "SHOW_RESPONSE",
          data: e.data
        });
      else
        throw new Error(e.error);
    }
  } catch (e) {
    await s.error("Context menu handler error", {
      selection: r.selectionText
    }, e);
  }
});
chrome.runtime.onMessage.addListener((r, t, e) => {
  var n;
  if (r.type === "START_SESSION")
    return d(e), !0;
  if (r.type === "ASK_REVISEWISE")
    return w(r.text, (n = t.tab) == null ? void 0 : n.id), !0;
});
async function d(r) {
  var t;
  try {
    const [e] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
    if (await s.info("Starting session", { tabId: e.id, url: e.url }), !e.id)
      throw new Error("No active tab found");
    if ((t = e.url) != null && t.includes("app.revisewise.co"))
      await chrome.tabs.sendMessage(e.id, { type: "START_SESSION" }), await s.info("Session started on existing tab", { tabId: e.id });
    else {
      const n = await chrome.tabs.create({ url: "https://app.revisewise.co/dashboard" });
      await s.info("New session tab created", { newTabId: n.id });
    }
    r({ success: !0 });
  } catch (e) {
    await s.error("Error starting session", {
      url: chrome.runtime.getURL("dashboard.html")
    }, e), r({ success: !1, error: e.message });
  }
}
async function w(r, t) {
  try {
    await s.info("Processing query", { textLength: r.length });
    const e = await c.processQuery(r);
    if (e.success && t)
      chrome.tabs.sendMessage(t, {
        type: "SHOW_RESPONSE",
        data: e.data
      });
    else
      throw new Error(e.error);
  } catch (e) {
    await s.error("Query handler error", { text: r }, e);
  }
}

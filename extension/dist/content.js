import { l as n } from "./logger.C_sQt7f9.js";
class c {
  constructor() {
    this.button = null, this.responseContainer = null, this.isInitialized = !1, this.init();
  }
  init() {
    try {
      if (this.isInitialized) return;
      this.button = this.createButton(), this.responseContainer = this.createResponseContainer(), this.setupEventListeners(), this.isInitialized = !0, n.info("ReviseWise UI initialized");
    } catch (e) {
      n.error("Failed to initialize ReviseWise UI", {}, e);
    }
  }
  createButton() {
    const e = document.createElement("button");
    return e.className = "revisewise-floating-button", e.innerHTML = `
      <img src="${chrome.runtime.getURL("icons/icon16.png")}" alt="ReviseWise" />
      <span>Ask ReviseWise</span>
    `, e.style.display = "none", document.body.appendChild(e), e;
  }
  createResponseContainer() {
    const e = document.createElement("div");
    return e.className = "revisewise-response-container", e.style.display = "none", document.body.appendChild(e), e;
  }
  setupEventListeners() {
    var e;
    document.addEventListener("mouseup", this.handleTextSelection.bind(this)), document.addEventListener("scroll", this.hideUI.bind(this)), (e = this.button) == null || e.addEventListener("click", this.handleButtonClick.bind(this)), document.addEventListener("click", (i) => {
      i.target instanceof Node && this.responseContainer && !this.responseContainer.contains(i.target) && this.hideResponse();
    }), window.addEventListener("unload", this.cleanup.bind(this));
  }
  async handleTextSelection(e) {
    var i;
    try {
      const t = window.getSelection(), a = t == null ? void 0 : t.toString().trim();
      if (!a || !this.button) {
        this.hideUI();
        return;
      }
      const l = t == null ? void 0 : t.getRangeAt(0);
      if (!l) return;
      const r = l.getBoundingClientRect();
      this.button.style.position = "fixed", this.button.style.top = `${r.bottom + window.scrollY + 10}px`, this.button.style.left = `${r.left + window.scrollX}px`, this.button.style.display = "flex", await n.info("Text selection detected", {
        textLength: a.length,
        position: { x: r.left, y: r.bottom }
      });
    } catch (t) {
      await n.error("Text selection handling error", {
        selection: (i = window.getSelection()) == null ? void 0 : i.toString()
      }, t), this.hideUI();
    }
  }
  hideUI() {
    this.hideButton(), this.hideResponse();
  }
  hideButton() {
    this.button && (this.button.style.display = "none");
  }
  hideResponse() {
    this.responseContainer && (this.responseContainer.style.display = "none");
  }
  showResponse(e) {
    if (!this.responseContainer) return;
    this.responseContainer.innerHTML = `
      <div class="revisewise-response-content">
        <div class="revisewise-response-header">
          <img src="${chrome.runtime.getURL("icons/icon16.png")}" alt="ReviseWise" />
          <h3>ReviseWise Response</h3>
          <button class="revisewise-close-button">×</button>
        </div>
        <div class="revisewise-response-body">
          ${e.explanation || e.message || "No response available"}
        </div>
      </div>
    `;
    const i = this.responseContainer.querySelector(".revisewise-close-button");
    i == null || i.addEventListener("click", () => this.hideResponse()), this.responseContainer.style.display = "block", this.hideButton();
  }
  async handleButtonClick() {
    var e, i;
    try {
      const t = (e = window.getSelection()) == null ? void 0 : e.toString().trim();
      if (!t) return;
      await n.info("ReviseWise button clicked", {
        textLength: t.length
      }), chrome.runtime.sendMessage({
        type: "ASK_REVISEWISE",
        text: t
      }), this.hideButton();
    } catch (t) {
      await n.error("Button click handling error", {
        selection: (i = window.getSelection()) == null ? void 0 : i.toString()
      }, t);
    }
  }
  cleanup() {
    var e, i;
    try {
      (e = this.button) == null || e.remove(), (i = this.responseContainer) == null || i.remove(), this.isInitialized = !1, n.info("ReviseWise UI cleaned up");
    } catch (t) {
      n.error("Cleanup error", {}, t);
    }
  }
  reinitialize() {
    this.cleanup(), this.init();
  }
}
let s = null;
chrome.runtime.onMessage.addListener(async (o, e, i) => {
  try {
    switch (o.type) {
      case "ENABLE_TEXT_SELECTION":
        s ? s.reinitialize() : s = new c(), await n.info("Text selection feature enabled", {
          userRole: o.userRole
        }), i({ success: !0 });
        break;
      case "SHOW_RESPONSE":
        s == null || s.showResponse(o.data);
        break;
    }
  } catch (t) {
    await n.error("Message handling error", {
      messageType: o.type
    }, t), i({ success: !1, error: t.message });
  }
});

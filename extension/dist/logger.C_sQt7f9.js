/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const yc = function(n) {
  const e = [];
  let t = 0;
  for (let r = 0; r < n.length; r++) {
    let i = n.charCodeAt(r);
    i < 128 ? e[t++] = i : i < 2048 ? (e[t++] = i >> 6 | 192, e[t++] = i & 63 | 128) : (i & 64512) === 55296 && r + 1 < n.length && (n.charCodeAt(r + 1) & 64512) === 56320 ? (i = 65536 + ((i & 1023) << 10) + (n.charCodeAt(++r) & 1023), e[t++] = i >> 18 | 240, e[t++] = i >> 12 & 63 | 128, e[t++] = i >> 6 & 63 | 128, e[t++] = i & 63 | 128) : (e[t++] = i >> 12 | 224, e[t++] = i >> 6 & 63 | 128, e[t++] = i & 63 | 128);
  }
  return e;
}, ch = function(n) {
  const e = [];
  let t = 0, r = 0;
  for (; t < n.length; ) {
    const i = n[t++];
    if (i < 128)
      e[r++] = String.fromCharCode(i);
    else if (i > 191 && i < 224) {
      const o = n[t++];
      e[r++] = String.fromCharCode((i & 31) << 6 | o & 63);
    } else if (i > 239 && i < 365) {
      const o = n[t++], a = n[t++], u = n[t++], h = ((i & 7) << 18 | (o & 63) << 12 | (a & 63) << 6 | u & 63) - 65536;
      e[r++] = String.fromCharCode(55296 + (h >> 10)), e[r++] = String.fromCharCode(56320 + (h & 1023));
    } else {
      const o = n[t++], a = n[t++];
      e[r++] = String.fromCharCode((i & 15) << 12 | (o & 63) << 6 | a & 63);
    }
  }
  return e.join("");
}, vc = {
  /**
   * Maps bytes to characters.
   */
  byteToCharMap_: null,
  /**
   * Maps characters to bytes.
   */
  charToByteMap_: null,
  /**
   * Maps bytes to websafe characters.
   * @private
   */
  byteToCharMapWebSafe_: null,
  /**
   * Maps websafe characters to bytes.
   * @private
   */
  charToByteMapWebSafe_: null,
  /**
   * Our default alphabet, shared between
   * ENCODED_VALS and ENCODED_VALS_WEBSAFE
   */
  ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /**
   * Our default alphabet. Value 64 (=) is special; it means "nothing."
   */
  get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  },
  /**
   * Our websafe alphabet.
   */
  get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  },
  /**
   * Whether this browser supports the atob and btoa functions. This extension
   * started at Mozilla but is now implemented by many browsers. We use the
   * ASSUME_* variables to avoid pulling in the full useragent detection library
   * but still allowing the standard per-browser compilations.
   *
   */
  HAS_NATIVE_SUPPORT: typeof atob == "function",
  /**
   * Base64-encode an array of bytes.
   *
   * @param input An array of bytes (numbers with
   *     value in [0, 255]) to encode.
   * @param webSafe Boolean indicating we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeByteArray(n, e) {
    if (!Array.isArray(n))
      throw Error("encodeByteArray takes an array as a parameter");
    this.init_();
    const t = e ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, r = [];
    for (let i = 0; i < n.length; i += 3) {
      const o = n[i], a = i + 1 < n.length, u = a ? n[i + 1] : 0, h = i + 2 < n.length, d = h ? n[i + 2] : 0, m = o >> 2, w = (o & 3) << 4 | u >> 4;
      let R = (u & 15) << 2 | d >> 6, P = d & 63;
      h || (P = 64, a || (R = 64)), r.push(t[m], t[w], t[R], t[P]);
    }
    return r.join("");
  },
  /**
   * Base64-encode a string.
   *
   * @param input A string to encode.
   * @param webSafe If true, we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeString(n, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? btoa(n) : this.encodeByteArray(yc(n), e);
  },
  /**
   * Base64-decode a string.
   *
   * @param input to decode.
   * @param webSafe True if we should use the
   *     alternative alphabet.
   * @return string representing the decoded value.
   */
  decodeString(n, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? atob(n) : ch(this.decodeStringToByteArray(n, e));
  },
  /**
   * Base64-decode a string.
   *
   * In base-64 decoding, groups of four characters are converted into three
   * bytes.  If the encoder did not apply padding, the input length may not
   * be a multiple of 4.
   *
   * In this case, the last group will have fewer than 4 characters, and
   * padding will be inferred.  If the group has one or two characters, it decodes
   * to one byte.  If the group has three characters, it decodes to two bytes.
   *
   * @param input Input to decode.
   * @param webSafe True if we should use the web-safe alphabet.
   * @return bytes representing the decoded value.
   */
  decodeStringToByteArray(n, e) {
    this.init_();
    const t = e ? this.charToByteMapWebSafe_ : this.charToByteMap_, r = [];
    for (let i = 0; i < n.length; ) {
      const o = t[n.charAt(i++)], u = i < n.length ? t[n.charAt(i)] : 0;
      ++i;
      const d = i < n.length ? t[n.charAt(i)] : 64;
      ++i;
      const w = i < n.length ? t[n.charAt(i)] : 64;
      if (++i, o == null || u == null || d == null || w == null)
        throw new uh();
      const R = o << 2 | u >> 4;
      if (r.push(R), d !== 64) {
        const P = u << 4 & 240 | d >> 2;
        if (r.push(P), w !== 64) {
          const V = d << 6 & 192 | w;
          r.push(V);
        }
      }
    }
    return r;
  },
  /**
   * Lazy static initialization function. Called before
   * accessing any of the static map variables.
   * @private
   */
  init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
      for (let n = 0; n < this.ENCODED_VALS.length; n++)
        this.byteToCharMap_[n] = this.ENCODED_VALS.charAt(n), this.charToByteMap_[this.byteToCharMap_[n]] = n, this.byteToCharMapWebSafe_[n] = this.ENCODED_VALS_WEBSAFE.charAt(n), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]] = n, n >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)] = n, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)] = n);
    }
  }
};
class uh extends Error {
  constructor() {
    super(...arguments), this.name = "DecodeBase64StringError";
  }
}
const lh = function(n) {
  const e = yc(n);
  return vc.encodeByteArray(e, !0);
}, Nr = function(n) {
  return lh(n).replace(/\./g, "");
}, Ec = function(n) {
  try {
    return vc.decodeString(n, !0);
  } catch (e) {
    console.error("base64Decode failed: ", e);
  }
  return null;
};
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function hh() {
  if (typeof self < "u")
    return self;
  if (typeof window < "u")
    return window;
  if (typeof global < "u")
    return global;
  throw new Error("Unable to locate global object.");
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const dh = () => hh().__FIREBASE_DEFAULTS__, fh = () => {
  if (typeof process > "u" || typeof process.env > "u")
    return;
  const n = process.env.__FIREBASE_DEFAULTS__;
  if (n)
    return JSON.parse(n);
}, ph = () => {
  if (typeof document > "u")
    return;
  let n;
  try {
    n = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
  } catch {
    return;
  }
  const e = n && Ec(n[1]);
  return e && JSON.parse(e);
}, Yr = () => {
  try {
    return dh() || fh() || ph();
  } catch (n) {
    console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);
    return;
  }
}, Tc = (n) => {
  var e, t;
  return (t = (e = Yr()) === null || e === void 0 ? void 0 : e.emulatorHosts) === null || t === void 0 ? void 0 : t[n];
}, mh = (n) => {
  const e = Tc(n);
  if (!e)
    return;
  const t = e.lastIndexOf(":");
  if (t <= 0 || t + 1 === e.length)
    throw new Error(`Invalid host ${e} with no separate hostname and port!`);
  const r = parseInt(e.substring(t + 1), 10);
  return e[0] === "[" ? [e.substring(1, t - 1), r] : [e.substring(0, t), r];
}, Ic = () => {
  var n;
  return (n = Yr()) === null || n === void 0 ? void 0 : n.config;
}, wc = (n) => {
  var e;
  return (e = Yr()) === null || e === void 0 ? void 0 : e[`_${n}`];
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gh {
  constructor() {
    this.reject = () => {
    }, this.resolve = () => {
    }, this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
  /**
   * Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
   * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
   * and returns a node-style callback which will resolve or reject the Deferred's promise.
   */
  wrapCallback(e) {
    return (t, r) => {
      t ? this.reject(t) : this.resolve(r), typeof e == "function" && (this.promise.catch(() => {
      }), e.length === 1 ? e(t) : e(t, r));
    };
  }
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function _h(n, e) {
  if (n.uid)
    throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');
  const t = {
    alg: "none",
    type: "JWT"
  }, r = e || "demo-project", i = n.iat || 0, o = n.sub || n.user_id;
  if (!o)
    throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
  const a = Object.assign({
    // Set all required fields to decent defaults
    iss: `https://securetoken.google.com/${r}`,
    aud: r,
    iat: i,
    exp: i + 3600,
    auth_time: i,
    sub: o,
    user_id: o,
    firebase: {
      sign_in_provider: "custom",
      identities: {}
    }
  }, n);
  return [
    Nr(JSON.stringify(t)),
    Nr(JSON.stringify(a)),
    ""
  ].join(".");
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ve() {
  return typeof navigator < "u" && typeof navigator.userAgent == "string" ? navigator.userAgent : "";
}
function yh() {
  return typeof window < "u" && // @ts-ignore Setting up an broadly applicable index signature for Window
  // just to deal with this case would probably be a bad idea.
  !!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ve());
}
function vh() {
  var n;
  const e = (n = Yr()) === null || n === void 0 ? void 0 : n.forceEnvironment;
  if (e === "node")
    return !0;
  if (e === "browser")
    return !1;
  try {
    return Object.prototype.toString.call(global.process) === "[object process]";
  } catch {
    return !1;
  }
}
function Eh() {
  return typeof navigator < "u" && navigator.userAgent === "Cloudflare-Workers";
}
function Th() {
  const n = typeof chrome == "object" ? chrome.runtime : typeof browser == "object" ? browser.runtime : void 0;
  return typeof n == "object" && n.id !== void 0;
}
function Ih() {
  return typeof navigator == "object" && navigator.product === "ReactNative";
}
function wh() {
  const n = ve();
  return n.indexOf("MSIE ") >= 0 || n.indexOf("Trident/") >= 0;
}
function Ah() {
  return !vh() && !!navigator.userAgent && navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome");
}
function Rh() {
  try {
    return typeof indexedDB == "object";
  } catch {
    return !1;
  }
}
function Sh() {
  return new Promise((n, e) => {
    try {
      let t = !0;
      const r = "validate-browser-context-for-indexeddb-analytics-module", i = self.indexedDB.open(r);
      i.onsuccess = () => {
        i.result.close(), t || self.indexedDB.deleteDatabase(r), n(!0);
      }, i.onupgradeneeded = () => {
        t = !1;
      }, i.onerror = () => {
        var o;
        e(((o = i.error) === null || o === void 0 ? void 0 : o.message) || "");
      };
    } catch (t) {
      e(t);
    }
  });
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ph = "FirebaseError";
class Ge extends Error {
  constructor(e, t, r) {
    super(t), this.code = e, this.customData = r, this.name = Ph, Object.setPrototypeOf(this, Ge.prototype), Error.captureStackTrace && Error.captureStackTrace(this, zn.prototype.create);
  }
}
class zn {
  constructor(e, t, r) {
    this.service = e, this.serviceName = t, this.errors = r;
  }
  create(e, ...t) {
    const r = t[0] || {}, i = `${this.service}/${e}`, o = this.errors[e], a = o ? Ch(o, r) : "Error", u = `${this.serviceName}: ${a} (${i}).`;
    return new Ge(i, u, r);
  }
}
function Ch(n, e) {
  return n.replace(bh, (t, r) => {
    const i = e[r];
    return i != null ? String(i) : `<${r}?>`;
  });
}
const bh = /\{\$([^}]+)}/g;
function kh(n) {
  for (const e in n)
    if (Object.prototype.hasOwnProperty.call(n, e))
      return !1;
  return !0;
}
function Or(n, e) {
  if (n === e)
    return !0;
  const t = Object.keys(n), r = Object.keys(e);
  for (const i of t) {
    if (!r.includes(i))
      return !1;
    const o = n[i], a = e[i];
    if (oa(o) && oa(a)) {
      if (!Or(o, a))
        return !1;
    } else if (o !== a)
      return !1;
  }
  for (const i of r)
    if (!t.includes(i))
      return !1;
  return !0;
}
function oa(n) {
  return n !== null && typeof n == "object";
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Wn(n) {
  const e = [];
  for (const [t, r] of Object.entries(n))
    Array.isArray(r) ? r.forEach((i) => {
      e.push(encodeURIComponent(t) + "=" + encodeURIComponent(i));
    }) : e.push(encodeURIComponent(t) + "=" + encodeURIComponent(r));
  return e.length ? "&" + e.join("&") : "";
}
function An(n) {
  const e = {};
  return n.replace(/^\?/, "").split("&").forEach((r) => {
    if (r) {
      const [i, o] = r.split("=");
      e[decodeURIComponent(i)] = decodeURIComponent(o);
    }
  }), e;
}
function Rn(n) {
  const e = n.indexOf("?");
  if (!e)
    return "";
  const t = n.indexOf("#", e);
  return n.substring(e, t > 0 ? t : void 0);
}
function Vh(n, e) {
  const t = new Dh(n, e);
  return t.subscribe.bind(t);
}
class Dh {
  /**
   * @param executor Function which can make calls to a single Observer
   *     as a proxy.
   * @param onNoObservers Callback when count of Observers goes to zero.
   */
  constructor(e, t) {
    this.observers = [], this.unsubscribes = [], this.observerCount = 0, this.task = Promise.resolve(), this.finalized = !1, this.onNoObservers = t, this.task.then(() => {
      e(this);
    }).catch((r) => {
      this.error(r);
    });
  }
  next(e) {
    this.forEachObserver((t) => {
      t.next(e);
    });
  }
  error(e) {
    this.forEachObserver((t) => {
      t.error(e);
    }), this.close(e);
  }
  complete() {
    this.forEachObserver((e) => {
      e.complete();
    }), this.close();
  }
  /**
   * Subscribe function that can be used to add an Observer to the fan-out list.
   *
   * - We require that no event is sent to a subscriber synchronously to their
   *   call to subscribe().
   */
  subscribe(e, t, r) {
    let i;
    if (e === void 0 && t === void 0 && r === void 0)
      throw new Error("Missing Observer.");
    Nh(e, [
      "next",
      "error",
      "complete"
    ]) ? i = e : i = {
      next: e,
      error: t,
      complete: r
    }, i.next === void 0 && (i.next = Mi), i.error === void 0 && (i.error = Mi), i.complete === void 0 && (i.complete = Mi);
    const o = this.unsubscribeOne.bind(this, this.observers.length);
    return this.finalized && this.task.then(() => {
      try {
        this.finalError ? i.error(this.finalError) : i.complete();
      } catch {
      }
    }), this.observers.push(i), o;
  }
  // Unsubscribe is synchronous - we guarantee that no events are sent to
  // any unsubscribed Observer.
  unsubscribeOne(e) {
    this.observers === void 0 || this.observers[e] === void 0 || (delete this.observers[e], this.observerCount -= 1, this.observerCount === 0 && this.onNoObservers !== void 0 && this.onNoObservers(this));
  }
  forEachObserver(e) {
    if (!this.finalized)
      for (let t = 0; t < this.observers.length; t++)
        this.sendOne(t, e);
  }
  // Call the Observer via one of it's callback function. We are careful to
  // confirm that the observe has not been unsubscribed since this asynchronous
  // function had been queued.
  sendOne(e, t) {
    this.task.then(() => {
      if (this.observers !== void 0 && this.observers[e] !== void 0)
        try {
          t(this.observers[e]);
        } catch (r) {
          typeof console < "u" && console.error && console.error(r);
        }
    });
  }
  close(e) {
    this.finalized || (this.finalized = !0, e !== void 0 && (this.finalError = e), this.task.then(() => {
      this.observers = void 0, this.onNoObservers = void 0;
    }));
  }
}
function Nh(n, e) {
  if (typeof n != "object" || n === null)
    return !1;
  for (const t of e)
    if (t in n && typeof n[t] == "function")
      return !0;
  return !1;
}
function Mi() {
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ie(n) {
  return n && n._delegate ? n._delegate : n;
}
class It {
  /**
   *
   * @param name The public service name, e.g. app, auth, firestore, database
   * @param instanceFactory Service factory responsible for creating the public interface
   * @param type whether the service provided by the component is public or private
   */
  constructor(e, t, r) {
    this.name = e, this.instanceFactory = t, this.type = r, this.multipleInstances = !1, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null;
  }
  setInstantiationMode(e) {
    return this.instantiationMode = e, this;
  }
  setMultipleInstances(e) {
    return this.multipleInstances = e, this;
  }
  setServiceProps(e) {
    return this.serviceProps = e, this;
  }
  setInstanceCreatedCallback(e) {
    return this.onInstanceCreated = e, this;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const vt = "[DEFAULT]";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Oh {
  constructor(e, t) {
    this.name = e, this.container = t, this.component = null, this.instances = /* @__PURE__ */ new Map(), this.instancesDeferred = /* @__PURE__ */ new Map(), this.instancesOptions = /* @__PURE__ */ new Map(), this.onInitCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * @param identifier A provider can provide multiple instances of a service
   * if this.component.multipleInstances is true.
   */
  get(e) {
    const t = this.normalizeInstanceIdentifier(e);
    if (!this.instancesDeferred.has(t)) {
      const r = new gh();
      if (this.instancesDeferred.set(t, r), this.isInitialized(t) || this.shouldAutoInitialize())
        try {
          const i = this.getOrInitializeService({
            instanceIdentifier: t
          });
          i && r.resolve(i);
        } catch {
        }
    }
    return this.instancesDeferred.get(t).promise;
  }
  getImmediate(e) {
    var t;
    const r = this.normalizeInstanceIdentifier(e == null ? void 0 : e.identifier), i = (t = e == null ? void 0 : e.optional) !== null && t !== void 0 ? t : !1;
    if (this.isInitialized(r) || this.shouldAutoInitialize())
      try {
        return this.getOrInitializeService({
          instanceIdentifier: r
        });
      } catch (o) {
        if (i)
          return null;
        throw o;
      }
    else {
      if (i)
        return null;
      throw Error(`Service ${this.name} is not available`);
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(e) {
    if (e.name !== this.name)
      throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
    if (this.component)
      throw Error(`Component for ${this.name} has already been provided`);
    if (this.component = e, !!this.shouldAutoInitialize()) {
      if (Mh(e))
        try {
          this.getOrInitializeService({ instanceIdentifier: vt });
        } catch {
        }
      for (const [t, r] of this.instancesDeferred.entries()) {
        const i = this.normalizeInstanceIdentifier(t);
        try {
          const o = this.getOrInitializeService({
            instanceIdentifier: i
          });
          r.resolve(o);
        } catch {
        }
      }
    }
  }
  clearInstance(e = vt) {
    this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e);
  }
  // app.delete() will call this method on every provider to delete the services
  // TODO: should we mark the provider as deleted?
  async delete() {
    const e = Array.from(this.instances.values());
    await Promise.all([
      ...e.filter((t) => "INTERNAL" in t).map((t) => t.INTERNAL.delete()),
      ...e.filter((t) => "_delete" in t).map((t) => t._delete())
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(e = vt) {
    return this.instances.has(e);
  }
  getOptions(e = vt) {
    return this.instancesOptions.get(e) || {};
  }
  initialize(e = {}) {
    const { options: t = {} } = e, r = this.normalizeInstanceIdentifier(e.instanceIdentifier);
    if (this.isInitialized(r))
      throw Error(`${this.name}(${r}) has already been initialized`);
    if (!this.isComponentSet())
      throw Error(`Component ${this.name} has not been registered yet`);
    const i = this.getOrInitializeService({
      instanceIdentifier: r,
      options: t
    });
    for (const [o, a] of this.instancesDeferred.entries()) {
      const u = this.normalizeInstanceIdentifier(o);
      r === u && a.resolve(i);
    }
    return i;
  }
  /**
   *
   * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
   * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
   *
   * @param identifier An optional instance identifier
   * @returns a function to unregister the callback
   */
  onInit(e, t) {
    var r;
    const i = this.normalizeInstanceIdentifier(t), o = (r = this.onInitCallbacks.get(i)) !== null && r !== void 0 ? r : /* @__PURE__ */ new Set();
    o.add(e), this.onInitCallbacks.set(i, o);
    const a = this.instances.get(i);
    return a && e(a, i), () => {
      o.delete(e);
    };
  }
  /**
   * Invoke onInit callbacks synchronously
   * @param instance the service instance`
   */
  invokeOnInitCallbacks(e, t) {
    const r = this.onInitCallbacks.get(t);
    if (r)
      for (const i of r)
        try {
          i(e, t);
        } catch {
        }
  }
  getOrInitializeService({ instanceIdentifier: e, options: t = {} }) {
    let r = this.instances.get(e);
    if (!r && this.component && (r = this.component.instanceFactory(this.container, {
      instanceIdentifier: Lh(e),
      options: t
    }), this.instances.set(e, r), this.instancesOptions.set(e, t), this.invokeOnInitCallbacks(r, e), this.component.onInstanceCreated))
      try {
        this.component.onInstanceCreated(this.container, e, r);
      } catch {
      }
    return r || null;
  }
  normalizeInstanceIdentifier(e = vt) {
    return this.component ? this.component.multipleInstances ? e : vt : e;
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== "EXPLICIT";
  }
}
function Lh(n) {
  return n === vt ? void 0 : n;
}
function Mh(n) {
  return n.instantiationMode === "EAGER";
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class xh {
  constructor(e) {
    this.name = e, this.providers = /* @__PURE__ */ new Map();
  }
  /**
   *
   * @param component Component being added
   * @param overwrite When a component with the same name has already been registered,
   * if overwrite is true: overwrite the existing component with the new component and create a new
   * provider with the new component. It can be useful in tests where you want to use different mocks
   * for different tests.
   * if overwrite is false: throw an exception
   */
  addComponent(e) {
    const t = this.getProvider(e.name);
    if (t.isComponentSet())
      throw new Error(`Component ${e.name} has already been registered with ${this.name}`);
    t.setComponent(e);
  }
  addOrOverwriteComponent(e) {
    this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name), this.addComponent(e);
  }
  /**
   * getProvider provides a type safe interface where it can only be called with a field name
   * present in NameServiceMapping interface.
   *
   * Firebase SDKs providing services should extend NameServiceMapping interface to register
   * themselves.
   */
  getProvider(e) {
    if (this.providers.has(e))
      return this.providers.get(e);
    const t = new Oh(e, this);
    return this.providers.set(e, t), t;
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var j;
(function(n) {
  n[n.DEBUG = 0] = "DEBUG", n[n.VERBOSE = 1] = "VERBOSE", n[n.INFO = 2] = "INFO", n[n.WARN = 3] = "WARN", n[n.ERROR = 4] = "ERROR", n[n.SILENT = 5] = "SILENT";
})(j || (j = {}));
const Fh = {
  debug: j.DEBUG,
  verbose: j.VERBOSE,
  info: j.INFO,
  warn: j.WARN,
  error: j.ERROR,
  silent: j.SILENT
}, Uh = j.INFO, Bh = {
  [j.DEBUG]: "log",
  [j.VERBOSE]: "log",
  [j.INFO]: "info",
  [j.WARN]: "warn",
  [j.ERROR]: "error"
}, jh = (n, e, ...t) => {
  if (e < n.logLevel)
    return;
  const r = (/* @__PURE__ */ new Date()).toISOString(), i = Bh[e];
  if (i)
    console[i](`[${r}]  ${n.name}:`, ...t);
  else
    throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`);
};
let ms = class {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(e) {
    this.name = e, this._logLevel = Uh, this._logHandler = jh, this._userLogHandler = null;
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(e) {
    if (!(e in j))
      throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
    this._logLevel = e;
  }
  // Workaround for setter/getter having to be the same type.
  setLogLevel(e) {
    this._logLevel = typeof e == "string" ? Fh[e] : e;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(e) {
    if (typeof e != "function")
      throw new TypeError("Value assigned to `logHandler` must be a function");
    this._logHandler = e;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(e) {
    this._userLogHandler = e;
  }
  /**
   * The functions below are all based on the `console` interface
   */
  debug(...e) {
    this._userLogHandler && this._userLogHandler(this, j.DEBUG, ...e), this._logHandler(this, j.DEBUG, ...e);
  }
  log(...e) {
    this._userLogHandler && this._userLogHandler(this, j.VERBOSE, ...e), this._logHandler(this, j.VERBOSE, ...e);
  }
  info(...e) {
    this._userLogHandler && this._userLogHandler(this, j.INFO, ...e), this._logHandler(this, j.INFO, ...e);
  }
  warn(...e) {
    this._userLogHandler && this._userLogHandler(this, j.WARN, ...e), this._logHandler(this, j.WARN, ...e);
  }
  error(...e) {
    this._userLogHandler && this._userLogHandler(this, j.ERROR, ...e), this._logHandler(this, j.ERROR, ...e);
  }
};
const qh = (n, e) => e.some((t) => n instanceof t);
let aa, ca;
function $h() {
  return aa || (aa = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function zh() {
  return ca || (ca = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const Ac = /* @__PURE__ */ new WeakMap(), Ki = /* @__PURE__ */ new WeakMap(), Rc = /* @__PURE__ */ new WeakMap(), xi = /* @__PURE__ */ new WeakMap(), gs = /* @__PURE__ */ new WeakMap();
function Wh(n) {
  const e = new Promise((t, r) => {
    const i = () => {
      n.removeEventListener("success", o), n.removeEventListener("error", a);
    }, o = () => {
      t(st(n.result)), i();
    }, a = () => {
      r(n.error), i();
    };
    n.addEventListener("success", o), n.addEventListener("error", a);
  });
  return e.then((t) => {
    t instanceof IDBCursor && Ac.set(t, n);
  }).catch(() => {
  }), gs.set(e, n), e;
}
function Hh(n) {
  if (Ki.has(n))
    return;
  const e = new Promise((t, r) => {
    const i = () => {
      n.removeEventListener("complete", o), n.removeEventListener("error", a), n.removeEventListener("abort", a);
    }, o = () => {
      t(), i();
    }, a = () => {
      r(n.error || new DOMException("AbortError", "AbortError")), i();
    };
    n.addEventListener("complete", o), n.addEventListener("error", a), n.addEventListener("abort", a);
  });
  Ki.set(n, e);
}
let Gi = {
  get(n, e, t) {
    if (n instanceof IDBTransaction) {
      if (e === "done")
        return Ki.get(n);
      if (e === "objectStoreNames")
        return n.objectStoreNames || Rc.get(n);
      if (e === "store")
        return t.objectStoreNames[1] ? void 0 : t.objectStore(t.objectStoreNames[0]);
    }
    return st(n[e]);
  },
  set(n, e, t) {
    return n[e] = t, !0;
  },
  has(n, e) {
    return n instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in n;
  }
};
function Kh(n) {
  Gi = n(Gi);
}
function Gh(n) {
  return n === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(e, ...t) {
    const r = n.call(Fi(this), e, ...t);
    return Rc.set(r, e.sort ? e.sort() : [e]), st(r);
  } : zh().includes(n) ? function(...e) {
    return n.apply(Fi(this), e), st(Ac.get(this));
  } : function(...e) {
    return st(n.apply(Fi(this), e));
  };
}
function Qh(n) {
  return typeof n == "function" ? Gh(n) : (n instanceof IDBTransaction && Hh(n), qh(n, $h()) ? new Proxy(n, Gi) : n);
}
function st(n) {
  if (n instanceof IDBRequest)
    return Wh(n);
  if (xi.has(n))
    return xi.get(n);
  const e = Qh(n);
  return e !== n && (xi.set(n, e), gs.set(e, n)), e;
}
const Fi = (n) => gs.get(n);
function Yh(n, e, { blocked: t, upgrade: r, blocking: i, terminated: o } = {}) {
  const a = indexedDB.open(n, e), u = st(a);
  return r && a.addEventListener("upgradeneeded", (h) => {
    r(st(a.result), h.oldVersion, h.newVersion, st(a.transaction), h);
  }), t && a.addEventListener("blocked", (h) => t(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    h.oldVersion,
    h.newVersion,
    h
  )), u.then((h) => {
    o && h.addEventListener("close", () => o()), i && h.addEventListener("versionchange", (d) => i(d.oldVersion, d.newVersion, d));
  }).catch(() => {
  }), u;
}
const Jh = ["get", "getKey", "getAll", "getAllKeys", "count"], Xh = ["put", "add", "delete", "clear"], Ui = /* @__PURE__ */ new Map();
function ua(n, e) {
  if (!(n instanceof IDBDatabase && !(e in n) && typeof e == "string"))
    return;
  if (Ui.get(e))
    return Ui.get(e);
  const t = e.replace(/FromIndex$/, ""), r = e !== t, i = Xh.includes(t);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(t in (r ? IDBIndex : IDBObjectStore).prototype) || !(i || Jh.includes(t))
  )
    return;
  const o = async function(a, ...u) {
    const h = this.transaction(a, i ? "readwrite" : "readonly");
    let d = h.store;
    return r && (d = d.index(u.shift())), (await Promise.all([
      d[t](...u),
      i && h.done
    ]))[0];
  };
  return Ui.set(e, o), o;
}
Kh((n) => ({
  ...n,
  get: (e, t, r) => ua(e, t) || n.get(e, t, r),
  has: (e, t) => !!ua(e, t) || n.has(e, t)
}));
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Zh {
  constructor(e) {
    this.container = e;
  }
  // In initial implementation, this will be called by installations on
  // auth token refresh, and installations will send this string.
  getPlatformInfoString() {
    return this.container.getProviders().map((t) => {
      if (ed(t)) {
        const r = t.getImmediate();
        return `${r.library}/${r.version}`;
      } else
        return null;
    }).filter((t) => t).join(" ");
  }
}
function ed(n) {
  const e = n.getComponent();
  return (e == null ? void 0 : e.type) === "VERSION";
}
const Qi = "@firebase/app", la = "0.10.13";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ze = new ms("@firebase/app"), td = "@firebase/app-compat", nd = "@firebase/analytics-compat", rd = "@firebase/analytics", id = "@firebase/app-check-compat", sd = "@firebase/app-check", od = "@firebase/auth", ad = "@firebase/auth-compat", cd = "@firebase/database", ud = "@firebase/data-connect", ld = "@firebase/database-compat", hd = "@firebase/functions", dd = "@firebase/functions-compat", fd = "@firebase/installations", pd = "@firebase/installations-compat", md = "@firebase/messaging", gd = "@firebase/messaging-compat", _d = "@firebase/performance", yd = "@firebase/performance-compat", vd = "@firebase/remote-config", Ed = "@firebase/remote-config-compat", Td = "@firebase/storage", Id = "@firebase/storage-compat", wd = "@firebase/firestore", Ad = "@firebase/vertexai-preview", Rd = "@firebase/firestore-compat", Sd = "firebase", Pd = "10.14.1";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Yi = "[DEFAULT]", Cd = {
  [Qi]: "fire-core",
  [td]: "fire-core-compat",
  [rd]: "fire-analytics",
  [nd]: "fire-analytics-compat",
  [sd]: "fire-app-check",
  [id]: "fire-app-check-compat",
  [od]: "fire-auth",
  [ad]: "fire-auth-compat",
  [cd]: "fire-rtdb",
  [ud]: "fire-data-connect",
  [ld]: "fire-rtdb-compat",
  [hd]: "fire-fn",
  [dd]: "fire-fn-compat",
  [fd]: "fire-iid",
  [pd]: "fire-iid-compat",
  [md]: "fire-fcm",
  [gd]: "fire-fcm-compat",
  [_d]: "fire-perf",
  [yd]: "fire-perf-compat",
  [vd]: "fire-rc",
  [Ed]: "fire-rc-compat",
  [Td]: "fire-gcs",
  [Id]: "fire-gcs-compat",
  [wd]: "fire-fst",
  [Rd]: "fire-fst-compat",
  [Ad]: "fire-vertex",
  "fire-js": "fire-js",
  [Sd]: "fire-js-all"
};
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Lr = /* @__PURE__ */ new Map(), bd = /* @__PURE__ */ new Map(), Ji = /* @__PURE__ */ new Map();
function ha(n, e) {
  try {
    n.container.addComponent(e);
  } catch (t) {
    ze.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`, t);
  }
}
function $t(n) {
  const e = n.name;
  if (Ji.has(e))
    return ze.debug(`There were multiple attempts to register component ${e}.`), !1;
  Ji.set(e, n);
  for (const t of Lr.values())
    ha(t, n);
  for (const t of bd.values())
    ha(t, n);
  return !0;
}
function _s(n, e) {
  const t = n.container.getProvider("heartbeat").getImmediate({ optional: !0 });
  return t && t.triggerHeartbeat(), n.container.getProvider(e);
}
function Ue(n) {
  return n.settings !== void 0;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const kd = {
  "no-app": "No Firebase App '{$appName}' has been created - call initializeApp() first",
  "bad-app-name": "Illegal App name: '{$appName}'",
  "duplicate-app": "Firebase App named '{$appName}' already exists with different options or config",
  "app-deleted": "Firebase App named '{$appName}' already deleted",
  "server-app-deleted": "Firebase Server App has been deleted",
  "no-options": "Need to provide options, when not being deployed to hosting via source.",
  "invalid-app-argument": "firebase.{$appName}() takes either no argument or a Firebase App instance.",
  "invalid-log-argument": "First argument to `onLog` must be null or a function.",
  "idb-open": "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-get": "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-set": "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-delete": "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
  "finalization-registry-not-supported": "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
  "invalid-server-app-environment": "FirebaseServerApp is not for use in browser environments."
}, ot = new zn("app", "Firebase", kd);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Vd {
  constructor(e, t, r) {
    this._isDeleted = !1, this._options = Object.assign({}, e), this._config = Object.assign({}, t), this._name = t.name, this._automaticDataCollectionEnabled = t.automaticDataCollectionEnabled, this._container = r, this.container.addComponent(new It(
      "app",
      () => this,
      "PUBLIC"
      /* ComponentType.PUBLIC */
    ));
  }
  get automaticDataCollectionEnabled() {
    return this.checkDestroyed(), this._automaticDataCollectionEnabled;
  }
  set automaticDataCollectionEnabled(e) {
    this.checkDestroyed(), this._automaticDataCollectionEnabled = e;
  }
  get name() {
    return this.checkDestroyed(), this._name;
  }
  get options() {
    return this.checkDestroyed(), this._options;
  }
  get config() {
    return this.checkDestroyed(), this._config;
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(e) {
    this._isDeleted = e;
  }
  /**
   * This function will throw an Error if the App has already been deleted -
   * use before performing API actions on the App.
   */
  checkDestroyed() {
    if (this.isDeleted)
      throw ot.create("app-deleted", { appName: this._name });
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Xt = Pd;
function Sc(n, e = {}) {
  let t = n;
  typeof e != "object" && (e = { name: e });
  const r = Object.assign({ name: Yi, automaticDataCollectionEnabled: !1 }, e), i = r.name;
  if (typeof i != "string" || !i)
    throw ot.create("bad-app-name", {
      appName: String(i)
    });
  if (t || (t = Ic()), !t)
    throw ot.create(
      "no-options"
      /* AppError.NO_OPTIONS */
    );
  const o = Lr.get(i);
  if (o) {
    if (Or(t, o.options) && Or(r, o.config))
      return o;
    throw ot.create("duplicate-app", { appName: i });
  }
  const a = new xh(i);
  for (const h of Ji.values())
    a.addComponent(h);
  const u = new Vd(t, r, a);
  return Lr.set(i, u), u;
}
function Pc(n = Yi) {
  const e = Lr.get(n);
  if (!e && n === Yi && Ic())
    return Sc();
  if (!e)
    throw ot.create("no-app", { appName: n });
  return e;
}
function at(n, e, t) {
  var r;
  let i = (r = Cd[n]) !== null && r !== void 0 ? r : n;
  t && (i += `-${t}`);
  const o = i.match(/\s|\//), a = e.match(/\s|\//);
  if (o || a) {
    const u = [
      `Unable to register library "${i}" with version "${e}":`
    ];
    o && u.push(`library name "${i}" contains illegal characters (whitespace or "/")`), o && a && u.push("and"), a && u.push(`version name "${e}" contains illegal characters (whitespace or "/")`), ze.warn(u.join(" "));
    return;
  }
  $t(new It(
    `${i}-version`,
    () => ({ library: i, version: e }),
    "VERSION"
    /* ComponentType.VERSION */
  ));
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Dd = "firebase-heartbeat-database", Nd = 1, On = "firebase-heartbeat-store";
let Bi = null;
function Cc() {
  return Bi || (Bi = Yh(Dd, Nd, {
    upgrade: (n, e) => {
      switch (e) {
        case 0:
          try {
            n.createObjectStore(On);
          } catch (t) {
            console.warn(t);
          }
      }
    }
  }).catch((n) => {
    throw ot.create("idb-open", {
      originalErrorMessage: n.message
    });
  })), Bi;
}
async function Od(n) {
  try {
    const t = (await Cc()).transaction(On), r = await t.objectStore(On).get(bc(n));
    return await t.done, r;
  } catch (e) {
    if (e instanceof Ge)
      ze.warn(e.message);
    else {
      const t = ot.create("idb-get", {
        originalErrorMessage: e == null ? void 0 : e.message
      });
      ze.warn(t.message);
    }
  }
}
async function da(n, e) {
  try {
    const r = (await Cc()).transaction(On, "readwrite");
    await r.objectStore(On).put(e, bc(n)), await r.done;
  } catch (t) {
    if (t instanceof Ge)
      ze.warn(t.message);
    else {
      const r = ot.create("idb-set", {
        originalErrorMessage: t == null ? void 0 : t.message
      });
      ze.warn(r.message);
    }
  }
}
function bc(n) {
  return `${n.name}!${n.options.appId}`;
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ld = 1024, Md = 30 * 24 * 60 * 60 * 1e3;
class xd {
  constructor(e) {
    this.container = e, this._heartbeatsCache = null;
    const t = this.container.getProvider("app").getImmediate();
    this._storage = new Ud(t), this._heartbeatsCachePromise = this._storage.read().then((r) => (this._heartbeatsCache = r, r));
  }
  /**
   * Called to report a heartbeat. The function will generate
   * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
   * to IndexedDB.
   * Note that we only store one heartbeat per day. So if a heartbeat for today is
   * already logged, subsequent calls to this function in the same day will be ignored.
   */
  async triggerHeartbeat() {
    var e, t;
    try {
      const i = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(), o = fa();
      return ((e = this._heartbeatsCache) === null || e === void 0 ? void 0 : e.heartbeats) == null && (this._heartbeatsCache = await this._heartbeatsCachePromise, ((t = this._heartbeatsCache) === null || t === void 0 ? void 0 : t.heartbeats) == null) || this._heartbeatsCache.lastSentHeartbeatDate === o || this._heartbeatsCache.heartbeats.some((a) => a.date === o) ? void 0 : (this._heartbeatsCache.heartbeats.push({ date: o, agent: i }), this._heartbeatsCache.heartbeats = this._heartbeatsCache.heartbeats.filter((a) => {
        const u = new Date(a.date).valueOf();
        return Date.now() - u <= Md;
      }), this._storage.overwrite(this._heartbeatsCache));
    } catch (r) {
      ze.warn(r);
    }
  }
  /**
   * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
   * It also clears all heartbeats from memory as well as in IndexedDB.
   *
   * NOTE: Consuming product SDKs should not send the header if this method
   * returns an empty string.
   */
  async getHeartbeatsHeader() {
    var e;
    try {
      if (this._heartbeatsCache === null && await this._heartbeatsCachePromise, ((e = this._heartbeatsCache) === null || e === void 0 ? void 0 : e.heartbeats) == null || this._heartbeatsCache.heartbeats.length === 0)
        return "";
      const t = fa(), { heartbeatsToSend: r, unsentEntries: i } = Fd(this._heartbeatsCache.heartbeats), o = Nr(JSON.stringify({ version: 2, heartbeats: r }));
      return this._heartbeatsCache.lastSentHeartbeatDate = t, i.length > 0 ? (this._heartbeatsCache.heartbeats = i, await this._storage.overwrite(this._heartbeatsCache)) : (this._heartbeatsCache.heartbeats = [], this._storage.overwrite(this._heartbeatsCache)), o;
    } catch (t) {
      return ze.warn(t), "";
    }
  }
}
function fa() {
  return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function Fd(n, e = Ld) {
  const t = [];
  let r = n.slice();
  for (const i of n) {
    const o = t.find((a) => a.agent === i.agent);
    if (o) {
      if (o.dates.push(i.date), pa(t) > e) {
        o.dates.pop();
        break;
      }
    } else if (t.push({
      agent: i.agent,
      dates: [i.date]
    }), pa(t) > e) {
      t.pop();
      break;
    }
    r = r.slice(1);
  }
  return {
    heartbeatsToSend: t,
    unsentEntries: r
  };
}
class Ud {
  constructor(e) {
    this.app = e, this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
  }
  async runIndexedDBEnvironmentCheck() {
    return Rh() ? Sh().then(() => !0).catch(() => !1) : !1;
  }
  /**
   * Read all heartbeats.
   */
  async read() {
    if (await this._canUseIndexedDBPromise) {
      const t = await Od(this.app);
      return t != null && t.heartbeats ? t : { heartbeats: [] };
    } else
      return { heartbeats: [] };
  }
  // overwrite the storage with the provided heartbeats
  async overwrite(e) {
    var t;
    if (await this._canUseIndexedDBPromise) {
      const i = await this.read();
      return da(this.app, {
        lastSentHeartbeatDate: (t = e.lastSentHeartbeatDate) !== null && t !== void 0 ? t : i.lastSentHeartbeatDate,
        heartbeats: e.heartbeats
      });
    } else
      return;
  }
  // add heartbeats
  async add(e) {
    var t;
    if (await this._canUseIndexedDBPromise) {
      const i = await this.read();
      return da(this.app, {
        lastSentHeartbeatDate: (t = e.lastSentHeartbeatDate) !== null && t !== void 0 ? t : i.lastSentHeartbeatDate,
        heartbeats: [
          ...i.heartbeats,
          ...e.heartbeats
        ]
      });
    } else
      return;
  }
}
function pa(n) {
  return Nr(
    // heartbeatsCache wrapper properties
    JSON.stringify({ version: 2, heartbeats: n })
  ).length;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Bd(n) {
  $t(new It(
    "platform-logger",
    (e) => new Zh(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), $t(new It(
    "heartbeat",
    (e) => new xd(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), at(Qi, la, n), at(Qi, la, "esm2017"), at("fire-js", "");
}
Bd("");
function ys(n, e) {
  var t = {};
  for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && e.indexOf(r) < 0 && (t[r] = n[r]);
  if (n != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(n); i < r.length; i++)
      e.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(n, r[i]) && (t[r[i]] = n[r[i]]);
  return t;
}
function kc() {
  return {
    "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."
  };
}
const jd = kc, Vc = new zn("auth", "Firebase", kc());
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Mr = new ms("@firebase/auth");
function qd(n, ...e) {
  Mr.logLevel <= j.WARN && Mr.warn(`Auth (${Xt}): ${n}`, ...e);
}
function Rr(n, ...e) {
  Mr.logLevel <= j.ERROR && Mr.error(`Auth (${Xt}): ${n}`, ...e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function be(n, ...e) {
  throw vs(n, ...e);
}
function ke(n, ...e) {
  return vs(n, ...e);
}
function Dc(n, e, t) {
  const r = Object.assign(Object.assign({}, jd()), { [e]: t });
  return new zn("auth", "Firebase", r).create(e, {
    appName: n.name
  });
}
function ct(n) {
  return Dc(n, "operation-not-supported-in-this-environment", "Operations that alter the current user are not supported in conjunction with FirebaseServerApp");
}
function vs(n, ...e) {
  if (typeof n != "string") {
    const t = e[0], r = [...e.slice(1)];
    return r[0] && (r[0].appName = n.name), n._errorFactory.create(t, ...r);
  }
  return Vc.create(n, ...e);
}
function M(n, e, ...t) {
  if (!n)
    throw vs(e, ...t);
}
function Be(n) {
  const e = "INTERNAL ASSERTION FAILED: " + n;
  throw Rr(e), new Error(e);
}
function We(n, e) {
  n || Be(e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Xi() {
  var n;
  return typeof self < "u" && ((n = self.location) === null || n === void 0 ? void 0 : n.href) || "";
}
function $d() {
  return ma() === "http:" || ma() === "https:";
}
function ma() {
  var n;
  return typeof self < "u" && ((n = self.location) === null || n === void 0 ? void 0 : n.protocol) || null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function zd() {
  return typeof navigator < "u" && navigator && "onLine" in navigator && typeof navigator.onLine == "boolean" && // Apply only for traditional web apps and Chrome extensions.
  // This is especially true for Cordova apps which have unreliable
  // navigator.onLine behavior unless cordova-plugin-network-information is
  // installed which overwrites the native navigator.onLine value and
  // defines navigator.connection.
  ($d() || Th() || "connection" in navigator) ? navigator.onLine : !0;
}
function Wd() {
  if (typeof navigator > "u")
    return null;
  const n = navigator;
  return (
    // Most reliable, but only supported in Chrome/Firefox.
    n.languages && n.languages[0] || // Supported in most browsers, but returns the language of the browser
    // UI, not the language set in browser settings.
    n.language || // Couldn't determine language.
    null
  );
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Hn {
  constructor(e, t) {
    this.shortDelay = e, this.longDelay = t, We(t > e, "Short delay should be less than long delay!"), this.isMobile = yh() || Ih();
  }
  get() {
    return zd() ? this.isMobile ? this.longDelay : this.shortDelay : Math.min(5e3, this.shortDelay);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Es(n, e) {
  We(n.emulator, "Emulator should always be set here");
  const { url: t } = n.emulator;
  return e ? `${t}${e.startsWith("/") ? e.slice(1) : e}` : t;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Nc {
  static initialize(e, t, r) {
    this.fetchImpl = e, t && (this.headersImpl = t), r && (this.responseImpl = r);
  }
  static fetch() {
    if (this.fetchImpl)
      return this.fetchImpl;
    if (typeof self < "u" && "fetch" in self)
      return self.fetch;
    if (typeof globalThis < "u" && globalThis.fetch)
      return globalThis.fetch;
    if (typeof fetch < "u")
      return fetch;
    Be("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
  static headers() {
    if (this.headersImpl)
      return this.headersImpl;
    if (typeof self < "u" && "Headers" in self)
      return self.Headers;
    if (typeof globalThis < "u" && globalThis.Headers)
      return globalThis.Headers;
    if (typeof Headers < "u")
      return Headers;
    Be("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
  static response() {
    if (this.responseImpl)
      return this.responseImpl;
    if (typeof self < "u" && "Response" in self)
      return self.Response;
    if (typeof globalThis < "u" && globalThis.Response)
      return globalThis.Response;
    if (typeof Response < "u")
      return Response;
    Be("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Hd = {
  // Custom token errors.
  CREDENTIAL_MISMATCH: "custom-token-mismatch",
  // This can only happen if the SDK sends a bad request.
  MISSING_CUSTOM_TOKEN: "internal-error",
  // Create Auth URI errors.
  INVALID_IDENTIFIER: "invalid-email",
  // This can only happen if the SDK sends a bad request.
  MISSING_CONTINUE_URI: "internal-error",
  // Sign in with email and password errors (some apply to sign up too).
  INVALID_PASSWORD: "wrong-password",
  // This can only happen if the SDK sends a bad request.
  MISSING_PASSWORD: "missing-password",
  // Thrown if Email Enumeration Protection is enabled in the project and the email or password is
  // invalid.
  INVALID_LOGIN_CREDENTIALS: "invalid-credential",
  // Sign up with email and password errors.
  EMAIL_EXISTS: "email-already-in-use",
  PASSWORD_LOGIN_DISABLED: "operation-not-allowed",
  // Verify assertion for sign in with credential errors:
  INVALID_IDP_RESPONSE: "invalid-credential",
  INVALID_PENDING_TOKEN: "invalid-credential",
  FEDERATED_USER_ID_ALREADY_LINKED: "credential-already-in-use",
  // This can only happen if the SDK sends a bad request.
  MISSING_REQ_TYPE: "internal-error",
  // Send Password reset email errors:
  EMAIL_NOT_FOUND: "user-not-found",
  RESET_PASSWORD_EXCEED_LIMIT: "too-many-requests",
  EXPIRED_OOB_CODE: "expired-action-code",
  INVALID_OOB_CODE: "invalid-action-code",
  // This can only happen if the SDK sends a bad request.
  MISSING_OOB_CODE: "internal-error",
  // Operations that require ID token in request:
  CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "requires-recent-login",
  INVALID_ID_TOKEN: "invalid-user-token",
  TOKEN_EXPIRED: "user-token-expired",
  USER_NOT_FOUND: "user-token-expired",
  // Other errors.
  TOO_MANY_ATTEMPTS_TRY_LATER: "too-many-requests",
  PASSWORD_DOES_NOT_MEET_REQUIREMENTS: "password-does-not-meet-requirements",
  // Phone Auth related errors.
  INVALID_CODE: "invalid-verification-code",
  INVALID_SESSION_INFO: "invalid-verification-id",
  INVALID_TEMPORARY_PROOF: "invalid-credential",
  MISSING_SESSION_INFO: "missing-verification-id",
  SESSION_EXPIRED: "code-expired",
  // Other action code errors when additional settings passed.
  // MISSING_CONTINUE_URI is getting mapped to INTERNAL_ERROR above.
  // This is OK as this error will be caught by client side validation.
  MISSING_ANDROID_PACKAGE_NAME: "missing-android-pkg-name",
  UNAUTHORIZED_DOMAIN: "unauthorized-continue-uri",
  // getProjectConfig errors when clientId is passed.
  INVALID_OAUTH_CLIENT_ID: "invalid-oauth-client-id",
  // User actions (sign-up or deletion) disabled errors.
  ADMIN_ONLY_OPERATION: "admin-restricted-operation",
  // Multi factor related errors.
  INVALID_MFA_PENDING_CREDENTIAL: "invalid-multi-factor-session",
  MFA_ENROLLMENT_NOT_FOUND: "multi-factor-info-not-found",
  MISSING_MFA_ENROLLMENT_ID: "missing-multi-factor-info",
  MISSING_MFA_PENDING_CREDENTIAL: "missing-multi-factor-session",
  SECOND_FACTOR_EXISTS: "second-factor-already-in-use",
  SECOND_FACTOR_LIMIT_EXCEEDED: "maximum-second-factor-count-exceeded",
  // Blocking functions related errors.
  BLOCKING_FUNCTION_ERROR_RESPONSE: "internal-error",
  // Recaptcha related errors.
  RECAPTCHA_NOT_ENABLED: "recaptcha-not-enabled",
  MISSING_RECAPTCHA_TOKEN: "missing-recaptcha-token",
  INVALID_RECAPTCHA_TOKEN: "invalid-recaptcha-token",
  INVALID_RECAPTCHA_ACTION: "invalid-recaptcha-action",
  MISSING_CLIENT_TYPE: "missing-client-type",
  MISSING_RECAPTCHA_VERSION: "missing-recaptcha-version",
  INVALID_RECAPTCHA_VERSION: "invalid-recaptcha-version",
  INVALID_REQ_TYPE: "invalid-req-type"
  /* AuthErrorCode.INVALID_REQ_TYPE */
};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Kd = new Hn(3e4, 6e4);
function Pt(n, e) {
  return n.tenantId && !e.tenantId ? Object.assign(Object.assign({}, e), { tenantId: n.tenantId }) : e;
}
async function pt(n, e, t, r, i = {}) {
  return Oc(n, i, async () => {
    let o = {}, a = {};
    r && (e === "GET" ? a = r : o = {
      body: JSON.stringify(r)
    });
    const u = Wn(Object.assign({ key: n.config.apiKey }, a)).slice(1), h = await n._getAdditionalHeaders();
    h[
      "Content-Type"
      /* HttpHeader.CONTENT_TYPE */
    ] = "application/json", n.languageCode && (h[
      "X-Firebase-Locale"
      /* HttpHeader.X_FIREBASE_LOCALE */
    ] = n.languageCode);
    const d = Object.assign({
      method: e,
      headers: h
    }, o);
    return Eh() || (d.referrerPolicy = "no-referrer"), Nc.fetch()(Lc(n, n.config.apiHost, t, u), d);
  });
}
async function Oc(n, e, t) {
  n._canInitEmulator = !1;
  const r = Object.assign(Object.assign({}, Hd), e);
  try {
    const i = new Qd(n), o = await Promise.race([
      t(),
      i.promise
    ]);
    i.clearNetworkTimeout();
    const a = await o.json();
    if ("needConfirmation" in a)
      throw Er(n, "account-exists-with-different-credential", a);
    if (o.ok && !("errorMessage" in a))
      return a;
    {
      const u = o.ok ? a.errorMessage : a.error.message, [h, d] = u.split(" : ");
      if (h === "FEDERATED_USER_ID_ALREADY_LINKED")
        throw Er(n, "credential-already-in-use", a);
      if (h === "EMAIL_EXISTS")
        throw Er(n, "email-already-in-use", a);
      if (h === "USER_DISABLED")
        throw Er(n, "user-disabled", a);
      const m = r[h] || h.toLowerCase().replace(/[_\s]+/g, "-");
      if (d)
        throw Dc(n, m, d);
      be(n, m);
    }
  } catch (i) {
    if (i instanceof Ge)
      throw i;
    be(n, "network-request-failed", { message: String(i) });
  }
}
async function Jr(n, e, t, r, i = {}) {
  const o = await pt(n, e, t, r, i);
  return "mfaPendingCredential" in o && be(n, "multi-factor-auth-required", {
    _serverResponse: o
  }), o;
}
function Lc(n, e, t, r) {
  const i = `${e}${t}?${r}`;
  return n.config.emulator ? Es(n.config, i) : `${n.config.apiScheme}://${i}`;
}
function Gd(n) {
  switch (n) {
    case "ENFORCE":
      return "ENFORCE";
    case "AUDIT":
      return "AUDIT";
    case "OFF":
      return "OFF";
    default:
      return "ENFORCEMENT_STATE_UNSPECIFIED";
  }
}
class Qd {
  constructor(e) {
    this.auth = e, this.timer = null, this.promise = new Promise((t, r) => {
      this.timer = setTimeout(() => r(ke(
        this.auth,
        "network-request-failed"
        /* AuthErrorCode.NETWORK_REQUEST_FAILED */
      )), Kd.get());
    });
  }
  clearNetworkTimeout() {
    clearTimeout(this.timer);
  }
}
function Er(n, e, t) {
  const r = {
    appName: n.name
  };
  t.email && (r.email = t.email), t.phoneNumber && (r.phoneNumber = t.phoneNumber);
  const i = ke(n, e, r);
  return i.customData._tokenResponse = t, i;
}
function ga(n) {
  return n !== void 0 && n.enterprise !== void 0;
}
class Yd {
  constructor(e) {
    if (this.siteKey = "", this.recaptchaEnforcementState = [], e.recaptchaKey === void 0)
      throw new Error("recaptchaKey undefined");
    this.siteKey = e.recaptchaKey.split("/")[3], this.recaptchaEnforcementState = e.recaptchaEnforcementState;
  }
  /**
   * Returns the reCAPTCHA Enterprise enforcement state for the given provider.
   *
   * @param providerStr - The provider whose enforcement state is to be returned.
   * @returns The reCAPTCHA Enterprise enforcement state for the given provider.
   */
  getProviderEnforcementState(e) {
    if (!this.recaptchaEnforcementState || this.recaptchaEnforcementState.length === 0)
      return null;
    for (const t of this.recaptchaEnforcementState)
      if (t.provider && t.provider === e)
        return Gd(t.enforcementState);
    return null;
  }
  /**
   * Returns true if the reCAPTCHA Enterprise enforcement state for the provider is set to ENFORCE or AUDIT.
   *
   * @param providerStr - The provider whose enablement state is to be returned.
   * @returns Whether or not reCAPTCHA Enterprise protection is enabled for the given provider.
   */
  isProviderEnabled(e) {
    return this.getProviderEnforcementState(e) === "ENFORCE" || this.getProviderEnforcementState(e) === "AUDIT";
  }
}
async function Jd(n, e) {
  return pt(n, "GET", "/v2/recaptchaConfig", Pt(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Xd(n, e) {
  return pt(n, "POST", "/v1/accounts:delete", e);
}
async function Mc(n, e) {
  return pt(n, "POST", "/v1/accounts:lookup", e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function bn(n) {
  if (n)
    try {
      const e = new Date(Number(n));
      if (!isNaN(e.getTime()))
        return e.toUTCString();
    } catch {
    }
}
async function Zd(n, e = !1) {
  const t = Ie(n), r = await t.getIdToken(e), i = Ts(r);
  M(
    i && i.exp && i.auth_time && i.iat,
    t.auth,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  const o = typeof i.firebase == "object" ? i.firebase : void 0, a = o == null ? void 0 : o.sign_in_provider;
  return {
    claims: i,
    token: r,
    authTime: bn(ji(i.auth_time)),
    issuedAtTime: bn(ji(i.iat)),
    expirationTime: bn(ji(i.exp)),
    signInProvider: a || null,
    signInSecondFactor: (o == null ? void 0 : o.sign_in_second_factor) || null
  };
}
function ji(n) {
  return Number(n) * 1e3;
}
function Ts(n) {
  const [e, t, r] = n.split(".");
  if (e === void 0 || t === void 0 || r === void 0)
    return Rr("JWT malformed, contained fewer than 3 sections"), null;
  try {
    const i = Ec(t);
    return i ? JSON.parse(i) : (Rr("Failed to decode base64 JWT payload"), null);
  } catch (i) {
    return Rr("Caught error parsing JWT payload as JSON", i == null ? void 0 : i.toString()), null;
  }
}
function _a(n) {
  const e = Ts(n);
  return M(
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), M(
    typeof e.exp < "u",
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), M(
    typeof e.iat < "u",
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), Number(e.exp) - Number(e.iat);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Ln(n, e, t = !1) {
  if (t)
    return e;
  try {
    return await e;
  } catch (r) {
    throw r instanceof Ge && ef(r) && n.auth.currentUser === n && await n.auth.signOut(), r;
  }
}
function ef({ code: n }) {
  return n === "auth/user-disabled" || n === "auth/user-token-expired";
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class tf {
  constructor(e) {
    this.user = e, this.isRunning = !1, this.timerId = null, this.errorBackoff = 3e4;
  }
  _start() {
    this.isRunning || (this.isRunning = !0, this.schedule());
  }
  _stop() {
    this.isRunning && (this.isRunning = !1, this.timerId !== null && clearTimeout(this.timerId));
  }
  getInterval(e) {
    var t;
    if (e) {
      const r = this.errorBackoff;
      return this.errorBackoff = Math.min(
        this.errorBackoff * 2,
        96e4
        /* Duration.RETRY_BACKOFF_MAX */
      ), r;
    } else {
      this.errorBackoff = 3e4;
      const i = ((t = this.user.stsTokenManager.expirationTime) !== null && t !== void 0 ? t : 0) - Date.now() - 3e5;
      return Math.max(0, i);
    }
  }
  schedule(e = !1) {
    if (!this.isRunning)
      return;
    const t = this.getInterval(e);
    this.timerId = setTimeout(async () => {
      await this.iteration();
    }, t);
  }
  async iteration() {
    try {
      await this.user.getIdToken(!0);
    } catch (e) {
      (e == null ? void 0 : e.code) === "auth/network-request-failed" && this.schedule(
        /* wasError */
        !0
      );
      return;
    }
    this.schedule();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Zi {
  constructor(e, t) {
    this.createdAt = e, this.lastLoginAt = t, this._initializeTime();
  }
  _initializeTime() {
    this.lastSignInTime = bn(this.lastLoginAt), this.creationTime = bn(this.createdAt);
  }
  _copy(e) {
    this.createdAt = e.createdAt, this.lastLoginAt = e.lastLoginAt, this._initializeTime();
  }
  toJSON() {
    return {
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt
    };
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function xr(n) {
  var e;
  const t = n.auth, r = await n.getIdToken(), i = await Ln(n, Mc(t, { idToken: r }));
  M(
    i == null ? void 0 : i.users.length,
    t,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  );
  const o = i.users[0];
  n._notifyReloadListener(o);
  const a = !((e = o.providerUserInfo) === null || e === void 0) && e.length ? xc(o.providerUserInfo) : [], u = rf(n.providerData, a), h = n.isAnonymous, d = !(n.email && o.passwordHash) && !(u != null && u.length), m = h ? d : !1, w = {
    uid: o.localId,
    displayName: o.displayName || null,
    photoURL: o.photoUrl || null,
    email: o.email || null,
    emailVerified: o.emailVerified || !1,
    phoneNumber: o.phoneNumber || null,
    tenantId: o.tenantId || null,
    providerData: u,
    metadata: new Zi(o.createdAt, o.lastLoginAt),
    isAnonymous: m
  };
  Object.assign(n, w);
}
async function nf(n) {
  const e = Ie(n);
  await xr(e), await e.auth._persistUserIfCurrent(e), e.auth._notifyListenersIfCurrent(e);
}
function rf(n, e) {
  return [...n.filter((r) => !e.some((i) => i.providerId === r.providerId)), ...e];
}
function xc(n) {
  return n.map((e) => {
    var { providerId: t } = e, r = ys(e, ["providerId"]);
    return {
      providerId: t,
      uid: r.rawId || "",
      displayName: r.displayName || null,
      email: r.email || null,
      phoneNumber: r.phoneNumber || null,
      photoURL: r.photoUrl || null
    };
  });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function sf(n, e) {
  const t = await Oc(n, {}, async () => {
    const r = Wn({
      grant_type: "refresh_token",
      refresh_token: e
    }).slice(1), { tokenApiHost: i, apiKey: o } = n.config, a = Lc(n, i, "/v1/token", `key=${o}`), u = await n._getAdditionalHeaders();
    return u[
      "Content-Type"
      /* HttpHeader.CONTENT_TYPE */
    ] = "application/x-www-form-urlencoded", Nc.fetch()(a, {
      method: "POST",
      headers: u,
      body: r
    });
  });
  return {
    accessToken: t.access_token,
    expiresIn: t.expires_in,
    refreshToken: t.refresh_token
  };
}
async function of(n, e) {
  return pt(n, "POST", "/v2/accounts:revokeToken", Pt(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ut {
  constructor() {
    this.refreshToken = null, this.accessToken = null, this.expirationTime = null;
  }
  get isExpired() {
    return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
  }
  updateFromServerResponse(e) {
    M(
      e.idToken,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), M(
      typeof e.idToken < "u",
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), M(
      typeof e.refreshToken < "u",
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const t = "expiresIn" in e && typeof e.expiresIn < "u" ? Number(e.expiresIn) : _a(e.idToken);
    this.updateTokensAndExpiration(e.idToken, e.refreshToken, t);
  }
  updateFromIdToken(e) {
    M(
      e.length !== 0,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const t = _a(e);
    this.updateTokensAndExpiration(e, null, t);
  }
  async getToken(e, t = !1) {
    return !t && this.accessToken && !this.isExpired ? this.accessToken : (M(
      this.refreshToken,
      e,
      "user-token-expired"
      /* AuthErrorCode.TOKEN_EXPIRED */
    ), this.refreshToken ? (await this.refresh(e, this.refreshToken), this.accessToken) : null);
  }
  clearRefreshToken() {
    this.refreshToken = null;
  }
  async refresh(e, t) {
    const { accessToken: r, refreshToken: i, expiresIn: o } = await sf(e, t);
    this.updateTokensAndExpiration(r, i, Number(o));
  }
  updateTokensAndExpiration(e, t, r) {
    this.refreshToken = t || null, this.accessToken = e || null, this.expirationTime = Date.now() + r * 1e3;
  }
  static fromJSON(e, t) {
    const { refreshToken: r, accessToken: i, expirationTime: o } = t, a = new Ut();
    return r && (M(typeof r == "string", "internal-error", {
      appName: e
    }), a.refreshToken = r), i && (M(typeof i == "string", "internal-error", {
      appName: e
    }), a.accessToken = i), o && (M(typeof o == "number", "internal-error", {
      appName: e
    }), a.expirationTime = o), a;
  }
  toJSON() {
    return {
      refreshToken: this.refreshToken,
      accessToken: this.accessToken,
      expirationTime: this.expirationTime
    };
  }
  _assign(e) {
    this.accessToken = e.accessToken, this.refreshToken = e.refreshToken, this.expirationTime = e.expirationTime;
  }
  _clone() {
    return Object.assign(new Ut(), this.toJSON());
  }
  _performRefresh() {
    return Be("not implemented");
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ze(n, e) {
  M(typeof n == "string" || typeof n > "u", "internal-error", { appName: e });
}
class je {
  constructor(e) {
    var { uid: t, auth: r, stsTokenManager: i } = e, o = ys(e, ["uid", "auth", "stsTokenManager"]);
    this.providerId = "firebase", this.proactiveRefresh = new tf(this), this.reloadUserInfo = null, this.reloadListener = null, this.uid = t, this.auth = r, this.stsTokenManager = i, this.accessToken = i.accessToken, this.displayName = o.displayName || null, this.email = o.email || null, this.emailVerified = o.emailVerified || !1, this.phoneNumber = o.phoneNumber || null, this.photoURL = o.photoURL || null, this.isAnonymous = o.isAnonymous || !1, this.tenantId = o.tenantId || null, this.providerData = o.providerData ? [...o.providerData] : [], this.metadata = new Zi(o.createdAt || void 0, o.lastLoginAt || void 0);
  }
  async getIdToken(e) {
    const t = await Ln(this, this.stsTokenManager.getToken(this.auth, e));
    return M(
      t,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.accessToken !== t && (this.accessToken = t, await this.auth._persistUserIfCurrent(this), this.auth._notifyListenersIfCurrent(this)), t;
  }
  getIdTokenResult(e) {
    return Zd(this, e);
  }
  reload() {
    return nf(this);
  }
  _assign(e) {
    this !== e && (M(
      this.uid === e.uid,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.displayName = e.displayName, this.photoURL = e.photoURL, this.email = e.email, this.emailVerified = e.emailVerified, this.phoneNumber = e.phoneNumber, this.isAnonymous = e.isAnonymous, this.tenantId = e.tenantId, this.providerData = e.providerData.map((t) => Object.assign({}, t)), this.metadata._copy(e.metadata), this.stsTokenManager._assign(e.stsTokenManager));
  }
  _clone(e) {
    const t = new je(Object.assign(Object.assign({}, this), { auth: e, stsTokenManager: this.stsTokenManager._clone() }));
    return t.metadata._copy(this.metadata), t;
  }
  _onReload(e) {
    M(
      !this.reloadListener,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.reloadListener = e, this.reloadUserInfo && (this._notifyReloadListener(this.reloadUserInfo), this.reloadUserInfo = null);
  }
  _notifyReloadListener(e) {
    this.reloadListener ? this.reloadListener(e) : this.reloadUserInfo = e;
  }
  _startProactiveRefresh() {
    this.proactiveRefresh._start();
  }
  _stopProactiveRefresh() {
    this.proactiveRefresh._stop();
  }
  async _updateTokensIfNecessary(e, t = !1) {
    let r = !1;
    e.idToken && e.idToken !== this.stsTokenManager.accessToken && (this.stsTokenManager.updateFromServerResponse(e), r = !0), t && await xr(this), await this.auth._persistUserIfCurrent(this), r && this.auth._notifyListenersIfCurrent(this);
  }
  async delete() {
    if (Ue(this.auth.app))
      return Promise.reject(ct(this.auth));
    const e = await this.getIdToken();
    return await Ln(this, Xd(this.auth, { idToken: e })), this.stsTokenManager.clearRefreshToken(), this.auth.signOut();
  }
  toJSON() {
    return Object.assign(Object.assign({
      uid: this.uid,
      email: this.email || void 0,
      emailVerified: this.emailVerified,
      displayName: this.displayName || void 0,
      isAnonymous: this.isAnonymous,
      photoURL: this.photoURL || void 0,
      phoneNumber: this.phoneNumber || void 0,
      tenantId: this.tenantId || void 0,
      providerData: this.providerData.map((e) => Object.assign({}, e)),
      stsTokenManager: this.stsTokenManager.toJSON(),
      // Redirect event ID must be maintained in case there is a pending
      // redirect event.
      _redirectEventId: this._redirectEventId
    }, this.metadata.toJSON()), {
      // Required for compatibility with the legacy SDK (go/firebase-auth-sdk-persistence-parsing):
      apiKey: this.auth.config.apiKey,
      appName: this.auth.name
    });
  }
  get refreshToken() {
    return this.stsTokenManager.refreshToken || "";
  }
  static _fromJSON(e, t) {
    var r, i, o, a, u, h, d, m;
    const w = (r = t.displayName) !== null && r !== void 0 ? r : void 0, R = (i = t.email) !== null && i !== void 0 ? i : void 0, P = (o = t.phoneNumber) !== null && o !== void 0 ? o : void 0, V = (a = t.photoURL) !== null && a !== void 0 ? a : void 0, N = (u = t.tenantId) !== null && u !== void 0 ? u : void 0, k = (h = t._redirectEventId) !== null && h !== void 0 ? h : void 0, W = (d = t.createdAt) !== null && d !== void 0 ? d : void 0, H = (m = t.lastLoginAt) !== null && m !== void 0 ? m : void 0, { uid: K, emailVerified: ee, isAnonymous: Ae, providerData: te, stsTokenManager: v } = t;
    M(
      K && v,
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const p = Ut.fromJSON(this.name, v);
    M(
      typeof K == "string",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), Ze(w, e.name), Ze(R, e.name), M(
      typeof ee == "boolean",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), M(
      typeof Ae == "boolean",
      e,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), Ze(P, e.name), Ze(V, e.name), Ze(N, e.name), Ze(k, e.name), Ze(W, e.name), Ze(H, e.name);
    const _ = new je({
      uid: K,
      auth: e,
      email: R,
      emailVerified: ee,
      displayName: w,
      isAnonymous: Ae,
      photoURL: V,
      phoneNumber: P,
      tenantId: N,
      stsTokenManager: p,
      createdAt: W,
      lastLoginAt: H
    });
    return te && Array.isArray(te) && (_.providerData = te.map((y) => Object.assign({}, y))), k && (_._redirectEventId = k), _;
  }
  /**
   * Initialize a User from an idToken server response
   * @param auth
   * @param idTokenResponse
   */
  static async _fromIdTokenResponse(e, t, r = !1) {
    const i = new Ut();
    i.updateFromServerResponse(t);
    const o = new je({
      uid: t.localId,
      auth: e,
      stsTokenManager: i,
      isAnonymous: r
    });
    return await xr(o), o;
  }
  /**
   * Initialize a User from an idToken server response
   * @param auth
   * @param idTokenResponse
   */
  static async _fromGetAccountInfoResponse(e, t, r) {
    const i = t.users[0];
    M(
      i.localId !== void 0,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const o = i.providerUserInfo !== void 0 ? xc(i.providerUserInfo) : [], a = !(i.email && i.passwordHash) && !(o != null && o.length), u = new Ut();
    u.updateFromIdToken(r);
    const h = new je({
      uid: i.localId,
      auth: e,
      stsTokenManager: u,
      isAnonymous: a
    }), d = {
      uid: i.localId,
      displayName: i.displayName || null,
      photoURL: i.photoUrl || null,
      email: i.email || null,
      emailVerified: i.emailVerified || !1,
      phoneNumber: i.phoneNumber || null,
      tenantId: i.tenantId || null,
      providerData: o,
      metadata: new Zi(i.createdAt, i.lastLoginAt),
      isAnonymous: !(i.email && i.passwordHash) && !(o != null && o.length)
    };
    return Object.assign(h, d), h;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ya = /* @__PURE__ */ new Map();
function qe(n) {
  We(n instanceof Function, "Expected a class definition");
  let e = ya.get(n);
  return e ? (We(e instanceof n, "Instance stored in cache mismatched with class"), e) : (e = new n(), ya.set(n, e), e);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Fc {
  constructor() {
    this.type = "NONE", this.storage = {};
  }
  async _isAvailable() {
    return !0;
  }
  async _set(e, t) {
    this.storage[e] = t;
  }
  async _get(e) {
    const t = this.storage[e];
    return t === void 0 ? null : t;
  }
  async _remove(e) {
    delete this.storage[e];
  }
  _addListener(e, t) {
  }
  _removeListener(e, t) {
  }
}
Fc.type = "NONE";
const va = Fc;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Sr(n, e, t) {
  return `firebase:${n}:${e}:${t}`;
}
class Bt {
  constructor(e, t, r) {
    this.persistence = e, this.auth = t, this.userKey = r;
    const { config: i, name: o } = this.auth;
    this.fullUserKey = Sr(this.userKey, i.apiKey, o), this.fullPersistenceKey = Sr("persistence", i.apiKey, o), this.boundEventHandler = t._onStorageEvent.bind(t), this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
  }
  setCurrentUser(e) {
    return this.persistence._set(this.fullUserKey, e.toJSON());
  }
  async getCurrentUser() {
    const e = await this.persistence._get(this.fullUserKey);
    return e ? je._fromJSON(this.auth, e) : null;
  }
  removeCurrentUser() {
    return this.persistence._remove(this.fullUserKey);
  }
  savePersistenceForRedirect() {
    return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
  }
  async setPersistence(e) {
    if (this.persistence === e)
      return;
    const t = await this.getCurrentUser();
    if (await this.removeCurrentUser(), this.persistence = e, t)
      return this.setCurrentUser(t);
  }
  delete() {
    this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
  }
  static async create(e, t, r = "authUser") {
    if (!t.length)
      return new Bt(qe(va), e, r);
    const i = (await Promise.all(t.map(async (d) => {
      if (await d._isAvailable())
        return d;
    }))).filter((d) => d);
    let o = i[0] || qe(va);
    const a = Sr(r, e.config.apiKey, e.name);
    let u = null;
    for (const d of t)
      try {
        const m = await d._get(a);
        if (m) {
          const w = je._fromJSON(e, m);
          d !== o && (u = w), o = d;
          break;
        }
      } catch {
      }
    const h = i.filter((d) => d._shouldAllowMigration);
    return !o._shouldAllowMigration || !h.length ? new Bt(o, e, r) : (o = h[0], u && await o._set(a, u.toJSON()), await Promise.all(t.map(async (d) => {
      if (d !== o)
        try {
          await d._remove(a);
        } catch {
        }
    })), new Bt(o, e, r));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ea(n) {
  const e = n.toLowerCase();
  if (e.includes("opera/") || e.includes("opr/") || e.includes("opios/"))
    return "Opera";
  if (qc(e))
    return "IEMobile";
  if (e.includes("msie") || e.includes("trident/"))
    return "IE";
  if (e.includes("edge/"))
    return "Edge";
  if (Uc(e))
    return "Firefox";
  if (e.includes("silk/"))
    return "Silk";
  if (zc(e))
    return "Blackberry";
  if (Wc(e))
    return "Webos";
  if (Bc(e))
    return "Safari";
  if ((e.includes("chrome/") || jc(e)) && !e.includes("edge/"))
    return "Chrome";
  if ($c(e))
    return "Android";
  {
    const t = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/, r = n.match(t);
    if ((r == null ? void 0 : r.length) === 2)
      return r[1];
  }
  return "Other";
}
function Uc(n = ve()) {
  return /firefox\//i.test(n);
}
function Bc(n = ve()) {
  const e = n.toLowerCase();
  return e.includes("safari/") && !e.includes("chrome/") && !e.includes("crios/") && !e.includes("android");
}
function jc(n = ve()) {
  return /crios\//i.test(n);
}
function qc(n = ve()) {
  return /iemobile/i.test(n);
}
function $c(n = ve()) {
  return /android/i.test(n);
}
function zc(n = ve()) {
  return /blackberry/i.test(n);
}
function Wc(n = ve()) {
  return /webos/i.test(n);
}
function Is(n = ve()) {
  return /iphone|ipad|ipod/i.test(n) || /macintosh/i.test(n) && /mobile/i.test(n);
}
function af(n = ve()) {
  var e;
  return Is(n) && !!(!((e = window.navigator) === null || e === void 0) && e.standalone);
}
function cf() {
  return wh() && document.documentMode === 10;
}
function Hc(n = ve()) {
  return Is(n) || $c(n) || Wc(n) || zc(n) || /windows phone/i.test(n) || qc(n);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Kc(n, e = []) {
  let t;
  switch (n) {
    case "Browser":
      t = Ea(ve());
      break;
    case "Worker":
      t = `${Ea(ve())}-${n}`;
      break;
    default:
      t = n;
  }
  const r = e.length ? e.join(",") : "FirebaseCore-web";
  return `${t}/JsCore/${Xt}/${r}`;
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class uf {
  constructor(e) {
    this.auth = e, this.queue = [];
  }
  pushCallback(e, t) {
    const r = (o) => new Promise((a, u) => {
      try {
        const h = e(o);
        a(h);
      } catch (h) {
        u(h);
      }
    });
    r.onAbort = t, this.queue.push(r);
    const i = this.queue.length - 1;
    return () => {
      this.queue[i] = () => Promise.resolve();
    };
  }
  async runMiddleware(e) {
    if (this.auth.currentUser === e)
      return;
    const t = [];
    try {
      for (const r of this.queue)
        await r(e), r.onAbort && t.push(r.onAbort);
    } catch (r) {
      t.reverse();
      for (const i of t)
        try {
          i();
        } catch {
        }
      throw this.auth._errorFactory.create("login-blocked", {
        originalMessage: r == null ? void 0 : r.message
      });
    }
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function lf(n, e = {}) {
  return pt(n, "GET", "/v2/passwordPolicy", Pt(n, e));
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const hf = 6;
class df {
  constructor(e) {
    var t, r, i, o;
    const a = e.customStrengthOptions;
    this.customStrengthOptions = {}, this.customStrengthOptions.minPasswordLength = (t = a.minPasswordLength) !== null && t !== void 0 ? t : hf, a.maxPasswordLength && (this.customStrengthOptions.maxPasswordLength = a.maxPasswordLength), a.containsLowercaseCharacter !== void 0 && (this.customStrengthOptions.containsLowercaseLetter = a.containsLowercaseCharacter), a.containsUppercaseCharacter !== void 0 && (this.customStrengthOptions.containsUppercaseLetter = a.containsUppercaseCharacter), a.containsNumericCharacter !== void 0 && (this.customStrengthOptions.containsNumericCharacter = a.containsNumericCharacter), a.containsNonAlphanumericCharacter !== void 0 && (this.customStrengthOptions.containsNonAlphanumericCharacter = a.containsNonAlphanumericCharacter), this.enforcementState = e.enforcementState, this.enforcementState === "ENFORCEMENT_STATE_UNSPECIFIED" && (this.enforcementState = "OFF"), this.allowedNonAlphanumericCharacters = (i = (r = e.allowedNonAlphanumericCharacters) === null || r === void 0 ? void 0 : r.join("")) !== null && i !== void 0 ? i : "", this.forceUpgradeOnSignin = (o = e.forceUpgradeOnSignin) !== null && o !== void 0 ? o : !1, this.schemaVersion = e.schemaVersion;
  }
  validatePassword(e) {
    var t, r, i, o, a, u;
    const h = {
      isValid: !0,
      passwordPolicy: this
    };
    return this.validatePasswordLengthOptions(e, h), this.validatePasswordCharacterOptions(e, h), h.isValid && (h.isValid = (t = h.meetsMinPasswordLength) !== null && t !== void 0 ? t : !0), h.isValid && (h.isValid = (r = h.meetsMaxPasswordLength) !== null && r !== void 0 ? r : !0), h.isValid && (h.isValid = (i = h.containsLowercaseLetter) !== null && i !== void 0 ? i : !0), h.isValid && (h.isValid = (o = h.containsUppercaseLetter) !== null && o !== void 0 ? o : !0), h.isValid && (h.isValid = (a = h.containsNumericCharacter) !== null && a !== void 0 ? a : !0), h.isValid && (h.isValid = (u = h.containsNonAlphanumericCharacter) !== null && u !== void 0 ? u : !0), h;
  }
  /**
   * Validates that the password meets the length options for the policy.
   *
   * @param password Password to validate.
   * @param status Validation status.
   */
  validatePasswordLengthOptions(e, t) {
    const r = this.customStrengthOptions.minPasswordLength, i = this.customStrengthOptions.maxPasswordLength;
    r && (t.meetsMinPasswordLength = e.length >= r), i && (t.meetsMaxPasswordLength = e.length <= i);
  }
  /**
   * Validates that the password meets the character options for the policy.
   *
   * @param password Password to validate.
   * @param status Validation status.
   */
  validatePasswordCharacterOptions(e, t) {
    this.updatePasswordCharacterOptionsStatuses(
      t,
      /* containsLowercaseCharacter= */
      !1,
      /* containsUppercaseCharacter= */
      !1,
      /* containsNumericCharacter= */
      !1,
      /* containsNonAlphanumericCharacter= */
      !1
    );
    let r;
    for (let i = 0; i < e.length; i++)
      r = e.charAt(i), this.updatePasswordCharacterOptionsStatuses(
        t,
        /* containsLowercaseCharacter= */
        r >= "a" && r <= "z",
        /* containsUppercaseCharacter= */
        r >= "A" && r <= "Z",
        /* containsNumericCharacter= */
        r >= "0" && r <= "9",
        /* containsNonAlphanumericCharacter= */
        this.allowedNonAlphanumericCharacters.includes(r)
      );
  }
  /**
   * Updates the running validation status with the statuses for the character options.
   * Expected to be called each time a character is processed to update each option status
   * based on the current character.
   *
   * @param status Validation status.
   * @param containsLowercaseCharacter Whether the character is a lowercase letter.
   * @param containsUppercaseCharacter Whether the character is an uppercase letter.
   * @param containsNumericCharacter Whether the character is a numeric character.
   * @param containsNonAlphanumericCharacter Whether the character is a non-alphanumeric character.
   */
  updatePasswordCharacterOptionsStatuses(e, t, r, i, o) {
    this.customStrengthOptions.containsLowercaseLetter && (e.containsLowercaseLetter || (e.containsLowercaseLetter = t)), this.customStrengthOptions.containsUppercaseLetter && (e.containsUppercaseLetter || (e.containsUppercaseLetter = r)), this.customStrengthOptions.containsNumericCharacter && (e.containsNumericCharacter || (e.containsNumericCharacter = i)), this.customStrengthOptions.containsNonAlphanumericCharacter && (e.containsNonAlphanumericCharacter || (e.containsNonAlphanumericCharacter = o));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ff {
  constructor(e, t, r, i) {
    this.app = e, this.heartbeatServiceProvider = t, this.appCheckServiceProvider = r, this.config = i, this.currentUser = null, this.emulatorConfig = null, this.operations = Promise.resolve(), this.authStateSubscription = new Ta(this), this.idTokenSubscription = new Ta(this), this.beforeStateQueue = new uf(this), this.redirectUser = null, this.isProactiveRefreshEnabled = !1, this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1, this._canInitEmulator = !0, this._isInitialized = !1, this._deleted = !1, this._initializationPromise = null, this._popupRedirectResolver = null, this._errorFactory = Vc, this._agentRecaptchaConfig = null, this._tenantRecaptchaConfigs = {}, this._projectPasswordPolicy = null, this._tenantPasswordPolicies = {}, this.lastNotifiedUid = void 0, this.languageCode = null, this.tenantId = null, this.settings = { appVerificationDisabledForTesting: !1 }, this.frameworks = [], this.name = e.name, this.clientVersion = i.sdkClientVersion;
  }
  _initializeWithPersistence(e, t) {
    return t && (this._popupRedirectResolver = qe(t)), this._initializationPromise = this.queue(async () => {
      var r, i;
      if (!this._deleted && (this.persistenceManager = await Bt.create(this, e), !this._deleted)) {
        if (!((r = this._popupRedirectResolver) === null || r === void 0) && r._shouldInitProactively)
          try {
            await this._popupRedirectResolver._initialize(this);
          } catch {
          }
        await this.initializeCurrentUser(t), this.lastNotifiedUid = ((i = this.currentUser) === null || i === void 0 ? void 0 : i.uid) || null, !this._deleted && (this._isInitialized = !0);
      }
    }), this._initializationPromise;
  }
  /**
   * If the persistence is changed in another window, the user manager will let us know
   */
  async _onStorageEvent() {
    if (this._deleted)
      return;
    const e = await this.assertedPersistence.getCurrentUser();
    if (!(!this.currentUser && !e)) {
      if (this.currentUser && e && this.currentUser.uid === e.uid) {
        this._currentUser._assign(e), await this.currentUser.getIdToken();
        return;
      }
      await this._updateCurrentUser(
        e,
        /* skipBeforeStateCallbacks */
        !0
      );
    }
  }
  async initializeCurrentUserFromIdToken(e) {
    try {
      const t = await Mc(this, { idToken: e }), r = await je._fromGetAccountInfoResponse(this, t, e);
      await this.directlySetCurrentUser(r);
    } catch (t) {
      console.warn("FirebaseServerApp could not login user with provided authIdToken: ", t), await this.directlySetCurrentUser(null);
    }
  }
  async initializeCurrentUser(e) {
    var t;
    if (Ue(this.app)) {
      const a = this.app.settings.authIdToken;
      return a ? new Promise((u) => {
        setTimeout(() => this.initializeCurrentUserFromIdToken(a).then(u, u));
      }) : this.directlySetCurrentUser(null);
    }
    const r = await this.assertedPersistence.getCurrentUser();
    let i = r, o = !1;
    if (e && this.config.authDomain) {
      await this.getOrInitRedirectPersistenceManager();
      const a = (t = this.redirectUser) === null || t === void 0 ? void 0 : t._redirectEventId, u = i == null ? void 0 : i._redirectEventId, h = await this.tryRedirectSignIn(e);
      (!a || a === u) && (h != null && h.user) && (i = h.user, o = !0);
    }
    if (!i)
      return this.directlySetCurrentUser(null);
    if (!i._redirectEventId) {
      if (o)
        try {
          await this.beforeStateQueue.runMiddleware(i);
        } catch (a) {
          i = r, this._popupRedirectResolver._overrideRedirectResult(this, () => Promise.reject(a));
        }
      return i ? this.reloadAndSetCurrentUserOrClear(i) : this.directlySetCurrentUser(null);
    }
    return M(
      this._popupRedirectResolver,
      this,
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), await this.getOrInitRedirectPersistenceManager(), this.redirectUser && this.redirectUser._redirectEventId === i._redirectEventId ? this.directlySetCurrentUser(i) : this.reloadAndSetCurrentUserOrClear(i);
  }
  async tryRedirectSignIn(e) {
    let t = null;
    try {
      t = await this._popupRedirectResolver._completeRedirectFn(this, e, !0);
    } catch {
      await this._setRedirectUser(null);
    }
    return t;
  }
  async reloadAndSetCurrentUserOrClear(e) {
    try {
      await xr(e);
    } catch (t) {
      if ((t == null ? void 0 : t.code) !== "auth/network-request-failed")
        return this.directlySetCurrentUser(null);
    }
    return this.directlySetCurrentUser(e);
  }
  useDeviceLanguage() {
    this.languageCode = Wd();
  }
  async _delete() {
    this._deleted = !0;
  }
  async updateCurrentUser(e) {
    if (Ue(this.app))
      return Promise.reject(ct(this));
    const t = e ? Ie(e) : null;
    return t && M(
      t.auth.config.apiKey === this.config.apiKey,
      this,
      "invalid-user-token"
      /* AuthErrorCode.INVALID_AUTH */
    ), this._updateCurrentUser(t && t._clone(this));
  }
  async _updateCurrentUser(e, t = !1) {
    if (!this._deleted)
      return e && M(
        this.tenantId === e.tenantId,
        this,
        "tenant-id-mismatch"
        /* AuthErrorCode.TENANT_ID_MISMATCH */
      ), t || await this.beforeStateQueue.runMiddleware(e), this.queue(async () => {
        await this.directlySetCurrentUser(e), this.notifyAuthListeners();
      });
  }
  async signOut() {
    return Ue(this.app) ? Promise.reject(ct(this)) : (await this.beforeStateQueue.runMiddleware(null), (this.redirectPersistenceManager || this._popupRedirectResolver) && await this._setRedirectUser(null), this._updateCurrentUser(
      null,
      /* skipBeforeStateCallbacks */
      !0
    ));
  }
  setPersistence(e) {
    return Ue(this.app) ? Promise.reject(ct(this)) : this.queue(async () => {
      await this.assertedPersistence.setPersistence(qe(e));
    });
  }
  _getRecaptchaConfig() {
    return this.tenantId == null ? this._agentRecaptchaConfig : this._tenantRecaptchaConfigs[this.tenantId];
  }
  async validatePassword(e) {
    this._getPasswordPolicyInternal() || await this._updatePasswordPolicy();
    const t = this._getPasswordPolicyInternal();
    return t.schemaVersion !== this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION ? Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version", {})) : t.validatePassword(e);
  }
  _getPasswordPolicyInternal() {
    return this.tenantId === null ? this._projectPasswordPolicy : this._tenantPasswordPolicies[this.tenantId];
  }
  async _updatePasswordPolicy() {
    const e = await lf(this), t = new df(e);
    this.tenantId === null ? this._projectPasswordPolicy = t : this._tenantPasswordPolicies[this.tenantId] = t;
  }
  _getPersistence() {
    return this.assertedPersistence.persistence.type;
  }
  _updateErrorMap(e) {
    this._errorFactory = new zn("auth", "Firebase", e());
  }
  onAuthStateChanged(e, t, r) {
    return this.registerStateListener(this.authStateSubscription, e, t, r);
  }
  beforeAuthStateChanged(e, t) {
    return this.beforeStateQueue.pushCallback(e, t);
  }
  onIdTokenChanged(e, t, r) {
    return this.registerStateListener(this.idTokenSubscription, e, t, r);
  }
  authStateReady() {
    return new Promise((e, t) => {
      if (this.currentUser)
        e();
      else {
        const r = this.onAuthStateChanged(() => {
          r(), e();
        }, t);
      }
    });
  }
  /**
   * Revokes the given access token. Currently only supports Apple OAuth access tokens.
   */
  async revokeAccessToken(e) {
    if (this.currentUser) {
      const t = await this.currentUser.getIdToken(), r = {
        providerId: "apple.com",
        tokenType: "ACCESS_TOKEN",
        token: e,
        idToken: t
      };
      this.tenantId != null && (r.tenantId = this.tenantId), await of(this, r);
    }
  }
  toJSON() {
    var e;
    return {
      apiKey: this.config.apiKey,
      authDomain: this.config.authDomain,
      appName: this.name,
      currentUser: (e = this._currentUser) === null || e === void 0 ? void 0 : e.toJSON()
    };
  }
  async _setRedirectUser(e, t) {
    const r = await this.getOrInitRedirectPersistenceManager(t);
    return e === null ? r.removeCurrentUser() : r.setCurrentUser(e);
  }
  async getOrInitRedirectPersistenceManager(e) {
    if (!this.redirectPersistenceManager) {
      const t = e && qe(e) || this._popupRedirectResolver;
      M(
        t,
        this,
        "argument-error"
        /* AuthErrorCode.ARGUMENT_ERROR */
      ), this.redirectPersistenceManager = await Bt.create(
        this,
        [qe(t._redirectPersistence)],
        "redirectUser"
        /* KeyName.REDIRECT_USER */
      ), this.redirectUser = await this.redirectPersistenceManager.getCurrentUser();
    }
    return this.redirectPersistenceManager;
  }
  async _redirectUserForId(e) {
    var t, r;
    return this._isInitialized && await this.queue(async () => {
    }), ((t = this._currentUser) === null || t === void 0 ? void 0 : t._redirectEventId) === e ? this._currentUser : ((r = this.redirectUser) === null || r === void 0 ? void 0 : r._redirectEventId) === e ? this.redirectUser : null;
  }
  async _persistUserIfCurrent(e) {
    if (e === this.currentUser)
      return this.queue(async () => this.directlySetCurrentUser(e));
  }
  /** Notifies listeners only if the user is current */
  _notifyListenersIfCurrent(e) {
    e === this.currentUser && this.notifyAuthListeners();
  }
  _key() {
    return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
  }
  _startProactiveRefresh() {
    this.isProactiveRefreshEnabled = !0, this.currentUser && this._currentUser._startProactiveRefresh();
  }
  _stopProactiveRefresh() {
    this.isProactiveRefreshEnabled = !1, this.currentUser && this._currentUser._stopProactiveRefresh();
  }
  /** Returns the current user cast as the internal type */
  get _currentUser() {
    return this.currentUser;
  }
  notifyAuthListeners() {
    var e, t;
    if (!this._isInitialized)
      return;
    this.idTokenSubscription.next(this.currentUser);
    const r = (t = (e = this.currentUser) === null || e === void 0 ? void 0 : e.uid) !== null && t !== void 0 ? t : null;
    this.lastNotifiedUid !== r && (this.lastNotifiedUid = r, this.authStateSubscription.next(this.currentUser));
  }
  registerStateListener(e, t, r, i) {
    if (this._deleted)
      return () => {
      };
    const o = typeof t == "function" ? t : t.next.bind(t);
    let a = !1;
    const u = this._isInitialized ? Promise.resolve() : this._initializationPromise;
    if (M(
      u,
      this,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), u.then(() => {
      a || o(this.currentUser);
    }), typeof t == "function") {
      const h = e.addObserver(t, r, i);
      return () => {
        a = !0, h();
      };
    } else {
      const h = e.addObserver(t);
      return () => {
        a = !0, h();
      };
    }
  }
  /**
   * Unprotected (from race conditions) method to set the current user. This
   * should only be called from within a queued callback. This is necessary
   * because the queue shouldn't rely on another queued callback.
   */
  async directlySetCurrentUser(e) {
    this.currentUser && this.currentUser !== e && this._currentUser._stopProactiveRefresh(), e && this.isProactiveRefreshEnabled && e._startProactiveRefresh(), this.currentUser = e, e ? await this.assertedPersistence.setCurrentUser(e) : await this.assertedPersistence.removeCurrentUser();
  }
  queue(e) {
    return this.operations = this.operations.then(e, e), this.operations;
  }
  get assertedPersistence() {
    return M(
      this.persistenceManager,
      this,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.persistenceManager;
  }
  _logFramework(e) {
    !e || this.frameworks.includes(e) || (this.frameworks.push(e), this.frameworks.sort(), this.clientVersion = Kc(this.config.clientPlatform, this._getFrameworks()));
  }
  _getFrameworks() {
    return this.frameworks;
  }
  async _getAdditionalHeaders() {
    var e;
    const t = {
      "X-Client-Version": this.clientVersion
    };
    this.app.options.appId && (t[
      "X-Firebase-gmpid"
      /* HttpHeader.X_FIREBASE_GMPID */
    ] = this.app.options.appId);
    const r = await ((e = this.heartbeatServiceProvider.getImmediate({
      optional: !0
    })) === null || e === void 0 ? void 0 : e.getHeartbeatsHeader());
    r && (t[
      "X-Firebase-Client"
      /* HttpHeader.X_FIREBASE_CLIENT */
    ] = r);
    const i = await this._getAppCheckToken();
    return i && (t[
      "X-Firebase-AppCheck"
      /* HttpHeader.X_FIREBASE_APP_CHECK */
    ] = i), t;
  }
  async _getAppCheckToken() {
    var e;
    const t = await ((e = this.appCheckServiceProvider.getImmediate({ optional: !0 })) === null || e === void 0 ? void 0 : e.getToken());
    return t != null && t.error && qd(`Error while retrieving App Check token: ${t.error}`), t == null ? void 0 : t.token;
  }
}
function Zt(n) {
  return Ie(n);
}
class Ta {
  constructor(e) {
    this.auth = e, this.observer = null, this.addObserver = Vh((t) => this.observer = t);
  }
  get next() {
    return M(
      this.observer,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), this.observer.next.bind(this.observer);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let Xr = {
  async loadJS() {
    throw new Error("Unable to load external scripts");
  },
  recaptchaV2Script: "",
  recaptchaEnterpriseScript: "",
  gapiScript: ""
};
function pf(n) {
  Xr = n;
}
function Gc(n) {
  return Xr.loadJS(n);
}
function mf() {
  return Xr.recaptchaEnterpriseScript;
}
function gf() {
  return Xr.gapiScript;
}
function _f(n) {
  return `__${n}${Math.floor(Math.random() * 1e6)}`;
}
const yf = "recaptcha-enterprise", vf = "NO_RECAPTCHA";
class Ef {
  /**
   *
   * @param authExtern - The corresponding Firebase {@link Auth} instance.
   *
   */
  constructor(e) {
    this.type = yf, this.auth = Zt(e);
  }
  /**
   * Executes the verification process.
   *
   * @returns A Promise for a token that can be used to assert the validity of a request.
   */
  async verify(e = "verify", t = !1) {
    async function r(o) {
      if (!t) {
        if (o.tenantId == null && o._agentRecaptchaConfig != null)
          return o._agentRecaptchaConfig.siteKey;
        if (o.tenantId != null && o._tenantRecaptchaConfigs[o.tenantId] !== void 0)
          return o._tenantRecaptchaConfigs[o.tenantId].siteKey;
      }
      return new Promise(async (a, u) => {
        Jd(o, {
          clientType: "CLIENT_TYPE_WEB",
          version: "RECAPTCHA_ENTERPRISE"
          /* RecaptchaVersion.ENTERPRISE */
        }).then((h) => {
          if (h.recaptchaKey === void 0)
            u(new Error("recaptcha Enterprise site key undefined"));
          else {
            const d = new Yd(h);
            return o.tenantId == null ? o._agentRecaptchaConfig = d : o._tenantRecaptchaConfigs[o.tenantId] = d, a(d.siteKey);
          }
        }).catch((h) => {
          u(h);
        });
      });
    }
    function i(o, a, u) {
      const h = window.grecaptcha;
      ga(h) ? h.enterprise.ready(() => {
        h.enterprise.execute(o, { action: e }).then((d) => {
          a(d);
        }).catch(() => {
          a(vf);
        });
      }) : u(Error("No reCAPTCHA enterprise script loaded."));
    }
    return new Promise((o, a) => {
      r(this.auth).then((u) => {
        if (!t && ga(window.grecaptcha))
          i(u, o, a);
        else {
          if (typeof window > "u") {
            a(new Error("RecaptchaVerifier is only supported in browser"));
            return;
          }
          let h = mf();
          h.length !== 0 && (h += u), Gc(h).then(() => {
            i(u, o, a);
          }).catch((d) => {
            a(d);
          });
        }
      }).catch((u) => {
        a(u);
      });
    });
  }
}
async function Ia(n, e, t, r = !1) {
  const i = new Ef(n);
  let o;
  try {
    o = await i.verify(t);
  } catch {
    o = await i.verify(t, !0);
  }
  const a = Object.assign({}, e);
  return r ? Object.assign(a, { captchaResp: o }) : Object.assign(a, { captchaResponse: o }), Object.assign(a, {
    clientType: "CLIENT_TYPE_WEB"
    /* RecaptchaClientType.WEB */
  }), Object.assign(a, {
    recaptchaVersion: "RECAPTCHA_ENTERPRISE"
    /* RecaptchaVersion.ENTERPRISE */
  }), a;
}
async function wa(n, e, t, r) {
  var i;
  if (!((i = n._getRecaptchaConfig()) === null || i === void 0) && i.isProviderEnabled(
    "EMAIL_PASSWORD_PROVIDER"
    /* RecaptchaProvider.EMAIL_PASSWORD_PROVIDER */
  )) {
    const o = await Ia(
      n,
      e,
      t,
      t === "getOobCode"
      /* RecaptchaActionName.GET_OOB_CODE */
    );
    return r(n, o);
  } else
    return r(n, e).catch(async (o) => {
      if (o.code === "auth/missing-recaptcha-token") {
        console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);
        const a = await Ia(
          n,
          e,
          t,
          t === "getOobCode"
          /* RecaptchaActionName.GET_OOB_CODE */
        );
        return r(n, a);
      } else
        return Promise.reject(o);
    });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Tf(n, e) {
  const t = _s(n, "auth");
  if (t.isInitialized()) {
    const i = t.getImmediate(), o = t.getOptions();
    if (Or(o, e ?? {}))
      return i;
    be(
      i,
      "already-initialized"
      /* AuthErrorCode.ALREADY_INITIALIZED */
    );
  }
  return t.initialize({ options: e });
}
function If(n, e) {
  const t = (e == null ? void 0 : e.persistence) || [], r = (Array.isArray(t) ? t : [t]).map(qe);
  e != null && e.errorMap && n._updateErrorMap(e.errorMap), n._initializeWithPersistence(r, e == null ? void 0 : e.popupRedirectResolver);
}
function wf(n, e, t) {
  const r = Zt(n);
  M(
    r._canInitEmulator,
    r,
    "emulator-config-failed"
    /* AuthErrorCode.EMULATOR_CONFIG_FAILED */
  ), M(
    /^https?:\/\//.test(e),
    r,
    "invalid-emulator-scheme"
    /* AuthErrorCode.INVALID_EMULATOR_SCHEME */
  );
  const i = !1, o = Qc(e), { host: a, port: u } = Af(e), h = u === null ? "" : `:${u}`;
  r.config.emulator = { url: `${o}//${a}${h}/` }, r.settings.appVerificationDisabledForTesting = !0, r.emulatorConfig = Object.freeze({
    host: a,
    port: u,
    protocol: o.replace(":", ""),
    options: Object.freeze({ disableWarnings: i })
  }), Rf();
}
function Qc(n) {
  const e = n.indexOf(":");
  return e < 0 ? "" : n.substr(0, e + 1);
}
function Af(n) {
  const e = Qc(n), t = /(\/\/)?([^?#/]+)/.exec(n.substr(e.length));
  if (!t)
    return { host: "", port: null };
  const r = t[2].split("@").pop() || "", i = /^(\[[^\]]+\])(:|$)/.exec(r);
  if (i) {
    const o = i[1];
    return { host: o, port: Aa(r.substr(o.length + 1)) };
  } else {
    const [o, a] = r.split(":");
    return { host: o, port: Aa(a) };
  }
}
function Aa(n) {
  if (!n)
    return null;
  const e = Number(n);
  return isNaN(e) ? null : e;
}
function Rf() {
  function n() {
    const e = document.createElement("p"), t = e.style;
    e.innerText = "Running in emulator mode. Do not use with production credentials.", t.position = "fixed", t.width = "100%", t.backgroundColor = "#ffffff", t.border = ".1em solid #000000", t.color = "#b50000", t.bottom = "0px", t.left = "0px", t.margin = "0px", t.zIndex = "10000", t.textAlign = "center", e.classList.add("firebase-emulator-warning"), document.body.appendChild(e);
  }
  typeof console < "u" && typeof console.info == "function" && console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."), typeof window < "u" && typeof document < "u" && (document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", n) : n());
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ws {
  /** @internal */
  constructor(e, t) {
    this.providerId = e, this.signInMethod = t;
  }
  /**
   * Returns a JSON-serializable representation of this object.
   *
   * @returns a JSON-serializable representation of this object.
   */
  toJSON() {
    return Be("not implemented");
  }
  /** @internal */
  _getIdTokenResponse(e) {
    return Be("not implemented");
  }
  /** @internal */
  _linkToIdToken(e, t) {
    return Be("not implemented");
  }
  /** @internal */
  _getReauthenticationResolver(e) {
    return Be("not implemented");
  }
}
async function Sf(n, e) {
  return pt(n, "POST", "/v1/accounts:signUp", e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Pf(n, e) {
  return Jr(n, "POST", "/v1/accounts:signInWithPassword", Pt(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Cf(n, e) {
  return Jr(n, "POST", "/v1/accounts:signInWithEmailLink", Pt(n, e));
}
async function bf(n, e) {
  return Jr(n, "POST", "/v1/accounts:signInWithEmailLink", Pt(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Mn extends ws {
  /** @internal */
  constructor(e, t, r, i = null) {
    super("password", r), this._email = e, this._password = t, this._tenantId = i;
  }
  /** @internal */
  static _fromEmailAndPassword(e, t) {
    return new Mn(
      e,
      t,
      "password"
      /* SignInMethod.EMAIL_PASSWORD */
    );
  }
  /** @internal */
  static _fromEmailAndCode(e, t, r = null) {
    return new Mn(e, t, "emailLink", r);
  }
  /** {@inheritdoc AuthCredential.toJSON} */
  toJSON() {
    return {
      email: this._email,
      password: this._password,
      signInMethod: this.signInMethod,
      tenantId: this._tenantId
    };
  }
  /**
   * Static method to deserialize a JSON representation of an object into an {@link  AuthCredential}.
   *
   * @param json - Either `object` or the stringified representation of the object. When string is
   * provided, `JSON.parse` would be called first.
   *
   * @returns If the JSON input does not represent an {@link AuthCredential}, null is returned.
   */
  static fromJSON(e) {
    const t = typeof e == "string" ? JSON.parse(e) : e;
    if (t != null && t.email && (t != null && t.password)) {
      if (t.signInMethod === "password")
        return this._fromEmailAndPassword(t.email, t.password);
      if (t.signInMethod === "emailLink")
        return this._fromEmailAndCode(t.email, t.password, t.tenantId);
    }
    return null;
  }
  /** @internal */
  async _getIdTokenResponse(e) {
    switch (this.signInMethod) {
      case "password":
        const t = {
          returnSecureToken: !0,
          email: this._email,
          password: this._password,
          clientType: "CLIENT_TYPE_WEB"
          /* RecaptchaClientType.WEB */
        };
        return wa(e, t, "signInWithPassword", Pf);
      case "emailLink":
        return Cf(e, {
          email: this._email,
          oobCode: this._password
        });
      default:
        be(
          e,
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
    }
  }
  /** @internal */
  async _linkToIdToken(e, t) {
    switch (this.signInMethod) {
      case "password":
        const r = {
          idToken: t,
          returnSecureToken: !0,
          email: this._email,
          password: this._password,
          clientType: "CLIENT_TYPE_WEB"
          /* RecaptchaClientType.WEB */
        };
        return wa(e, r, "signUpPassword", Sf);
      case "emailLink":
        return bf(e, {
          idToken: t,
          email: this._email,
          oobCode: this._password
        });
      default:
        be(
          e,
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
    }
  }
  /** @internal */
  _getReauthenticationResolver(e) {
    return this._getIdTokenResponse(e);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function jt(n, e) {
  return Jr(n, "POST", "/v1/accounts:signInWithIdp", Pt(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const kf = "http://localhost";
class wt extends ws {
  constructor() {
    super(...arguments), this.pendingToken = null;
  }
  /** @internal */
  static _fromParams(e) {
    const t = new wt(e.providerId, e.signInMethod);
    return e.idToken || e.accessToken ? (e.idToken && (t.idToken = e.idToken), e.accessToken && (t.accessToken = e.accessToken), e.nonce && !e.pendingToken && (t.nonce = e.nonce), e.pendingToken && (t.pendingToken = e.pendingToken)) : e.oauthToken && e.oauthTokenSecret ? (t.accessToken = e.oauthToken, t.secret = e.oauthTokenSecret) : be(
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), t;
  }
  /** {@inheritdoc AuthCredential.toJSON}  */
  toJSON() {
    return {
      idToken: this.idToken,
      accessToken: this.accessToken,
      secret: this.secret,
      nonce: this.nonce,
      pendingToken: this.pendingToken,
      providerId: this.providerId,
      signInMethod: this.signInMethod
    };
  }
  /**
   * Static method to deserialize a JSON representation of an object into an
   * {@link  AuthCredential}.
   *
   * @param json - Input can be either Object or the stringified representation of the object.
   * When string is provided, JSON.parse would be called first.
   *
   * @returns If the JSON input does not represent an {@link  AuthCredential}, null is returned.
   */
  static fromJSON(e) {
    const t = typeof e == "string" ? JSON.parse(e) : e, { providerId: r, signInMethod: i } = t, o = ys(t, ["providerId", "signInMethod"]);
    if (!r || !i)
      return null;
    const a = new wt(r, i);
    return a.idToken = o.idToken || void 0, a.accessToken = o.accessToken || void 0, a.secret = o.secret, a.nonce = o.nonce, a.pendingToken = o.pendingToken || null, a;
  }
  /** @internal */
  _getIdTokenResponse(e) {
    const t = this.buildRequest();
    return jt(e, t);
  }
  /** @internal */
  _linkToIdToken(e, t) {
    const r = this.buildRequest();
    return r.idToken = t, jt(e, r);
  }
  /** @internal */
  _getReauthenticationResolver(e) {
    const t = this.buildRequest();
    return t.autoCreate = !1, jt(e, t);
  }
  buildRequest() {
    const e = {
      requestUri: kf,
      returnSecureToken: !0
    };
    if (this.pendingToken)
      e.pendingToken = this.pendingToken;
    else {
      const t = {};
      this.idToken && (t.id_token = this.idToken), this.accessToken && (t.access_token = this.accessToken), this.secret && (t.oauth_token_secret = this.secret), t.providerId = this.providerId, this.nonce && !this.pendingToken && (t.nonce = this.nonce), e.postBody = Wn(t);
    }
    return e;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Vf(n) {
  switch (n) {
    case "recoverEmail":
      return "RECOVER_EMAIL";
    case "resetPassword":
      return "PASSWORD_RESET";
    case "signIn":
      return "EMAIL_SIGNIN";
    case "verifyEmail":
      return "VERIFY_EMAIL";
    case "verifyAndChangeEmail":
      return "VERIFY_AND_CHANGE_EMAIL";
    case "revertSecondFactorAddition":
      return "REVERT_SECOND_FACTOR_ADDITION";
    default:
      return null;
  }
}
function Df(n) {
  const e = An(Rn(n)).link, t = e ? An(Rn(e)).deep_link_id : null, r = An(Rn(n)).deep_link_id;
  return (r ? An(Rn(r)).link : null) || r || t || e || n;
}
class As {
  /**
   * @param actionLink - The link from which to extract the URL.
   * @returns The {@link ActionCodeURL} object, or null if the link is invalid.
   *
   * @internal
   */
  constructor(e) {
    var t, r, i, o, a, u;
    const h = An(Rn(e)), d = (t = h.apiKey) !== null && t !== void 0 ? t : null, m = (r = h.oobCode) !== null && r !== void 0 ? r : null, w = Vf((i = h.mode) !== null && i !== void 0 ? i : null);
    M(
      d && m && w,
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), this.apiKey = d, this.operation = w, this.code = m, this.continueUrl = (o = h.continueUrl) !== null && o !== void 0 ? o : null, this.languageCode = (a = h.languageCode) !== null && a !== void 0 ? a : null, this.tenantId = (u = h.tenantId) !== null && u !== void 0 ? u : null;
  }
  /**
   * Parses the email action link string and returns an {@link ActionCodeURL} if the link is valid,
   * otherwise returns null.
   *
   * @param link  - The email action link string.
   * @returns The {@link ActionCodeURL} object, or null if the link is invalid.
   *
   * @public
   */
  static parseLink(e) {
    const t = Df(e);
    try {
      return new As(t);
    } catch {
      return null;
    }
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class en {
  constructor() {
    this.providerId = en.PROVIDER_ID;
  }
  /**
   * Initialize an {@link AuthCredential} using an email and password.
   *
   * @example
   * ```javascript
   * const authCredential = EmailAuthProvider.credential(email, password);
   * const userCredential = await signInWithCredential(auth, authCredential);
   * ```
   *
   * @example
   * ```javascript
   * const userCredential = await signInWithEmailAndPassword(auth, email, password);
   * ```
   *
   * @param email - Email address.
   * @param password - User account password.
   * @returns The auth provider credential.
   */
  static credential(e, t) {
    return Mn._fromEmailAndPassword(e, t);
  }
  /**
   * Initialize an {@link AuthCredential} using an email and an email link after a sign in with
   * email link operation.
   *
   * @example
   * ```javascript
   * const authCredential = EmailAuthProvider.credentialWithLink(auth, email, emailLink);
   * const userCredential = await signInWithCredential(auth, authCredential);
   * ```
   *
   * @example
   * ```javascript
   * await sendSignInLinkToEmail(auth, email);
   * // Obtain emailLink from user.
   * const userCredential = await signInWithEmailLink(auth, email, emailLink);
   * ```
   *
   * @param auth - The {@link Auth} instance used to verify the link.
   * @param email - Email address.
   * @param emailLink - Sign-in email link.
   * @returns - The auth provider credential.
   */
  static credentialWithLink(e, t) {
    const r = As.parseLink(t);
    return M(
      r,
      "argument-error"
      /* AuthErrorCode.ARGUMENT_ERROR */
    ), Mn._fromEmailAndCode(e, r.code, r.tenantId);
  }
}
en.PROVIDER_ID = "password";
en.EMAIL_PASSWORD_SIGN_IN_METHOD = "password";
en.EMAIL_LINK_SIGN_IN_METHOD = "emailLink";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Yc {
  /**
   * Constructor for generic OAuth providers.
   *
   * @param providerId - Provider for which credentials should be generated.
   */
  constructor(e) {
    this.providerId = e, this.defaultLanguageCode = null, this.customParameters = {};
  }
  /**
   * Set the language gode.
   *
   * @param languageCode - language code
   */
  setDefaultLanguage(e) {
    this.defaultLanguageCode = e;
  }
  /**
   * Sets the OAuth custom parameters to pass in an OAuth request for popup and redirect sign-in
   * operations.
   *
   * @remarks
   * For a detailed list, check the reserved required OAuth 2.0 parameters such as `client_id`,
   * `redirect_uri`, `scope`, `response_type`, and `state` are not allowed and will be ignored.
   *
   * @param customOAuthParameters - The custom OAuth parameters to pass in the OAuth request.
   */
  setCustomParameters(e) {
    return this.customParameters = e, this;
  }
  /**
   * Retrieve the current list of {@link CustomParameters}.
   */
  getCustomParameters() {
    return this.customParameters;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Kn extends Yc {
  constructor() {
    super(...arguments), this.scopes = [];
  }
  /**
   * Add an OAuth scope to the credential.
   *
   * @param scope - Provider OAuth scope to add.
   */
  addScope(e) {
    return this.scopes.includes(e) || this.scopes.push(e), this;
  }
  /**
   * Retrieve the current list of OAuth scopes.
   */
  getScopes() {
    return [...this.scopes];
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class et extends Kn {
  constructor() {
    super(
      "facebook.com"
      /* ProviderId.FACEBOOK */
    );
  }
  /**
   * Creates a credential for Facebook.
   *
   * @example
   * ```javascript
   * // `event` from the Facebook auth.authResponseChange callback.
   * const credential = FacebookAuthProvider.credential(event.authResponse.accessToken);
   * const result = await signInWithCredential(credential);
   * ```
   *
   * @param accessToken - Facebook access token.
   */
  static credential(e) {
    return wt._fromParams({
      providerId: et.PROVIDER_ID,
      signInMethod: et.FACEBOOK_SIGN_IN_METHOD,
      accessToken: e
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return et.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return et.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !("oauthAccessToken" in e) || !e.oauthAccessToken)
      return null;
    try {
      return et.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
et.FACEBOOK_SIGN_IN_METHOD = "facebook.com";
et.PROVIDER_ID = "facebook.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class tt extends Kn {
  constructor() {
    super(
      "google.com"
      /* ProviderId.GOOGLE */
    ), this.addScope("profile");
  }
  /**
   * Creates a credential for Google. At least one of ID token and access token is required.
   *
   * @example
   * ```javascript
   * // \`googleUser\` from the onsuccess Google Sign In callback.
   * const credential = GoogleAuthProvider.credential(googleUser.getAuthResponse().id_token);
   * const result = await signInWithCredential(credential);
   * ```
   *
   * @param idToken - Google ID token.
   * @param accessToken - Google access token.
   */
  static credential(e, t) {
    return wt._fromParams({
      providerId: tt.PROVIDER_ID,
      signInMethod: tt.GOOGLE_SIGN_IN_METHOD,
      idToken: e,
      accessToken: t
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return tt.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return tt.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e)
      return null;
    const { oauthIdToken: t, oauthAccessToken: r } = e;
    if (!t && !r)
      return null;
    try {
      return tt.credential(t, r);
    } catch {
      return null;
    }
  }
}
tt.GOOGLE_SIGN_IN_METHOD = "google.com";
tt.PROVIDER_ID = "google.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class nt extends Kn {
  constructor() {
    super(
      "github.com"
      /* ProviderId.GITHUB */
    );
  }
  /**
   * Creates a credential for GitHub.
   *
   * @param accessToken - GitHub access token.
   */
  static credential(e) {
    return wt._fromParams({
      providerId: nt.PROVIDER_ID,
      signInMethod: nt.GITHUB_SIGN_IN_METHOD,
      accessToken: e
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return nt.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return nt.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !("oauthAccessToken" in e) || !e.oauthAccessToken)
      return null;
    try {
      return nt.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
nt.GITHUB_SIGN_IN_METHOD = "github.com";
nt.PROVIDER_ID = "github.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class rt extends Kn {
  constructor() {
    super(
      "twitter.com"
      /* ProviderId.TWITTER */
    );
  }
  /**
   * Creates a credential for Twitter.
   *
   * @param token - Twitter access token.
   * @param secret - Twitter secret.
   */
  static credential(e, t) {
    return wt._fromParams({
      providerId: rt.PROVIDER_ID,
      signInMethod: rt.TWITTER_SIGN_IN_METHOD,
      oauthToken: e,
      oauthTokenSecret: t
    });
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link UserCredential}.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromResult(e) {
    return rt.credentialFromTaggedObject(e);
  }
  /**
   * Used to extract the underlying {@link OAuthCredential} from a {@link AuthError} which was
   * thrown during a sign-in, link, or reauthenticate operation.
   *
   * @param userCredential - The user credential.
   */
  static credentialFromError(e) {
    return rt.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e)
      return null;
    const { oauthAccessToken: t, oauthTokenSecret: r } = e;
    if (!t || !r)
      return null;
    try {
      return rt.credential(t, r);
    } catch {
      return null;
    }
  }
}
rt.TWITTER_SIGN_IN_METHOD = "twitter.com";
rt.PROVIDER_ID = "twitter.com";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class zt {
  constructor(e) {
    this.user = e.user, this.providerId = e.providerId, this._tokenResponse = e._tokenResponse, this.operationType = e.operationType;
  }
  static async _fromIdTokenResponse(e, t, r, i = !1) {
    const o = await je._fromIdTokenResponse(e, r, i), a = Ra(r);
    return new zt({
      user: o,
      providerId: a,
      _tokenResponse: r,
      operationType: t
    });
  }
  static async _forOperation(e, t, r) {
    await e._updateTokensIfNecessary(
      r,
      /* reload */
      !0
    );
    const i = Ra(r);
    return new zt({
      user: e,
      providerId: i,
      _tokenResponse: r,
      operationType: t
    });
  }
}
function Ra(n) {
  return n.providerId ? n.providerId : "phoneNumber" in n ? "phone" : null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Fr extends Ge {
  constructor(e, t, r, i) {
    var o;
    super(t.code, t.message), this.operationType = r, this.user = i, Object.setPrototypeOf(this, Fr.prototype), this.customData = {
      appName: e.name,
      tenantId: (o = e.tenantId) !== null && o !== void 0 ? o : void 0,
      _serverResponse: t.customData._serverResponse,
      operationType: r
    };
  }
  static _fromErrorAndOperation(e, t, r, i) {
    return new Fr(e, t, r, i);
  }
}
function Jc(n, e, t, r) {
  return (e === "reauthenticate" ? t._getReauthenticationResolver(n) : t._getIdTokenResponse(n)).catch((o) => {
    throw o.code === "auth/multi-factor-auth-required" ? Fr._fromErrorAndOperation(n, o, e, r) : o;
  });
}
async function Nf(n, e, t = !1) {
  const r = await Ln(n, e._linkToIdToken(n.auth, await n.getIdToken()), t);
  return zt._forOperation(n, "link", r);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Of(n, e, t = !1) {
  const { auth: r } = n;
  if (Ue(r.app))
    return Promise.reject(ct(r));
  const i = "reauthenticate";
  try {
    const o = await Ln(n, Jc(r, i, e, n), t);
    M(
      o.idToken,
      r,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const a = Ts(o.idToken);
    M(
      a,
      r,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    );
    const { sub: u } = a;
    return M(
      n.uid === u,
      r,
      "user-mismatch"
      /* AuthErrorCode.USER_MISMATCH */
    ), zt._forOperation(n, i, o);
  } catch (o) {
    throw (o == null ? void 0 : o.code) === "auth/user-not-found" && be(
      r,
      "user-mismatch"
      /* AuthErrorCode.USER_MISMATCH */
    ), o;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Xc(n, e, t = !1) {
  if (Ue(n.app))
    return Promise.reject(ct(n));
  const r = "signIn", i = await Jc(n, r, e), o = await zt._fromIdTokenResponse(n, r, i);
  return t || await n._updateCurrentUser(o.user), o;
}
async function Lf(n, e) {
  return Xc(Zt(n), e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Mf(n) {
  const e = Zt(n);
  e._getPasswordPolicyInternal() && await e._updatePasswordPolicy();
}
function my(n, e, t) {
  return Ue(n.app) ? Promise.reject(ct(n)) : Lf(Ie(n), en.credential(e, t)).catch(async (r) => {
    throw r.code === "auth/password-does-not-meet-requirements" && Mf(n), r;
  });
}
function xf(n, e, t, r) {
  return Ie(n).onIdTokenChanged(e, t, r);
}
function Ff(n, e, t) {
  return Ie(n).beforeAuthStateChanged(e, t);
}
function gy(n, e, t, r) {
  return Ie(n).onAuthStateChanged(e, t, r);
}
function _y(n) {
  return Ie(n).signOut();
}
const Ur = "__sak";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Zc {
  constructor(e, t) {
    this.storageRetriever = e, this.type = t;
  }
  _isAvailable() {
    try {
      return this.storage ? (this.storage.setItem(Ur, "1"), this.storage.removeItem(Ur), Promise.resolve(!0)) : Promise.resolve(!1);
    } catch {
      return Promise.resolve(!1);
    }
  }
  _set(e, t) {
    return this.storage.setItem(e, JSON.stringify(t)), Promise.resolve();
  }
  _get(e) {
    const t = this.storage.getItem(e);
    return Promise.resolve(t ? JSON.parse(t) : null);
  }
  _remove(e) {
    return this.storage.removeItem(e), Promise.resolve();
  }
  get storage() {
    return this.storageRetriever();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Uf = 1e3, Bf = 10;
class eu extends Zc {
  constructor() {
    super(
      () => window.localStorage,
      "LOCAL"
      /* PersistenceType.LOCAL */
    ), this.boundEventHandler = (e, t) => this.onStorageEvent(e, t), this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.fallbackToPolling = Hc(), this._shouldAllowMigration = !0;
  }
  forAllChangedKeys(e) {
    for (const t of Object.keys(this.listeners)) {
      const r = this.storage.getItem(t), i = this.localCache[t];
      r !== i && e(t, i, r);
    }
  }
  onStorageEvent(e, t = !1) {
    if (!e.key) {
      this.forAllChangedKeys((a, u, h) => {
        this.notifyListeners(a, h);
      });
      return;
    }
    const r = e.key;
    t ? this.detachListener() : this.stopPolling();
    const i = () => {
      const a = this.storage.getItem(r);
      !t && this.localCache[r] === a || this.notifyListeners(r, a);
    }, o = this.storage.getItem(r);
    cf() && o !== e.newValue && e.newValue !== e.oldValue ? setTimeout(i, Bf) : i();
  }
  notifyListeners(e, t) {
    this.localCache[e] = t;
    const r = this.listeners[e];
    if (r)
      for (const i of Array.from(r))
        i(t && JSON.parse(t));
  }
  startPolling() {
    this.stopPolling(), this.pollTimer = setInterval(() => {
      this.forAllChangedKeys((e, t, r) => {
        this.onStorageEvent(
          new StorageEvent("storage", {
            key: e,
            oldValue: t,
            newValue: r
          }),
          /* poll */
          !0
        );
      });
    }, Uf);
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null);
  }
  attachListener() {
    window.addEventListener("storage", this.boundEventHandler);
  }
  detachListener() {
    window.removeEventListener("storage", this.boundEventHandler);
  }
  _addListener(e, t) {
    Object.keys(this.listeners).length === 0 && (this.fallbackToPolling ? this.startPolling() : this.attachListener()), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this.localCache[e] = this.storage.getItem(e)), this.listeners[e].add(t);
  }
  _removeListener(e, t) {
    this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && (this.detachListener(), this.stopPolling());
  }
  // Update local cache on base operations:
  async _set(e, t) {
    await super._set(e, t), this.localCache[e] = JSON.stringify(t);
  }
  async _get(e) {
    const t = await super._get(e);
    return this.localCache[e] = JSON.stringify(t), t;
  }
  async _remove(e) {
    await super._remove(e), delete this.localCache[e];
  }
}
eu.type = "LOCAL";
const jf = eu;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class tu extends Zc {
  constructor() {
    super(
      () => window.sessionStorage,
      "SESSION"
      /* PersistenceType.SESSION */
    );
  }
  _addListener(e, t) {
  }
  _removeListener(e, t) {
  }
}
tu.type = "SESSION";
const nu = tu;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function qf(n) {
  return Promise.all(n.map(async (e) => {
    try {
      return {
        fulfilled: !0,
        value: await e
      };
    } catch (t) {
      return {
        fulfilled: !1,
        reason: t
      };
    }
  }));
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Zr {
  constructor(e) {
    this.eventTarget = e, this.handlersMap = {}, this.boundEventHandler = this.handleEvent.bind(this);
  }
  /**
   * Obtain an instance of a Receiver for a given event target, if none exists it will be created.
   *
   * @param eventTarget - An event target (such as window or self) through which the underlying
   * messages will be received.
   */
  static _getInstance(e) {
    const t = this.receivers.find((i) => i.isListeningto(e));
    if (t)
      return t;
    const r = new Zr(e);
    return this.receivers.push(r), r;
  }
  isListeningto(e) {
    return this.eventTarget === e;
  }
  /**
   * Fans out a MessageEvent to the appropriate listeners.
   *
   * @remarks
   * Sends an {@link Status.ACK} upon receipt and a {@link Status.DONE} once all handlers have
   * finished processing.
   *
   * @param event - The MessageEvent.
   *
   */
  async handleEvent(e) {
    const t = e, { eventId: r, eventType: i, data: o } = t.data, a = this.handlersMap[i];
    if (!(a != null && a.size))
      return;
    t.ports[0].postMessage({
      status: "ack",
      eventId: r,
      eventType: i
    });
    const u = Array.from(a).map(async (d) => d(t.origin, o)), h = await qf(u);
    t.ports[0].postMessage({
      status: "done",
      eventId: r,
      eventType: i,
      response: h
    });
  }
  /**
   * Subscribe an event handler for a particular event.
   *
   * @param eventType - Event name to subscribe to.
   * @param eventHandler - The event handler which should receive the events.
   *
   */
  _subscribe(e, t) {
    Object.keys(this.handlersMap).length === 0 && this.eventTarget.addEventListener("message", this.boundEventHandler), this.handlersMap[e] || (this.handlersMap[e] = /* @__PURE__ */ new Set()), this.handlersMap[e].add(t);
  }
  /**
   * Unsubscribe an event handler from a particular event.
   *
   * @param eventType - Event name to unsubscribe from.
   * @param eventHandler - Optional event handler, if none provided, unsubscribe all handlers on this event.
   *
   */
  _unsubscribe(e, t) {
    this.handlersMap[e] && t && this.handlersMap[e].delete(t), (!t || this.handlersMap[e].size === 0) && delete this.handlersMap[e], Object.keys(this.handlersMap).length === 0 && this.eventTarget.removeEventListener("message", this.boundEventHandler);
  }
}
Zr.receivers = [];
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Rs(n = "", e = 10) {
  let t = "";
  for (let r = 0; r < e; r++)
    t += Math.floor(Math.random() * 10);
  return n + t;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class $f {
  constructor(e) {
    this.target = e, this.handlers = /* @__PURE__ */ new Set();
  }
  /**
   * Unsubscribe the handler and remove it from our tracking Set.
   *
   * @param handler - The handler to unsubscribe.
   */
  removeMessageHandler(e) {
    e.messageChannel && (e.messageChannel.port1.removeEventListener("message", e.onMessage), e.messageChannel.port1.close()), this.handlers.delete(e);
  }
  /**
   * Send a message to the Receiver located at {@link target}.
   *
   * @remarks
   * We'll first wait a bit for an ACK , if we get one we will wait significantly longer until the
   * receiver has had a chance to fully process the event.
   *
   * @param eventType - Type of event to send.
   * @param data - The payload of the event.
   * @param timeout - Timeout for waiting on an ACK from the receiver.
   *
   * @returns An array of settled promises from all the handlers that were listening on the receiver.
   */
  async _send(e, t, r = 50) {
    const i = typeof MessageChannel < "u" ? new MessageChannel() : null;
    if (!i)
      throw new Error(
        "connection_unavailable"
        /* _MessageError.CONNECTION_UNAVAILABLE */
      );
    let o, a;
    return new Promise((u, h) => {
      const d = Rs("", 20);
      i.port1.start();
      const m = setTimeout(() => {
        h(new Error(
          "unsupported_event"
          /* _MessageError.UNSUPPORTED_EVENT */
        ));
      }, r);
      a = {
        messageChannel: i,
        onMessage(w) {
          const R = w;
          if (R.data.eventId === d)
            switch (R.data.status) {
              case "ack":
                clearTimeout(m), o = setTimeout(
                  () => {
                    h(new Error(
                      "timeout"
                      /* _MessageError.TIMEOUT */
                    ));
                  },
                  3e3
                  /* _TimeoutDuration.COMPLETION */
                );
                break;
              case "done":
                clearTimeout(o), u(R.data.response);
                break;
              default:
                clearTimeout(m), clearTimeout(o), h(new Error(
                  "invalid_response"
                  /* _MessageError.INVALID_RESPONSE */
                ));
                break;
            }
        }
      }, this.handlers.add(a), i.port1.addEventListener("message", a.onMessage), this.target.postMessage({
        eventType: e,
        eventId: d,
        data: t
      }, [i.port2]);
    }).finally(() => {
      a && this.removeMessageHandler(a);
    });
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ve() {
  return window;
}
function zf(n) {
  Ve().location.href = n;
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ru() {
  return typeof Ve().WorkerGlobalScope < "u" && typeof Ve().importScripts == "function";
}
async function Wf() {
  if (!(navigator != null && navigator.serviceWorker))
    return null;
  try {
    return (await navigator.serviceWorker.ready).active;
  } catch {
    return null;
  }
}
function Hf() {
  var n;
  return ((n = navigator == null ? void 0 : navigator.serviceWorker) === null || n === void 0 ? void 0 : n.controller) || null;
}
function Kf() {
  return ru() ? self : null;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const iu = "firebaseLocalStorageDb", Gf = 1, Br = "firebaseLocalStorage", su = "fbase_key";
class Gn {
  constructor(e) {
    this.request = e;
  }
  toPromise() {
    return new Promise((e, t) => {
      this.request.addEventListener("success", () => {
        e(this.request.result);
      }), this.request.addEventListener("error", () => {
        t(this.request.error);
      });
    });
  }
}
function ei(n, e) {
  return n.transaction([Br], e ? "readwrite" : "readonly").objectStore(Br);
}
function Qf() {
  const n = indexedDB.deleteDatabase(iu);
  return new Gn(n).toPromise();
}
function es() {
  const n = indexedDB.open(iu, Gf);
  return new Promise((e, t) => {
    n.addEventListener("error", () => {
      t(n.error);
    }), n.addEventListener("upgradeneeded", () => {
      const r = n.result;
      try {
        r.createObjectStore(Br, { keyPath: su });
      } catch (i) {
        t(i);
      }
    }), n.addEventListener("success", async () => {
      const r = n.result;
      r.objectStoreNames.contains(Br) ? e(r) : (r.close(), await Qf(), e(await es()));
    });
  });
}
async function Sa(n, e, t) {
  const r = ei(n, !0).put({
    [su]: e,
    value: t
  });
  return new Gn(r).toPromise();
}
async function Yf(n, e) {
  const t = ei(n, !1).get(e), r = await new Gn(t).toPromise();
  return r === void 0 ? null : r.value;
}
function Pa(n, e) {
  const t = ei(n, !0).delete(e);
  return new Gn(t).toPromise();
}
const Jf = 800, Xf = 3;
class ou {
  constructor() {
    this.type = "LOCAL", this._shouldAllowMigration = !0, this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.pendingWrites = 0, this.receiver = null, this.sender = null, this.serviceWorkerReceiverAvailable = !1, this.activeServiceWorker = null, this._workerInitializationPromise = this.initializeServiceWorkerMessaging().then(() => {
    }, () => {
    });
  }
  async _openDb() {
    return this.db ? this.db : (this.db = await es(), this.db);
  }
  async _withRetries(e) {
    let t = 0;
    for (; ; )
      try {
        const r = await this._openDb();
        return await e(r);
      } catch (r) {
        if (t++ > Xf)
          throw r;
        this.db && (this.db.close(), this.db = void 0);
      }
  }
  /**
   * IndexedDB events do not propagate from the main window to the worker context.  We rely on a
   * postMessage interface to send these events to the worker ourselves.
   */
  async initializeServiceWorkerMessaging() {
    return ru() ? this.initializeReceiver() : this.initializeSender();
  }
  /**
   * As the worker we should listen to events from the main window.
   */
  async initializeReceiver() {
    this.receiver = Zr._getInstance(Kf()), this.receiver._subscribe("keyChanged", async (e, t) => ({
      keyProcessed: (await this._poll()).includes(t.key)
    })), this.receiver._subscribe("ping", async (e, t) => [
      "keyChanged"
      /* _EventType.KEY_CHANGED */
    ]);
  }
  /**
   * As the main window, we should let the worker know when keys change (set and remove).
   *
   * @remarks
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/ready | ServiceWorkerContainer.ready}
   * may not resolve.
   */
  async initializeSender() {
    var e, t;
    if (this.activeServiceWorker = await Wf(), !this.activeServiceWorker)
      return;
    this.sender = new $f(this.activeServiceWorker);
    const r = await this.sender._send(
      "ping",
      {},
      800
      /* _TimeoutDuration.LONG_ACK */
    );
    r && !((e = r[0]) === null || e === void 0) && e.fulfilled && !((t = r[0]) === null || t === void 0) && t.value.includes(
      "keyChanged"
      /* _EventType.KEY_CHANGED */
    ) && (this.serviceWorkerReceiverAvailable = !0);
  }
  /**
   * Let the worker know about a changed key, the exact key doesn't technically matter since the
   * worker will just trigger a full sync anyway.
   *
   * @remarks
   * For now, we only support one service worker per page.
   *
   * @param key - Storage key which changed.
   */
  async notifyServiceWorker(e) {
    if (!(!this.sender || !this.activeServiceWorker || Hf() !== this.activeServiceWorker))
      try {
        await this.sender._send(
          "keyChanged",
          { key: e },
          // Use long timeout if receiver has previously responded to a ping from us.
          this.serviceWorkerReceiverAvailable ? 800 : 50
          /* _TimeoutDuration.ACK */
        );
      } catch {
      }
  }
  async _isAvailable() {
    try {
      if (!indexedDB)
        return !1;
      const e = await es();
      return await Sa(e, Ur, "1"), await Pa(e, Ur), !0;
    } catch {
    }
    return !1;
  }
  async _withPendingWrite(e) {
    this.pendingWrites++;
    try {
      await e();
    } finally {
      this.pendingWrites--;
    }
  }
  async _set(e, t) {
    return this._withPendingWrite(async () => (await this._withRetries((r) => Sa(r, e, t)), this.localCache[e] = t, this.notifyServiceWorker(e)));
  }
  async _get(e) {
    const t = await this._withRetries((r) => Yf(r, e));
    return this.localCache[e] = t, t;
  }
  async _remove(e) {
    return this._withPendingWrite(async () => (await this._withRetries((t) => Pa(t, e)), delete this.localCache[e], this.notifyServiceWorker(e)));
  }
  async _poll() {
    const e = await this._withRetries((i) => {
      const o = ei(i, !1).getAll();
      return new Gn(o).toPromise();
    });
    if (!e)
      return [];
    if (this.pendingWrites !== 0)
      return [];
    const t = [], r = /* @__PURE__ */ new Set();
    if (e.length !== 0)
      for (const { fbase_key: i, value: o } of e)
        r.add(i), JSON.stringify(this.localCache[i]) !== JSON.stringify(o) && (this.notifyListeners(i, o), t.push(i));
    for (const i of Object.keys(this.localCache))
      this.localCache[i] && !r.has(i) && (this.notifyListeners(i, null), t.push(i));
    return t;
  }
  notifyListeners(e, t) {
    this.localCache[e] = t;
    const r = this.listeners[e];
    if (r)
      for (const i of Array.from(r))
        i(t);
  }
  startPolling() {
    this.stopPolling(), this.pollTimer = setInterval(async () => this._poll(), Jf);
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), this.pollTimer = null);
  }
  _addListener(e, t) {
    Object.keys(this.listeners).length === 0 && this.startPolling(), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this._get(e)), this.listeners[e].add(t);
  }
  _removeListener(e, t) {
    this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && this.stopPolling();
  }
}
ou.type = "LOCAL";
const Zf = ou;
new Hn(3e4, 6e4);
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ep(n, e) {
  return e ? qe(e) : (M(
    n._popupRedirectResolver,
    n,
    "argument-error"
    /* AuthErrorCode.ARGUMENT_ERROR */
  ), n._popupRedirectResolver);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ss extends ws {
  constructor(e) {
    super(
      "custom",
      "custom"
      /* ProviderId.CUSTOM */
    ), this.params = e;
  }
  _getIdTokenResponse(e) {
    return jt(e, this._buildIdpRequest());
  }
  _linkToIdToken(e, t) {
    return jt(e, this._buildIdpRequest(t));
  }
  _getReauthenticationResolver(e) {
    return jt(e, this._buildIdpRequest());
  }
  _buildIdpRequest(e) {
    const t = {
      requestUri: this.params.requestUri,
      sessionId: this.params.sessionId,
      postBody: this.params.postBody,
      tenantId: this.params.tenantId,
      pendingToken: this.params.pendingToken,
      returnSecureToken: !0,
      returnIdpCredential: !0
    };
    return e && (t.idToken = e), t;
  }
}
function tp(n) {
  return Xc(n.auth, new Ss(n), n.bypassAuthState);
}
function np(n) {
  const { auth: e, user: t } = n;
  return M(
    t,
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), Of(t, new Ss(n), n.bypassAuthState);
}
async function rp(n) {
  const { auth: e, user: t } = n;
  return M(
    t,
    e,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), Nf(t, new Ss(n), n.bypassAuthState);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class au {
  constructor(e, t, r, i, o = !1) {
    this.auth = e, this.resolver = r, this.user = i, this.bypassAuthState = o, this.pendingPromise = null, this.eventManager = null, this.filter = Array.isArray(t) ? t : [t];
  }
  execute() {
    return new Promise(async (e, t) => {
      this.pendingPromise = { resolve: e, reject: t };
      try {
        this.eventManager = await this.resolver._initialize(this.auth), await this.onExecution(), this.eventManager.registerConsumer(this);
      } catch (r) {
        this.reject(r);
      }
    });
  }
  async onAuthEvent(e) {
    const { urlResponse: t, sessionId: r, postBody: i, tenantId: o, error: a, type: u } = e;
    if (a) {
      this.reject(a);
      return;
    }
    const h = {
      auth: this.auth,
      requestUri: t,
      sessionId: r,
      tenantId: o || void 0,
      postBody: i || void 0,
      user: this.user,
      bypassAuthState: this.bypassAuthState
    };
    try {
      this.resolve(await this.getIdpTask(u)(h));
    } catch (d) {
      this.reject(d);
    }
  }
  onError(e) {
    this.reject(e);
  }
  getIdpTask(e) {
    switch (e) {
      case "signInViaPopup":
      case "signInViaRedirect":
        return tp;
      case "linkViaPopup":
      case "linkViaRedirect":
        return rp;
      case "reauthViaPopup":
      case "reauthViaRedirect":
        return np;
      default:
        be(
          this.auth,
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
    }
  }
  resolve(e) {
    We(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.resolve(e), this.unregisterAndCleanUp();
  }
  reject(e) {
    We(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.reject(e), this.unregisterAndCleanUp();
  }
  unregisterAndCleanUp() {
    this.eventManager && this.eventManager.unregisterConsumer(this), this.pendingPromise = null, this.cleanUp();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ip = new Hn(2e3, 1e4);
class xt extends au {
  constructor(e, t, r, i, o) {
    super(e, t, i, o), this.provider = r, this.authWindow = null, this.pollId = null, xt.currentPopupAction && xt.currentPopupAction.cancel(), xt.currentPopupAction = this;
  }
  async executeNotNull() {
    const e = await this.execute();
    return M(
      e,
      this.auth,
      "internal-error"
      /* AuthErrorCode.INTERNAL_ERROR */
    ), e;
  }
  async onExecution() {
    We(this.filter.length === 1, "Popup operations only handle one event");
    const e = Rs();
    this.authWindow = await this.resolver._openPopup(
      this.auth,
      this.provider,
      this.filter[0],
      // There's always one, see constructor
      e
    ), this.authWindow.associatedEvent = e, this.resolver._originValidation(this.auth).catch((t) => {
      this.reject(t);
    }), this.resolver._isIframeWebStorageSupported(this.auth, (t) => {
      t || this.reject(ke(
        this.auth,
        "web-storage-unsupported"
        /* AuthErrorCode.WEB_STORAGE_UNSUPPORTED */
      ));
    }), this.pollUserCancellation();
  }
  get eventId() {
    var e;
    return ((e = this.authWindow) === null || e === void 0 ? void 0 : e.associatedEvent) || null;
  }
  cancel() {
    this.reject(ke(
      this.auth,
      "cancelled-popup-request"
      /* AuthErrorCode.EXPIRED_POPUP_REQUEST */
    ));
  }
  cleanUp() {
    this.authWindow && this.authWindow.close(), this.pollId && window.clearTimeout(this.pollId), this.authWindow = null, this.pollId = null, xt.currentPopupAction = null;
  }
  pollUserCancellation() {
    const e = () => {
      var t, r;
      if (!((r = (t = this.authWindow) === null || t === void 0 ? void 0 : t.window) === null || r === void 0) && r.closed) {
        this.pollId = window.setTimeout(
          () => {
            this.pollId = null, this.reject(ke(
              this.auth,
              "popup-closed-by-user"
              /* AuthErrorCode.POPUP_CLOSED_BY_USER */
            ));
          },
          8e3
          /* _Timeout.AUTH_EVENT */
        );
        return;
      }
      this.pollId = window.setTimeout(e, ip.get());
    };
    e();
  }
}
xt.currentPopupAction = null;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const sp = "pendingRedirect", Pr = /* @__PURE__ */ new Map();
class op extends au {
  constructor(e, t, r = !1) {
    super(e, [
      "signInViaRedirect",
      "linkViaRedirect",
      "reauthViaRedirect",
      "unknown"
      /* AuthEventType.UNKNOWN */
    ], t, void 0, r), this.eventId = null;
  }
  /**
   * Override the execute function; if we already have a redirect result, then
   * just return it.
   */
  async execute() {
    let e = Pr.get(this.auth._key());
    if (!e) {
      try {
        const r = await ap(this.resolver, this.auth) ? await super.execute() : null;
        e = () => Promise.resolve(r);
      } catch (t) {
        e = () => Promise.reject(t);
      }
      Pr.set(this.auth._key(), e);
    }
    return this.bypassAuthState || Pr.set(this.auth._key(), () => Promise.resolve(null)), e();
  }
  async onAuthEvent(e) {
    if (e.type === "signInViaRedirect")
      return super.onAuthEvent(e);
    if (e.type === "unknown") {
      this.resolve(null);
      return;
    }
    if (e.eventId) {
      const t = await this.auth._redirectUserForId(e.eventId);
      if (t)
        return this.user = t, super.onAuthEvent(e);
      this.resolve(null);
    }
  }
  async onExecution() {
  }
  cleanUp() {
  }
}
async function ap(n, e) {
  const t = lp(e), r = up(n);
  if (!await r._isAvailable())
    return !1;
  const i = await r._get(t) === "true";
  return await r._remove(t), i;
}
function cp(n, e) {
  Pr.set(n._key(), e);
}
function up(n) {
  return qe(n._redirectPersistence);
}
function lp(n) {
  return Sr(sp, n.config.apiKey, n.name);
}
async function hp(n, e, t = !1) {
  if (Ue(n.app))
    return Promise.reject(ct(n));
  const r = Zt(n), i = ep(r, e), a = await new op(r, i, t).execute();
  return a && !t && (delete a.user._redirectEventId, await r._persistUserIfCurrent(a.user), await r._setRedirectUser(null, e)), a;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const dp = 10 * 60 * 1e3;
class fp {
  constructor(e) {
    this.auth = e, this.cachedEventUids = /* @__PURE__ */ new Set(), this.consumers = /* @__PURE__ */ new Set(), this.queuedRedirectEvent = null, this.hasHandledPotentialRedirect = !1, this.lastProcessedEventTime = Date.now();
  }
  registerConsumer(e) {
    this.consumers.add(e), this.queuedRedirectEvent && this.isEventForConsumer(this.queuedRedirectEvent, e) && (this.sendToConsumer(this.queuedRedirectEvent, e), this.saveEventToCache(this.queuedRedirectEvent), this.queuedRedirectEvent = null);
  }
  unregisterConsumer(e) {
    this.consumers.delete(e);
  }
  onEvent(e) {
    if (this.hasEventBeenHandled(e))
      return !1;
    let t = !1;
    return this.consumers.forEach((r) => {
      this.isEventForConsumer(e, r) && (t = !0, this.sendToConsumer(e, r), this.saveEventToCache(e));
    }), this.hasHandledPotentialRedirect || !pp(e) || (this.hasHandledPotentialRedirect = !0, t || (this.queuedRedirectEvent = e, t = !0)), t;
  }
  sendToConsumer(e, t) {
    var r;
    if (e.error && !cu(e)) {
      const i = ((r = e.error.code) === null || r === void 0 ? void 0 : r.split("auth/")[1]) || "internal-error";
      t.onError(ke(this.auth, i));
    } else
      t.onAuthEvent(e);
  }
  isEventForConsumer(e, t) {
    const r = t.eventId === null || !!e.eventId && e.eventId === t.eventId;
    return t.filter.includes(e.type) && r;
  }
  hasEventBeenHandled(e) {
    return Date.now() - this.lastProcessedEventTime >= dp && this.cachedEventUids.clear(), this.cachedEventUids.has(Ca(e));
  }
  saveEventToCache(e) {
    this.cachedEventUids.add(Ca(e)), this.lastProcessedEventTime = Date.now();
  }
}
function Ca(n) {
  return [n.type, n.eventId, n.sessionId, n.tenantId].filter((e) => e).join("-");
}
function cu({ type: n, error: e }) {
  return n === "unknown" && (e == null ? void 0 : e.code) === "auth/no-auth-event";
}
function pp(n) {
  switch (n.type) {
    case "signInViaRedirect":
    case "linkViaRedirect":
    case "reauthViaRedirect":
      return !0;
    case "unknown":
      return cu(n);
    default:
      return !1;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function mp(n, e = {}) {
  return pt(n, "GET", "/v1/projects", e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const gp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, _p = /^https?/;
async function yp(n) {
  if (n.config.emulator)
    return;
  const { authorizedDomains: e } = await mp(n);
  for (const t of e)
    try {
      if (vp(t))
        return;
    } catch {
    }
  be(
    n,
    "unauthorized-domain"
    /* AuthErrorCode.INVALID_ORIGIN */
  );
}
function vp(n) {
  const e = Xi(), { protocol: t, hostname: r } = new URL(e);
  if (n.startsWith("chrome-extension://")) {
    const a = new URL(n);
    return a.hostname === "" && r === "" ? t === "chrome-extension:" && n.replace("chrome-extension://", "") === e.replace("chrome-extension://", "") : t === "chrome-extension:" && a.hostname === r;
  }
  if (!_p.test(t))
    return !1;
  if (gp.test(n))
    return r === n;
  const i = n.replace(/\./g, "\\.");
  return new RegExp("^(.+\\." + i + "|" + i + ")$", "i").test(r);
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ep = new Hn(3e4, 6e4);
function ba() {
  const n = Ve().___jsl;
  if (n != null && n.H) {
    for (const e of Object.keys(n.H))
      if (n.H[e].r = n.H[e].r || [], n.H[e].L = n.H[e].L || [], n.H[e].r = [...n.H[e].L], n.CP)
        for (let t = 0; t < n.CP.length; t++)
          n.CP[t] = null;
  }
}
function Tp(n) {
  return new Promise((e, t) => {
    var r, i, o;
    function a() {
      ba(), gapi.load("gapi.iframes", {
        callback: () => {
          e(gapi.iframes.getContext());
        },
        ontimeout: () => {
          ba(), t(ke(
            n,
            "network-request-failed"
            /* AuthErrorCode.NETWORK_REQUEST_FAILED */
          ));
        },
        timeout: Ep.get()
      });
    }
    if (!((i = (r = Ve().gapi) === null || r === void 0 ? void 0 : r.iframes) === null || i === void 0) && i.Iframe)
      e(gapi.iframes.getContext());
    else if (!((o = Ve().gapi) === null || o === void 0) && o.load)
      a();
    else {
      const u = _f("iframefcb");
      return Ve()[u] = () => {
        gapi.load ? a() : t(ke(
          n,
          "network-request-failed"
          /* AuthErrorCode.NETWORK_REQUEST_FAILED */
        ));
      }, Gc(`${gf()}?onload=${u}`).catch((h) => t(h));
    }
  }).catch((e) => {
    throw Cr = null, e;
  });
}
let Cr = null;
function Ip(n) {
  return Cr = Cr || Tp(n), Cr;
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const wp = new Hn(5e3, 15e3), Ap = "__/auth/iframe", Rp = "emulator/auth/iframe", Sp = {
  style: {
    position: "absolute",
    top: "-100px",
    width: "1px",
    height: "1px"
  },
  "aria-hidden": "true",
  tabindex: "-1"
}, Pp = /* @__PURE__ */ new Map([
  ["identitytoolkit.googleapis.com", "p"],
  ["staging-identitytoolkit.sandbox.googleapis.com", "s"],
  ["test-identitytoolkit.sandbox.googleapis.com", "t"]
  // test
]);
function Cp(n) {
  const e = n.config;
  M(
    e.authDomain,
    n,
    "auth-domain-config-required"
    /* AuthErrorCode.MISSING_AUTH_DOMAIN */
  );
  const t = e.emulator ? Es(e, Rp) : `https://${n.config.authDomain}/${Ap}`, r = {
    apiKey: e.apiKey,
    appName: n.name,
    v: Xt
  }, i = Pp.get(n.config.apiHost);
  i && (r.eid = i);
  const o = n._getFrameworks();
  return o.length && (r.fw = o.join(",")), `${t}?${Wn(r).slice(1)}`;
}
async function bp(n) {
  const e = await Ip(n), t = Ve().gapi;
  return M(
    t,
    n,
    "internal-error"
    /* AuthErrorCode.INTERNAL_ERROR */
  ), e.open({
    where: document.body,
    url: Cp(n),
    messageHandlersFilter: t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
    attributes: Sp,
    dontclear: !0
  }, (r) => new Promise(async (i, o) => {
    await r.restyle({
      // Prevent iframe from closing on mouse out.
      setHideOnLeave: !1
    });
    const a = ke(
      n,
      "network-request-failed"
      /* AuthErrorCode.NETWORK_REQUEST_FAILED */
    ), u = Ve().setTimeout(() => {
      o(a);
    }, wp.get());
    function h() {
      Ve().clearTimeout(u), i(r);
    }
    r.ping(h).then(h, () => {
      o(a);
    });
  }));
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const kp = {
  location: "yes",
  resizable: "yes",
  statusbar: "yes",
  toolbar: "no"
}, Vp = 500, Dp = 600, Np = "_blank", Op = "http://localhost";
class ka {
  constructor(e) {
    this.window = e, this.associatedEvent = null;
  }
  close() {
    if (this.window)
      try {
        this.window.close();
      } catch {
      }
  }
}
function Lp(n, e, t, r = Vp, i = Dp) {
  const o = Math.max((window.screen.availHeight - i) / 2, 0).toString(), a = Math.max((window.screen.availWidth - r) / 2, 0).toString();
  let u = "";
  const h = Object.assign(Object.assign({}, kp), {
    width: r.toString(),
    height: i.toString(),
    top: o,
    left: a
  }), d = ve().toLowerCase();
  t && (u = jc(d) ? Np : t), Uc(d) && (e = e || Op, h.scrollbars = "yes");
  const m = Object.entries(h).reduce((R, [P, V]) => `${R}${P}=${V},`, "");
  if (af(d) && u !== "_self")
    return Mp(e || "", u), new ka(null);
  const w = window.open(e || "", u, m);
  M(
    w,
    n,
    "popup-blocked"
    /* AuthErrorCode.POPUP_BLOCKED */
  );
  try {
    w.focus();
  } catch {
  }
  return new ka(w);
}
function Mp(n, e) {
  const t = document.createElement("a");
  t.href = n, t.target = e;
  const r = document.createEvent("MouseEvent");
  r.initMouseEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 1, null), t.dispatchEvent(r);
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const xp = "__/auth/handler", Fp = "emulator/auth/handler", Up = encodeURIComponent("fac");
async function Va(n, e, t, r, i, o) {
  M(
    n.config.authDomain,
    n,
    "auth-domain-config-required"
    /* AuthErrorCode.MISSING_AUTH_DOMAIN */
  ), M(
    n.config.apiKey,
    n,
    "invalid-api-key"
    /* AuthErrorCode.INVALID_API_KEY */
  );
  const a = {
    apiKey: n.config.apiKey,
    appName: n.name,
    authType: t,
    redirectUrl: r,
    v: Xt,
    eventId: i
  };
  if (e instanceof Yc) {
    e.setDefaultLanguage(n.languageCode), a.providerId = e.providerId || "", kh(e.getCustomParameters()) || (a.customParameters = JSON.stringify(e.getCustomParameters()));
    for (const [m, w] of Object.entries({}))
      a[m] = w;
  }
  if (e instanceof Kn) {
    const m = e.getScopes().filter((w) => w !== "");
    m.length > 0 && (a.scopes = m.join(","));
  }
  n.tenantId && (a.tid = n.tenantId);
  const u = a;
  for (const m of Object.keys(u))
    u[m] === void 0 && delete u[m];
  const h = await n._getAppCheckToken(), d = h ? `#${Up}=${encodeURIComponent(h)}` : "";
  return `${Bp(n)}?${Wn(u).slice(1)}${d}`;
}
function Bp({ config: n }) {
  return n.emulator ? Es(n, Fp) : `https://${n.authDomain}/${xp}`;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const qi = "webStorageSupport";
class jp {
  constructor() {
    this.eventManagers = {}, this.iframes = {}, this.originValidationPromises = {}, this._redirectPersistence = nu, this._completeRedirectFn = hp, this._overrideRedirectResult = cp;
  }
  // Wrapping in async even though we don't await anywhere in order
  // to make sure errors are raised as promise rejections
  async _openPopup(e, t, r, i) {
    var o;
    We((o = this.eventManagers[e._key()]) === null || o === void 0 ? void 0 : o.manager, "_initialize() not called before _openPopup()");
    const a = await Va(e, t, r, Xi(), i);
    return Lp(e, a, Rs());
  }
  async _openRedirect(e, t, r, i) {
    await this._originValidation(e);
    const o = await Va(e, t, r, Xi(), i);
    return zf(o), new Promise(() => {
    });
  }
  _initialize(e) {
    const t = e._key();
    if (this.eventManagers[t]) {
      const { manager: i, promise: o } = this.eventManagers[t];
      return i ? Promise.resolve(i) : (We(o, "If manager is not set, promise should be"), o);
    }
    const r = this.initAndGetManager(e);
    return this.eventManagers[t] = { promise: r }, r.catch(() => {
      delete this.eventManagers[t];
    }), r;
  }
  async initAndGetManager(e) {
    const t = await bp(e), r = new fp(e);
    return t.register("authEvent", (i) => (M(
      i == null ? void 0 : i.authEvent,
      e,
      "invalid-auth-event"
      /* AuthErrorCode.INVALID_AUTH_EVENT */
    ), {
      status: r.onEvent(i.authEvent) ? "ACK" : "ERROR"
      /* GapiOutcome.ERROR */
    }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER), this.eventManagers[e._key()] = { manager: r }, this.iframes[e._key()] = t, r;
  }
  _isIframeWebStorageSupported(e, t) {
    this.iframes[e._key()].send(qi, { type: qi }, (i) => {
      var o;
      const a = (o = i == null ? void 0 : i[0]) === null || o === void 0 ? void 0 : o[qi];
      a !== void 0 && t(!!a), be(
        e,
        "internal-error"
        /* AuthErrorCode.INTERNAL_ERROR */
      );
    }, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
  }
  _originValidation(e) {
    const t = e._key();
    return this.originValidationPromises[t] || (this.originValidationPromises[t] = yp(e)), this.originValidationPromises[t];
  }
  get _shouldInitProactively() {
    return Hc() || Bc() || Is();
  }
}
const qp = jp;
var Da = "@firebase/auth", Na = "1.7.9";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class $p {
  constructor(e) {
    this.auth = e, this.internalListeners = /* @__PURE__ */ new Map();
  }
  getUid() {
    var e;
    return this.assertAuthConfigured(), ((e = this.auth.currentUser) === null || e === void 0 ? void 0 : e.uid) || null;
  }
  async getToken(e) {
    return this.assertAuthConfigured(), await this.auth._initializationPromise, this.auth.currentUser ? { accessToken: await this.auth.currentUser.getIdToken(e) } : null;
  }
  addAuthTokenListener(e) {
    if (this.assertAuthConfigured(), this.internalListeners.has(e))
      return;
    const t = this.auth.onIdTokenChanged((r) => {
      e((r == null ? void 0 : r.stsTokenManager.accessToken) || null);
    });
    this.internalListeners.set(e, t), this.updateProactiveRefresh();
  }
  removeAuthTokenListener(e) {
    this.assertAuthConfigured();
    const t = this.internalListeners.get(e);
    t && (this.internalListeners.delete(e), t(), this.updateProactiveRefresh());
  }
  assertAuthConfigured() {
    M(
      this.auth._initializationPromise,
      "dependent-sdk-initialized-before-auth"
      /* AuthErrorCode.DEPENDENT_SDK_INIT_BEFORE_AUTH */
    );
  }
  updateProactiveRefresh() {
    this.internalListeners.size > 0 ? this.auth._startProactiveRefresh() : this.auth._stopProactiveRefresh();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function zp(n) {
  switch (n) {
    case "Node":
      return "node";
    case "ReactNative":
      return "rn";
    case "Worker":
      return "webworker";
    case "Cordova":
      return "cordova";
    case "WebExtension":
      return "web-extension";
    default:
      return;
  }
}
function Wp(n) {
  $t(new It(
    "auth",
    (e, { options: t }) => {
      const r = e.getProvider("app").getImmediate(), i = e.getProvider("heartbeat"), o = e.getProvider("app-check-internal"), { apiKey: a, authDomain: u } = r.options;
      M(a && !a.includes(":"), "invalid-api-key", { appName: r.name });
      const h = {
        apiKey: a,
        authDomain: u,
        clientPlatform: n,
        apiHost: "identitytoolkit.googleapis.com",
        tokenApiHost: "securetoken.googleapis.com",
        apiScheme: "https",
        sdkClientVersion: Kc(n)
      }, d = new ff(r, i, o, h);
      return If(d, t), d;
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ).setInstanceCreatedCallback((e, t, r) => {
    e.getProvider(
      "auth-internal"
      /* _ComponentName.AUTH_INTERNAL */
    ).initialize();
  })), $t(new It(
    "auth-internal",
    (e) => {
      const t = Zt(e.getProvider(
        "auth"
        /* _ComponentName.AUTH */
      ).getImmediate());
      return ((r) => new $p(r))(t);
    },
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  )), at(Da, Na, zp(n)), at(Da, Na, "esm2017");
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Hp = 5 * 60, Kp = wc("authIdTokenMaxAge") || Hp;
let Oa = null;
const Gp = (n) => async (e) => {
  const t = e && await e.getIdTokenResult(), r = t && ((/* @__PURE__ */ new Date()).getTime() - Date.parse(t.issuedAtTime)) / 1e3;
  if (r && r > Kp)
    return;
  const i = t == null ? void 0 : t.token;
  Oa !== i && (Oa = i, await fetch(n, {
    method: i ? "POST" : "DELETE",
    headers: i ? {
      Authorization: `Bearer ${i}`
    } : {}
  }));
};
function Qp(n = Pc()) {
  const e = _s(n, "auth");
  if (e.isInitialized())
    return e.getImmediate();
  const t = Tf(n, {
    popupRedirectResolver: qp,
    persistence: [
      Zf,
      jf,
      nu
    ]
  }), r = wc("authTokenSyncURL");
  if (r && typeof isSecureContext == "boolean" && isSecureContext) {
    const o = new URL(r, location.origin);
    if (location.origin === o.origin) {
      const a = Gp(o.toString());
      Ff(t, a, () => a(t.currentUser)), xf(t, (u) => a(u));
    }
  }
  const i = Tc("auth");
  return i && wf(t, `http://${i}`), t;
}
function Yp() {
  var n, e;
  return (e = (n = document.getElementsByTagName("head")) === null || n === void 0 ? void 0 : n[0]) !== null && e !== void 0 ? e : document;
}
pf({
  loadJS(n) {
    return new Promise((e, t) => {
      const r = document.createElement("script");
      r.setAttribute("src", n), r.onload = e, r.onerror = (i) => {
        const o = ke(
          "internal-error"
          /* AuthErrorCode.INTERNAL_ERROR */
        );
        o.customData = i, t(o);
      }, r.type = "text/javascript", r.charset = "UTF-8", Yp().appendChild(r);
    });
  },
  gapiScript: "https://apis.google.com/js/api.js",
  recaptchaV2Script: "https://www.google.com/recaptcha/api.js",
  recaptchaEnterpriseScript: "https://www.google.com/recaptcha/enterprise.js?render="
});
Wp(
  "Browser"
  /* ClientPlatform.BROWSER */
);
var La = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/
var Tt, uu;
(function() {
  var n;
  /** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
  function e(v, p) {
    function _() {
    }
    _.prototype = p.prototype, v.D = p.prototype, v.prototype = new _(), v.prototype.constructor = v, v.C = function(y, E, I) {
      for (var g = Array(arguments.length - 2), Me = 2; Me < arguments.length; Me++) g[Me - 2] = arguments[Me];
      return p.prototype[E].apply(y, g);
    };
  }
  function t() {
    this.blockSize = -1;
  }
  function r() {
    this.blockSize = -1, this.blockSize = 64, this.g = Array(4), this.B = Array(this.blockSize), this.o = this.h = 0, this.s();
  }
  e(r, t), r.prototype.s = function() {
    this.g[0] = 1732584193, this.g[1] = 4023233417, this.g[2] = 2562383102, this.g[3] = 271733878, this.o = this.h = 0;
  };
  function i(v, p, _) {
    _ || (_ = 0);
    var y = Array(16);
    if (typeof p == "string") for (var E = 0; 16 > E; ++E) y[E] = p.charCodeAt(_++) | p.charCodeAt(_++) << 8 | p.charCodeAt(_++) << 16 | p.charCodeAt(_++) << 24;
    else for (E = 0; 16 > E; ++E) y[E] = p[_++] | p[_++] << 8 | p[_++] << 16 | p[_++] << 24;
    p = v.g[0], _ = v.g[1], E = v.g[2];
    var I = v.g[3], g = p + (I ^ _ & (E ^ I)) + y[0] + 3614090360 & 4294967295;
    p = _ + (g << 7 & 4294967295 | g >>> 25), g = I + (E ^ p & (_ ^ E)) + y[1] + 3905402710 & 4294967295, I = p + (g << 12 & 4294967295 | g >>> 20), g = E + (_ ^ I & (p ^ _)) + y[2] + 606105819 & 4294967295, E = I + (g << 17 & 4294967295 | g >>> 15), g = _ + (p ^ E & (I ^ p)) + y[3] + 3250441966 & 4294967295, _ = E + (g << 22 & 4294967295 | g >>> 10), g = p + (I ^ _ & (E ^ I)) + y[4] + 4118548399 & 4294967295, p = _ + (g << 7 & 4294967295 | g >>> 25), g = I + (E ^ p & (_ ^ E)) + y[5] + 1200080426 & 4294967295, I = p + (g << 12 & 4294967295 | g >>> 20), g = E + (_ ^ I & (p ^ _)) + y[6] + 2821735955 & 4294967295, E = I + (g << 17 & 4294967295 | g >>> 15), g = _ + (p ^ E & (I ^ p)) + y[7] + 4249261313 & 4294967295, _ = E + (g << 22 & 4294967295 | g >>> 10), g = p + (I ^ _ & (E ^ I)) + y[8] + 1770035416 & 4294967295, p = _ + (g << 7 & 4294967295 | g >>> 25), g = I + (E ^ p & (_ ^ E)) + y[9] + 2336552879 & 4294967295, I = p + (g << 12 & 4294967295 | g >>> 20), g = E + (_ ^ I & (p ^ _)) + y[10] + 4294925233 & 4294967295, E = I + (g << 17 & 4294967295 | g >>> 15), g = _ + (p ^ E & (I ^ p)) + y[11] + 2304563134 & 4294967295, _ = E + (g << 22 & 4294967295 | g >>> 10), g = p + (I ^ _ & (E ^ I)) + y[12] + 1804603682 & 4294967295, p = _ + (g << 7 & 4294967295 | g >>> 25), g = I + (E ^ p & (_ ^ E)) + y[13] + 4254626195 & 4294967295, I = p + (g << 12 & 4294967295 | g >>> 20), g = E + (_ ^ I & (p ^ _)) + y[14] + 2792965006 & 4294967295, E = I + (g << 17 & 4294967295 | g >>> 15), g = _ + (p ^ E & (I ^ p)) + y[15] + 1236535329 & 4294967295, _ = E + (g << 22 & 4294967295 | g >>> 10), g = p + (E ^ I & (_ ^ E)) + y[1] + 4129170786 & 4294967295, p = _ + (g << 5 & 4294967295 | g >>> 27), g = I + (_ ^ E & (p ^ _)) + y[6] + 3225465664 & 4294967295, I = p + (g << 9 & 4294967295 | g >>> 23), g = E + (p ^ _ & (I ^ p)) + y[11] + 643717713 & 4294967295, E = I + (g << 14 & 4294967295 | g >>> 18), g = _ + (I ^ p & (E ^ I)) + y[0] + 3921069994 & 4294967295, _ = E + (g << 20 & 4294967295 | g >>> 12), g = p + (E ^ I & (_ ^ E)) + y[5] + 3593408605 & 4294967295, p = _ + (g << 5 & 4294967295 | g >>> 27), g = I + (_ ^ E & (p ^ _)) + y[10] + 38016083 & 4294967295, I = p + (g << 9 & 4294967295 | g >>> 23), g = E + (p ^ _ & (I ^ p)) + y[15] + 3634488961 & 4294967295, E = I + (g << 14 & 4294967295 | g >>> 18), g = _ + (I ^ p & (E ^ I)) + y[4] + 3889429448 & 4294967295, _ = E + (g << 20 & 4294967295 | g >>> 12), g = p + (E ^ I & (_ ^ E)) + y[9] + 568446438 & 4294967295, p = _ + (g << 5 & 4294967295 | g >>> 27), g = I + (_ ^ E & (p ^ _)) + y[14] + 3275163606 & 4294967295, I = p + (g << 9 & 4294967295 | g >>> 23), g = E + (p ^ _ & (I ^ p)) + y[3] + 4107603335 & 4294967295, E = I + (g << 14 & 4294967295 | g >>> 18), g = _ + (I ^ p & (E ^ I)) + y[8] + 1163531501 & 4294967295, _ = E + (g << 20 & 4294967295 | g >>> 12), g = p + (E ^ I & (_ ^ E)) + y[13] + 2850285829 & 4294967295, p = _ + (g << 5 & 4294967295 | g >>> 27), g = I + (_ ^ E & (p ^ _)) + y[2] + 4243563512 & 4294967295, I = p + (g << 9 & 4294967295 | g >>> 23), g = E + (p ^ _ & (I ^ p)) + y[7] + 1735328473 & 4294967295, E = I + (g << 14 & 4294967295 | g >>> 18), g = _ + (I ^ p & (E ^ I)) + y[12] + 2368359562 & 4294967295, _ = E + (g << 20 & 4294967295 | g >>> 12), g = p + (_ ^ E ^ I) + y[5] + 4294588738 & 4294967295, p = _ + (g << 4 & 4294967295 | g >>> 28), g = I + (p ^ _ ^ E) + y[8] + 2272392833 & 4294967295, I = p + (g << 11 & 4294967295 | g >>> 21), g = E + (I ^ p ^ _) + y[11] + 1839030562 & 4294967295, E = I + (g << 16 & 4294967295 | g >>> 16), g = _ + (E ^ I ^ p) + y[14] + 4259657740 & 4294967295, _ = E + (g << 23 & 4294967295 | g >>> 9), g = p + (_ ^ E ^ I) + y[1] + 2763975236 & 4294967295, p = _ + (g << 4 & 4294967295 | g >>> 28), g = I + (p ^ _ ^ E) + y[4] + 1272893353 & 4294967295, I = p + (g << 11 & 4294967295 | g >>> 21), g = E + (I ^ p ^ _) + y[7] + 4139469664 & 4294967295, E = I + (g << 16 & 4294967295 | g >>> 16), g = _ + (E ^ I ^ p) + y[10] + 3200236656 & 4294967295, _ = E + (g << 23 & 4294967295 | g >>> 9), g = p + (_ ^ E ^ I) + y[13] + 681279174 & 4294967295, p = _ + (g << 4 & 4294967295 | g >>> 28), g = I + (p ^ _ ^ E) + y[0] + 3936430074 & 4294967295, I = p + (g << 11 & 4294967295 | g >>> 21), g = E + (I ^ p ^ _) + y[3] + 3572445317 & 4294967295, E = I + (g << 16 & 4294967295 | g >>> 16), g = _ + (E ^ I ^ p) + y[6] + 76029189 & 4294967295, _ = E + (g << 23 & 4294967295 | g >>> 9), g = p + (_ ^ E ^ I) + y[9] + 3654602809 & 4294967295, p = _ + (g << 4 & 4294967295 | g >>> 28), g = I + (p ^ _ ^ E) + y[12] + 3873151461 & 4294967295, I = p + (g << 11 & 4294967295 | g >>> 21), g = E + (I ^ p ^ _) + y[15] + 530742520 & 4294967295, E = I + (g << 16 & 4294967295 | g >>> 16), g = _ + (E ^ I ^ p) + y[2] + 3299628645 & 4294967295, _ = E + (g << 23 & 4294967295 | g >>> 9), g = p + (E ^ (_ | ~I)) + y[0] + 4096336452 & 4294967295, p = _ + (g << 6 & 4294967295 | g >>> 26), g = I + (_ ^ (p | ~E)) + y[7] + 1126891415 & 4294967295, I = p + (g << 10 & 4294967295 | g >>> 22), g = E + (p ^ (I | ~_)) + y[14] + 2878612391 & 4294967295, E = I + (g << 15 & 4294967295 | g >>> 17), g = _ + (I ^ (E | ~p)) + y[5] + 4237533241 & 4294967295, _ = E + (g << 21 & 4294967295 | g >>> 11), g = p + (E ^ (_ | ~I)) + y[12] + 1700485571 & 4294967295, p = _ + (g << 6 & 4294967295 | g >>> 26), g = I + (_ ^ (p | ~E)) + y[3] + 2399980690 & 4294967295, I = p + (g << 10 & 4294967295 | g >>> 22), g = E + (p ^ (I | ~_)) + y[10] + 4293915773 & 4294967295, E = I + (g << 15 & 4294967295 | g >>> 17), g = _ + (I ^ (E | ~p)) + y[1] + 2240044497 & 4294967295, _ = E + (g << 21 & 4294967295 | g >>> 11), g = p + (E ^ (_ | ~I)) + y[8] + 1873313359 & 4294967295, p = _ + (g << 6 & 4294967295 | g >>> 26), g = I + (_ ^ (p | ~E)) + y[15] + 4264355552 & 4294967295, I = p + (g << 10 & 4294967295 | g >>> 22), g = E + (p ^ (I | ~_)) + y[6] + 2734768916 & 4294967295, E = I + (g << 15 & 4294967295 | g >>> 17), g = _ + (I ^ (E | ~p)) + y[13] + 1309151649 & 4294967295, _ = E + (g << 21 & 4294967295 | g >>> 11), g = p + (E ^ (_ | ~I)) + y[4] + 4149444226 & 4294967295, p = _ + (g << 6 & 4294967295 | g >>> 26), g = I + (_ ^ (p | ~E)) + y[11] + 3174756917 & 4294967295, I = p + (g << 10 & 4294967295 | g >>> 22), g = E + (p ^ (I | ~_)) + y[2] + 718787259 & 4294967295, E = I + (g << 15 & 4294967295 | g >>> 17), g = _ + (I ^ (E | ~p)) + y[9] + 3951481745 & 4294967295, v.g[0] = v.g[0] + p & 4294967295, v.g[1] = v.g[1] + (E + (g << 21 & 4294967295 | g >>> 11)) & 4294967295, v.g[2] = v.g[2] + E & 4294967295, v.g[3] = v.g[3] + I & 4294967295;
  }
  r.prototype.u = function(v, p) {
    p === void 0 && (p = v.length);
    for (var _ = p - this.blockSize, y = this.B, E = this.h, I = 0; I < p; ) {
      if (E == 0) for (; I <= _; ) i(this, v, I), I += this.blockSize;
      if (typeof v == "string") {
        for (; I < p; )
          if (y[E++] = v.charCodeAt(I++), E == this.blockSize) {
            i(this, y), E = 0;
            break;
          }
      } else for (; I < p; ) if (y[E++] = v[I++], E == this.blockSize) {
        i(this, y), E = 0;
        break;
      }
    }
    this.h = E, this.o += p;
  }, r.prototype.v = function() {
    var v = Array((56 > this.h ? this.blockSize : 2 * this.blockSize) - this.h);
    v[0] = 128;
    for (var p = 1; p < v.length - 8; ++p) v[p] = 0;
    var _ = 8 * this.o;
    for (p = v.length - 8; p < v.length; ++p) v[p] = _ & 255, _ /= 256;
    for (this.u(v), v = Array(16), p = _ = 0; 4 > p; ++p) for (var y = 0; 32 > y; y += 8) v[_++] = this.g[p] >>> y & 255;
    return v;
  };
  function o(v, p) {
    var _ = u;
    return Object.prototype.hasOwnProperty.call(_, v) ? _[v] : _[v] = p(v);
  }
  function a(v, p) {
    this.h = p;
    for (var _ = [], y = !0, E = v.length - 1; 0 <= E; E--) {
      var I = v[E] | 0;
      y && I == p || (_[E] = I, y = !1);
    }
    this.g = _;
  }
  var u = {};
  function h(v) {
    return -128 <= v && 128 > v ? o(v, function(p) {
      return new a([p | 0], 0 > p ? -1 : 0);
    }) : new a([v | 0], 0 > v ? -1 : 0);
  }
  function d(v) {
    if (isNaN(v) || !isFinite(v)) return w;
    if (0 > v) return k(d(-v));
    for (var p = [], _ = 1, y = 0; v >= _; y++) p[y] = v / _ | 0, _ *= 4294967296;
    return new a(p, 0);
  }
  function m(v, p) {
    if (v.length == 0) throw Error("number format error: empty string");
    if (p = p || 10, 2 > p || 36 < p) throw Error("radix out of range: " + p);
    if (v.charAt(0) == "-") return k(m(v.substring(1), p));
    if (0 <= v.indexOf("-")) throw Error('number format error: interior "-" character');
    for (var _ = d(Math.pow(p, 8)), y = w, E = 0; E < v.length; E += 8) {
      var I = Math.min(8, v.length - E), g = parseInt(v.substring(E, E + I), p);
      8 > I ? (I = d(Math.pow(p, I)), y = y.j(I).add(d(g))) : (y = y.j(_), y = y.add(d(g)));
    }
    return y;
  }
  var w = h(0), R = h(1), P = h(16777216);
  n = a.prototype, n.m = function() {
    if (N(this)) return -k(this).m();
    for (var v = 0, p = 1, _ = 0; _ < this.g.length; _++) {
      var y = this.i(_);
      v += (0 <= y ? y : 4294967296 + y) * p, p *= 4294967296;
    }
    return v;
  }, n.toString = function(v) {
    if (v = v || 10, 2 > v || 36 < v) throw Error("radix out of range: " + v);
    if (V(this)) return "0";
    if (N(this)) return "-" + k(this).toString(v);
    for (var p = d(Math.pow(v, 6)), _ = this, y = ""; ; ) {
      var E = ee(_, p).g;
      _ = W(_, E.j(p));
      var I = ((0 < _.g.length ? _.g[0] : _.h) >>> 0).toString(v);
      if (_ = E, V(_)) return I + y;
      for (; 6 > I.length; ) I = "0" + I;
      y = I + y;
    }
  }, n.i = function(v) {
    return 0 > v ? 0 : v < this.g.length ? this.g[v] : this.h;
  };
  function V(v) {
    if (v.h != 0) return !1;
    for (var p = 0; p < v.g.length; p++) if (v.g[p] != 0) return !1;
    return !0;
  }
  function N(v) {
    return v.h == -1;
  }
  n.l = function(v) {
    return v = W(this, v), N(v) ? -1 : V(v) ? 0 : 1;
  };
  function k(v) {
    for (var p = v.g.length, _ = [], y = 0; y < p; y++) _[y] = ~v.g[y];
    return new a(_, ~v.h).add(R);
  }
  n.abs = function() {
    return N(this) ? k(this) : this;
  }, n.add = function(v) {
    for (var p = Math.max(this.g.length, v.g.length), _ = [], y = 0, E = 0; E <= p; E++) {
      var I = y + (this.i(E) & 65535) + (v.i(E) & 65535), g = (I >>> 16) + (this.i(E) >>> 16) + (v.i(E) >>> 16);
      y = g >>> 16, I &= 65535, g &= 65535, _[E] = g << 16 | I;
    }
    return new a(_, _[_.length - 1] & -2147483648 ? -1 : 0);
  };
  function W(v, p) {
    return v.add(k(p));
  }
  n.j = function(v) {
    if (V(this) || V(v)) return w;
    if (N(this)) return N(v) ? k(this).j(k(v)) : k(k(this).j(v));
    if (N(v)) return k(this.j(k(v)));
    if (0 > this.l(P) && 0 > v.l(P)) return d(this.m() * v.m());
    for (var p = this.g.length + v.g.length, _ = [], y = 0; y < 2 * p; y++) _[y] = 0;
    for (y = 0; y < this.g.length; y++) for (var E = 0; E < v.g.length; E++) {
      var I = this.i(y) >>> 16, g = this.i(y) & 65535, Me = v.i(E) >>> 16, on = v.i(E) & 65535;
      _[2 * y + 2 * E] += g * on, H(_, 2 * y + 2 * E), _[2 * y + 2 * E + 1] += I * on, H(_, 2 * y + 2 * E + 1), _[2 * y + 2 * E + 1] += g * Me, H(_, 2 * y + 2 * E + 1), _[2 * y + 2 * E + 2] += I * Me, H(_, 2 * y + 2 * E + 2);
    }
    for (y = 0; y < p; y++) _[y] = _[2 * y + 1] << 16 | _[2 * y];
    for (y = p; y < 2 * p; y++) _[y] = 0;
    return new a(_, 0);
  };
  function H(v, p) {
    for (; (v[p] & 65535) != v[p]; ) v[p + 1] += v[p] >>> 16, v[p] &= 65535, p++;
  }
  function K(v, p) {
    this.g = v, this.h = p;
  }
  function ee(v, p) {
    if (V(p)) throw Error("division by zero");
    if (V(v)) return new K(w, w);
    if (N(v)) return p = ee(k(v), p), new K(k(p.g), k(p.h));
    if (N(p)) return p = ee(v, k(p)), new K(k(p.g), p.h);
    if (30 < v.g.length) {
      if (N(v) || N(p)) throw Error("slowDivide_ only works with positive integers.");
      for (var _ = R, y = p; 0 >= y.l(v); ) _ = Ae(_), y = Ae(y);
      var E = te(_, 1), I = te(y, 1);
      for (y = te(y, 2), _ = te(_, 2); !V(y); ) {
        var g = I.add(y);
        0 >= g.l(v) && (E = E.add(_), I = g), y = te(y, 1), _ = te(_, 1);
      }
      return p = W(v, E.j(p)), new K(E, p);
    }
    for (E = w; 0 <= v.l(p); ) {
      for (_ = Math.max(1, Math.floor(v.m() / p.m())), y = Math.ceil(Math.log(_) / Math.LN2), y = 48 >= y ? 1 : Math.pow(2, y - 48), I = d(_), g = I.j(p); N(g) || 0 < g.l(v); ) _ -= y, I = d(_), g = I.j(p);
      V(I) && (I = R), E = E.add(I), v = W(v, g);
    }
    return new K(E, v);
  }
  n.A = function(v) {
    return ee(this, v).h;
  }, n.and = function(v) {
    for (var p = Math.max(this.g.length, v.g.length), _ = [], y = 0; y < p; y++) _[y] = this.i(y) & v.i(y);
    return new a(_, this.h & v.h);
  }, n.or = function(v) {
    for (var p = Math.max(this.g.length, v.g.length), _ = [], y = 0; y < p; y++) _[y] = this.i(y) | v.i(y);
    return new a(_, this.h | v.h);
  }, n.xor = function(v) {
    for (var p = Math.max(this.g.length, v.g.length), _ = [], y = 0; y < p; y++) _[y] = this.i(y) ^ v.i(y);
    return new a(_, this.h ^ v.h);
  };
  function Ae(v) {
    for (var p = v.g.length + 1, _ = [], y = 0; y < p; y++) _[y] = v.i(y) << 1 | v.i(y - 1) >>> 31;
    return new a(_, v.h);
  }
  function te(v, p) {
    var _ = p >> 5;
    p %= 32;
    for (var y = v.g.length - _, E = [], I = 0; I < y; I++) E[I] = 0 < p ? v.i(I + _) >>> p | v.i(I + _ + 1) << 32 - p : v.i(I + _);
    return new a(E, v.h);
  }
  r.prototype.digest = r.prototype.v, r.prototype.reset = r.prototype.s, r.prototype.update = r.prototype.u, uu = r, a.prototype.add = a.prototype.add, a.prototype.multiply = a.prototype.j, a.prototype.modulo = a.prototype.A, a.prototype.compare = a.prototype.l, a.prototype.toNumber = a.prototype.m, a.prototype.toString = a.prototype.toString, a.prototype.getBits = a.prototype.i, a.fromNumber = d, a.fromString = m, Tt = a;
}).apply(typeof La < "u" ? La : typeof self < "u" ? self : typeof window < "u" ? window : {});
var Tr = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/
var lu, Sn, hu, br, ts, du, fu, pu;
(function() {
  var n, e = typeof Object.defineProperties == "function" ? Object.defineProperty : function(s, c, l) {
    return s == Array.prototype || s == Object.prototype || (s[c] = l.value), s;
  };
  function t(s) {
    s = [typeof globalThis == "object" && globalThis, s, typeof window == "object" && window, typeof self == "object" && self, typeof Tr == "object" && Tr];
    for (var c = 0; c < s.length; ++c) {
      var l = s[c];
      if (l && l.Math == Math) return l;
    }
    throw Error("Cannot find global object");
  }
  var r = t(this);
  function i(s, c) {
    if (c) e: {
      var l = r;
      s = s.split(".");
      for (var f = 0; f < s.length - 1; f++) {
        var T = s[f];
        if (!(T in l)) break e;
        l = l[T];
      }
      s = s[s.length - 1], f = l[s], c = c(f), c != f && c != null && e(l, s, { configurable: !0, writable: !0, value: c });
    }
  }
  function o(s, c) {
    s instanceof String && (s += "");
    var l = 0, f = !1, T = { next: function() {
      if (!f && l < s.length) {
        var A = l++;
        return { value: c(A, s[A]), done: !1 };
      }
      return f = !0, { done: !0, value: void 0 };
    } };
    return T[Symbol.iterator] = function() {
      return T;
    }, T;
  }
  i("Array.prototype.values", function(s) {
    return s || function() {
      return o(this, function(c, l) {
        return l;
      });
    };
  });
  /** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */
  var a = a || {}, u = this || self;
  function h(s) {
    var c = typeof s;
    return c = c != "object" ? c : s ? Array.isArray(s) ? "array" : c : "null", c == "array" || c == "object" && typeof s.length == "number";
  }
  function d(s) {
    var c = typeof s;
    return c == "object" && s != null || c == "function";
  }
  function m(s, c, l) {
    return s.call.apply(s.bind, arguments);
  }
  function w(s, c, l) {
    if (!s) throw Error();
    if (2 < arguments.length) {
      var f = Array.prototype.slice.call(arguments, 2);
      return function() {
        var T = Array.prototype.slice.call(arguments);
        return Array.prototype.unshift.apply(T, f), s.apply(c, T);
      };
    }
    return function() {
      return s.apply(c, arguments);
    };
  }
  function R(s, c, l) {
    return R = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? m : w, R.apply(null, arguments);
  }
  function P(s, c) {
    var l = Array.prototype.slice.call(arguments, 1);
    return function() {
      var f = l.slice();
      return f.push.apply(f, arguments), s.apply(this, f);
    };
  }
  function V(s, c) {
    function l() {
    }
    l.prototype = c.prototype, s.aa = c.prototype, s.prototype = new l(), s.prototype.constructor = s, s.Qb = function(f, T, A) {
      for (var b = Array(arguments.length - 2), Q = 2; Q < arguments.length; Q++) b[Q - 2] = arguments[Q];
      return c.prototype[T].apply(f, b);
    };
  }
  function N(s) {
    const c = s.length;
    if (0 < c) {
      const l = Array(c);
      for (let f = 0; f < c; f++) l[f] = s[f];
      return l;
    }
    return [];
  }
  function k(s, c) {
    for (let l = 1; l < arguments.length; l++) {
      const f = arguments[l];
      if (h(f)) {
        const T = s.length || 0, A = f.length || 0;
        s.length = T + A;
        for (let b = 0; b < A; b++) s[T + b] = f[b];
      } else s.push(f);
    }
  }
  class W {
    constructor(c, l) {
      this.i = c, this.j = l, this.h = 0, this.g = null;
    }
    get() {
      let c;
      return 0 < this.h ? (this.h--, c = this.g, this.g = c.next, c.next = null) : c = this.i(), c;
    }
  }
  function H(s) {
    return /^[\s\xa0]*$/.test(s);
  }
  function K() {
    var s = u.navigator;
    return s && (s = s.userAgent) ? s : "";
  }
  function ee(s) {
    return ee[" "](s), s;
  }
  ee[" "] = function() {
  };
  var Ae = K().indexOf("Gecko") != -1 && !(K().toLowerCase().indexOf("webkit") != -1 && K().indexOf("Edge") == -1) && !(K().indexOf("Trident") != -1 || K().indexOf("MSIE") != -1) && K().indexOf("Edge") == -1;
  function te(s, c, l) {
    for (const f in s) c.call(l, s[f], f, s);
  }
  function v(s, c) {
    for (const l in s) c.call(void 0, s[l], l, s);
  }
  function p(s) {
    const c = {};
    for (const l in s) c[l] = s[l];
    return c;
  }
  const _ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
  function y(s, c) {
    let l, f;
    for (let T = 1; T < arguments.length; T++) {
      f = arguments[T];
      for (l in f) s[l] = f[l];
      for (let A = 0; A < _.length; A++) l = _[A], Object.prototype.hasOwnProperty.call(f, l) && (s[l] = f[l]);
    }
  }
  function E(s) {
    var c = 1;
    s = s.split(":");
    const l = [];
    for (; 0 < c && s.length; ) l.push(s.shift()), c--;
    return s.length && l.push(s.join(":")), l;
  }
  function I(s) {
    u.setTimeout(() => {
      throw s;
    }, 0);
  }
  function g() {
    var s = di;
    let c = null;
    return s.g && (c = s.g, s.g = s.g.next, s.g || (s.h = null), c.next = null), c;
  }
  class Me {
    constructor() {
      this.h = this.g = null;
    }
    add(c, l) {
      const f = on.get();
      f.set(c, l), this.h ? this.h.next = f : this.g = f, this.h = f;
    }
  }
  var on = new W(() => new Pl(), (s) => s.reset());
  class Pl {
    constructor() {
      this.next = this.g = this.h = null;
    }
    set(c, l) {
      this.h = c, this.g = l, this.next = null;
    }
    reset() {
      this.next = this.g = this.h = null;
    }
  }
  let an, cn = !1, di = new Me(), so = () => {
    const s = u.Promise.resolve(void 0);
    an = () => {
      s.then(Cl);
    };
  };
  var Cl = () => {
    for (var s; s = g(); ) {
      try {
        s.h.call(s.g);
      } catch (l) {
        I(l);
      }
      var c = on;
      c.j(s), 100 > c.h && (c.h++, s.next = c.g, c.g = s);
    }
    cn = !1;
  };
  function Qe() {
    this.s = this.s, this.C = this.C;
  }
  Qe.prototype.s = !1, Qe.prototype.ma = function() {
    this.s || (this.s = !0, this.N());
  }, Qe.prototype.N = function() {
    if (this.C) for (; this.C.length; ) this.C.shift()();
  };
  function de(s, c) {
    this.type = s, this.g = this.target = c, this.defaultPrevented = !1;
  }
  de.prototype.h = function() {
    this.defaultPrevented = !0;
  };
  var bl = function() {
    if (!u.addEventListener || !Object.defineProperty) return !1;
    var s = !1, c = Object.defineProperty({}, "passive", { get: function() {
      s = !0;
    } });
    try {
      const l = () => {
      };
      u.addEventListener("test", l, c), u.removeEventListener("test", l, c);
    } catch {
    }
    return s;
  }();
  function un(s, c) {
    if (de.call(this, s ? s.type : ""), this.relatedTarget = this.g = this.target = null, this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0, this.key = "", this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1, this.state = null, this.pointerId = 0, this.pointerType = "", this.i = null, s) {
      var l = this.type = s.type, f = s.changedTouches && s.changedTouches.length ? s.changedTouches[0] : null;
      if (this.target = s.target || s.srcElement, this.g = c, c = s.relatedTarget) {
        if (Ae) {
          e: {
            try {
              ee(c.nodeName);
              var T = !0;
              break e;
            } catch {
            }
            T = !1;
          }
          T || (c = null);
        }
      } else l == "mouseover" ? c = s.fromElement : l == "mouseout" && (c = s.toElement);
      this.relatedTarget = c, f ? (this.clientX = f.clientX !== void 0 ? f.clientX : f.pageX, this.clientY = f.clientY !== void 0 ? f.clientY : f.pageY, this.screenX = f.screenX || 0, this.screenY = f.screenY || 0) : (this.clientX = s.clientX !== void 0 ? s.clientX : s.pageX, this.clientY = s.clientY !== void 0 ? s.clientY : s.pageY, this.screenX = s.screenX || 0, this.screenY = s.screenY || 0), this.button = s.button, this.key = s.key || "", this.ctrlKey = s.ctrlKey, this.altKey = s.altKey, this.shiftKey = s.shiftKey, this.metaKey = s.metaKey, this.pointerId = s.pointerId || 0, this.pointerType = typeof s.pointerType == "string" ? s.pointerType : kl[s.pointerType] || "", this.state = s.state, this.i = s, s.defaultPrevented && un.aa.h.call(this);
    }
  }
  V(un, de);
  var kl = { 2: "touch", 3: "pen", 4: "mouse" };
  un.prototype.h = function() {
    un.aa.h.call(this);
    var s = this.i;
    s.preventDefault ? s.preventDefault() : s.returnValue = !1;
  };
  var tr = "closure_listenable_" + (1e6 * Math.random() | 0), Vl = 0;
  function Dl(s, c, l, f, T) {
    this.listener = s, this.proxy = null, this.src = c, this.type = l, this.capture = !!f, this.ha = T, this.key = ++Vl, this.da = this.fa = !1;
  }
  function nr(s) {
    s.da = !0, s.listener = null, s.proxy = null, s.src = null, s.ha = null;
  }
  function rr(s) {
    this.src = s, this.g = {}, this.h = 0;
  }
  rr.prototype.add = function(s, c, l, f, T) {
    var A = s.toString();
    s = this.g[A], s || (s = this.g[A] = [], this.h++);
    var b = pi(s, c, f, T);
    return -1 < b ? (c = s[b], l || (c.fa = !1)) : (c = new Dl(c, this.src, A, !!f, T), c.fa = l, s.push(c)), c;
  };
  function fi(s, c) {
    var l = c.type;
    if (l in s.g) {
      var f = s.g[l], T = Array.prototype.indexOf.call(f, c, void 0), A;
      (A = 0 <= T) && Array.prototype.splice.call(f, T, 1), A && (nr(c), s.g[l].length == 0 && (delete s.g[l], s.h--));
    }
  }
  function pi(s, c, l, f) {
    for (var T = 0; T < s.length; ++T) {
      var A = s[T];
      if (!A.da && A.listener == c && A.capture == !!l && A.ha == f) return T;
    }
    return -1;
  }
  var mi = "closure_lm_" + (1e6 * Math.random() | 0), gi = {};
  function oo(s, c, l, f, T) {
    if (Array.isArray(c)) {
      for (var A = 0; A < c.length; A++) oo(s, c[A], l, f, T);
      return null;
    }
    return l = uo(l), s && s[tr] ? s.K(c, l, d(f) ? !!f.capture : !!f, T) : Nl(s, c, l, !1, f, T);
  }
  function Nl(s, c, l, f, T, A) {
    if (!c) throw Error("Invalid event type");
    var b = d(T) ? !!T.capture : !!T, Q = yi(s);
    if (Q || (s[mi] = Q = new rr(s)), l = Q.add(c, l, f, b, A), l.proxy) return l;
    if (f = Ol(), l.proxy = f, f.src = s, f.listener = l, s.addEventListener) bl || (T = b), T === void 0 && (T = !1), s.addEventListener(c.toString(), f, T);
    else if (s.attachEvent) s.attachEvent(co(c.toString()), f);
    else if (s.addListener && s.removeListener) s.addListener(f);
    else throw Error("addEventListener and attachEvent are unavailable.");
    return l;
  }
  function Ol() {
    function s(l) {
      return c.call(s.src, s.listener, l);
    }
    const c = Ll;
    return s;
  }
  function ao(s, c, l, f, T) {
    if (Array.isArray(c)) for (var A = 0; A < c.length; A++) ao(s, c[A], l, f, T);
    else f = d(f) ? !!f.capture : !!f, l = uo(l), s && s[tr] ? (s = s.i, c = String(c).toString(), c in s.g && (A = s.g[c], l = pi(A, l, f, T), -1 < l && (nr(A[l]), Array.prototype.splice.call(A, l, 1), A.length == 0 && (delete s.g[c], s.h--)))) : s && (s = yi(s)) && (c = s.g[c.toString()], s = -1, c && (s = pi(c, l, f, T)), (l = -1 < s ? c[s] : null) && _i(l));
  }
  function _i(s) {
    if (typeof s != "number" && s && !s.da) {
      var c = s.src;
      if (c && c[tr]) fi(c.i, s);
      else {
        var l = s.type, f = s.proxy;
        c.removeEventListener ? c.removeEventListener(l, f, s.capture) : c.detachEvent ? c.detachEvent(co(l), f) : c.addListener && c.removeListener && c.removeListener(f), (l = yi(c)) ? (fi(l, s), l.h == 0 && (l.src = null, c[mi] = null)) : nr(s);
      }
    }
  }
  function co(s) {
    return s in gi ? gi[s] : gi[s] = "on" + s;
  }
  function Ll(s, c) {
    if (s.da) s = !0;
    else {
      c = new un(c, this);
      var l = s.listener, f = s.ha || s.src;
      s.fa && _i(s), s = l.call(f, c);
    }
    return s;
  }
  function yi(s) {
    return s = s[mi], s instanceof rr ? s : null;
  }
  var vi = "__closure_events_fn_" + (1e9 * Math.random() >>> 0);
  function uo(s) {
    return typeof s == "function" ? s : (s[vi] || (s[vi] = function(c) {
      return s.handleEvent(c);
    }), s[vi]);
  }
  function fe() {
    Qe.call(this), this.i = new rr(this), this.M = this, this.F = null;
  }
  V(fe, Qe), fe.prototype[tr] = !0, fe.prototype.removeEventListener = function(s, c, l, f) {
    ao(this, s, c, l, f);
  };
  function Ee(s, c) {
    var l, f = s.F;
    if (f) for (l = []; f; f = f.F) l.push(f);
    if (s = s.M, f = c.type || c, typeof c == "string") c = new de(c, s);
    else if (c instanceof de) c.target = c.target || s;
    else {
      var T = c;
      c = new de(f, s), y(c, T);
    }
    if (T = !0, l) for (var A = l.length - 1; 0 <= A; A--) {
      var b = c.g = l[A];
      T = ir(b, f, !0, c) && T;
    }
    if (b = c.g = s, T = ir(b, f, !0, c) && T, T = ir(b, f, !1, c) && T, l) for (A = 0; A < l.length; A++) b = c.g = l[A], T = ir(b, f, !1, c) && T;
  }
  fe.prototype.N = function() {
    if (fe.aa.N.call(this), this.i) {
      var s = this.i, c;
      for (c in s.g) {
        for (var l = s.g[c], f = 0; f < l.length; f++) nr(l[f]);
        delete s.g[c], s.h--;
      }
    }
    this.F = null;
  }, fe.prototype.K = function(s, c, l, f) {
    return this.i.add(String(s), c, !1, l, f);
  }, fe.prototype.L = function(s, c, l, f) {
    return this.i.add(String(s), c, !0, l, f);
  };
  function ir(s, c, l, f) {
    if (c = s.i.g[String(c)], !c) return !0;
    c = c.concat();
    for (var T = !0, A = 0; A < c.length; ++A) {
      var b = c[A];
      if (b && !b.da && b.capture == l) {
        var Q = b.listener, ae = b.ha || b.src;
        b.fa && fi(s.i, b), T = Q.call(ae, f) !== !1 && T;
      }
    }
    return T && !f.defaultPrevented;
  }
  function lo(s, c, l) {
    if (typeof s == "function") l && (s = R(s, l));
    else if (s && typeof s.handleEvent == "function") s = R(s.handleEvent, s);
    else throw Error("Invalid listener argument");
    return 2147483647 < Number(c) ? -1 : u.setTimeout(s, c || 0);
  }
  function ho(s) {
    s.g = lo(() => {
      s.g = null, s.i && (s.i = !1, ho(s));
    }, s.l);
    const c = s.h;
    s.h = null, s.m.apply(null, c);
  }
  class Ml extends Qe {
    constructor(c, l) {
      super(), this.m = c, this.l = l, this.h = null, this.i = !1, this.g = null;
    }
    j(c) {
      this.h = arguments, this.g ? this.i = !0 : ho(this);
    }
    N() {
      super.N(), this.g && (u.clearTimeout(this.g), this.g = null, this.i = !1, this.h = null);
    }
  }
  function ln(s) {
    Qe.call(this), this.h = s, this.g = {};
  }
  V(ln, Qe);
  var fo = [];
  function po(s) {
    te(s.g, function(c, l) {
      this.g.hasOwnProperty(l) && _i(c);
    }, s), s.g = {};
  }
  ln.prototype.N = function() {
    ln.aa.N.call(this), po(this);
  }, ln.prototype.handleEvent = function() {
    throw Error("EventHandler.handleEvent not implemented");
  };
  var Ei = u.JSON.stringify, xl = u.JSON.parse, Fl = class {
    stringify(s) {
      return u.JSON.stringify(s, void 0);
    }
    parse(s) {
      return u.JSON.parse(s, void 0);
    }
  };
  function Ti() {
  }
  Ti.prototype.h = null;
  function mo(s) {
    return s.h || (s.h = s.i());
  }
  function go() {
  }
  var hn = { OPEN: "a", kb: "b", Ja: "c", wb: "d" };
  function Ii() {
    de.call(this, "d");
  }
  V(Ii, de);
  function wi() {
    de.call(this, "c");
  }
  V(wi, de);
  var mt = {}, _o = null;
  function sr() {
    return _o = _o || new fe();
  }
  mt.La = "serverreachability";
  function yo(s) {
    de.call(this, mt.La, s);
  }
  V(yo, de);
  function dn(s) {
    const c = sr();
    Ee(c, new yo(c));
  }
  mt.STAT_EVENT = "statevent";
  function vo(s, c) {
    de.call(this, mt.STAT_EVENT, s), this.stat = c;
  }
  V(vo, de);
  function Te(s) {
    const c = sr();
    Ee(c, new vo(c, s));
  }
  mt.Ma = "timingevent";
  function Eo(s, c) {
    de.call(this, mt.Ma, s), this.size = c;
  }
  V(Eo, de);
  function fn(s, c) {
    if (typeof s != "function") throw Error("Fn must not be null and must be a function");
    return u.setTimeout(function() {
      s();
    }, c);
  }
  function pn() {
    this.g = !0;
  }
  pn.prototype.xa = function() {
    this.g = !1;
  };
  function Ul(s, c, l, f, T, A) {
    s.info(function() {
      if (s.g) if (A)
        for (var b = "", Q = A.split("&"), ae = 0; ae < Q.length; ae++) {
          var $ = Q[ae].split("=");
          if (1 < $.length) {
            var pe = $[0];
            $ = $[1];
            var me = pe.split("_");
            b = 2 <= me.length && me[1] == "type" ? b + (pe + "=" + $ + "&") : b + (pe + "=redacted&");
          }
        }
      else b = null;
      else b = A;
      return "XMLHTTP REQ (" + f + ") [attempt " + T + "]: " + c + `
` + l + `
` + b;
    });
  }
  function Bl(s, c, l, f, T, A, b) {
    s.info(function() {
      return "XMLHTTP RESP (" + f + ") [ attempt " + T + "]: " + c + `
` + l + `
` + A + " " + b;
    });
  }
  function kt(s, c, l, f) {
    s.info(function() {
      return "XMLHTTP TEXT (" + c + "): " + ql(s, l) + (f ? " " + f : "");
    });
  }
  function jl(s, c) {
    s.info(function() {
      return "TIMEOUT: " + c;
    });
  }
  pn.prototype.info = function() {
  };
  function ql(s, c) {
    if (!s.g) return c;
    if (!c) return null;
    try {
      var l = JSON.parse(c);
      if (l) {
        for (s = 0; s < l.length; s++) if (Array.isArray(l[s])) {
          var f = l[s];
          if (!(2 > f.length)) {
            var T = f[1];
            if (Array.isArray(T) && !(1 > T.length)) {
              var A = T[0];
              if (A != "noop" && A != "stop" && A != "close") for (var b = 1; b < T.length; b++) T[b] = "";
            }
          }
        }
      }
      return Ei(l);
    } catch {
      return c;
    }
  }
  var or = { NO_ERROR: 0, gb: 1, tb: 2, sb: 3, nb: 4, rb: 5, ub: 6, Ia: 7, TIMEOUT: 8, xb: 9 }, To = { lb: "complete", Hb: "success", Ja: "error", Ia: "abort", zb: "ready", Ab: "readystatechange", TIMEOUT: "timeout", vb: "incrementaldata", yb: "progress", ob: "downloadprogress", Pb: "uploadprogress" }, Ai;
  function ar() {
  }
  V(ar, Ti), ar.prototype.g = function() {
    return new XMLHttpRequest();
  }, ar.prototype.i = function() {
    return {};
  }, Ai = new ar();
  function Ye(s, c, l, f) {
    this.j = s, this.i = c, this.l = l, this.R = f || 1, this.U = new ln(this), this.I = 45e3, this.H = null, this.o = !1, this.m = this.A = this.v = this.L = this.F = this.S = this.B = null, this.D = [], this.g = null, this.C = 0, this.s = this.u = null, this.X = -1, this.J = !1, this.O = 0, this.M = null, this.W = this.K = this.T = this.P = !1, this.h = new Io();
  }
  function Io() {
    this.i = null, this.g = "", this.h = !1;
  }
  var wo = {}, Ri = {};
  function Si(s, c, l) {
    s.L = 1, s.v = hr(xe(c)), s.m = l, s.P = !0, Ao(s, null);
  }
  function Ao(s, c) {
    s.F = Date.now(), cr(s), s.A = xe(s.v);
    var l = s.A, f = s.R;
    Array.isArray(f) || (f = [String(f)]), Fo(l.i, "t", f), s.C = 0, l = s.j.J, s.h = new Io(), s.g = na(s.j, l ? c : null, !s.m), 0 < s.O && (s.M = new Ml(R(s.Y, s, s.g), s.O)), c = s.U, l = s.g, f = s.ca;
    var T = "readystatechange";
    Array.isArray(T) || (T && (fo[0] = T.toString()), T = fo);
    for (var A = 0; A < T.length; A++) {
      var b = oo(l, T[A], f || c.handleEvent, !1, c.h || c);
      if (!b) break;
      c.g[b.key] = b;
    }
    c = s.H ? p(s.H) : {}, s.m ? (s.u || (s.u = "POST"), c["Content-Type"] = "application/x-www-form-urlencoded", s.g.ea(
      s.A,
      s.u,
      s.m,
      c
    )) : (s.u = "GET", s.g.ea(s.A, s.u, null, c)), dn(), Ul(s.i, s.u, s.A, s.l, s.R, s.m);
  }
  Ye.prototype.ca = function(s) {
    s = s.target;
    const c = this.M;
    c && Fe(s) == 3 ? c.j() : this.Y(s);
  }, Ye.prototype.Y = function(s) {
    try {
      if (s == this.g) e: {
        const me = Fe(this.g);
        var c = this.g.Ba();
        const Nt = this.g.Z();
        if (!(3 > me) && (me != 3 || this.g && (this.h.h || this.g.oa() || Wo(this.g)))) {
          this.J || me != 4 || c == 7 || (c == 8 || 0 >= Nt ? dn(3) : dn(2)), Pi(this);
          var l = this.g.Z();
          this.X = l;
          t: if (Ro(this)) {
            var f = Wo(this.g);
            s = "";
            var T = f.length, A = Fe(this.g) == 4;
            if (!this.h.i) {
              if (typeof TextDecoder > "u") {
                gt(this), mn(this);
                var b = "";
                break t;
              }
              this.h.i = new u.TextDecoder();
            }
            for (c = 0; c < T; c++) this.h.h = !0, s += this.h.i.decode(f[c], { stream: !(A && c == T - 1) });
            f.length = 0, this.h.g += s, this.C = 0, b = this.h.g;
          } else b = this.g.oa();
          if (this.o = l == 200, Bl(this.i, this.u, this.A, this.l, this.R, me, l), this.o) {
            if (this.T && !this.K) {
              t: {
                if (this.g) {
                  var Q, ae = this.g;
                  if ((Q = ae.g ? ae.g.getResponseHeader("X-HTTP-Initial-Response") : null) && !H(Q)) {
                    var $ = Q;
                    break t;
                  }
                }
                $ = null;
              }
              if (l = $) kt(this.i, this.l, l, "Initial handshake response via X-HTTP-Initial-Response"), this.K = !0, Ci(this, l);
              else {
                this.o = !1, this.s = 3, Te(12), gt(this), mn(this);
                break e;
              }
            }
            if (this.P) {
              l = !0;
              let Pe;
              for (; !this.J && this.C < b.length; ) if (Pe = $l(this, b), Pe == Ri) {
                me == 4 && (this.s = 4, Te(14), l = !1), kt(this.i, this.l, null, "[Incomplete Response]");
                break;
              } else if (Pe == wo) {
                this.s = 4, Te(15), kt(this.i, this.l, b, "[Invalid Chunk]"), l = !1;
                break;
              } else kt(this.i, this.l, Pe, null), Ci(this, Pe);
              if (Ro(this) && this.C != 0 && (this.h.g = this.h.g.slice(this.C), this.C = 0), me != 4 || b.length != 0 || this.h.h || (this.s = 1, Te(16), l = !1), this.o = this.o && l, !l) kt(this.i, this.l, b, "[Invalid Chunked Response]"), gt(this), mn(this);
              else if (0 < b.length && !this.W) {
                this.W = !0;
                var pe = this.j;
                pe.g == this && pe.ba && !pe.M && (pe.j.info("Great, no buffering proxy detected. Bytes received: " + b.length), Oi(pe), pe.M = !0, Te(11));
              }
            } else kt(this.i, this.l, b, null), Ci(this, b);
            me == 4 && gt(this), this.o && !this.J && (me == 4 ? Xo(this.j, this) : (this.o = !1, cr(this)));
          } else oh(this.g), l == 400 && 0 < b.indexOf("Unknown SID") ? (this.s = 3, Te(12)) : (this.s = 0, Te(13)), gt(this), mn(this);
        }
      }
    } catch {
    } finally {
    }
  };
  function Ro(s) {
    return s.g ? s.u == "GET" && s.L != 2 && s.j.Ca : !1;
  }
  function $l(s, c) {
    var l = s.C, f = c.indexOf(`
`, l);
    return f == -1 ? Ri : (l = Number(c.substring(l, f)), isNaN(l) ? wo : (f += 1, f + l > c.length ? Ri : (c = c.slice(f, f + l), s.C = f + l, c)));
  }
  Ye.prototype.cancel = function() {
    this.J = !0, gt(this);
  };
  function cr(s) {
    s.S = Date.now() + s.I, So(s, s.I);
  }
  function So(s, c) {
    if (s.B != null) throw Error("WatchDog timer not null");
    s.B = fn(R(s.ba, s), c);
  }
  function Pi(s) {
    s.B && (u.clearTimeout(s.B), s.B = null);
  }
  Ye.prototype.ba = function() {
    this.B = null;
    const s = Date.now();
    0 <= s - this.S ? (jl(this.i, this.A), this.L != 2 && (dn(), Te(17)), gt(this), this.s = 2, mn(this)) : So(this, this.S - s);
  };
  function mn(s) {
    s.j.G == 0 || s.J || Xo(s.j, s);
  }
  function gt(s) {
    Pi(s);
    var c = s.M;
    c && typeof c.ma == "function" && c.ma(), s.M = null, po(s.U), s.g && (c = s.g, s.g = null, c.abort(), c.ma());
  }
  function Ci(s, c) {
    try {
      var l = s.j;
      if (l.G != 0 && (l.g == s || bi(l.h, s))) {
        if (!s.K && bi(l.h, s) && l.G == 3) {
          try {
            var f = l.Da.g.parse(c);
          } catch {
            f = null;
          }
          if (Array.isArray(f) && f.length == 3) {
            var T = f;
            if (T[0] == 0) {
              e:
                if (!l.u) {
                  if (l.g) if (l.g.F + 3e3 < s.F) _r(l), mr(l);
                  else break e;
                  Ni(l), Te(18);
                }
            } else l.za = T[1], 0 < l.za - l.T && 37500 > T[2] && l.F && l.v == 0 && !l.C && (l.C = fn(R(l.Za, l), 6e3));
            if (1 >= bo(l.h) && l.ca) {
              try {
                l.ca();
              } catch {
              }
              l.ca = void 0;
            }
          } else yt(l, 11);
        } else if ((s.K || l.g == s) && _r(l), !H(c)) for (T = l.Da.g.parse(c), c = 0; c < T.length; c++) {
          let $ = T[c];
          if (l.T = $[0], $ = $[1], l.G == 2) if ($[0] == "c") {
            l.K = $[1], l.ia = $[2];
            const pe = $[3];
            pe != null && (l.la = pe, l.j.info("VER=" + l.la));
            const me = $[4];
            me != null && (l.Aa = me, l.j.info("SVER=" + l.Aa));
            const Nt = $[5];
            Nt != null && typeof Nt == "number" && 0 < Nt && (f = 1.5 * Nt, l.L = f, l.j.info("backChannelRequestTimeoutMs_=" + f)), f = l;
            const Pe = s.g;
            if (Pe) {
              const vr = Pe.g ? Pe.g.getResponseHeader("X-Client-Wire-Protocol") : null;
              if (vr) {
                var A = f.h;
                A.g || vr.indexOf("spdy") == -1 && vr.indexOf("quic") == -1 && vr.indexOf("h2") == -1 || (A.j = A.l, A.g = /* @__PURE__ */ new Set(), A.h && (ki(A, A.h), A.h = null));
              }
              if (f.D) {
                const Li = Pe.g ? Pe.g.getResponseHeader("X-HTTP-Session-Id") : null;
                Li && (f.ya = Li, Y(f.I, f.D, Li));
              }
            }
            l.G = 3, l.l && l.l.ua(), l.ba && (l.R = Date.now() - s.F, l.j.info("Handshake RTT: " + l.R + "ms")), f = l;
            var b = s;
            if (f.qa = ta(f, f.J ? f.ia : null, f.W), b.K) {
              ko(f.h, b);
              var Q = b, ae = f.L;
              ae && (Q.I = ae), Q.B && (Pi(Q), cr(Q)), f.g = b;
            } else Yo(f);
            0 < l.i.length && gr(l);
          } else $[0] != "stop" && $[0] != "close" || yt(l, 7);
          else l.G == 3 && ($[0] == "stop" || $[0] == "close" ? $[0] == "stop" ? yt(l, 7) : Di(l) : $[0] != "noop" && l.l && l.l.ta($), l.v = 0);
        }
      }
      dn(4);
    } catch {
    }
  }
  var zl = class {
    constructor(s, c) {
      this.g = s, this.map = c;
    }
  };
  function Po(s) {
    this.l = s || 10, u.PerformanceNavigationTiming ? (s = u.performance.getEntriesByType("navigation"), s = 0 < s.length && (s[0].nextHopProtocol == "hq" || s[0].nextHopProtocol == "h2")) : s = !!(u.chrome && u.chrome.loadTimes && u.chrome.loadTimes() && u.chrome.loadTimes().wasFetchedViaSpdy), this.j = s ? this.l : 1, this.g = null, 1 < this.j && (this.g = /* @__PURE__ */ new Set()), this.h = null, this.i = [];
  }
  function Co(s) {
    return s.h ? !0 : s.g ? s.g.size >= s.j : !1;
  }
  function bo(s) {
    return s.h ? 1 : s.g ? s.g.size : 0;
  }
  function bi(s, c) {
    return s.h ? s.h == c : s.g ? s.g.has(c) : !1;
  }
  function ki(s, c) {
    s.g ? s.g.add(c) : s.h = c;
  }
  function ko(s, c) {
    s.h && s.h == c ? s.h = null : s.g && s.g.has(c) && s.g.delete(c);
  }
  Po.prototype.cancel = function() {
    if (this.i = Vo(this), this.h) this.h.cancel(), this.h = null;
    else if (this.g && this.g.size !== 0) {
      for (const s of this.g.values()) s.cancel();
      this.g.clear();
    }
  };
  function Vo(s) {
    if (s.h != null) return s.i.concat(s.h.D);
    if (s.g != null && s.g.size !== 0) {
      let c = s.i;
      for (const l of s.g.values()) c = c.concat(l.D);
      return c;
    }
    return N(s.i);
  }
  function Wl(s) {
    if (s.V && typeof s.V == "function") return s.V();
    if (typeof Map < "u" && s instanceof Map || typeof Set < "u" && s instanceof Set) return Array.from(s.values());
    if (typeof s == "string") return s.split("");
    if (h(s)) {
      for (var c = [], l = s.length, f = 0; f < l; f++) c.push(s[f]);
      return c;
    }
    c = [], l = 0;
    for (f in s) c[l++] = s[f];
    return c;
  }
  function Hl(s) {
    if (s.na && typeof s.na == "function") return s.na();
    if (!s.V || typeof s.V != "function") {
      if (typeof Map < "u" && s instanceof Map) return Array.from(s.keys());
      if (!(typeof Set < "u" && s instanceof Set)) {
        if (h(s) || typeof s == "string") {
          var c = [];
          s = s.length;
          for (var l = 0; l < s; l++) c.push(l);
          return c;
        }
        c = [], l = 0;
        for (const f in s) c[l++] = f;
        return c;
      }
    }
  }
  function Do(s, c) {
    if (s.forEach && typeof s.forEach == "function") s.forEach(c, void 0);
    else if (h(s) || typeof s == "string") Array.prototype.forEach.call(s, c, void 0);
    else for (var l = Hl(s), f = Wl(s), T = f.length, A = 0; A < T; A++) c.call(void 0, f[A], l && l[A], s);
  }
  var No = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");
  function Kl(s, c) {
    if (s) {
      s = s.split("&");
      for (var l = 0; l < s.length; l++) {
        var f = s[l].indexOf("="), T = null;
        if (0 <= f) {
          var A = s[l].substring(0, f);
          T = s[l].substring(f + 1);
        } else A = s[l];
        c(A, T ? decodeURIComponent(T.replace(/\+/g, " ")) : "");
      }
    }
  }
  function _t(s) {
    if (this.g = this.o = this.j = "", this.s = null, this.m = this.l = "", this.h = !1, s instanceof _t) {
      this.h = s.h, ur(this, s.j), this.o = s.o, this.g = s.g, lr(this, s.s), this.l = s.l;
      var c = s.i, l = new yn();
      l.i = c.i, c.g && (l.g = new Map(c.g), l.h = c.h), Oo(this, l), this.m = s.m;
    } else s && (c = String(s).match(No)) ? (this.h = !1, ur(this, c[1] || "", !0), this.o = gn(c[2] || ""), this.g = gn(c[3] || "", !0), lr(this, c[4]), this.l = gn(c[5] || "", !0), Oo(this, c[6] || "", !0), this.m = gn(c[7] || "")) : (this.h = !1, this.i = new yn(null, this.h));
  }
  _t.prototype.toString = function() {
    var s = [], c = this.j;
    c && s.push(_n(c, Lo, !0), ":");
    var l = this.g;
    return (l || c == "file") && (s.push("//"), (c = this.o) && s.push(_n(c, Lo, !0), "@"), s.push(encodeURIComponent(String(l)).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), l = this.s, l != null && s.push(":", String(l))), (l = this.l) && (this.g && l.charAt(0) != "/" && s.push("/"), s.push(_n(l, l.charAt(0) == "/" ? Yl : Ql, !0))), (l = this.i.toString()) && s.push("?", l), (l = this.m) && s.push("#", _n(l, Xl)), s.join("");
  };
  function xe(s) {
    return new _t(s);
  }
  function ur(s, c, l) {
    s.j = l ? gn(c, !0) : c, s.j && (s.j = s.j.replace(/:$/, ""));
  }
  function lr(s, c) {
    if (c) {
      if (c = Number(c), isNaN(c) || 0 > c) throw Error("Bad port number " + c);
      s.s = c;
    } else s.s = null;
  }
  function Oo(s, c, l) {
    c instanceof yn ? (s.i = c, Zl(s.i, s.h)) : (l || (c = _n(c, Jl)), s.i = new yn(c, s.h));
  }
  function Y(s, c, l) {
    s.i.set(c, l);
  }
  function hr(s) {
    return Y(s, "zx", Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ Date.now()).toString(36)), s;
  }
  function gn(s, c) {
    return s ? c ? decodeURI(s.replace(/%25/g, "%2525")) : decodeURIComponent(s) : "";
  }
  function _n(s, c, l) {
    return typeof s == "string" ? (s = encodeURI(s).replace(c, Gl), l && (s = s.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), s) : null;
  }
  function Gl(s) {
    return s = s.charCodeAt(0), "%" + (s >> 4 & 15).toString(16) + (s & 15).toString(16);
  }
  var Lo = /[#\/\?@]/g, Ql = /[#\?:]/g, Yl = /[#\?]/g, Jl = /[#\?@]/g, Xl = /#/g;
  function yn(s, c) {
    this.h = this.g = null, this.i = s || null, this.j = !!c;
  }
  function Je(s) {
    s.g || (s.g = /* @__PURE__ */ new Map(), s.h = 0, s.i && Kl(s.i, function(c, l) {
      s.add(decodeURIComponent(c.replace(/\+/g, " ")), l);
    }));
  }
  n = yn.prototype, n.add = function(s, c) {
    Je(this), this.i = null, s = Vt(this, s);
    var l = this.g.get(s);
    return l || this.g.set(s, l = []), l.push(c), this.h += 1, this;
  };
  function Mo(s, c) {
    Je(s), c = Vt(s, c), s.g.has(c) && (s.i = null, s.h -= s.g.get(c).length, s.g.delete(c));
  }
  function xo(s, c) {
    return Je(s), c = Vt(s, c), s.g.has(c);
  }
  n.forEach = function(s, c) {
    Je(this), this.g.forEach(function(l, f) {
      l.forEach(function(T) {
        s.call(c, T, f, this);
      }, this);
    }, this);
  }, n.na = function() {
    Je(this);
    const s = Array.from(this.g.values()), c = Array.from(this.g.keys()), l = [];
    for (let f = 0; f < c.length; f++) {
      const T = s[f];
      for (let A = 0; A < T.length; A++) l.push(c[f]);
    }
    return l;
  }, n.V = function(s) {
    Je(this);
    let c = [];
    if (typeof s == "string") xo(this, s) && (c = c.concat(this.g.get(Vt(this, s))));
    else {
      s = Array.from(this.g.values());
      for (let l = 0; l < s.length; l++) c = c.concat(s[l]);
    }
    return c;
  }, n.set = function(s, c) {
    return Je(this), this.i = null, s = Vt(this, s), xo(this, s) && (this.h -= this.g.get(s).length), this.g.set(s, [c]), this.h += 1, this;
  }, n.get = function(s, c) {
    return s ? (s = this.V(s), 0 < s.length ? String(s[0]) : c) : c;
  };
  function Fo(s, c, l) {
    Mo(s, c), 0 < l.length && (s.i = null, s.g.set(Vt(s, c), N(l)), s.h += l.length);
  }
  n.toString = function() {
    if (this.i) return this.i;
    if (!this.g) return "";
    const s = [], c = Array.from(this.g.keys());
    for (var l = 0; l < c.length; l++) {
      var f = c[l];
      const A = encodeURIComponent(String(f)), b = this.V(f);
      for (f = 0; f < b.length; f++) {
        var T = A;
        b[f] !== "" && (T += "=" + encodeURIComponent(String(b[f]))), s.push(T);
      }
    }
    return this.i = s.join("&");
  };
  function Vt(s, c) {
    return c = String(c), s.j && (c = c.toLowerCase()), c;
  }
  function Zl(s, c) {
    c && !s.j && (Je(s), s.i = null, s.g.forEach(function(l, f) {
      var T = f.toLowerCase();
      f != T && (Mo(this, f), Fo(this, T, l));
    }, s)), s.j = c;
  }
  function eh(s, c) {
    const l = new pn();
    if (u.Image) {
      const f = new Image();
      f.onload = P(Xe, l, "TestLoadImage: loaded", !0, c, f), f.onerror = P(Xe, l, "TestLoadImage: error", !1, c, f), f.onabort = P(Xe, l, "TestLoadImage: abort", !1, c, f), f.ontimeout = P(Xe, l, "TestLoadImage: timeout", !1, c, f), u.setTimeout(function() {
        f.ontimeout && f.ontimeout();
      }, 1e4), f.src = s;
    } else c(!1);
  }
  function th(s, c) {
    const l = new pn(), f = new AbortController(), T = setTimeout(() => {
      f.abort(), Xe(l, "TestPingServer: timeout", !1, c);
    }, 1e4);
    fetch(s, { signal: f.signal }).then((A) => {
      clearTimeout(T), A.ok ? Xe(l, "TestPingServer: ok", !0, c) : Xe(l, "TestPingServer: server error", !1, c);
    }).catch(() => {
      clearTimeout(T), Xe(l, "TestPingServer: error", !1, c);
    });
  }
  function Xe(s, c, l, f, T) {
    try {
      T && (T.onload = null, T.onerror = null, T.onabort = null, T.ontimeout = null), f(l);
    } catch {
    }
  }
  function nh() {
    this.g = new Fl();
  }
  function rh(s, c, l) {
    const f = l || "";
    try {
      Do(s, function(T, A) {
        let b = T;
        d(T) && (b = Ei(T)), c.push(f + A + "=" + encodeURIComponent(b));
      });
    } catch (T) {
      throw c.push(f + "type=" + encodeURIComponent("_badmap")), T;
    }
  }
  function dr(s) {
    this.l = s.Ub || null, this.j = s.eb || !1;
  }
  V(dr, Ti), dr.prototype.g = function() {
    return new fr(this.l, this.j);
  }, dr.prototype.i = /* @__PURE__ */ function(s) {
    return function() {
      return s;
    };
  }({});
  function fr(s, c) {
    fe.call(this), this.D = s, this.o = c, this.m = void 0, this.status = this.readyState = 0, this.responseType = this.responseText = this.response = this.statusText = "", this.onreadystatechange = null, this.u = new Headers(), this.h = null, this.B = "GET", this.A = "", this.g = !1, this.v = this.j = this.l = null;
  }
  V(fr, fe), n = fr.prototype, n.open = function(s, c) {
    if (this.readyState != 0) throw this.abort(), Error("Error reopening a connection");
    this.B = s, this.A = c, this.readyState = 1, En(this);
  }, n.send = function(s) {
    if (this.readyState != 1) throw this.abort(), Error("need to call open() first. ");
    this.g = !0;
    const c = { headers: this.u, method: this.B, credentials: this.m, cache: void 0 };
    s && (c.body = s), (this.D || u).fetch(new Request(this.A, c)).then(this.Sa.bind(this), this.ga.bind(this));
  }, n.abort = function() {
    this.response = this.responseText = "", this.u = new Headers(), this.status = 0, this.j && this.j.cancel("Request was aborted.").catch(() => {
    }), 1 <= this.readyState && this.g && this.readyState != 4 && (this.g = !1, vn(this)), this.readyState = 0;
  }, n.Sa = function(s) {
    if (this.g && (this.l = s, this.h || (this.status = this.l.status, this.statusText = this.l.statusText, this.h = s.headers, this.readyState = 2, En(this)), this.g && (this.readyState = 3, En(this), this.g))) if (this.responseType === "arraybuffer") s.arrayBuffer().then(this.Qa.bind(this), this.ga.bind(this));
    else if (typeof u.ReadableStream < "u" && "body" in s) {
      if (this.j = s.body.getReader(), this.o) {
        if (this.responseType) throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');
        this.response = [];
      } else this.response = this.responseText = "", this.v = new TextDecoder();
      Uo(this);
    } else s.text().then(this.Ra.bind(this), this.ga.bind(this));
  };
  function Uo(s) {
    s.j.read().then(s.Pa.bind(s)).catch(s.ga.bind(s));
  }
  n.Pa = function(s) {
    if (this.g) {
      if (this.o && s.value) this.response.push(s.value);
      else if (!this.o) {
        var c = s.value ? s.value : new Uint8Array(0);
        (c = this.v.decode(c, { stream: !s.done })) && (this.response = this.responseText += c);
      }
      s.done ? vn(this) : En(this), this.readyState == 3 && Uo(this);
    }
  }, n.Ra = function(s) {
    this.g && (this.response = this.responseText = s, vn(this));
  }, n.Qa = function(s) {
    this.g && (this.response = s, vn(this));
  }, n.ga = function() {
    this.g && vn(this);
  };
  function vn(s) {
    s.readyState = 4, s.l = null, s.j = null, s.v = null, En(s);
  }
  n.setRequestHeader = function(s, c) {
    this.u.append(s, c);
  }, n.getResponseHeader = function(s) {
    return this.h && this.h.get(s.toLowerCase()) || "";
  }, n.getAllResponseHeaders = function() {
    if (!this.h) return "";
    const s = [], c = this.h.entries();
    for (var l = c.next(); !l.done; ) l = l.value, s.push(l[0] + ": " + l[1]), l = c.next();
    return s.join(`\r
`);
  };
  function En(s) {
    s.onreadystatechange && s.onreadystatechange.call(s);
  }
  Object.defineProperty(fr.prototype, "withCredentials", { get: function() {
    return this.m === "include";
  }, set: function(s) {
    this.m = s ? "include" : "same-origin";
  } });
  function Bo(s) {
    let c = "";
    return te(s, function(l, f) {
      c += f, c += ":", c += l, c += `\r
`;
    }), c;
  }
  function Vi(s, c, l) {
    e: {
      for (f in l) {
        var f = !1;
        break e;
      }
      f = !0;
    }
    f || (l = Bo(l), typeof s == "string" ? l != null && encodeURIComponent(String(l)) : Y(s, c, l));
  }
  function Z(s) {
    fe.call(this), this.headers = /* @__PURE__ */ new Map(), this.o = s || null, this.h = !1, this.v = this.g = null, this.D = "", this.m = 0, this.l = "", this.j = this.B = this.u = this.A = !1, this.I = null, this.H = "", this.J = !1;
  }
  V(Z, fe);
  var ih = /^https?$/i, sh = ["POST", "PUT"];
  n = Z.prototype, n.Ha = function(s) {
    this.J = s;
  }, n.ea = function(s, c, l, f) {
    if (this.g) throw Error("[goog.net.XhrIo] Object is active with another request=" + this.D + "; newUri=" + s);
    c = c ? c.toUpperCase() : "GET", this.D = s, this.l = "", this.m = 0, this.A = !1, this.h = !0, this.g = this.o ? this.o.g() : Ai.g(), this.v = this.o ? mo(this.o) : mo(Ai), this.g.onreadystatechange = R(this.Ea, this);
    try {
      this.B = !0, this.g.open(c, String(s), !0), this.B = !1;
    } catch (A) {
      jo(this, A);
      return;
    }
    if (s = l || "", l = new Map(this.headers), f) if (Object.getPrototypeOf(f) === Object.prototype) for (var T in f) l.set(T, f[T]);
    else if (typeof f.keys == "function" && typeof f.get == "function") for (const A of f.keys()) l.set(A, f.get(A));
    else throw Error("Unknown input type for opt_headers: " + String(f));
    f = Array.from(l.keys()).find((A) => A.toLowerCase() == "content-type"), T = u.FormData && s instanceof u.FormData, !(0 <= Array.prototype.indexOf.call(sh, c, void 0)) || f || T || l.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
    for (const [A, b] of l) this.g.setRequestHeader(A, b);
    this.H && (this.g.responseType = this.H), "withCredentials" in this.g && this.g.withCredentials !== this.J && (this.g.withCredentials = this.J);
    try {
      zo(this), this.u = !0, this.g.send(s), this.u = !1;
    } catch (A) {
      jo(this, A);
    }
  };
  function jo(s, c) {
    s.h = !1, s.g && (s.j = !0, s.g.abort(), s.j = !1), s.l = c, s.m = 5, qo(s), pr(s);
  }
  function qo(s) {
    s.A || (s.A = !0, Ee(s, "complete"), Ee(s, "error"));
  }
  n.abort = function(s) {
    this.g && this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1, this.m = s || 7, Ee(this, "complete"), Ee(this, "abort"), pr(this));
  }, n.N = function() {
    this.g && (this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1), pr(this, !0)), Z.aa.N.call(this);
  }, n.Ea = function() {
    this.s || (this.B || this.u || this.j ? $o(this) : this.bb());
  }, n.bb = function() {
    $o(this);
  };
  function $o(s) {
    if (s.h && typeof a < "u" && (!s.v[1] || Fe(s) != 4 || s.Z() != 2)) {
      if (s.u && Fe(s) == 4) lo(s.Ea, 0, s);
      else if (Ee(s, "readystatechange"), Fe(s) == 4) {
        s.h = !1;
        try {
          const b = s.Z();
          e: switch (b) {
            case 200:
            case 201:
            case 202:
            case 204:
            case 206:
            case 304:
            case 1223:
              var c = !0;
              break e;
            default:
              c = !1;
          }
          var l;
          if (!(l = c)) {
            var f;
            if (f = b === 0) {
              var T = String(s.D).match(No)[1] || null;
              !T && u.self && u.self.location && (T = u.self.location.protocol.slice(0, -1)), f = !ih.test(T ? T.toLowerCase() : "");
            }
            l = f;
          }
          if (l) Ee(s, "complete"), Ee(s, "success");
          else {
            s.m = 6;
            try {
              var A = 2 < Fe(s) ? s.g.statusText : "";
            } catch {
              A = "";
            }
            s.l = A + " [" + s.Z() + "]", qo(s);
          }
        } finally {
          pr(s);
        }
      }
    }
  }
  function pr(s, c) {
    if (s.g) {
      zo(s);
      const l = s.g, f = s.v[0] ? () => {
      } : null;
      s.g = null, s.v = null, c || Ee(s, "ready");
      try {
        l.onreadystatechange = f;
      } catch {
      }
    }
  }
  function zo(s) {
    s.I && (u.clearTimeout(s.I), s.I = null);
  }
  n.isActive = function() {
    return !!this.g;
  };
  function Fe(s) {
    return s.g ? s.g.readyState : 0;
  }
  n.Z = function() {
    try {
      return 2 < Fe(this) ? this.g.status : -1;
    } catch {
      return -1;
    }
  }, n.oa = function() {
    try {
      return this.g ? this.g.responseText : "";
    } catch {
      return "";
    }
  }, n.Oa = function(s) {
    if (this.g) {
      var c = this.g.responseText;
      return s && c.indexOf(s) == 0 && (c = c.substring(s.length)), xl(c);
    }
  };
  function Wo(s) {
    try {
      if (!s.g) return null;
      if ("response" in s.g) return s.g.response;
      switch (s.H) {
        case "":
        case "text":
          return s.g.responseText;
        case "arraybuffer":
          if ("mozResponseArrayBuffer" in s.g) return s.g.mozResponseArrayBuffer;
      }
      return null;
    } catch {
      return null;
    }
  }
  function oh(s) {
    const c = {};
    s = (s.g && 2 <= Fe(s) && s.g.getAllResponseHeaders() || "").split(`\r
`);
    for (let f = 0; f < s.length; f++) {
      if (H(s[f])) continue;
      var l = E(s[f]);
      const T = l[0];
      if (l = l[1], typeof l != "string") continue;
      l = l.trim();
      const A = c[T] || [];
      c[T] = A, A.push(l);
    }
    v(c, function(f) {
      return f.join(", ");
    });
  }
  n.Ba = function() {
    return this.m;
  }, n.Ka = function() {
    return typeof this.l == "string" ? this.l : String(this.l);
  };
  function Tn(s, c, l) {
    return l && l.internalChannelParams && l.internalChannelParams[s] || c;
  }
  function Ho(s) {
    this.Aa = 0, this.i = [], this.j = new pn(), this.ia = this.qa = this.I = this.W = this.g = this.ya = this.D = this.H = this.m = this.S = this.o = null, this.Ya = this.U = 0, this.Va = Tn("failFast", !1, s), this.F = this.C = this.u = this.s = this.l = null, this.X = !0, this.za = this.T = -1, this.Y = this.v = this.B = 0, this.Ta = Tn("baseRetryDelayMs", 5e3, s), this.cb = Tn("retryDelaySeedMs", 1e4, s), this.Wa = Tn("forwardChannelMaxRetries", 2, s), this.wa = Tn("forwardChannelRequestTimeoutMs", 2e4, s), this.pa = s && s.xmlHttpFactory || void 0, this.Xa = s && s.Tb || void 0, this.Ca = s && s.useFetchStreams || !1, this.L = void 0, this.J = s && s.supportsCrossDomainXhr || !1, this.K = "", this.h = new Po(s && s.concurrentRequestLimit), this.Da = new nh(), this.P = s && s.fastHandshake || !1, this.O = s && s.encodeInitMessageHeaders || !1, this.P && this.O && (this.O = !1), this.Ua = s && s.Rb || !1, s && s.xa && this.j.xa(), s && s.forceLongPolling && (this.X = !1), this.ba = !this.P && this.X && s && s.detectBufferingProxy || !1, this.ja = void 0, s && s.longPollingTimeout && 0 < s.longPollingTimeout && (this.ja = s.longPollingTimeout), this.ca = void 0, this.R = 0, this.M = !1, this.ka = this.A = null;
  }
  n = Ho.prototype, n.la = 8, n.G = 1, n.connect = function(s, c, l, f) {
    Te(0), this.W = s, this.H = c || {}, l && f !== void 0 && (this.H.OSID = l, this.H.OAID = f), this.F = this.X, this.I = ta(this, null, this.W), gr(this);
  };
  function Di(s) {
    if (Ko(s), s.G == 3) {
      var c = s.U++, l = xe(s.I);
      if (Y(l, "SID", s.K), Y(l, "RID", c), Y(l, "TYPE", "terminate"), In(s, l), c = new Ye(s, s.j, c), c.L = 2, c.v = hr(xe(l)), l = !1, u.navigator && u.navigator.sendBeacon) try {
        l = u.navigator.sendBeacon(c.v.toString(), "");
      } catch {
      }
      !l && u.Image && (new Image().src = c.v, l = !0), l || (c.g = na(c.j, null), c.g.ea(c.v)), c.F = Date.now(), cr(c);
    }
    ea(s);
  }
  function mr(s) {
    s.g && (Oi(s), s.g.cancel(), s.g = null);
  }
  function Ko(s) {
    mr(s), s.u && (u.clearTimeout(s.u), s.u = null), _r(s), s.h.cancel(), s.s && (typeof s.s == "number" && u.clearTimeout(s.s), s.s = null);
  }
  function gr(s) {
    if (!Co(s.h) && !s.s) {
      s.s = !0;
      var c = s.Ga;
      an || so(), cn || (an(), cn = !0), di.add(c, s), s.B = 0;
    }
  }
  function ah(s, c) {
    return bo(s.h) >= s.h.j - (s.s ? 1 : 0) ? !1 : s.s ? (s.i = c.D.concat(s.i), !0) : s.G == 1 || s.G == 2 || s.B >= (s.Va ? 0 : s.Wa) ? !1 : (s.s = fn(R(s.Ga, s, c), Zo(s, s.B)), s.B++, !0);
  }
  n.Ga = function(s) {
    if (this.s) if (this.s = null, this.G == 1) {
      if (!s) {
        this.U = Math.floor(1e5 * Math.random()), s = this.U++;
        const T = new Ye(this, this.j, s);
        let A = this.o;
        if (this.S && (A ? (A = p(A), y(A, this.S)) : A = this.S), this.m !== null || this.O || (T.H = A, A = null), this.P) e: {
          for (var c = 0, l = 0; l < this.i.length; l++) {
            t: {
              var f = this.i[l];
              if ("__data__" in f.map && (f = f.map.__data__, typeof f == "string")) {
                f = f.length;
                break t;
              }
              f = void 0;
            }
            if (f === void 0) break;
            if (c += f, 4096 < c) {
              c = l;
              break e;
            }
            if (c === 4096 || l === this.i.length - 1) {
              c = l + 1;
              break e;
            }
          }
          c = 1e3;
        }
        else c = 1e3;
        c = Qo(this, T, c), l = xe(this.I), Y(l, "RID", s), Y(l, "CVER", 22), this.D && Y(l, "X-HTTP-Session-Id", this.D), In(this, l), A && (this.O ? c = "headers=" + encodeURIComponent(String(Bo(A))) + "&" + c : this.m && Vi(l, this.m, A)), ki(this.h, T), this.Ua && Y(l, "TYPE", "init"), this.P ? (Y(l, "$req", c), Y(l, "SID", "null"), T.T = !0, Si(T, l, null)) : Si(T, l, c), this.G = 2;
      }
    } else this.G == 3 && (s ? Go(this, s) : this.i.length == 0 || Co(this.h) || Go(this));
  };
  function Go(s, c) {
    var l;
    c ? l = c.l : l = s.U++;
    const f = xe(s.I);
    Y(f, "SID", s.K), Y(f, "RID", l), Y(f, "AID", s.T), In(s, f), s.m && s.o && Vi(f, s.m, s.o), l = new Ye(s, s.j, l, s.B + 1), s.m === null && (l.H = s.o), c && (s.i = c.D.concat(s.i)), c = Qo(s, l, 1e3), l.I = Math.round(0.5 * s.wa) + Math.round(0.5 * s.wa * Math.random()), ki(s.h, l), Si(l, f, c);
  }
  function In(s, c) {
    s.H && te(s.H, function(l, f) {
      Y(c, f, l);
    }), s.l && Do({}, function(l, f) {
      Y(c, f, l);
    });
  }
  function Qo(s, c, l) {
    l = Math.min(s.i.length, l);
    var f = s.l ? R(s.l.Na, s.l, s) : null;
    e: {
      var T = s.i;
      let A = -1;
      for (; ; ) {
        const b = ["count=" + l];
        A == -1 ? 0 < l ? (A = T[0].g, b.push("ofs=" + A)) : A = 0 : b.push("ofs=" + A);
        let Q = !0;
        for (let ae = 0; ae < l; ae++) {
          let $ = T[ae].g;
          const pe = T[ae].map;
          if ($ -= A, 0 > $) A = Math.max(0, T[ae].g - 100), Q = !1;
          else try {
            rh(pe, b, "req" + $ + "_");
          } catch {
            f && f(pe);
          }
        }
        if (Q) {
          f = b.join("&");
          break e;
        }
      }
    }
    return s = s.i.splice(0, l), c.D = s, f;
  }
  function Yo(s) {
    if (!s.g && !s.u) {
      s.Y = 1;
      var c = s.Fa;
      an || so(), cn || (an(), cn = !0), di.add(c, s), s.v = 0;
    }
  }
  function Ni(s) {
    return s.g || s.u || 3 <= s.v ? !1 : (s.Y++, s.u = fn(R(s.Fa, s), Zo(s, s.v)), s.v++, !0);
  }
  n.Fa = function() {
    if (this.u = null, Jo(this), this.ba && !(this.M || this.g == null || 0 >= this.R)) {
      var s = 2 * this.R;
      this.j.info("BP detection timer enabled: " + s), this.A = fn(R(this.ab, this), s);
    }
  }, n.ab = function() {
    this.A && (this.A = null, this.j.info("BP detection timeout reached."), this.j.info("Buffering proxy detected and switch to long-polling!"), this.F = !1, this.M = !0, Te(10), mr(this), Jo(this));
  };
  function Oi(s) {
    s.A != null && (u.clearTimeout(s.A), s.A = null);
  }
  function Jo(s) {
    s.g = new Ye(s, s.j, "rpc", s.Y), s.m === null && (s.g.H = s.o), s.g.O = 0;
    var c = xe(s.qa);
    Y(c, "RID", "rpc"), Y(c, "SID", s.K), Y(c, "AID", s.T), Y(c, "CI", s.F ? "0" : "1"), !s.F && s.ja && Y(c, "TO", s.ja), Y(c, "TYPE", "xmlhttp"), In(s, c), s.m && s.o && Vi(c, s.m, s.o), s.L && (s.g.I = s.L);
    var l = s.g;
    s = s.ia, l.L = 1, l.v = hr(xe(c)), l.m = null, l.P = !0, Ao(l, s);
  }
  n.Za = function() {
    this.C != null && (this.C = null, mr(this), Ni(this), Te(19));
  };
  function _r(s) {
    s.C != null && (u.clearTimeout(s.C), s.C = null);
  }
  function Xo(s, c) {
    var l = null;
    if (s.g == c) {
      _r(s), Oi(s), s.g = null;
      var f = 2;
    } else if (bi(s.h, c)) l = c.D, ko(s.h, c), f = 1;
    else return;
    if (s.G != 0) {
      if (c.o) if (f == 1) {
        l = c.m ? c.m.length : 0, c = Date.now() - c.F;
        var T = s.B;
        f = sr(), Ee(f, new Eo(f, l)), gr(s);
      } else Yo(s);
      else if (T = c.s, T == 3 || T == 0 && 0 < c.X || !(f == 1 && ah(s, c) || f == 2 && Ni(s))) switch (l && 0 < l.length && (c = s.h, c.i = c.i.concat(l)), T) {
        case 1:
          yt(s, 5);
          break;
        case 4:
          yt(s, 10);
          break;
        case 3:
          yt(s, 6);
          break;
        default:
          yt(s, 2);
      }
    }
  }
  function Zo(s, c) {
    let l = s.Ta + Math.floor(Math.random() * s.cb);
    return s.isActive() || (l *= 2), l * c;
  }
  function yt(s, c) {
    if (s.j.info("Error code " + c), c == 2) {
      var l = R(s.fb, s), f = s.Xa;
      const T = !f;
      f = new _t(f || "//www.google.com/images/cleardot.gif"), u.location && u.location.protocol == "http" || ur(f, "https"), hr(f), T ? eh(f.toString(), l) : th(f.toString(), l);
    } else Te(2);
    s.G = 0, s.l && s.l.sa(c), ea(s), Ko(s);
  }
  n.fb = function(s) {
    s ? (this.j.info("Successfully pinged google.com"), Te(2)) : (this.j.info("Failed to ping google.com"), Te(1));
  };
  function ea(s) {
    if (s.G = 0, s.ka = [], s.l) {
      const c = Vo(s.h);
      (c.length != 0 || s.i.length != 0) && (k(s.ka, c), k(s.ka, s.i), s.h.i.length = 0, N(s.i), s.i.length = 0), s.l.ra();
    }
  }
  function ta(s, c, l) {
    var f = l instanceof _t ? xe(l) : new _t(l);
    if (f.g != "") c && (f.g = c + "." + f.g), lr(f, f.s);
    else {
      var T = u.location;
      f = T.protocol, c = c ? c + "." + T.hostname : T.hostname, T = +T.port;
      var A = new _t(null);
      f && ur(A, f), c && (A.g = c), T && lr(A, T), l && (A.l = l), f = A;
    }
    return l = s.D, c = s.ya, l && c && Y(f, l, c), Y(f, "VER", s.la), In(s, f), f;
  }
  function na(s, c, l) {
    if (c && !s.J) throw Error("Can't create secondary domain capable XhrIo object.");
    return c = s.Ca && !s.pa ? new Z(new dr({ eb: l })) : new Z(s.pa), c.Ha(s.J), c;
  }
  n.isActive = function() {
    return !!this.l && this.l.isActive(this);
  };
  function ra() {
  }
  n = ra.prototype, n.ua = function() {
  }, n.ta = function() {
  }, n.sa = function() {
  }, n.ra = function() {
  }, n.isActive = function() {
    return !0;
  }, n.Na = function() {
  };
  function yr() {
  }
  yr.prototype.g = function(s, c) {
    return new we(s, c);
  };
  function we(s, c) {
    fe.call(this), this.g = new Ho(c), this.l = s, this.h = c && c.messageUrlParams || null, s = c && c.messageHeaders || null, c && c.clientProtocolHeaderRequired && (s ? s["X-Client-Protocol"] = "webchannel" : s = { "X-Client-Protocol": "webchannel" }), this.g.o = s, s = c && c.initMessageHeaders || null, c && c.messageContentType && (s ? s["X-WebChannel-Content-Type"] = c.messageContentType : s = { "X-WebChannel-Content-Type": c.messageContentType }), c && c.va && (s ? s["X-WebChannel-Client-Profile"] = c.va : s = { "X-WebChannel-Client-Profile": c.va }), this.g.S = s, (s = c && c.Sb) && !H(s) && (this.g.m = s), this.v = c && c.supportsCrossDomainXhr || !1, this.u = c && c.sendRawJson || !1, (c = c && c.httpSessionIdParam) && !H(c) && (this.g.D = c, s = this.h, s !== null && c in s && (s = this.h, c in s && delete s[c])), this.j = new Dt(this);
  }
  V(we, fe), we.prototype.m = function() {
    this.g.l = this.j, this.v && (this.g.J = !0), this.g.connect(this.l, this.h || void 0);
  }, we.prototype.close = function() {
    Di(this.g);
  }, we.prototype.o = function(s) {
    var c = this.g;
    if (typeof s == "string") {
      var l = {};
      l.__data__ = s, s = l;
    } else this.u && (l = {}, l.__data__ = Ei(s), s = l);
    c.i.push(new zl(c.Ya++, s)), c.G == 3 && gr(c);
  }, we.prototype.N = function() {
    this.g.l = null, delete this.j, Di(this.g), delete this.g, we.aa.N.call(this);
  };
  function ia(s) {
    Ii.call(this), s.__headers__ && (this.headers = s.__headers__, this.statusCode = s.__status__, delete s.__headers__, delete s.__status__);
    var c = s.__sm__;
    if (c) {
      e: {
        for (const l in c) {
          s = l;
          break e;
        }
        s = void 0;
      }
      (this.i = s) && (s = this.i, c = c !== null && s in c ? c[s] : void 0), this.data = c;
    } else this.data = s;
  }
  V(ia, Ii);
  function sa() {
    wi.call(this), this.status = 1;
  }
  V(sa, wi);
  function Dt(s) {
    this.g = s;
  }
  V(Dt, ra), Dt.prototype.ua = function() {
    Ee(this.g, "a");
  }, Dt.prototype.ta = function(s) {
    Ee(this.g, new ia(s));
  }, Dt.prototype.sa = function(s) {
    Ee(this.g, new sa());
  }, Dt.prototype.ra = function() {
    Ee(this.g, "b");
  }, yr.prototype.createWebChannel = yr.prototype.g, we.prototype.send = we.prototype.o, we.prototype.open = we.prototype.m, we.prototype.close = we.prototype.close, pu = function() {
    return new yr();
  }, fu = function() {
    return sr();
  }, du = mt, ts = { mb: 0, pb: 1, qb: 2, Jb: 3, Ob: 4, Lb: 5, Mb: 6, Kb: 7, Ib: 8, Nb: 9, PROXY: 10, NOPROXY: 11, Gb: 12, Cb: 13, Db: 14, Bb: 15, Eb: 16, Fb: 17, ib: 18, hb: 19, jb: 20 }, or.NO_ERROR = 0, or.TIMEOUT = 8, or.HTTP_ERROR = 6, br = or, To.COMPLETE = "complete", hu = To, go.EventType = hn, hn.OPEN = "a", hn.CLOSE = "b", hn.ERROR = "c", hn.MESSAGE = "d", fe.prototype.listen = fe.prototype.K, Sn = go, Z.prototype.listenOnce = Z.prototype.L, Z.prototype.getLastError = Z.prototype.Ka, Z.prototype.getLastErrorCode = Z.prototype.Ba, Z.prototype.getStatus = Z.prototype.Z, Z.prototype.getResponseJson = Z.prototype.Oa, Z.prototype.getResponseText = Z.prototype.oa, Z.prototype.send = Z.prototype.ea, Z.prototype.setWithCredentials = Z.prototype.Ha, lu = Z;
}).apply(typeof Tr < "u" ? Tr : typeof self < "u" ? self : typeof window < "u" ? window : {});
const Ma = "@firebase/firestore";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class _e {
  constructor(e) {
    this.uid = e;
  }
  isAuthenticated() {
    return this.uid != null;
  }
  /**
   * Returns a key representing this user, suitable for inclusion in a
   * dictionary.
   */
  toKey() {
    return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
  }
  isEqual(e) {
    return e.uid === this.uid;
  }
}
_e.UNAUTHENTICATED = new _e(null), // TODO(mikelehen): Look into getting a proper uid-equivalent for
// non-FirebaseAuth providers.
_e.GOOGLE_CREDENTIALS = new _e("google-credentials-uid"), _e.FIRST_PARTY = new _e("first-party-uid"), _e.MOCK_USER = new _e("mock-user");
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let tn = "10.14.0";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const At = new ms("@firebase/firestore");
function wn() {
  return At.logLevel;
}
function D(n, ...e) {
  if (At.logLevel <= j.DEBUG) {
    const t = e.map(Ps);
    At.debug(`Firestore (${tn}): ${n}`, ...t);
  }
}
function He(n, ...e) {
  if (At.logLevel <= j.ERROR) {
    const t = e.map(Ps);
    At.error(`Firestore (${tn}): ${n}`, ...t);
  }
}
function Wt(n, ...e) {
  if (At.logLevel <= j.WARN) {
    const t = e.map(Ps);
    At.warn(`Firestore (${tn}): ${n}`, ...t);
  }
}
function Ps(n) {
  if (typeof n == "string") return n;
  try {
    /**
    * @license
    * Copyright 2020 Google LLC
    *
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    *   http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    */
    return function(t) {
      return JSON.stringify(t);
    }(n);
  } catch {
    return n;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function x(n = "Unexpected state") {
  const e = `FIRESTORE (${tn}) INTERNAL ASSERTION FAILED: ` + n;
  throw He(e), new Error(e);
}
function G(n, e) {
  n || x();
}
function U(n, e) {
  return n;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const C = {
  // Causes are copied from:
  // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
  /** Not an error; returned on success. */
  OK: "ok",
  /** The operation was cancelled (typically by the caller). */
  CANCELLED: "cancelled",
  /** Unknown error or an error from a different error domain. */
  UNKNOWN: "unknown",
  /**
   * Client specified an invalid argument. Note that this differs from
   * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
   * problematic regardless of the state of the system (e.g., a malformed file
   * name).
   */
  INVALID_ARGUMENT: "invalid-argument",
  /**
   * Deadline expired before operation could complete. For operations that
   * change the state of the system, this error may be returned even if the
   * operation has completed successfully. For example, a successful response
   * from a server could have been delayed long enough for the deadline to
   * expire.
   */
  DEADLINE_EXCEEDED: "deadline-exceeded",
  /** Some requested entity (e.g., file or directory) was not found. */
  NOT_FOUND: "not-found",
  /**
   * Some entity that we attempted to create (e.g., file or directory) already
   * exists.
   */
  ALREADY_EXISTS: "already-exists",
  /**
   * The caller does not have permission to execute the specified operation.
   * PERMISSION_DENIED must not be used for rejections caused by exhausting
   * some resource (use RESOURCE_EXHAUSTED instead for those errors).
   * PERMISSION_DENIED must not be used if the caller cannot be identified
   * (use UNAUTHENTICATED instead for those errors).
   */
  PERMISSION_DENIED: "permission-denied",
  /**
   * The request does not have valid authentication credentials for the
   * operation.
   */
  UNAUTHENTICATED: "unauthenticated",
  /**
   * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
   * entire file system is out of space.
   */
  RESOURCE_EXHAUSTED: "resource-exhausted",
  /**
   * Operation was rejected because the system is not in a state required for
   * the operation's execution. For example, directory to be deleted may be
   * non-empty, an rmdir operation is applied to a non-directory, etc.
   *
   * A litmus test that may help a service implementor in deciding
   * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
   *  (a) Use UNAVAILABLE if the client can retry just the failing call.
   *  (b) Use ABORTED if the client should retry at a higher-level
   *      (e.g., restarting a read-modify-write sequence).
   *  (c) Use FAILED_PRECONDITION if the client should not retry until
   *      the system state has been explicitly fixed. E.g., if an "rmdir"
   *      fails because the directory is non-empty, FAILED_PRECONDITION
   *      should be returned since the client should not retry unless
   *      they have first fixed up the directory by deleting files from it.
   *  (d) Use FAILED_PRECONDITION if the client performs conditional
   *      REST Get/Update/Delete on a resource and the resource on the
   *      server does not match the condition. E.g., conflicting
   *      read-modify-write on the same resource.
   */
  FAILED_PRECONDITION: "failed-precondition",
  /**
   * The operation was aborted, typically due to a concurrency issue like
   * sequencer check failures, transaction aborts, etc.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  ABORTED: "aborted",
  /**
   * Operation was attempted past the valid range. E.g., seeking or reading
   * past end of file.
   *
   * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
   * if the system state changes. For example, a 32-bit file system will
   * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
   * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
   * an offset past the current file size.
   *
   * There is a fair bit of overlap between FAILED_PRECONDITION and
   * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
   * when it applies so that callers who are iterating through a space can
   * easily look for an OUT_OF_RANGE error to detect when they are done.
   */
  OUT_OF_RANGE: "out-of-range",
  /** Operation is not implemented or not supported/enabled in this service. */
  UNIMPLEMENTED: "unimplemented",
  /**
   * Internal errors. Means some invariants expected by underlying System has
   * been broken. If you see one of these errors, Something is very broken.
   */
  INTERNAL: "internal",
  /**
   * The service is currently unavailable. This is a most likely a transient
   * condition and may be corrected by retrying with a backoff.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  UNAVAILABLE: "unavailable",
  /** Unrecoverable data loss or corruption. */
  DATA_LOSS: "data-loss"
};
class O extends Ge {
  /** @hideconstructor */
  constructor(e, t) {
    super(e, t), this.code = e, this.message = t, // HACK: We write a toString property directly because Error is not a real
    // class and so inheritance does not work correctly. We could alternatively
    // do the same "back-door inheritance" trick that FirebaseError does.
    this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ut {
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class mu {
  constructor(e, t) {
    this.user = t, this.type = "OAuth", this.headers = /* @__PURE__ */ new Map(), this.headers.set("Authorization", `Bearer ${e}`);
  }
}
class Jp {
  getToken() {
    return Promise.resolve(null);
  }
  invalidateToken() {
  }
  start(e, t) {
    e.enqueueRetryable(() => t(_e.UNAUTHENTICATED));
  }
  shutdown() {
  }
}
class Xp {
  constructor(e) {
    this.token = e, /**
     * Stores the listener registered with setChangeListener()
     * This isn't actually necessary since the UID never changes, but we use this
     * to verify the listen contract is adhered to in tests.
     */
    this.changeListener = null;
  }
  getToken() {
    return Promise.resolve(this.token);
  }
  invalidateToken() {
  }
  start(e, t) {
    this.changeListener = t, // Fire with initial user.
    e.enqueueRetryable(() => t(this.token.user));
  }
  shutdown() {
    this.changeListener = null;
  }
}
class Zp {
  constructor(e) {
    this.t = e, /** Tracks the current User. */
    this.currentUser = _e.UNAUTHENTICATED, /**
     * Counter used to detect if the token changed while a getToken request was
     * outstanding.
     */
    this.i = 0, this.forceRefresh = !1, this.auth = null;
  }
  start(e, t) {
    G(this.o === void 0);
    let r = this.i;
    const i = (h) => this.i !== r ? (r = this.i, t(h)) : Promise.resolve();
    let o = new ut();
    this.o = () => {
      this.i++, this.currentUser = this.u(), o.resolve(), o = new ut(), e.enqueueRetryable(() => i(this.currentUser));
    };
    const a = () => {
      const h = o;
      e.enqueueRetryable(async () => {
        await h.promise, await i(this.currentUser);
      });
    }, u = (h) => {
      D("FirebaseAuthCredentialsProvider", "Auth detected"), this.auth = h, this.o && (this.auth.addAuthTokenListener(this.o), a());
    };
    this.t.onInit((h) => u(h)), // Our users can initialize Auth right after Firestore, so we give it
    // a chance to register itself with the component framework before we
    // determine whether to start up in unauthenticated mode.
    setTimeout(() => {
      if (!this.auth) {
        const h = this.t.getImmediate({
          optional: !0
        });
        h ? u(h) : (
          // If auth is still not available, proceed with `null` user
          (D("FirebaseAuthCredentialsProvider", "Auth not yet detected"), o.resolve(), o = new ut())
        );
      }
    }, 0), a();
  }
  getToken() {
    const e = this.i, t = this.forceRefresh;
    return this.forceRefresh = !1, this.auth ? this.auth.getToken(t).then((r) => (
      // Cancel the request since the token changed while the request was
      // outstanding so the response is potentially for a previous user (which
      // user, we can't be sure).
      this.i !== e ? (D("FirebaseAuthCredentialsProvider", "getToken aborted due to token change."), this.getToken()) : r ? (G(typeof r.accessToken == "string"), new mu(r.accessToken, this.currentUser)) : null
    )) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    this.auth && this.o && this.auth.removeAuthTokenListener(this.o), this.o = void 0;
  }
  // Auth.getUid() can return null even with a user logged in. It is because
  // getUid() is synchronous, but the auth code populating Uid is asynchronous.
  // This method should only be called in the AuthTokenListener callback
  // to guarantee to get the actual user.
  u() {
    const e = this.auth && this.auth.getUid();
    return G(e === null || typeof e == "string"), new _e(e);
  }
}
class em {
  constructor(e, t, r) {
    this.l = e, this.h = t, this.P = r, this.type = "FirstParty", this.user = _e.FIRST_PARTY, this.I = /* @__PURE__ */ new Map();
  }
  /**
   * Gets an authorization token, using a provided factory function, or return
   * null.
   */
  T() {
    return this.P ? this.P() : null;
  }
  get headers() {
    this.I.set("X-Goog-AuthUser", this.l);
    const e = this.T();
    return e && this.I.set("Authorization", e), this.h && this.I.set("X-Goog-Iam-Authorization-Token", this.h), this.I;
  }
}
class tm {
  constructor(e, t, r) {
    this.l = e, this.h = t, this.P = r;
  }
  getToken() {
    return Promise.resolve(new em(this.l, this.h, this.P));
  }
  start(e, t) {
    e.enqueueRetryable(() => t(_e.FIRST_PARTY));
  }
  shutdown() {
  }
  invalidateToken() {
  }
}
class nm {
  constructor(e) {
    this.value = e, this.type = "AppCheck", this.headers = /* @__PURE__ */ new Map(), e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
  }
}
class rm {
  constructor(e) {
    this.A = e, this.forceRefresh = !1, this.appCheck = null, this.R = null;
  }
  start(e, t) {
    G(this.o === void 0);
    const r = (o) => {
      o.error != null && D("FirebaseAppCheckTokenProvider", `Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);
      const a = o.token !== this.R;
      return this.R = o.token, D("FirebaseAppCheckTokenProvider", `Received ${a ? "new" : "existing"} token.`), a ? t(o.token) : Promise.resolve();
    };
    this.o = (o) => {
      e.enqueueRetryable(() => r(o));
    };
    const i = (o) => {
      D("FirebaseAppCheckTokenProvider", "AppCheck detected"), this.appCheck = o, this.o && this.appCheck.addTokenListener(this.o);
    };
    this.A.onInit((o) => i(o)), // Our users can initialize AppCheck after Firestore, so we give it
    // a chance to register itself with the component framework.
    setTimeout(() => {
      if (!this.appCheck) {
        const o = this.A.getImmediate({
          optional: !0
        });
        o ? i(o) : (
          // If AppCheck is still not available, proceed without it.
          D("FirebaseAppCheckTokenProvider", "AppCheck not yet detected")
        );
      }
    }, 0);
  }
  getToken() {
    const e = this.forceRefresh;
    return this.forceRefresh = !1, this.appCheck ? this.appCheck.getToken(e).then((t) => t ? (G(typeof t.token == "string"), this.R = t.token, new nm(t.token)) : null) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    this.appCheck && this.o && this.appCheck.removeTokenListener(this.o), this.o = void 0;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function im(n) {
  const e = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof self < "u" && (self.crypto || self.msCrypto)
  ), t = new Uint8Array(n);
  if (e && typeof e.getRandomValues == "function") e.getRandomValues(t);
  else
    for (let r = 0; r < n; r++) t[r] = Math.floor(256 * Math.random());
  return t;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gu {
  static newId() {
    const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", t = Math.floor(256 / e.length) * e.length;
    let r = "";
    for (; r.length < 20; ) {
      const i = im(40);
      for (let o = 0; o < i.length; ++o)
        r.length < 20 && i[o] < t && (r += e.charAt(i[o] % e.length));
    }
    return r;
  }
}
function z(n, e) {
  return n < e ? -1 : n > e ? 1 : 0;
}
function Ht(n, e, t) {
  return n.length === e.length && n.every((r, i) => t(r, e[i]));
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class se {
  /**
   * Creates a new timestamp.
   *
   * @param seconds - The number of seconds of UTC time since Unix epoch
   *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
   *     9999-12-31T23:59:59Z inclusive.
   * @param nanoseconds - The non-negative fractions of a second at nanosecond
   *     resolution. Negative second values with fractions must still have
   *     non-negative nanoseconds values that count forward in time. Must be
   *     from 0 to 999,999,999 inclusive.
   */
  constructor(e, t) {
    if (this.seconds = e, this.nanoseconds = t, t < 0) throw new O(C.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
    if (t >= 1e9) throw new O(C.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
    if (e < -62135596800) throw new O(C.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
    if (e >= 253402300800) throw new O(C.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
  }
  /**
   * Creates a new timestamp with the current date, with millisecond precision.
   *
   * @returns a new timestamp representing the current date.
   */
  static now() {
    return se.fromMillis(Date.now());
  }
  /**
   * Creates a new timestamp from the given date.
   *
   * @param date - The date to initialize the `Timestamp` from.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     date.
   */
  static fromDate(e) {
    return se.fromMillis(e.getTime());
  }
  /**
   * Creates a new timestamp from the given number of milliseconds.
   *
   * @param milliseconds - Number of milliseconds since Unix epoch
   *     1970-01-01T00:00:00Z.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     number of milliseconds.
   */
  static fromMillis(e) {
    const t = Math.floor(e / 1e3), r = Math.floor(1e6 * (e - 1e3 * t));
    return new se(t, r);
  }
  /**
   * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
   * causes a loss of precision since `Date` objects only support millisecond
   * precision.
   *
   * @returns JavaScript `Date` object representing the same point in time as
   *     this `Timestamp`, with millisecond precision.
   */
  toDate() {
    return new Date(this.toMillis());
  }
  /**
   * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
   * epoch). This operation causes a loss of precision.
   *
   * @returns The point in time corresponding to this timestamp, represented as
   *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
   */
  toMillis() {
    return 1e3 * this.seconds + this.nanoseconds / 1e6;
  }
  _compareTo(e) {
    return this.seconds === e.seconds ? z(this.nanoseconds, e.nanoseconds) : z(this.seconds, e.seconds);
  }
  /**
   * Returns true if this `Timestamp` is equal to the provided one.
   *
   * @param other - The `Timestamp` to compare against.
   * @returns true if this `Timestamp` is equal to the provided one.
   */
  isEqual(e) {
    return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
  }
  /** Returns a textual representation of this `Timestamp`. */
  toString() {
    return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
  }
  /** Returns a JSON-serializable representation of this `Timestamp`. */
  toJSON() {
    return {
      seconds: this.seconds,
      nanoseconds: this.nanoseconds
    };
  }
  /**
   * Converts this object to a primitive string, which allows `Timestamp` objects
   * to be compared using the `>`, `<=`, `>=` and `>` operators.
   */
  valueOf() {
    const e = this.seconds - -62135596800;
    return String(e).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class F {
  constructor(e) {
    this.timestamp = e;
  }
  static fromTimestamp(e) {
    return new F(e);
  }
  static min() {
    return new F(new se(0, 0));
  }
  static max() {
    return new F(new se(253402300799, 999999999));
  }
  compareTo(e) {
    return this.timestamp._compareTo(e.timestamp);
  }
  isEqual(e) {
    return this.timestamp.isEqual(e.timestamp);
  }
  /** Returns a number representation of the version for use in spec tests. */
  toMicroseconds() {
    return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
  }
  toString() {
    return "SnapshotVersion(" + this.timestamp.toString() + ")";
  }
  toTimestamp() {
    return this.timestamp;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class xn {
  constructor(e, t, r) {
    t === void 0 ? t = 0 : t > e.length && x(), r === void 0 ? r = e.length - t : r > e.length - t && x(), this.segments = e, this.offset = t, this.len = r;
  }
  get length() {
    return this.len;
  }
  isEqual(e) {
    return xn.comparator(this, e) === 0;
  }
  child(e) {
    const t = this.segments.slice(this.offset, this.limit());
    return e instanceof xn ? e.forEach((r) => {
      t.push(r);
    }) : t.push(e), this.construct(t);
  }
  /** The index of one past the last segment of the path. */
  limit() {
    return this.offset + this.length;
  }
  popFirst(e) {
    return e = e === void 0 ? 1 : e, this.construct(this.segments, this.offset + e, this.length - e);
  }
  popLast() {
    return this.construct(this.segments, this.offset, this.length - 1);
  }
  firstSegment() {
    return this.segments[this.offset];
  }
  lastSegment() {
    return this.get(this.length - 1);
  }
  get(e) {
    return this.segments[this.offset + e];
  }
  isEmpty() {
    return this.length === 0;
  }
  isPrefixOf(e) {
    if (e.length < this.length) return !1;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
    return !0;
  }
  isImmediateParentOf(e) {
    if (this.length + 1 !== e.length) return !1;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
    return !0;
  }
  forEach(e) {
    for (let t = this.offset, r = this.limit(); t < r; t++) e(this.segments[t]);
  }
  toArray() {
    return this.segments.slice(this.offset, this.limit());
  }
  static comparator(e, t) {
    const r = Math.min(e.length, t.length);
    for (let i = 0; i < r; i++) {
      const o = e.get(i), a = t.get(i);
      if (o < a) return -1;
      if (o > a) return 1;
    }
    return e.length < t.length ? -1 : e.length > t.length ? 1 : 0;
  }
}
class J extends xn {
  construct(e, t, r) {
    return new J(e, t, r);
  }
  canonicalString() {
    return this.toArray().join("/");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns a string representation of this path
   * where each path segment has been encoded with
   * `encodeURIComponent`.
   */
  toUriEncodedString() {
    return this.toArray().map(encodeURIComponent).join("/");
  }
  /**
   * Creates a resource path from the given slash-delimited string. If multiple
   * arguments are provided, all components are combined. Leading and trailing
   * slashes from all components are ignored.
   */
  static fromString(...e) {
    const t = [];
    for (const r of e) {
      if (r.indexOf("//") >= 0) throw new O(C.INVALID_ARGUMENT, `Invalid segment (${r}). Paths must not contain // in them.`);
      t.push(...r.split("/").filter((i) => i.length > 0));
    }
    return new J(t);
  }
  static emptyPath() {
    return new J([]);
  }
}
const sm = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
class ue extends xn {
  construct(e, t, r) {
    return new ue(e, t, r);
  }
  /**
   * Returns true if the string could be used as a segment in a field path
   * without escaping.
   */
  static isValidIdentifier(e) {
    return sm.test(e);
  }
  canonicalString() {
    return this.toArray().map((e) => (e = e.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), ue.isValidIdentifier(e) || (e = "`" + e + "`"), e)).join(".");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns true if this field references the key of a document.
   */
  isKeyField() {
    return this.length === 1 && this.get(0) === "__name__";
  }
  /**
   * The field designating the key of a document.
   */
  static keyField() {
    return new ue(["__name__"]);
  }
  /**
   * Parses a field string from the given server-formatted string.
   *
   * - Splitting the empty string is not allowed (for now at least).
   * - Empty segments within the string (e.g. if there are two consecutive
   *   separators) are not allowed.
   *
   * TODO(b/37244157): we should make this more strict. Right now, it allows
   * non-identifier path components, even if they aren't escaped.
   */
  static fromServerFormat(e) {
    const t = [];
    let r = "", i = 0;
    const o = () => {
      if (r.length === 0) throw new O(C.INVALID_ARGUMENT, `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
      t.push(r), r = "";
    };
    let a = !1;
    for (; i < e.length; ) {
      const u = e[i];
      if (u === "\\") {
        if (i + 1 === e.length) throw new O(C.INVALID_ARGUMENT, "Path has trailing escape character: " + e);
        const h = e[i + 1];
        if (h !== "\\" && h !== "." && h !== "`") throw new O(C.INVALID_ARGUMENT, "Path has invalid escape sequence: " + e);
        r += h, i += 2;
      } else u === "`" ? (a = !a, i++) : u !== "." || a ? (r += u, i++) : (o(), i++);
    }
    if (o(), a) throw new O(C.INVALID_ARGUMENT, "Unterminated ` in path: " + e);
    return new ue(t);
  }
  static emptyPath() {
    return new ue([]);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class L {
  constructor(e) {
    this.path = e;
  }
  static fromPath(e) {
    return new L(J.fromString(e));
  }
  static fromName(e) {
    return new L(J.fromString(e).popFirst(5));
  }
  static empty() {
    return new L(J.emptyPath());
  }
  get collectionGroup() {
    return this.path.popLast().lastSegment();
  }
  /** Returns true if the document is in the specified collectionId. */
  hasCollectionId(e) {
    return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
  }
  /** Returns the collection group (i.e. the name of the parent collection) for this key. */
  getCollectionGroup() {
    return this.path.get(this.path.length - 2);
  }
  /** Returns the fully qualified path to the parent collection. */
  getCollectionPath() {
    return this.path.popLast();
  }
  isEqual(e) {
    return e !== null && J.comparator(this.path, e.path) === 0;
  }
  toString() {
    return this.path.toString();
  }
  static comparator(e, t) {
    return J.comparator(e.path, t.path);
  }
  static isDocumentKey(e) {
    return e.length % 2 == 0;
  }
  /**
   * Creates and returns a new document key with the given segments.
   *
   * @param segments - The segments of the path to the document
   * @returns A new instance of DocumentKey
   */
  static fromSegments(e) {
    return new L(new J(e.slice()));
  }
}
function om(n, e) {
  const t = n.toTimestamp().seconds, r = n.toTimestamp().nanoseconds + 1, i = F.fromTimestamp(r === 1e9 ? new se(t + 1, 0) : new se(t, r));
  return new ht(i, L.empty(), e);
}
function am(n) {
  return new ht(n.readTime, n.key, -1);
}
class ht {
  constructor(e, t, r) {
    this.readTime = e, this.documentKey = t, this.largestBatchId = r;
  }
  /** Returns an offset that sorts before all regular offsets. */
  static min() {
    return new ht(F.min(), L.empty(), -1);
  }
  /** Returns an offset that sorts after all regular offsets. */
  static max() {
    return new ht(F.max(), L.empty(), -1);
  }
}
function cm(n, e) {
  let t = n.readTime.compareTo(e.readTime);
  return t !== 0 ? t : (t = L.comparator(n.documentKey, e.documentKey), t !== 0 ? t : z(n.largestBatchId, e.largestBatchId));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const um = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";
class lm {
  constructor() {
    this.onCommittedListeners = [];
  }
  addOnCommittedListener(e) {
    this.onCommittedListeners.push(e);
  }
  raiseOnCommittedEvent() {
    this.onCommittedListeners.forEach((e) => e());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
async function Qn(n) {
  if (n.code !== C.FAILED_PRECONDITION || n.message !== um) throw n;
  D("LocalStore", "Unexpectedly lost primary lease");
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class S {
  constructor(e) {
    this.nextCallback = null, this.catchCallback = null, // When the operation resolves, we'll set result or error and mark isDone.
    this.result = void 0, this.error = void 0, this.isDone = !1, // Set to true when .then() or .catch() are called and prevents additional
    // chaining.
    this.callbackAttached = !1, e((t) => {
      this.isDone = !0, this.result = t, this.nextCallback && // value should be defined unless T is Void, but we can't express
      // that in the type system.
      this.nextCallback(t);
    }, (t) => {
      this.isDone = !0, this.error = t, this.catchCallback && this.catchCallback(t);
    });
  }
  catch(e) {
    return this.next(void 0, e);
  }
  next(e, t) {
    return this.callbackAttached && x(), this.callbackAttached = !0, this.isDone ? this.error ? this.wrapFailure(t, this.error) : this.wrapSuccess(e, this.result) : new S((r, i) => {
      this.nextCallback = (o) => {
        this.wrapSuccess(e, o).next(r, i);
      }, this.catchCallback = (o) => {
        this.wrapFailure(t, o).next(r, i);
      };
    });
  }
  toPromise() {
    return new Promise((e, t) => {
      this.next(e, t);
    });
  }
  wrapUserFunction(e) {
    try {
      const t = e();
      return t instanceof S ? t : S.resolve(t);
    } catch (t) {
      return S.reject(t);
    }
  }
  wrapSuccess(e, t) {
    return e ? this.wrapUserFunction(() => e(t)) : S.resolve(t);
  }
  wrapFailure(e, t) {
    return e ? this.wrapUserFunction(() => e(t)) : S.reject(t);
  }
  static resolve(e) {
    return new S((t, r) => {
      t(e);
    });
  }
  static reject(e) {
    return new S((t, r) => {
      r(e);
    });
  }
  static waitFor(e) {
    return new S((t, r) => {
      let i = 0, o = 0, a = !1;
      e.forEach((u) => {
        ++i, u.next(() => {
          ++o, a && o === i && t();
        }, (h) => r(h));
      }), a = !0, o === i && t();
    });
  }
  /**
   * Given an array of predicate functions that asynchronously evaluate to a
   * boolean, implements a short-circuiting `or` between the results. Predicates
   * will be evaluated until one of them returns `true`, then stop. The final
   * result will be whether any of them returned `true`.
   */
  static or(e) {
    let t = S.resolve(!1);
    for (const r of e) t = t.next((i) => i ? S.resolve(i) : r());
    return t;
  }
  static forEach(e, t) {
    const r = [];
    return e.forEach((i, o) => {
      r.push(t.call(this, i, o));
    }), this.waitFor(r);
  }
  /**
   * Concurrently map all array elements through asynchronous function.
   */
  static mapArray(e, t) {
    return new S((r, i) => {
      const o = e.length, a = new Array(o);
      let u = 0;
      for (let h = 0; h < o; h++) {
        const d = h;
        t(e[d]).next((m) => {
          a[d] = m, ++u, u === o && r(a);
        }, (m) => i(m));
      }
    });
  }
  /**
   * An alternative to recursive PersistencePromise calls, that avoids
   * potential memory problems from unbounded chains of promises.
   *
   * The `action` will be called repeatedly while `condition` is true.
   */
  static doWhile(e, t) {
    return new S((r, i) => {
      const o = () => {
        e() === !0 ? t().next(() => {
          o();
        }, i) : r();
      };
      o();
    });
  }
}
function hm(n) {
  const e = n.match(/Android ([\d.]+)/i), t = e ? e[1].split(".").slice(0, 2).join(".") : "-1";
  return Number(t);
}
function Yn(n) {
  return n.name === "IndexedDbTransactionError";
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Cs {
  constructor(e, t) {
    this.previousValue = e, t && (t.sequenceNumberHandler = (r) => this.ie(r), this.se = (r) => t.writeSequenceNumber(r));
  }
  ie(e) {
    return this.previousValue = Math.max(e, this.previousValue), this.previousValue;
  }
  next() {
    const e = ++this.previousValue;
    return this.se && this.se(e), e;
  }
}
Cs.oe = -1;
function ti(n) {
  return n == null;
}
function jr(n) {
  return n === 0 && 1 / n == -1 / 0;
}
function dm(n) {
  return typeof n == "number" && Number.isInteger(n) && !jr(n) && n <= Number.MAX_SAFE_INTEGER && n >= Number.MIN_SAFE_INTEGER;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function xa(n) {
  let e = 0;
  for (const t in n) Object.prototype.hasOwnProperty.call(n, t) && e++;
  return e;
}
function nn(n, e) {
  for (const t in n) Object.prototype.hasOwnProperty.call(n, t) && e(t, n[t]);
}
function _u(n) {
  for (const e in n) if (Object.prototype.hasOwnProperty.call(n, e)) return !1;
  return !0;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class X {
  constructor(e, t) {
    this.comparator = e, this.root = t || ce.EMPTY;
  }
  // Returns a copy of the map, with the specified key/value added or replaced.
  insert(e, t) {
    return new X(this.comparator, this.root.insert(e, t, this.comparator).copy(null, null, ce.BLACK, null, null));
  }
  // Returns a copy of the map, with the specified key removed.
  remove(e) {
    return new X(this.comparator, this.root.remove(e, this.comparator).copy(null, null, ce.BLACK, null, null));
  }
  // Returns the value of the node with the given key, or null.
  get(e) {
    let t = this.root;
    for (; !t.isEmpty(); ) {
      const r = this.comparator(e, t.key);
      if (r === 0) return t.value;
      r < 0 ? t = t.left : r > 0 && (t = t.right);
    }
    return null;
  }
  // Returns the index of the element in this sorted map, or -1 if it doesn't
  // exist.
  indexOf(e) {
    let t = 0, r = this.root;
    for (; !r.isEmpty(); ) {
      const i = this.comparator(e, r.key);
      if (i === 0) return t + r.left.size;
      i < 0 ? r = r.left : (
        // Count all nodes left of the node plus the node itself
        (t += r.left.size + 1, r = r.right)
      );
    }
    return -1;
  }
  isEmpty() {
    return this.root.isEmpty();
  }
  // Returns the total number of nodes in the map.
  get size() {
    return this.root.size;
  }
  // Returns the minimum key in the map.
  minKey() {
    return this.root.minKey();
  }
  // Returns the maximum key in the map.
  maxKey() {
    return this.root.maxKey();
  }
  // Traverses the map in key order and calls the specified action function
  // for each key/value pair. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.root.inorderTraversal(e);
  }
  forEach(e) {
    this.inorderTraversal((t, r) => (e(t, r), !1));
  }
  toString() {
    const e = [];
    return this.inorderTraversal((t, r) => (e.push(`${t}:${r}`), !1)), `{${e.join(", ")}}`;
  }
  // Traverses the map in reverse key order and calls the specified action
  // function for each key/value pair. If action returns true, traversal is
  // aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.root.reverseTraversal(e);
  }
  // Returns an iterator over the SortedMap.
  getIterator() {
    return new Ir(this.root, null, this.comparator, !1);
  }
  getIteratorFrom(e) {
    return new Ir(this.root, e, this.comparator, !1);
  }
  getReverseIterator() {
    return new Ir(this.root, null, this.comparator, !0);
  }
  getReverseIteratorFrom(e) {
    return new Ir(this.root, e, this.comparator, !0);
  }
}
class Ir {
  constructor(e, t, r, i) {
    this.isReverse = i, this.nodeStack = [];
    let o = 1;
    for (; !e.isEmpty(); ) if (o = t ? r(e.key, t) : 1, // flip the comparison if we're going in reverse
    t && i && (o *= -1), o < 0)
      e = this.isReverse ? e.left : e.right;
    else {
      if (o === 0) {
        this.nodeStack.push(e);
        break;
      }
      this.nodeStack.push(e), e = this.isReverse ? e.right : e.left;
    }
  }
  getNext() {
    let e = this.nodeStack.pop();
    const t = {
      key: e.key,
      value: e.value
    };
    if (this.isReverse) for (e = e.left; !e.isEmpty(); ) this.nodeStack.push(e), e = e.right;
    else for (e = e.right; !e.isEmpty(); ) this.nodeStack.push(e), e = e.left;
    return t;
  }
  hasNext() {
    return this.nodeStack.length > 0;
  }
  peek() {
    if (this.nodeStack.length === 0) return null;
    const e = this.nodeStack[this.nodeStack.length - 1];
    return {
      key: e.key,
      value: e.value
    };
  }
}
class ce {
  constructor(e, t, r, i, o) {
    this.key = e, this.value = t, this.color = r ?? ce.RED, this.left = i ?? ce.EMPTY, this.right = o ?? ce.EMPTY, this.size = this.left.size + 1 + this.right.size;
  }
  // Returns a copy of the current node, optionally replacing pieces of it.
  copy(e, t, r, i, o) {
    return new ce(e ?? this.key, t ?? this.value, r ?? this.color, i ?? this.left, o ?? this.right);
  }
  isEmpty() {
    return !1;
  }
  // Traverses the tree in key order and calls the specified action function
  // for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.left.inorderTraversal(e) || e(this.key, this.value) || this.right.inorderTraversal(e);
  }
  // Traverses the tree in reverse key order and calls the specified action
  // function for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.right.reverseTraversal(e) || e(this.key, this.value) || this.left.reverseTraversal(e);
  }
  // Returns the minimum node in the tree.
  min() {
    return this.left.isEmpty() ? this : this.left.min();
  }
  // Returns the maximum key in the tree.
  minKey() {
    return this.min().key;
  }
  // Returns the maximum key in the tree.
  maxKey() {
    return this.right.isEmpty() ? this.key : this.right.maxKey();
  }
  // Returns new tree, with the key/value added.
  insert(e, t, r) {
    let i = this;
    const o = r(e, i.key);
    return i = o < 0 ? i.copy(null, null, null, i.left.insert(e, t, r), null) : o === 0 ? i.copy(null, t, null, null, null) : i.copy(null, null, null, null, i.right.insert(e, t, r)), i.fixUp();
  }
  removeMin() {
    if (this.left.isEmpty()) return ce.EMPTY;
    let e = this;
    return e.left.isRed() || e.left.left.isRed() || (e = e.moveRedLeft()), e = e.copy(null, null, null, e.left.removeMin(), null), e.fixUp();
  }
  // Returns new tree, with the specified item removed.
  remove(e, t) {
    let r, i = this;
    if (t(e, i.key) < 0) i.left.isEmpty() || i.left.isRed() || i.left.left.isRed() || (i = i.moveRedLeft()), i = i.copy(null, null, null, i.left.remove(e, t), null);
    else {
      if (i.left.isRed() && (i = i.rotateRight()), i.right.isEmpty() || i.right.isRed() || i.right.left.isRed() || (i = i.moveRedRight()), t(e, i.key) === 0) {
        if (i.right.isEmpty()) return ce.EMPTY;
        r = i.right.min(), i = i.copy(r.key, r.value, null, null, i.right.removeMin());
      }
      i = i.copy(null, null, null, null, i.right.remove(e, t));
    }
    return i.fixUp();
  }
  isRed() {
    return this.color;
  }
  // Returns new tree after performing any needed rotations.
  fixUp() {
    let e = this;
    return e.right.isRed() && !e.left.isRed() && (e = e.rotateLeft()), e.left.isRed() && e.left.left.isRed() && (e = e.rotateRight()), e.left.isRed() && e.right.isRed() && (e = e.colorFlip()), e;
  }
  moveRedLeft() {
    let e = this.colorFlip();
    return e.right.left.isRed() && (e = e.copy(null, null, null, null, e.right.rotateRight()), e = e.rotateLeft(), e = e.colorFlip()), e;
  }
  moveRedRight() {
    let e = this.colorFlip();
    return e.left.left.isRed() && (e = e.rotateRight(), e = e.colorFlip()), e;
  }
  rotateLeft() {
    const e = this.copy(null, null, ce.RED, null, this.right.left);
    return this.right.copy(null, null, this.color, e, null);
  }
  rotateRight() {
    const e = this.copy(null, null, ce.RED, this.left.right, null);
    return this.left.copy(null, null, this.color, null, e);
  }
  colorFlip() {
    const e = this.left.copy(null, null, !this.left.color, null, null), t = this.right.copy(null, null, !this.right.color, null, null);
    return this.copy(null, null, !this.color, e, t);
  }
  // For testing.
  checkMaxDepth() {
    const e = this.check();
    return Math.pow(2, e) <= this.size + 1;
  }
  // In a balanced RB tree, the black-depth (number of black nodes) from root to
  // leaves is equal on both sides.  This function verifies that or asserts.
  check() {
    if (this.isRed() && this.left.isRed() || this.right.isRed()) throw x();
    const e = this.left.check();
    if (e !== this.right.check()) throw x();
    return e + (this.isRed() ? 0 : 1);
  }
}
ce.EMPTY = null, ce.RED = !0, ce.BLACK = !1;
ce.EMPTY = new // Represents an empty node (a leaf node in the Red-Black Tree).
class {
  constructor() {
    this.size = 0;
  }
  get key() {
    throw x();
  }
  get value() {
    throw x();
  }
  get color() {
    throw x();
  }
  get left() {
    throw x();
  }
  get right() {
    throw x();
  }
  // Returns a copy of the current node.
  copy(e, t, r, i, o) {
    return this;
  }
  // Returns a copy of the tree, with the specified key/value added.
  insert(e, t, r) {
    return new ce(e, t);
  }
  // Returns a copy of the tree, with the specified key removed.
  remove(e, t) {
    return this;
  }
  isEmpty() {
    return !0;
  }
  inorderTraversal(e) {
    return !1;
  }
  reverseTraversal(e) {
    return !1;
  }
  minKey() {
    return null;
  }
  maxKey() {
    return null;
  }
  isRed() {
    return !1;
  }
  // For testing.
  checkMaxDepth() {
    return !0;
  }
  check() {
    return 0;
  }
}();
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class le {
  constructor(e) {
    this.comparator = e, this.data = new X(this.comparator);
  }
  has(e) {
    return this.data.get(e) !== null;
  }
  first() {
    return this.data.minKey();
  }
  last() {
    return this.data.maxKey();
  }
  get size() {
    return this.data.size;
  }
  indexOf(e) {
    return this.data.indexOf(e);
  }
  /** Iterates elements in order defined by "comparator" */
  forEach(e) {
    this.data.inorderTraversal((t, r) => (e(t), !1));
  }
  /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */
  forEachInRange(e, t) {
    const r = this.data.getIteratorFrom(e[0]);
    for (; r.hasNext(); ) {
      const i = r.getNext();
      if (this.comparator(i.key, e[1]) >= 0) return;
      t(i.key);
    }
  }
  /**
   * Iterates over `elem`s such that: start &lt;= elem until false is returned.
   */
  forEachWhile(e, t) {
    let r;
    for (r = t !== void 0 ? this.data.getIteratorFrom(t) : this.data.getIterator(); r.hasNext(); )
      if (!e(r.getNext().key)) return;
  }
  /** Finds the least element greater than or equal to `elem`. */
  firstAfterOrEqual(e) {
    const t = this.data.getIteratorFrom(e);
    return t.hasNext() ? t.getNext().key : null;
  }
  getIterator() {
    return new Fa(this.data.getIterator());
  }
  getIteratorFrom(e) {
    return new Fa(this.data.getIteratorFrom(e));
  }
  /** Inserts or updates an element */
  add(e) {
    return this.copy(this.data.remove(e).insert(e, !0));
  }
  /** Deletes an element */
  delete(e) {
    return this.has(e) ? this.copy(this.data.remove(e)) : this;
  }
  isEmpty() {
    return this.data.isEmpty();
  }
  unionWith(e) {
    let t = this;
    return t.size < e.size && (t = e, e = this), e.forEach((r) => {
      t = t.add(r);
    }), t;
  }
  isEqual(e) {
    if (!(e instanceof le) || this.size !== e.size) return !1;
    const t = this.data.getIterator(), r = e.data.getIterator();
    for (; t.hasNext(); ) {
      const i = t.getNext().key, o = r.getNext().key;
      if (this.comparator(i, o) !== 0) return !1;
    }
    return !0;
  }
  toArray() {
    const e = [];
    return this.forEach((t) => {
      e.push(t);
    }), e;
  }
  toString() {
    const e = [];
    return this.forEach((t) => e.push(t)), "SortedSet(" + e.toString() + ")";
  }
  copy(e) {
    const t = new le(this.comparator);
    return t.data = e, t;
  }
}
class Fa {
  constructor(e) {
    this.iter = e;
  }
  getNext() {
    return this.iter.getNext().key;
  }
  hasNext() {
    return this.iter.hasNext();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ce {
  constructor(e) {
    this.fields = e, // TODO(dimond): validation of FieldMask
    // Sort the field mask to support `FieldMask.isEqual()` and assert below.
    e.sort(ue.comparator);
  }
  static empty() {
    return new Ce([]);
  }
  /**
   * Returns a new FieldMask object that is the result of adding all the given
   * fields paths to this field mask.
   */
  unionWith(e) {
    let t = new le(ue.comparator);
    for (const r of this.fields) t = t.add(r);
    for (const r of e) t = t.add(r);
    return new Ce(t.toArray());
  }
  /**
   * Verifies that `fieldPath` is included by at least one field in this field
   * mask.
   *
   * This is an O(n) operation, where `n` is the size of the field mask.
   */
  covers(e) {
    for (const t of this.fields) if (t.isPrefixOf(e)) return !0;
    return !1;
  }
  isEqual(e) {
    return Ht(this.fields, e.fields, (t, r) => t.isEqual(r));
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class yu extends Error {
  constructor() {
    super(...arguments), this.name = "Base64DecodeError";
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class he {
  constructor(e) {
    this.binaryString = e;
  }
  static fromBase64String(e) {
    const t = function(i) {
      try {
        return atob(i);
      } catch (o) {
        throw typeof DOMException < "u" && o instanceof DOMException ? new yu("Invalid base64 string: " + o) : o;
      }
    }(e);
    return new he(t);
  }
  static fromUint8Array(e) {
    const t = (
      /**
      * Helper function to convert an Uint8array to a binary string.
      */
      function(i) {
        let o = "";
        for (let a = 0; a < i.length; ++a) o += String.fromCharCode(i[a]);
        return o;
      }(e)
    );
    return new he(t);
  }
  [Symbol.iterator]() {
    let e = 0;
    return {
      next: () => e < this.binaryString.length ? {
        value: this.binaryString.charCodeAt(e++),
        done: !1
      } : {
        value: void 0,
        done: !0
      }
    };
  }
  toBase64() {
    return function(t) {
      return btoa(t);
    }(this.binaryString);
  }
  toUint8Array() {
    return function(t) {
      const r = new Uint8Array(t.length);
      for (let i = 0; i < t.length; i++) r[i] = t.charCodeAt(i);
      return r;
    }(this.binaryString);
  }
  approximateByteSize() {
    return 2 * this.binaryString.length;
  }
  compareTo(e) {
    return z(this.binaryString, e.binaryString);
  }
  isEqual(e) {
    return this.binaryString === e.binaryString;
  }
}
he.EMPTY_BYTE_STRING = new he("");
const fm = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function dt(n) {
  if (G(!!n), typeof n == "string") {
    let e = 0;
    const t = fm.exec(n);
    if (G(!!t), t[1]) {
      let i = t[1];
      i = (i + "000000000").substr(0, 9), e = Number(i);
    }
    const r = new Date(n);
    return {
      seconds: Math.floor(r.getTime() / 1e3),
      nanos: e
    };
  }
  return {
    seconds: ne(n.seconds),
    nanos: ne(n.nanos)
  };
}
function ne(n) {
  return typeof n == "number" ? n : typeof n == "string" ? Number(n) : 0;
}
function Rt(n) {
  return typeof n == "string" ? he.fromBase64String(n) : he.fromUint8Array(n);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function bs(n) {
  var e, t;
  return ((t = (((e = n == null ? void 0 : n.mapValue) === null || e === void 0 ? void 0 : e.fields) || {}).__type__) === null || t === void 0 ? void 0 : t.stringValue) === "server_timestamp";
}
function ks(n) {
  const e = n.mapValue.fields.__previous_value__;
  return bs(e) ? ks(e) : e;
}
function Fn(n) {
  const e = dt(n.mapValue.fields.__local_write_time__.timestampValue);
  return new se(e.seconds, e.nanos);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class pm {
  /**
   * Constructs a DatabaseInfo using the provided host, databaseId and
   * persistenceKey.
   *
   * @param databaseId - The database to use.
   * @param appId - The Firebase App Id.
   * @param persistenceKey - A unique identifier for this Firestore's local
   * storage (used in conjunction with the databaseId).
   * @param host - The Firestore backend host to connect to.
   * @param ssl - Whether to use SSL when connecting.
   * @param forceLongPolling - Whether to use the forceLongPolling option
   * when using WebChannel as the network transport.
   * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
   * option when using WebChannel as the network transport.
   * @param longPollingOptions Options that configure long-polling.
   * @param useFetchStreams Whether to use the Fetch API instead of
   * XMLHTTPRequest
   */
  constructor(e, t, r, i, o, a, u, h, d) {
    this.databaseId = e, this.appId = t, this.persistenceKey = r, this.host = i, this.ssl = o, this.forceLongPolling = a, this.autoDetectLongPolling = u, this.longPollingOptions = h, this.useFetchStreams = d;
  }
}
class Un {
  constructor(e, t) {
    this.projectId = e, this.database = t || "(default)";
  }
  static empty() {
    return new Un("", "");
  }
  get isDefaultDatabase() {
    return this.database === "(default)";
  }
  isEqual(e) {
    return e instanceof Un && e.projectId === this.projectId && e.database === this.database;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const wr = {
  mapValue: {
    fields: {
      __type__: {
        stringValue: "__max__"
      }
    }
  }
};
function St(n) {
  return "nullValue" in n ? 0 : "booleanValue" in n ? 1 : "integerValue" in n || "doubleValue" in n ? 2 : "timestampValue" in n ? 3 : "stringValue" in n ? 5 : "bytesValue" in n ? 6 : "referenceValue" in n ? 7 : "geoPointValue" in n ? 8 : "arrayValue" in n ? 9 : "mapValue" in n ? bs(n) ? 4 : gm(n) ? 9007199254740991 : mm(n) ? 10 : 11 : x();
}
function Oe(n, e) {
  if (n === e) return !0;
  const t = St(n);
  if (t !== St(e)) return !1;
  switch (t) {
    case 0:
    case 9007199254740991:
      return !0;
    case 1:
      return n.booleanValue === e.booleanValue;
    case 4:
      return Fn(n).isEqual(Fn(e));
    case 3:
      return function(i, o) {
        if (typeof i.timestampValue == "string" && typeof o.timestampValue == "string" && i.timestampValue.length === o.timestampValue.length)
          return i.timestampValue === o.timestampValue;
        const a = dt(i.timestampValue), u = dt(o.timestampValue);
        return a.seconds === u.seconds && a.nanos === u.nanos;
      }(n, e);
    case 5:
      return n.stringValue === e.stringValue;
    case 6:
      return function(i, o) {
        return Rt(i.bytesValue).isEqual(Rt(o.bytesValue));
      }(n, e);
    case 7:
      return n.referenceValue === e.referenceValue;
    case 8:
      return function(i, o) {
        return ne(i.geoPointValue.latitude) === ne(o.geoPointValue.latitude) && ne(i.geoPointValue.longitude) === ne(o.geoPointValue.longitude);
      }(n, e);
    case 2:
      return function(i, o) {
        if ("integerValue" in i && "integerValue" in o) return ne(i.integerValue) === ne(o.integerValue);
        if ("doubleValue" in i && "doubleValue" in o) {
          const a = ne(i.doubleValue), u = ne(o.doubleValue);
          return a === u ? jr(a) === jr(u) : isNaN(a) && isNaN(u);
        }
        return !1;
      }(n, e);
    case 9:
      return Ht(n.arrayValue.values || [], e.arrayValue.values || [], Oe);
    case 10:
    case 11:
      return function(i, o) {
        const a = i.mapValue.fields || {}, u = o.mapValue.fields || {};
        if (xa(a) !== xa(u)) return !1;
        for (const h in a) if (a.hasOwnProperty(h) && (u[h] === void 0 || !Oe(a[h], u[h]))) return !1;
        return !0;
      }(n, e);
    default:
      return x();
  }
}
function Bn(n, e) {
  return (n.values || []).find((t) => Oe(t, e)) !== void 0;
}
function Kt(n, e) {
  if (n === e) return 0;
  const t = St(n), r = St(e);
  if (t !== r) return z(t, r);
  switch (t) {
    case 0:
    case 9007199254740991:
      return 0;
    case 1:
      return z(n.booleanValue, e.booleanValue);
    case 2:
      return function(o, a) {
        const u = ne(o.integerValue || o.doubleValue), h = ne(a.integerValue || a.doubleValue);
        return u < h ? -1 : u > h ? 1 : u === h ? 0 : (
          // one or both are NaN.
          isNaN(u) ? isNaN(h) ? 0 : -1 : 1
        );
      }(n, e);
    case 3:
      return Ua(n.timestampValue, e.timestampValue);
    case 4:
      return Ua(Fn(n), Fn(e));
    case 5:
      return z(n.stringValue, e.stringValue);
    case 6:
      return function(o, a) {
        const u = Rt(o), h = Rt(a);
        return u.compareTo(h);
      }(n.bytesValue, e.bytesValue);
    case 7:
      return function(o, a) {
        const u = o.split("/"), h = a.split("/");
        for (let d = 0; d < u.length && d < h.length; d++) {
          const m = z(u[d], h[d]);
          if (m !== 0) return m;
        }
        return z(u.length, h.length);
      }(n.referenceValue, e.referenceValue);
    case 8:
      return function(o, a) {
        const u = z(ne(o.latitude), ne(a.latitude));
        return u !== 0 ? u : z(ne(o.longitude), ne(a.longitude));
      }(n.geoPointValue, e.geoPointValue);
    case 9:
      return Ba(n.arrayValue, e.arrayValue);
    case 10:
      return function(o, a) {
        var u, h, d, m;
        const w = o.fields || {}, R = a.fields || {}, P = (u = w.value) === null || u === void 0 ? void 0 : u.arrayValue, V = (h = R.value) === null || h === void 0 ? void 0 : h.arrayValue, N = z(((d = P == null ? void 0 : P.values) === null || d === void 0 ? void 0 : d.length) || 0, ((m = V == null ? void 0 : V.values) === null || m === void 0 ? void 0 : m.length) || 0);
        return N !== 0 ? N : Ba(P, V);
      }(n.mapValue, e.mapValue);
    case 11:
      return function(o, a) {
        if (o === wr.mapValue && a === wr.mapValue) return 0;
        if (o === wr.mapValue) return 1;
        if (a === wr.mapValue) return -1;
        const u = o.fields || {}, h = Object.keys(u), d = a.fields || {}, m = Object.keys(d);
        h.sort(), m.sort();
        for (let w = 0; w < h.length && w < m.length; ++w) {
          const R = z(h[w], m[w]);
          if (R !== 0) return R;
          const P = Kt(u[h[w]], d[m[w]]);
          if (P !== 0) return P;
        }
        return z(h.length, m.length);
      }(n.mapValue, e.mapValue);
    default:
      throw x();
  }
}
function Ua(n, e) {
  if (typeof n == "string" && typeof e == "string" && n.length === e.length) return z(n, e);
  const t = dt(n), r = dt(e), i = z(t.seconds, r.seconds);
  return i !== 0 ? i : z(t.nanos, r.nanos);
}
function Ba(n, e) {
  const t = n.values || [], r = e.values || [];
  for (let i = 0; i < t.length && i < r.length; ++i) {
    const o = Kt(t[i], r[i]);
    if (o) return o;
  }
  return z(t.length, r.length);
}
function Gt(n) {
  return ns(n);
}
function ns(n) {
  return "nullValue" in n ? "null" : "booleanValue" in n ? "" + n.booleanValue : "integerValue" in n ? "" + n.integerValue : "doubleValue" in n ? "" + n.doubleValue : "timestampValue" in n ? function(t) {
    const r = dt(t);
    return `time(${r.seconds},${r.nanos})`;
  }(n.timestampValue) : "stringValue" in n ? n.stringValue : "bytesValue" in n ? function(t) {
    return Rt(t).toBase64();
  }(n.bytesValue) : "referenceValue" in n ? function(t) {
    return L.fromName(t).toString();
  }(n.referenceValue) : "geoPointValue" in n ? function(t) {
    return `geo(${t.latitude},${t.longitude})`;
  }(n.geoPointValue) : "arrayValue" in n ? function(t) {
    let r = "[", i = !0;
    for (const o of t.values || []) i ? i = !1 : r += ",", r += ns(o);
    return r + "]";
  }(n.arrayValue) : "mapValue" in n ? function(t) {
    const r = Object.keys(t.fields || {}).sort();
    let i = "{", o = !0;
    for (const a of r) o ? o = !1 : i += ",", i += `${a}:${ns(t.fields[a])}`;
    return i + "}";
  }(n.mapValue) : x();
}
function rs(n) {
  return !!n && "integerValue" in n;
}
function Vs(n) {
  return !!n && "arrayValue" in n;
}
function ja(n) {
  return !!n && "nullValue" in n;
}
function qa(n) {
  return !!n && "doubleValue" in n && isNaN(Number(n.doubleValue));
}
function kr(n) {
  return !!n && "mapValue" in n;
}
function mm(n) {
  var e, t;
  return ((t = (((e = n == null ? void 0 : n.mapValue) === null || e === void 0 ? void 0 : e.fields) || {}).__type__) === null || t === void 0 ? void 0 : t.stringValue) === "__vector__";
}
function kn(n) {
  if (n.geoPointValue) return {
    geoPointValue: Object.assign({}, n.geoPointValue)
  };
  if (n.timestampValue && typeof n.timestampValue == "object") return {
    timestampValue: Object.assign({}, n.timestampValue)
  };
  if (n.mapValue) {
    const e = {
      mapValue: {
        fields: {}
      }
    };
    return nn(n.mapValue.fields, (t, r) => e.mapValue.fields[t] = kn(r)), e;
  }
  if (n.arrayValue) {
    const e = {
      arrayValue: {
        values: []
      }
    };
    for (let t = 0; t < (n.arrayValue.values || []).length; ++t) e.arrayValue.values[t] = kn(n.arrayValue.values[t]);
    return e;
  }
  return Object.assign({}, n);
}
function gm(n) {
  return (((n.mapValue || {}).fields || {}).__type__ || {}).stringValue === "__max__";
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Re {
  constructor(e) {
    this.value = e;
  }
  static empty() {
    return new Re({
      mapValue: {}
    });
  }
  /**
   * Returns the value at the given path or null.
   *
   * @param path - the path to search
   * @returns The value at the path or null if the path is not set.
   */
  field(e) {
    if (e.isEmpty()) return this.value;
    {
      let t = this.value;
      for (let r = 0; r < e.length - 1; ++r) if (t = (t.mapValue.fields || {})[e.get(r)], !kr(t)) return null;
      return t = (t.mapValue.fields || {})[e.lastSegment()], t || null;
    }
  }
  /**
   * Sets the field to the provided value.
   *
   * @param path - The field path to set.
   * @param value - The value to set.
   */
  set(e, t) {
    this.getFieldsMap(e.popLast())[e.lastSegment()] = kn(t);
  }
  /**
   * Sets the provided fields to the provided values.
   *
   * @param data - A map of fields to values (or null for deletes).
   */
  setAll(e) {
    let t = ue.emptyPath(), r = {}, i = [];
    e.forEach((a, u) => {
      if (!t.isImmediateParentOf(u)) {
        const h = this.getFieldsMap(t);
        this.applyChanges(h, r, i), r = {}, i = [], t = u.popLast();
      }
      a ? r[u.lastSegment()] = kn(a) : i.push(u.lastSegment());
    });
    const o = this.getFieldsMap(t);
    this.applyChanges(o, r, i);
  }
  /**
   * Removes the field at the specified path. If there is no field at the
   * specified path, nothing is changed.
   *
   * @param path - The field path to remove.
   */
  delete(e) {
    const t = this.field(e.popLast());
    kr(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
  }
  isEqual(e) {
    return Oe(this.value, e.value);
  }
  /**
   * Returns the map that contains the leaf element of `path`. If the parent
   * entry does not yet exist, or if it is not a map, a new map will be created.
   */
  getFieldsMap(e) {
    let t = this.value;
    t.mapValue.fields || (t.mapValue = {
      fields: {}
    });
    for (let r = 0; r < e.length; ++r) {
      let i = t.mapValue.fields[e.get(r)];
      kr(i) && i.mapValue.fields || (i = {
        mapValue: {
          fields: {}
        }
      }, t.mapValue.fields[e.get(r)] = i), t = i;
    }
    return t.mapValue.fields;
  }
  /**
   * Modifies `fieldsMap` by adding, replacing or deleting the specified
   * entries.
   */
  applyChanges(e, t, r) {
    nn(t, (i, o) => e[i] = o);
    for (const i of r) delete e[i];
  }
  clone() {
    return new Re(kn(this.value));
  }
}
function vu(n) {
  const e = [];
  return nn(n.fields, (t, r) => {
    const i = new ue([t]);
    if (kr(r)) {
      const o = vu(r.mapValue).fields;
      if (o.length === 0)
        e.push(i);
      else
        for (const a of o) e.push(i.child(a));
    } else
      e.push(i);
  }), new Ce(e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ye {
  constructor(e, t, r, i, o, a, u) {
    this.key = e, this.documentType = t, this.version = r, this.readTime = i, this.createTime = o, this.data = a, this.documentState = u;
  }
  /**
   * Creates a document with no known version or data, but which can serve as
   * base document for mutations.
   */
  static newInvalidDocument(e) {
    return new ye(
      e,
      0,
      /* version */
      F.min(),
      /* readTime */
      F.min(),
      /* createTime */
      F.min(),
      Re.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist with the given data at the
   * given version.
   */
  static newFoundDocument(e, t, r, i) {
    return new ye(
      e,
      1,
      /* version */
      t,
      /* readTime */
      F.min(),
      /* createTime */
      r,
      i,
      0
      /* DocumentState.SYNCED */
    );
  }
  /** Creates a new document that is known to not exist at the given version. */
  static newNoDocument(e, t) {
    return new ye(
      e,
      2,
      /* version */
      t,
      /* readTime */
      F.min(),
      /* createTime */
      F.min(),
      Re.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist at the given version but
   * whose data is not known (e.g. a document that was updated without a known
   * base document).
   */
  static newUnknownDocument(e, t) {
    return new ye(
      e,
      3,
      /* version */
      t,
      /* readTime */
      F.min(),
      /* createTime */
      F.min(),
      Re.empty(),
      2
      /* DocumentState.HAS_COMMITTED_MUTATIONS */
    );
  }
  /**
   * Changes the document type to indicate that it exists and that its version
   * and data are known.
   */
  convertToFoundDocument(e, t) {
    return !this.createTime.isEqual(F.min()) || this.documentType !== 2 && this.documentType !== 0 || (this.createTime = e), this.version = e, this.documentType = 1, this.data = t, this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it doesn't exist at the given
   * version.
   */
  convertToNoDocument(e) {
    return this.version = e, this.documentType = 2, this.data = Re.empty(), this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it exists at a given version but
   * that its data is not known (e.g. a document that was updated without a known
   * base document).
   */
  convertToUnknownDocument(e) {
    return this.version = e, this.documentType = 3, this.data = Re.empty(), this.documentState = 2, this;
  }
  setHasCommittedMutations() {
    return this.documentState = 2, this;
  }
  setHasLocalMutations() {
    return this.documentState = 1, this.version = F.min(), this;
  }
  setReadTime(e) {
    return this.readTime = e, this;
  }
  get hasLocalMutations() {
    return this.documentState === 1;
  }
  get hasCommittedMutations() {
    return this.documentState === 2;
  }
  get hasPendingWrites() {
    return this.hasLocalMutations || this.hasCommittedMutations;
  }
  isValidDocument() {
    return this.documentType !== 0;
  }
  isFoundDocument() {
    return this.documentType === 1;
  }
  isNoDocument() {
    return this.documentType === 2;
  }
  isUnknownDocument() {
    return this.documentType === 3;
  }
  isEqual(e) {
    return e instanceof ye && this.key.isEqual(e.key) && this.version.isEqual(e.version) && this.documentType === e.documentType && this.documentState === e.documentState && this.data.isEqual(e.data);
  }
  mutableCopy() {
    return new ye(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
  }
  toString() {
    return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class qr {
  constructor(e, t) {
    this.position = e, this.inclusive = t;
  }
}
function $a(n, e, t) {
  let r = 0;
  for (let i = 0; i < n.position.length; i++) {
    const o = e[i], a = n.position[i];
    if (o.field.isKeyField() ? r = L.comparator(L.fromName(a.referenceValue), t.key) : r = Kt(a, t.data.field(o.field)), o.dir === "desc" && (r *= -1), r !== 0) break;
  }
  return r;
}
function za(n, e) {
  if (n === null) return e === null;
  if (e === null || n.inclusive !== e.inclusive || n.position.length !== e.position.length) return !1;
  for (let t = 0; t < n.position.length; t++)
    if (!Oe(n.position[t], e.position[t])) return !1;
  return !0;
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class $r {
  constructor(e, t = "asc") {
    this.field = e, this.dir = t;
  }
}
function _m(n, e) {
  return n.dir === e.dir && n.field.isEqual(e.field);
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Eu {
}
class ie extends Eu {
  constructor(e, t, r) {
    super(), this.field = e, this.op = t, this.value = r;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, t, r) {
    return e.isKeyField() ? t === "in" || t === "not-in" ? this.createKeyFieldInFilter(e, t, r) : new vm(e, t, r) : t === "array-contains" ? new Im(e, r) : t === "in" ? new wm(e, r) : t === "not-in" ? new Am(e, r) : t === "array-contains-any" ? new Rm(e, r) : new ie(e, t, r);
  }
  static createKeyFieldInFilter(e, t, r) {
    return t === "in" ? new Em(e, r) : new Tm(e, r);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return this.op === "!=" ? t !== null && this.matchesComparison(Kt(t, this.value)) : t !== null && St(this.value) === St(t) && this.matchesComparison(Kt(t, this.value));
  }
  matchesComparison(e) {
    switch (this.op) {
      case "<":
        return e < 0;
      case "<=":
        return e <= 0;
      case "==":
        return e === 0;
      case "!=":
        return e !== 0;
      case ">":
        return e > 0;
      case ">=":
        return e >= 0;
      default:
        return x();
    }
  }
  isInequality() {
    return [
      "<",
      "<=",
      ">",
      ">=",
      "!=",
      "not-in"
      /* Operator.NOT_IN */
    ].indexOf(this.op) >= 0;
  }
  getFlattenedFilters() {
    return [this];
  }
  getFilters() {
    return [this];
  }
}
class Le extends Eu {
  constructor(e, t) {
    super(), this.filters = e, this.op = t, this.ae = null;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, t) {
    return new Le(e, t);
  }
  matches(e) {
    return Tu(this) ? this.filters.find((t) => !t.matches(e)) === void 0 : this.filters.find((t) => t.matches(e)) !== void 0;
  }
  getFlattenedFilters() {
    return this.ae !== null || (this.ae = this.filters.reduce((e, t) => e.concat(t.getFlattenedFilters()), [])), this.ae;
  }
  // Returns a mutable copy of `this.filters`
  getFilters() {
    return Object.assign([], this.filters);
  }
}
function Tu(n) {
  return n.op === "and";
}
function Iu(n) {
  return ym(n) && Tu(n);
}
function ym(n) {
  for (const e of n.filters) if (e instanceof Le) return !1;
  return !0;
}
function is(n) {
  if (n instanceof ie)
    return n.field.canonicalString() + n.op.toString() + Gt(n.value);
  if (Iu(n))
    return n.filters.map((e) => is(e)).join(",");
  {
    const e = n.filters.map((t) => is(t)).join(",");
    return `${n.op}(${e})`;
  }
}
function wu(n, e) {
  return n instanceof ie ? function(r, i) {
    return i instanceof ie && r.op === i.op && r.field.isEqual(i.field) && Oe(r.value, i.value);
  }(n, e) : n instanceof Le ? function(r, i) {
    return i instanceof Le && r.op === i.op && r.filters.length === i.filters.length ? r.filters.reduce((o, a, u) => o && wu(a, i.filters[u]), !0) : !1;
  }(n, e) : void x();
}
function Au(n) {
  return n instanceof ie ? function(t) {
    return `${t.field.canonicalString()} ${t.op} ${Gt(t.value)}`;
  }(n) : n instanceof Le ? function(t) {
    return t.op.toString() + " {" + t.getFilters().map(Au).join(" ,") + "}";
  }(n) : "Filter";
}
class vm extends ie {
  constructor(e, t, r) {
    super(e, t, r), this.key = L.fromName(r.referenceValue);
  }
  matches(e) {
    const t = L.comparator(e.key, this.key);
    return this.matchesComparison(t);
  }
}
class Em extends ie {
  constructor(e, t) {
    super(e, "in", t), this.keys = Ru("in", t);
  }
  matches(e) {
    return this.keys.some((t) => t.isEqual(e.key));
  }
}
class Tm extends ie {
  constructor(e, t) {
    super(e, "not-in", t), this.keys = Ru("not-in", t);
  }
  matches(e) {
    return !this.keys.some((t) => t.isEqual(e.key));
  }
}
function Ru(n, e) {
  var t;
  return (((t = e.arrayValue) === null || t === void 0 ? void 0 : t.values) || []).map((r) => L.fromName(r.referenceValue));
}
class Im extends ie {
  constructor(e, t) {
    super(e, "array-contains", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return Vs(t) && Bn(t.arrayValue, this.value);
  }
}
class wm extends ie {
  constructor(e, t) {
    super(e, "in", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return t !== null && Bn(this.value.arrayValue, t);
  }
}
class Am extends ie {
  constructor(e, t) {
    super(e, "not-in", t);
  }
  matches(e) {
    if (Bn(this.value.arrayValue, {
      nullValue: "NULL_VALUE"
    })) return !1;
    const t = e.data.field(this.field);
    return t !== null && !Bn(this.value.arrayValue, t);
  }
}
class Rm extends ie {
  constructor(e, t) {
    super(e, "array-contains-any", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return !(!Vs(t) || !t.arrayValue.values) && t.arrayValue.values.some((r) => Bn(this.value.arrayValue, r));
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Sm {
  constructor(e, t = null, r = [], i = [], o = null, a = null, u = null) {
    this.path = e, this.collectionGroup = t, this.orderBy = r, this.filters = i, this.limit = o, this.startAt = a, this.endAt = u, this.ue = null;
  }
}
function Wa(n, e = null, t = [], r = [], i = null, o = null, a = null) {
  return new Sm(n, e, t, r, i, o, a);
}
function Ds(n) {
  const e = U(n);
  if (e.ue === null) {
    let t = e.path.canonicalString();
    e.collectionGroup !== null && (t += "|cg:" + e.collectionGroup), t += "|f:", t += e.filters.map((r) => is(r)).join(","), t += "|ob:", t += e.orderBy.map((r) => function(o) {
      return o.field.canonicalString() + o.dir;
    }(r)).join(","), ti(e.limit) || (t += "|l:", t += e.limit), e.startAt && (t += "|lb:", t += e.startAt.inclusive ? "b:" : "a:", t += e.startAt.position.map((r) => Gt(r)).join(",")), e.endAt && (t += "|ub:", t += e.endAt.inclusive ? "a:" : "b:", t += e.endAt.position.map((r) => Gt(r)).join(",")), e.ue = t;
  }
  return e.ue;
}
function Ns(n, e) {
  if (n.limit !== e.limit || n.orderBy.length !== e.orderBy.length) return !1;
  for (let t = 0; t < n.orderBy.length; t++) if (!_m(n.orderBy[t], e.orderBy[t])) return !1;
  if (n.filters.length !== e.filters.length) return !1;
  for (let t = 0; t < n.filters.length; t++) if (!wu(n.filters[t], e.filters[t])) return !1;
  return n.collectionGroup === e.collectionGroup && !!n.path.isEqual(e.path) && !!za(n.startAt, e.startAt) && za(n.endAt, e.endAt);
}
function ss(n) {
  return L.isDocumentKey(n.path) && n.collectionGroup === null && n.filters.length === 0;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ni {
  /**
   * Initializes a Query with a path and optional additional query constraints.
   * Path must currently be empty if this is a collection group query.
   */
  constructor(e, t = null, r = [], i = [], o = null, a = "F", u = null, h = null) {
    this.path = e, this.collectionGroup = t, this.explicitOrderBy = r, this.filters = i, this.limit = o, this.limitType = a, this.startAt = u, this.endAt = h, this.ce = null, // The corresponding `Target` of this `Query` instance, for use with
    // non-aggregate queries.
    this.le = null, // The corresponding `Target` of this `Query` instance, for use with
    // aggregate queries. Unlike targets for non-aggregate queries,
    // aggregate query targets do not contain normalized order-bys, they only
    // contain explicit order-bys.
    this.he = null, this.startAt, this.endAt;
  }
}
function Pm(n, e, t, r, i, o, a, u) {
  return new ni(n, e, t, r, i, o, a, u);
}
function Os(n) {
  return new ni(n);
}
function Ha(n) {
  return n.filters.length === 0 && n.limit === null && n.startAt == null && n.endAt == null && (n.explicitOrderBy.length === 0 || n.explicitOrderBy.length === 1 && n.explicitOrderBy[0].field.isKeyField());
}
function Cm(n) {
  return n.collectionGroup !== null;
}
function Vn(n) {
  const e = U(n);
  if (e.ce === null) {
    e.ce = [];
    const t = /* @__PURE__ */ new Set();
    for (const o of e.explicitOrderBy) e.ce.push(o), t.add(o.field.canonicalString());
    const r = e.explicitOrderBy.length > 0 ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir : "asc";
    (function(a) {
      let u = new le(ue.comparator);
      return a.filters.forEach((h) => {
        h.getFlattenedFilters().forEach((d) => {
          d.isInequality() && (u = u.add(d.field));
        });
      }), u;
    })(e).forEach((o) => {
      t.has(o.canonicalString()) || o.isKeyField() || e.ce.push(new $r(o, r));
    }), // Add the document key field to the last if it is not explicitly ordered.
    t.has(ue.keyField().canonicalString()) || e.ce.push(new $r(ue.keyField(), r));
  }
  return e.ce;
}
function De(n) {
  const e = U(n);
  return e.le || (e.le = bm(e, Vn(n))), e.le;
}
function bm(n, e) {
  if (n.limitType === "F") return Wa(n.path, n.collectionGroup, e, n.filters, n.limit, n.startAt, n.endAt);
  {
    e = e.map((i) => {
      const o = i.dir === "desc" ? "asc" : "desc";
      return new $r(i.field, o);
    });
    const t = n.endAt ? new qr(n.endAt.position, n.endAt.inclusive) : null, r = n.startAt ? new qr(n.startAt.position, n.startAt.inclusive) : null;
    return Wa(n.path, n.collectionGroup, e, n.filters, n.limit, t, r);
  }
}
function os(n, e, t) {
  return new ni(n.path, n.collectionGroup, n.explicitOrderBy.slice(), n.filters.slice(), e, t, n.startAt, n.endAt);
}
function ri(n, e) {
  return Ns(De(n), De(e)) && n.limitType === e.limitType;
}
function Su(n) {
  return `${Ds(De(n))}|lt:${n.limitType}`;
}
function Ot(n) {
  return `Query(target=${function(t) {
    let r = t.path.canonicalString();
    return t.collectionGroup !== null && (r += " collectionGroup=" + t.collectionGroup), t.filters.length > 0 && (r += `, filters: [${t.filters.map((i) => Au(i)).join(", ")}]`), ti(t.limit) || (r += ", limit: " + t.limit), t.orderBy.length > 0 && (r += `, orderBy: [${t.orderBy.map((i) => function(a) {
      return `${a.field.canonicalString()} (${a.dir})`;
    }(i)).join(", ")}]`), t.startAt && (r += ", startAt: ", r += t.startAt.inclusive ? "b:" : "a:", r += t.startAt.position.map((i) => Gt(i)).join(",")), t.endAt && (r += ", endAt: ", r += t.endAt.inclusive ? "a:" : "b:", r += t.endAt.position.map((i) => Gt(i)).join(",")), `Target(${r})`;
  }(De(n))}; limitType=${n.limitType})`;
}
function ii(n, e) {
  return e.isFoundDocument() && function(r, i) {
    const o = i.key.path;
    return r.collectionGroup !== null ? i.key.hasCollectionId(r.collectionGroup) && r.path.isPrefixOf(o) : L.isDocumentKey(r.path) ? r.path.isEqual(o) : r.path.isImmediateParentOf(o);
  }(n, e) && function(r, i) {
    for (const o of Vn(r))
      if (!o.field.isKeyField() && i.data.field(o.field) === null) return !1;
    return !0;
  }(n, e) && function(r, i) {
    for (const o of r.filters) if (!o.matches(i)) return !1;
    return !0;
  }(n, e) && function(r, i) {
    return !(r.startAt && !/**
    * Returns true if a document sorts before a bound using the provided sort
    * order.
    */
    function(a, u, h) {
      const d = $a(a, u, h);
      return a.inclusive ? d <= 0 : d < 0;
    }(r.startAt, Vn(r), i) || r.endAt && !function(a, u, h) {
      const d = $a(a, u, h);
      return a.inclusive ? d >= 0 : d > 0;
    }(r.endAt, Vn(r), i));
  }(n, e);
}
function km(n) {
  return n.collectionGroup || (n.path.length % 2 == 1 ? n.path.lastSegment() : n.path.get(n.path.length - 2));
}
function Pu(n) {
  return (e, t) => {
    let r = !1;
    for (const i of Vn(n)) {
      const o = Vm(i, e, t);
      if (o !== 0) return o;
      r = r || i.field.isKeyField();
    }
    return 0;
  };
}
function Vm(n, e, t) {
  const r = n.field.isKeyField() ? L.comparator(e.key, t.key) : function(o, a, u) {
    const h = a.data.field(o), d = u.data.field(o);
    return h !== null && d !== null ? Kt(h, d) : x();
  }(n.field, e, t);
  switch (n.dir) {
    case "asc":
      return r;
    case "desc":
      return -1 * r;
    default:
      return x();
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class rn {
  constructor(e, t) {
    this.mapKeyFn = e, this.equalsFn = t, /**
     * The inner map for a key/value pair. Due to the possibility of collisions we
     * keep a list of entries that we do a linear search through to find an actual
     * match. Note that collisions should be rare, so we still expect near
     * constant time lookups in practice.
     */
    this.inner = {}, /** The number of entries stored in the map */
    this.innerSize = 0;
  }
  /** Get a value for this key, or undefined if it does not exist. */
  get(e) {
    const t = this.mapKeyFn(e), r = this.inner[t];
    if (r !== void 0) {
      for (const [i, o] of r) if (this.equalsFn(i, e)) return o;
    }
  }
  has(e) {
    return this.get(e) !== void 0;
  }
  /** Put this key and value in the map. */
  set(e, t) {
    const r = this.mapKeyFn(e), i = this.inner[r];
    if (i === void 0) return this.inner[r] = [[e, t]], void this.innerSize++;
    for (let o = 0; o < i.length; o++) if (this.equalsFn(i[o][0], e))
      return void (i[o] = [e, t]);
    i.push([e, t]), this.innerSize++;
  }
  /**
   * Remove this key from the map. Returns a boolean if anything was deleted.
   */
  delete(e) {
    const t = this.mapKeyFn(e), r = this.inner[t];
    if (r === void 0) return !1;
    for (let i = 0; i < r.length; i++) if (this.equalsFn(r[i][0], e)) return r.length === 1 ? delete this.inner[t] : r.splice(i, 1), this.innerSize--, !0;
    return !1;
  }
  forEach(e) {
    nn(this.inner, (t, r) => {
      for (const [i, o] of r) e(i, o);
    });
  }
  isEmpty() {
    return _u(this.inner);
  }
  size() {
    return this.innerSize;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Dm = new X(L.comparator);
function Ke() {
  return Dm;
}
const Cu = new X(L.comparator);
function Pn(...n) {
  let e = Cu;
  for (const t of n) e = e.insert(t.key, t);
  return e;
}
function bu(n) {
  let e = Cu;
  return n.forEach((t, r) => e = e.insert(t, r.overlayedDocument)), e;
}
function Et() {
  return Dn();
}
function ku() {
  return Dn();
}
function Dn() {
  return new rn((n) => n.toString(), (n, e) => n.isEqual(e));
}
const Nm = new X(L.comparator), Om = new le(L.comparator);
function B(...n) {
  let e = Om;
  for (const t of n) e = e.add(t);
  return e;
}
const Lm = new le(z);
function Mm() {
  return Lm;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ls(n, e) {
  if (n.useProto3Json) {
    if (isNaN(e)) return {
      doubleValue: "NaN"
    };
    if (e === 1 / 0) return {
      doubleValue: "Infinity"
    };
    if (e === -1 / 0) return {
      doubleValue: "-Infinity"
    };
  }
  return {
    doubleValue: jr(e) ? "-0" : e
  };
}
function Vu(n) {
  return {
    integerValue: "" + n
  };
}
function xm(n, e) {
  return dm(e) ? Vu(e) : Ls(n, e);
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class si {
  constructor() {
    this._ = void 0;
  }
}
function Fm(n, e, t) {
  return n instanceof jn ? function(i, o) {
    const a = {
      fields: {
        __type__: {
          stringValue: "server_timestamp"
        },
        __local_write_time__: {
          timestampValue: {
            seconds: i.seconds,
            nanos: i.nanoseconds
          }
        }
      }
    };
    return o && bs(o) && (o = ks(o)), o && (a.fields.__previous_value__ = o), {
      mapValue: a
    };
  }(t, e) : n instanceof qn ? Nu(n, e) : n instanceof $n ? Ou(n, e) : function(i, o) {
    const a = Du(i, o), u = Ka(a) + Ka(i.Pe);
    return rs(a) && rs(i.Pe) ? Vu(u) : Ls(i.serializer, u);
  }(n, e);
}
function Um(n, e, t) {
  return n instanceof qn ? Nu(n, e) : n instanceof $n ? Ou(n, e) : t;
}
function Du(n, e) {
  return n instanceof zr ? (
    /** Returns true if `value` is either an IntegerValue or a DoubleValue. */
    function(r) {
      return rs(r) || function(o) {
        return !!o && "doubleValue" in o;
      }(r);
    }(e) ? e : {
      integerValue: 0
    }
  ) : null;
}
class jn extends si {
}
class qn extends si {
  constructor(e) {
    super(), this.elements = e;
  }
}
function Nu(n, e) {
  const t = Lu(e);
  for (const r of n.elements) t.some((i) => Oe(i, r)) || t.push(r);
  return {
    arrayValue: {
      values: t
    }
  };
}
class $n extends si {
  constructor(e) {
    super(), this.elements = e;
  }
}
function Ou(n, e) {
  let t = Lu(e);
  for (const r of n.elements) t = t.filter((i) => !Oe(i, r));
  return {
    arrayValue: {
      values: t
    }
  };
}
class zr extends si {
  constructor(e, t) {
    super(), this.serializer = e, this.Pe = t;
  }
}
function Ka(n) {
  return ne(n.integerValue || n.doubleValue);
}
function Lu(n) {
  return Vs(n) && n.arrayValue.values ? n.arrayValue.values.slice() : [];
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Bm {
  constructor(e, t) {
    this.field = e, this.transform = t;
  }
}
function jm(n, e) {
  return n.field.isEqual(e.field) && function(r, i) {
    return r instanceof qn && i instanceof qn || r instanceof $n && i instanceof $n ? Ht(r.elements, i.elements, Oe) : r instanceof zr && i instanceof zr ? Oe(r.Pe, i.Pe) : r instanceof jn && i instanceof jn;
  }(n.transform, e.transform);
}
class qm {
  constructor(e, t) {
    this.version = e, this.transformResults = t;
  }
}
class $e {
  constructor(e, t) {
    this.updateTime = e, this.exists = t;
  }
  /** Creates a new empty Precondition. */
  static none() {
    return new $e();
  }
  /** Creates a new Precondition with an exists flag. */
  static exists(e) {
    return new $e(void 0, e);
  }
  /** Creates a new Precondition based on a version a document exists at. */
  static updateTime(e) {
    return new $e(e);
  }
  /** Returns whether this Precondition is empty. */
  get isNone() {
    return this.updateTime === void 0 && this.exists === void 0;
  }
  isEqual(e) {
    return this.exists === e.exists && (this.updateTime ? !!e.updateTime && this.updateTime.isEqual(e.updateTime) : !e.updateTime);
  }
}
function Vr(n, e) {
  return n.updateTime !== void 0 ? e.isFoundDocument() && e.version.isEqual(n.updateTime) : n.exists === void 0 || n.exists === e.isFoundDocument();
}
class oi {
}
function Mu(n, e) {
  if (!n.hasLocalMutations || e && e.fields.length === 0) return null;
  if (e === null) return n.isNoDocument() ? new Fu(n.key, $e.none()) : new Jn(n.key, n.data, $e.none());
  {
    const t = n.data, r = Re.empty();
    let i = new le(ue.comparator);
    for (let o of e.fields) if (!i.has(o)) {
      let a = t.field(o);
      a === null && o.length > 1 && (o = o.popLast(), a = t.field(o)), a === null ? r.delete(o) : r.set(o, a), i = i.add(o);
    }
    return new Ct(n.key, r, new Ce(i.toArray()), $e.none());
  }
}
function $m(n, e, t) {
  n instanceof Jn ? function(i, o, a) {
    const u = i.value.clone(), h = Qa(i.fieldTransforms, o, a.transformResults);
    u.setAll(h), o.convertToFoundDocument(a.version, u).setHasCommittedMutations();
  }(n, e, t) : n instanceof Ct ? function(i, o, a) {
    if (!Vr(i.precondition, o))
      return void o.convertToUnknownDocument(a.version);
    const u = Qa(i.fieldTransforms, o, a.transformResults), h = o.data;
    h.setAll(xu(i)), h.setAll(u), o.convertToFoundDocument(a.version, h).setHasCommittedMutations();
  }(n, e, t) : function(i, o, a) {
    o.convertToNoDocument(a.version).setHasCommittedMutations();
  }(0, e, t);
}
function Nn(n, e, t, r) {
  return n instanceof Jn ? function(o, a, u, h) {
    if (!Vr(o.precondition, a))
      return u;
    const d = o.value.clone(), m = Ya(o.fieldTransforms, h, a);
    return d.setAll(m), a.convertToFoundDocument(a.version, d).setHasLocalMutations(), null;
  }(n, e, t, r) : n instanceof Ct ? function(o, a, u, h) {
    if (!Vr(o.precondition, a)) return u;
    const d = Ya(o.fieldTransforms, h, a), m = a.data;
    return m.setAll(xu(o)), m.setAll(d), a.convertToFoundDocument(a.version, m).setHasLocalMutations(), u === null ? null : u.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map((w) => w.field));
  }(n, e, t, r) : function(o, a, u) {
    return Vr(o.precondition, a) ? (a.convertToNoDocument(a.version).setHasLocalMutations(), null) : u;
  }(n, e, t);
}
function zm(n, e) {
  let t = null;
  for (const r of n.fieldTransforms) {
    const i = e.data.field(r.field), o = Du(r.transform, i || null);
    o != null && (t === null && (t = Re.empty()), t.set(r.field, o));
  }
  return t || null;
}
function Ga(n, e) {
  return n.type === e.type && !!n.key.isEqual(e.key) && !!n.precondition.isEqual(e.precondition) && !!function(r, i) {
    return r === void 0 && i === void 0 || !(!r || !i) && Ht(r, i, (o, a) => jm(o, a));
  }(n.fieldTransforms, e.fieldTransforms) && (n.type === 0 ? n.value.isEqual(e.value) : n.type !== 1 || n.data.isEqual(e.data) && n.fieldMask.isEqual(e.fieldMask));
}
class Jn extends oi {
  constructor(e, t, r, i = []) {
    super(), this.key = e, this.value = t, this.precondition = r, this.fieldTransforms = i, this.type = 0;
  }
  getFieldMask() {
    return null;
  }
}
class Ct extends oi {
  constructor(e, t, r, i, o = []) {
    super(), this.key = e, this.data = t, this.fieldMask = r, this.precondition = i, this.fieldTransforms = o, this.type = 1;
  }
  getFieldMask() {
    return this.fieldMask;
  }
}
function xu(n) {
  const e = /* @__PURE__ */ new Map();
  return n.fieldMask.fields.forEach((t) => {
    if (!t.isEmpty()) {
      const r = n.data.field(t);
      e.set(t, r);
    }
  }), e;
}
function Qa(n, e, t) {
  const r = /* @__PURE__ */ new Map();
  G(n.length === t.length);
  for (let i = 0; i < t.length; i++) {
    const o = n[i], a = o.transform, u = e.data.field(o.field);
    r.set(o.field, Um(a, u, t[i]));
  }
  return r;
}
function Ya(n, e, t) {
  const r = /* @__PURE__ */ new Map();
  for (const i of n) {
    const o = i.transform, a = t.data.field(i.field);
    r.set(i.field, Fm(o, a, e));
  }
  return r;
}
class Fu extends oi {
  constructor(e, t) {
    super(), this.key = e, this.precondition = t, this.type = 2, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
}
class Wm extends oi {
  constructor(e, t) {
    super(), this.key = e, this.precondition = t, this.type = 3, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Hm {
  /**
   * @param batchId - The unique ID of this mutation batch.
   * @param localWriteTime - The original write time of this mutation.
   * @param baseMutations - Mutations that are used to populate the base
   * values when this mutation is applied locally. This can be used to locally
   * overwrite values that are persisted in the remote document cache. Base
   * mutations are never sent to the backend.
   * @param mutations - The user-provided mutations in this mutation batch.
   * User-provided mutations are applied both locally and remotely on the
   * backend.
   */
  constructor(e, t, r, i) {
    this.batchId = e, this.localWriteTime = t, this.baseMutations = r, this.mutations = i;
  }
  /**
   * Applies all the mutations in this MutationBatch to the specified document
   * to compute the state of the remote document
   *
   * @param document - The document to apply mutations to.
   * @param batchResult - The result of applying the MutationBatch to the
   * backend.
   */
  applyToRemoteDocument(e, t) {
    const r = t.mutationResults;
    for (let i = 0; i < this.mutations.length; i++) {
      const o = this.mutations[i];
      o.key.isEqual(e.key) && $m(o, e, r[i]);
    }
  }
  /**
   * Computes the local view of a document given all the mutations in this
   * batch.
   *
   * @param document - The document to apply mutations to.
   * @param mutatedFields - Fields that have been updated before applying this mutation batch.
   * @returns A `FieldMask` representing all the fields that are mutated.
   */
  applyToLocalView(e, t) {
    for (const r of this.baseMutations) r.key.isEqual(e.key) && (t = Nn(r, e, t, this.localWriteTime));
    for (const r of this.mutations) r.key.isEqual(e.key) && (t = Nn(r, e, t, this.localWriteTime));
    return t;
  }
  /**
   * Computes the local view for all provided documents given the mutations in
   * this batch. Returns a `DocumentKey` to `Mutation` map which can be used to
   * replace all the mutation applications.
   */
  applyToLocalDocumentSet(e, t) {
    const r = ku();
    return this.mutations.forEach((i) => {
      const o = e.get(i.key), a = o.overlayedDocument;
      let u = this.applyToLocalView(a, o.mutatedFields);
      u = t.has(i.key) ? null : u;
      const h = Mu(a, u);
      h !== null && r.set(i.key, h), a.isValidDocument() || a.convertToNoDocument(F.min());
    }), r;
  }
  keys() {
    return this.mutations.reduce((e, t) => e.add(t.key), B());
  }
  isEqual(e) {
    return this.batchId === e.batchId && Ht(this.mutations, e.mutations, (t, r) => Ga(t, r)) && Ht(this.baseMutations, e.baseMutations, (t, r) => Ga(t, r));
  }
}
class Ms {
  constructor(e, t, r, i) {
    this.batch = e, this.commitVersion = t, this.mutationResults = r, this.docVersions = i;
  }
  /**
   * Creates a new MutationBatchResult for the given batch and results. There
   * must be one result for each mutation in the batch. This static factory
   * caches a document=&gt;version mapping (docVersions).
   */
  static from(e, t, r) {
    G(e.mutations.length === r.length);
    let i = /* @__PURE__ */ function() {
      return Nm;
    }();
    const o = e.mutations;
    for (let a = 0; a < o.length; a++) i = i.insert(o[a].key, r[a].version);
    return new Ms(e, t, r, i);
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Km {
  constructor(e, t) {
    this.largestBatchId = e, this.mutation = t;
  }
  getKey() {
    return this.mutation.key;
  }
  isEqual(e) {
    return e !== null && this.mutation === e.mutation;
  }
  toString() {
    return `Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Gm {
  constructor(e, t) {
    this.count = e, this.unchangedNames = t;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var re, q;
function Qm(n) {
  switch (n) {
    default:
      return x();
    case C.CANCELLED:
    case C.UNKNOWN:
    case C.DEADLINE_EXCEEDED:
    case C.RESOURCE_EXHAUSTED:
    case C.INTERNAL:
    case C.UNAVAILABLE:
    case C.UNAUTHENTICATED:
      return !1;
    case C.INVALID_ARGUMENT:
    case C.NOT_FOUND:
    case C.ALREADY_EXISTS:
    case C.PERMISSION_DENIED:
    case C.FAILED_PRECONDITION:
    case C.ABORTED:
    case C.OUT_OF_RANGE:
    case C.UNIMPLEMENTED:
    case C.DATA_LOSS:
      return !0;
  }
}
function Uu(n) {
  if (n === void 0)
    return He("GRPC error has no .code"), C.UNKNOWN;
  switch (n) {
    case re.OK:
      return C.OK;
    case re.CANCELLED:
      return C.CANCELLED;
    case re.UNKNOWN:
      return C.UNKNOWN;
    case re.DEADLINE_EXCEEDED:
      return C.DEADLINE_EXCEEDED;
    case re.RESOURCE_EXHAUSTED:
      return C.RESOURCE_EXHAUSTED;
    case re.INTERNAL:
      return C.INTERNAL;
    case re.UNAVAILABLE:
      return C.UNAVAILABLE;
    case re.UNAUTHENTICATED:
      return C.UNAUTHENTICATED;
    case re.INVALID_ARGUMENT:
      return C.INVALID_ARGUMENT;
    case re.NOT_FOUND:
      return C.NOT_FOUND;
    case re.ALREADY_EXISTS:
      return C.ALREADY_EXISTS;
    case re.PERMISSION_DENIED:
      return C.PERMISSION_DENIED;
    case re.FAILED_PRECONDITION:
      return C.FAILED_PRECONDITION;
    case re.ABORTED:
      return C.ABORTED;
    case re.OUT_OF_RANGE:
      return C.OUT_OF_RANGE;
    case re.UNIMPLEMENTED:
      return C.UNIMPLEMENTED;
    case re.DATA_LOSS:
      return C.DATA_LOSS;
    default:
      return x();
  }
}
(q = re || (re = {}))[q.OK = 0] = "OK", q[q.CANCELLED = 1] = "CANCELLED", q[q.UNKNOWN = 2] = "UNKNOWN", q[q.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", q[q.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", q[q.NOT_FOUND = 5] = "NOT_FOUND", q[q.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", q[q.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", q[q.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", q[q.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", q[q.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", q[q.ABORTED = 10] = "ABORTED", q[q.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", q[q.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", q[q.INTERNAL = 13] = "INTERNAL", q[q.UNAVAILABLE = 14] = "UNAVAILABLE", q[q.DATA_LOSS = 15] = "DATA_LOSS";
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ym() {
  return new TextEncoder();
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Jm = new Tt([4294967295, 4294967295], 0);
function Ja(n) {
  const e = Ym().encode(n), t = new uu();
  return t.update(e), new Uint8Array(t.digest());
}
function Xa(n) {
  const e = new DataView(n.buffer), t = e.getUint32(
    0,
    /* littleEndian= */
    !0
  ), r = e.getUint32(
    4,
    /* littleEndian= */
    !0
  ), i = e.getUint32(
    8,
    /* littleEndian= */
    !0
  ), o = e.getUint32(
    12,
    /* littleEndian= */
    !0
  );
  return [new Tt([t, r], 0), new Tt([i, o], 0)];
}
class xs {
  constructor(e, t, r) {
    if (this.bitmap = e, this.padding = t, this.hashCount = r, t < 0 || t >= 8) throw new Cn(`Invalid padding: ${t}`);
    if (r < 0) throw new Cn(`Invalid hash count: ${r}`);
    if (e.length > 0 && this.hashCount === 0)
      throw new Cn(`Invalid hash count: ${r}`);
    if (e.length === 0 && t !== 0)
      throw new Cn(`Invalid padding when bitmap length is 0: ${t}`);
    this.Ie = 8 * e.length - t, // Set the bit count in Integer to avoid repetition in mightContain().
    this.Te = Tt.fromNumber(this.Ie);
  }
  // Calculate the ith hash value based on the hashed 64bit integers,
  // and calculate its corresponding bit index in the bitmap to be checked.
  Ee(e, t, r) {
    let i = e.add(t.multiply(Tt.fromNumber(r)));
    return i.compare(Jm) === 1 && (i = new Tt([i.getBits(0), i.getBits(1)], 0)), i.modulo(this.Te).toNumber();
  }
  // Return whether the bit on the given index in the bitmap is set to 1.
  de(e) {
    return (this.bitmap[Math.floor(e / 8)] & 1 << e % 8) != 0;
  }
  mightContain(e) {
    if (this.Ie === 0) return !1;
    const t = Ja(e), [r, i] = Xa(t);
    for (let o = 0; o < this.hashCount; o++) {
      const a = this.Ee(r, i, o);
      if (!this.de(a)) return !1;
    }
    return !0;
  }
  /** Create bloom filter for testing purposes only. */
  static create(e, t, r) {
    const i = e % 8 == 0 ? 0 : 8 - e % 8, o = new Uint8Array(Math.ceil(e / 8)), a = new xs(o, i, t);
    return r.forEach((u) => a.insert(u)), a;
  }
  insert(e) {
    if (this.Ie === 0) return;
    const t = Ja(e), [r, i] = Xa(t);
    for (let o = 0; o < this.hashCount; o++) {
      const a = this.Ee(r, i, o);
      this.Ae(a);
    }
  }
  Ae(e) {
    const t = Math.floor(e / 8), r = e % 8;
    this.bitmap[t] |= 1 << r;
  }
}
class Cn extends Error {
  constructor() {
    super(...arguments), this.name = "BloomFilterError";
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ai {
  constructor(e, t, r, i, o) {
    this.snapshotVersion = e, this.targetChanges = t, this.targetMismatches = r, this.documentUpdates = i, this.resolvedLimboDocuments = o;
  }
  /**
   * HACK: Views require RemoteEvents in order to determine whether the view is
   * CURRENT, but secondary tabs don't receive remote events. So this method is
   * used to create a synthesized RemoteEvent that can be used to apply a
   * CURRENT status change to a View, for queries executed in a different tab.
   */
  // PORTING NOTE: Multi-tab only
  static createSynthesizedRemoteEventForCurrentChange(e, t, r) {
    const i = /* @__PURE__ */ new Map();
    return i.set(e, Xn.createSynthesizedTargetChangeForCurrentChange(e, t, r)), new ai(F.min(), i, new X(z), Ke(), B());
  }
}
class Xn {
  constructor(e, t, r, i, o) {
    this.resumeToken = e, this.current = t, this.addedDocuments = r, this.modifiedDocuments = i, this.removedDocuments = o;
  }
  /**
   * This method is used to create a synthesized TargetChanges that can be used to
   * apply a CURRENT status change to a View (for queries executed in a different
   * tab) or for new queries (to raise snapshots with correct CURRENT status).
   */
  static createSynthesizedTargetChangeForCurrentChange(e, t, r) {
    return new Xn(r, t, B(), B(), B());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Dr {
  constructor(e, t, r, i) {
    this.Re = e, this.removedTargetIds = t, this.key = r, this.Ve = i;
  }
}
class Bu {
  constructor(e, t) {
    this.targetId = e, this.me = t;
  }
}
class ju {
  constructor(e, t, r = he.EMPTY_BYTE_STRING, i = null) {
    this.state = e, this.targetIds = t, this.resumeToken = r, this.cause = i;
  }
}
class Za {
  constructor() {
    this.fe = 0, /**
     * Keeps track of the document changes since the last raised snapshot.
     *
     * These changes are continuously updated as we receive document updates and
     * always reflect the current set of changes against the last issued snapshot.
     */
    this.ge = tc(), /** See public getters for explanations of these fields. */
    this.pe = he.EMPTY_BYTE_STRING, this.ye = !1, /**
     * Whether this target state should be included in the next snapshot. We
     * initialize to true so that newly-added targets are included in the next
     * RemoteEvent.
     */
    this.we = !0;
  }
  /**
   * Whether this target has been marked 'current'.
   *
   * 'Current' has special meaning in the RPC protocol: It implies that the
   * Watch backend has sent us all changes up to the point at which the target
   * was added and that the target is consistent with the rest of the watch
   * stream.
   */
  get current() {
    return this.ye;
  }
  /** The last resume token sent to us for this target. */
  get resumeToken() {
    return this.pe;
  }
  /** Whether this target has pending target adds or target removes. */
  get Se() {
    return this.fe !== 0;
  }
  /** Whether we have modified any state that should trigger a snapshot. */
  get be() {
    return this.we;
  }
  /**
   * Applies the resume token to the TargetChange, but only when it has a new
   * value. Empty resumeTokens are discarded.
   */
  De(e) {
    e.approximateByteSize() > 0 && (this.we = !0, this.pe = e);
  }
  /**
   * Creates a target change from the current set of changes.
   *
   * To reset the document changes after raising this snapshot, call
   * `clearPendingChanges()`.
   */
  ve() {
    let e = B(), t = B(), r = B();
    return this.ge.forEach((i, o) => {
      switch (o) {
        case 0:
          e = e.add(i);
          break;
        case 2:
          t = t.add(i);
          break;
        case 1:
          r = r.add(i);
          break;
        default:
          x();
      }
    }), new Xn(this.pe, this.ye, e, t, r);
  }
  /**
   * Resets the document changes and sets `hasPendingChanges` to false.
   */
  Ce() {
    this.we = !1, this.ge = tc();
  }
  Fe(e, t) {
    this.we = !0, this.ge = this.ge.insert(e, t);
  }
  Me(e) {
    this.we = !0, this.ge = this.ge.remove(e);
  }
  xe() {
    this.fe += 1;
  }
  Oe() {
    this.fe -= 1, G(this.fe >= 0);
  }
  Ne() {
    this.we = !0, this.ye = !0;
  }
}
class Xm {
  constructor(e) {
    this.Le = e, /** The internal state of all tracked targets. */
    this.Be = /* @__PURE__ */ new Map(), /** Keeps track of the documents to update since the last raised snapshot. */
    this.ke = Ke(), /** A mapping of document keys to their set of target IDs. */
    this.qe = ec(), /**
     * A map of targets with existence filter mismatches. These targets are
     * known to be inconsistent and their listens needs to be re-established by
     * RemoteStore.
     */
    this.Qe = new X(z);
  }
  /**
   * Processes and adds the DocumentWatchChange to the current set of changes.
   */
  Ke(e) {
    for (const t of e.Re) e.Ve && e.Ve.isFoundDocument() ? this.$e(t, e.Ve) : this.Ue(t, e.key, e.Ve);
    for (const t of e.removedTargetIds) this.Ue(t, e.key, e.Ve);
  }
  /** Processes and adds the WatchTargetChange to the current set of changes. */
  We(e) {
    this.forEachTarget(e, (t) => {
      const r = this.Ge(t);
      switch (e.state) {
        case 0:
          this.ze(t) && r.De(e.resumeToken);
          break;
        case 1:
          r.Oe(), r.Se || // We have a freshly added target, so we need to reset any state
          // that we had previously. This can happen e.g. when remove and add
          // back a target for existence filter mismatches.
          r.Ce(), r.De(e.resumeToken);
          break;
        case 2:
          r.Oe(), r.Se || this.removeTarget(t);
          break;
        case 3:
          this.ze(t) && (r.Ne(), r.De(e.resumeToken));
          break;
        case 4:
          this.ze(t) && // Reset the target and synthesizes removes for all existing
          // documents. The backend will re-add any documents that still
          // match the target before it sends the next global snapshot.
          (this.je(t), r.De(e.resumeToken));
          break;
        default:
          x();
      }
    });
  }
  /**
   * Iterates over all targetIds that the watch change applies to: either the
   * targetIds explicitly listed in the change or the targetIds of all currently
   * active targets.
   */
  forEachTarget(e, t) {
    e.targetIds.length > 0 ? e.targetIds.forEach(t) : this.Be.forEach((r, i) => {
      this.ze(i) && t(i);
    });
  }
  /**
   * Handles existence filters and synthesizes deletes for filter mismatches.
   * Targets that are invalidated by filter mismatches are added to
   * `pendingTargetResets`.
   */
  He(e) {
    const t = e.targetId, r = e.me.count, i = this.Je(t);
    if (i) {
      const o = i.target;
      if (ss(o)) if (r === 0) {
        const a = new L(o.path);
        this.Ue(t, a, ye.newNoDocument(a, F.min()));
      } else G(r === 1);
      else {
        const a = this.Ye(t);
        if (a !== r) {
          const u = this.Ze(e), h = u ? this.Xe(u, e, a) : 1;
          if (h !== 0) {
            this.je(t);
            const d = h === 2 ? "TargetPurposeExistenceFilterMismatchBloom" : "TargetPurposeExistenceFilterMismatch";
            this.Qe = this.Qe.insert(t, d);
          }
        }
      }
    }
  }
  /**
   * Parse the bloom filter from the "unchanged_names" field of an existence
   * filter.
   */
  Ze(e) {
    const t = e.me.unchangedNames;
    if (!t || !t.bits) return null;
    const { bits: { bitmap: r = "", padding: i = 0 }, hashCount: o = 0 } = t;
    let a, u;
    try {
      a = Rt(r).toUint8Array();
    } catch (h) {
      if (h instanceof yu) return Wt("Decoding the base64 bloom filter in existence filter failed (" + h.message + "); ignoring the bloom filter and falling back to full re-query."), null;
      throw h;
    }
    try {
      u = new xs(a, i, o);
    } catch (h) {
      return Wt(h instanceof Cn ? "BloomFilter error: " : "Applying bloom filter failed: ", h), null;
    }
    return u.Ie === 0 ? null : u;
  }
  /**
   * Apply bloom filter to remove the deleted documents, and return the
   * application status.
   */
  Xe(e, t, r) {
    return t.me.count === r - this.nt(e, t.targetId) ? 0 : 2;
  }
  /**
   * Filter out removed documents based on bloom filter membership result and
   * return number of documents removed.
   */
  nt(e, t) {
    const r = this.Le.getRemoteKeysForTarget(t);
    let i = 0;
    return r.forEach((o) => {
      const a = this.Le.tt(), u = `projects/${a.projectId}/databases/${a.database}/documents/${o.path.canonicalString()}`;
      e.mightContain(u) || (this.Ue(
        t,
        o,
        /*updatedDocument=*/
        null
      ), i++);
    }), i;
  }
  /**
   * Converts the currently accumulated state into a remote event at the
   * provided snapshot version. Resets the accumulated changes before returning.
   */
  rt(e) {
    const t = /* @__PURE__ */ new Map();
    this.Be.forEach((o, a) => {
      const u = this.Je(a);
      if (u) {
        if (o.current && ss(u.target)) {
          const h = new L(u.target.path);
          this.ke.get(h) !== null || this.it(a, h) || this.Ue(a, h, ye.newNoDocument(h, e));
        }
        o.be && (t.set(a, o.ve()), o.Ce());
      }
    });
    let r = B();
    this.qe.forEach((o, a) => {
      let u = !0;
      a.forEachWhile((h) => {
        const d = this.Je(h);
        return !d || d.purpose === "TargetPurposeLimboResolution" || (u = !1, !1);
      }), u && (r = r.add(o));
    }), this.ke.forEach((o, a) => a.setReadTime(e));
    const i = new ai(e, t, this.Qe, this.ke, r);
    return this.ke = Ke(), this.qe = ec(), this.Qe = new X(z), i;
  }
  /**
   * Adds the provided document to the internal list of document updates and
   * its document key to the given target's mapping.
   */
  // Visible for testing.
  $e(e, t) {
    if (!this.ze(e)) return;
    const r = this.it(e, t.key) ? 2 : 0;
    this.Ge(e).Fe(t.key, r), this.ke = this.ke.insert(t.key, t), this.qe = this.qe.insert(t.key, this.st(t.key).add(e));
  }
  /**
   * Removes the provided document from the target mapping. If the
   * document no longer matches the target, but the document's state is still
   * known (e.g. we know that the document was deleted or we received the change
   * that caused the filter mismatch), the new document can be provided
   * to update the remote document cache.
   */
  // Visible for testing.
  Ue(e, t, r) {
    if (!this.ze(e)) return;
    const i = this.Ge(e);
    this.it(e, t) ? i.Fe(
      t,
      1
      /* ChangeType.Removed */
    ) : (
      // The document may have entered and left the target before we raised a
      // snapshot, so we can just ignore the change.
      i.Me(t)
    ), this.qe = this.qe.insert(t, this.st(t).delete(e)), r && (this.ke = this.ke.insert(t, r));
  }
  removeTarget(e) {
    this.Be.delete(e);
  }
  /**
   * Returns the current count of documents in the target. This includes both
   * the number of documents that the LocalStore considers to be part of the
   * target as well as any accumulated changes.
   */
  Ye(e) {
    const t = this.Ge(e).ve();
    return this.Le.getRemoteKeysForTarget(e).size + t.addedDocuments.size - t.removedDocuments.size;
  }
  /**
   * Increment the number of acks needed from watch before we can consider the
   * server to be 'in-sync' with the client's active targets.
   */
  xe(e) {
    this.Ge(e).xe();
  }
  Ge(e) {
    let t = this.Be.get(e);
    return t || (t = new Za(), this.Be.set(e, t)), t;
  }
  st(e) {
    let t = this.qe.get(e);
    return t || (t = new le(z), this.qe = this.qe.insert(e, t)), t;
  }
  /**
   * Verifies that the user is still interested in this target (by calling
   * `getTargetDataForTarget()`) and that we are not waiting for pending ADDs
   * from watch.
   */
  ze(e) {
    const t = this.Je(e) !== null;
    return t || D("WatchChangeAggregator", "Detected inactive target", e), t;
  }
  /**
   * Returns the TargetData for an active target (i.e. a target that the user
   * is still interested in that has no outstanding target change requests).
   */
  Je(e) {
    const t = this.Be.get(e);
    return t && t.Se ? null : this.Le.ot(e);
  }
  /**
   * Resets the state of a Watch target to its initial state (e.g. sets
   * 'current' to false, clears the resume token and removes its target mapping
   * from all documents).
   */
  je(e) {
    this.Be.set(e, new Za()), this.Le.getRemoteKeysForTarget(e).forEach((t) => {
      this.Ue(
        e,
        t,
        /*updatedDocument=*/
        null
      );
    });
  }
  /**
   * Returns whether the LocalStore considers the document to be part of the
   * specified target.
   */
  it(e, t) {
    return this.Le.getRemoteKeysForTarget(e).has(t);
  }
}
function ec() {
  return new X(L.comparator);
}
function tc() {
  return new X(L.comparator);
}
const Zm = {
  asc: "ASCENDING",
  desc: "DESCENDING"
}, eg = {
  "<": "LESS_THAN",
  "<=": "LESS_THAN_OR_EQUAL",
  ">": "GREATER_THAN",
  ">=": "GREATER_THAN_OR_EQUAL",
  "==": "EQUAL",
  "!=": "NOT_EQUAL",
  "array-contains": "ARRAY_CONTAINS",
  in: "IN",
  "not-in": "NOT_IN",
  "array-contains-any": "ARRAY_CONTAINS_ANY"
}, tg = {
  and: "AND",
  or: "OR"
};
class ng {
  constructor(e, t) {
    this.databaseId = e, this.useProto3Json = t;
  }
}
function as(n, e) {
  return n.useProto3Json || ti(e) ? e : {
    value: e
  };
}
function Wr(n, e) {
  return n.useProto3Json ? `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z` : {
    seconds: "" + e.seconds,
    nanos: e.nanoseconds
  };
}
function qu(n, e) {
  return n.useProto3Json ? e.toBase64() : e.toUint8Array();
}
function rg(n, e) {
  return Wr(n, e.toTimestamp());
}
function Ne(n) {
  return G(!!n), F.fromTimestamp(function(t) {
    const r = dt(t);
    return new se(r.seconds, r.nanos);
  }(n));
}
function Fs(n, e) {
  return cs(n, e).canonicalString();
}
function cs(n, e) {
  const t = function(i) {
    return new J(["projects", i.projectId, "databases", i.database]);
  }(n).child("documents");
  return e === void 0 ? t : t.child(e);
}
function $u(n) {
  const e = J.fromString(n);
  return G(Gu(e)), e;
}
function us(n, e) {
  return Fs(n.databaseId, e.path);
}
function $i(n, e) {
  const t = $u(e);
  if (t.get(1) !== n.databaseId.projectId) throw new O(C.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + t.get(1) + " vs " + n.databaseId.projectId);
  if (t.get(3) !== n.databaseId.database) throw new O(C.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + t.get(3) + " vs " + n.databaseId.database);
  return new L(Wu(t));
}
function zu(n, e) {
  return Fs(n.databaseId, e);
}
function ig(n) {
  const e = $u(n);
  return e.length === 4 ? J.emptyPath() : Wu(e);
}
function ls(n) {
  return new J(["projects", n.databaseId.projectId, "databases", n.databaseId.database]).canonicalString();
}
function Wu(n) {
  return G(n.length > 4 && n.get(4) === "documents"), n.popFirst(5);
}
function nc(n, e, t) {
  return {
    name: us(n, e),
    fields: t.value.mapValue.fields
  };
}
function sg(n, e) {
  let t;
  if ("targetChange" in e) {
    e.targetChange;
    const r = function(d) {
      return d === "NO_CHANGE" ? 0 : d === "ADD" ? 1 : d === "REMOVE" ? 2 : d === "CURRENT" ? 3 : d === "RESET" ? 4 : x();
    }(e.targetChange.targetChangeType || "NO_CHANGE"), i = e.targetChange.targetIds || [], o = function(d, m) {
      return d.useProto3Json ? (G(m === void 0 || typeof m == "string"), he.fromBase64String(m || "")) : (G(m === void 0 || // Check if the value is an instance of both Buffer and Uint8Array,
      // despite the fact that Buffer extends Uint8Array. In some
      // environments, such as jsdom, the prototype chain of Buffer
      // does not indicate that it extends Uint8Array.
      m instanceof Buffer || m instanceof Uint8Array), he.fromUint8Array(m || new Uint8Array()));
    }(n, e.targetChange.resumeToken), a = e.targetChange.cause, u = a && function(d) {
      const m = d.code === void 0 ? C.UNKNOWN : Uu(d.code);
      return new O(m, d.message || "");
    }(a);
    t = new ju(r, i, o, u || null);
  } else if ("documentChange" in e) {
    e.documentChange;
    const r = e.documentChange;
    r.document, r.document.name, r.document.updateTime;
    const i = $i(n, r.document.name), o = Ne(r.document.updateTime), a = r.document.createTime ? Ne(r.document.createTime) : F.min(), u = new Re({
      mapValue: {
        fields: r.document.fields
      }
    }), h = ye.newFoundDocument(i, o, a, u), d = r.targetIds || [], m = r.removedTargetIds || [];
    t = new Dr(d, m, h.key, h);
  } else if ("documentDelete" in e) {
    e.documentDelete;
    const r = e.documentDelete;
    r.document;
    const i = $i(n, r.document), o = r.readTime ? Ne(r.readTime) : F.min(), a = ye.newNoDocument(i, o), u = r.removedTargetIds || [];
    t = new Dr([], u, a.key, a);
  } else if ("documentRemove" in e) {
    e.documentRemove;
    const r = e.documentRemove;
    r.document;
    const i = $i(n, r.document), o = r.removedTargetIds || [];
    t = new Dr([], o, i, null);
  } else {
    if (!("filter" in e)) return x();
    {
      e.filter;
      const r = e.filter;
      r.targetId;
      const { count: i = 0, unchangedNames: o } = r, a = new Gm(i, o), u = r.targetId;
      t = new Bu(u, a);
    }
  }
  return t;
}
function og(n, e) {
  let t;
  if (e instanceof Jn) t = {
    update: nc(n, e.key, e.value)
  };
  else if (e instanceof Fu) t = {
    delete: us(n, e.key)
  };
  else if (e instanceof Ct) t = {
    update: nc(n, e.key, e.data),
    updateMask: mg(e.fieldMask)
  };
  else {
    if (!(e instanceof Wm)) return x();
    t = {
      verify: us(n, e.key)
    };
  }
  return e.fieldTransforms.length > 0 && (t.updateTransforms = e.fieldTransforms.map((r) => function(o, a) {
    const u = a.transform;
    if (u instanceof jn) return {
      fieldPath: a.field.canonicalString(),
      setToServerValue: "REQUEST_TIME"
    };
    if (u instanceof qn) return {
      fieldPath: a.field.canonicalString(),
      appendMissingElements: {
        values: u.elements
      }
    };
    if (u instanceof $n) return {
      fieldPath: a.field.canonicalString(),
      removeAllFromArray: {
        values: u.elements
      }
    };
    if (u instanceof zr) return {
      fieldPath: a.field.canonicalString(),
      increment: u.Pe
    };
    throw x();
  }(0, r))), e.precondition.isNone || (t.currentDocument = function(i, o) {
    return o.updateTime !== void 0 ? {
      updateTime: rg(i, o.updateTime)
    } : o.exists !== void 0 ? {
      exists: o.exists
    } : x();
  }(n, e.precondition)), t;
}
function ag(n, e) {
  return n && n.length > 0 ? (G(e !== void 0), n.map((t) => function(i, o) {
    let a = i.updateTime ? Ne(i.updateTime) : Ne(o);
    return a.isEqual(F.min()) && // The Firestore Emulator currently returns an update time of 0 for
    // deletes of non-existing documents (rather than null). This breaks the
    // test "get deleted doc while offline with source=cache" as NoDocuments
    // with version 0 are filtered by IndexedDb's RemoteDocumentCache.
    // TODO(#2149): Remove this when Emulator is fixed
    (a = Ne(o)), new qm(a, i.transformResults || []);
  }(t, e))) : [];
}
function cg(n, e) {
  return {
    documents: [zu(n, e.path)]
  };
}
function ug(n, e) {
  const t = {
    structuredQuery: {}
  }, r = e.path;
  let i;
  e.collectionGroup !== null ? (i = r, t.structuredQuery.from = [{
    collectionId: e.collectionGroup,
    allDescendants: !0
  }]) : (i = r.popLast(), t.structuredQuery.from = [{
    collectionId: r.lastSegment()
  }]), t.parent = zu(n, i);
  const o = function(d) {
    if (d.length !== 0)
      return Ku(Le.create(
        d,
        "and"
        /* CompositeOperator.AND */
      ));
  }(e.filters);
  o && (t.structuredQuery.where = o);
  const a = function(d) {
    if (d.length !== 0)
      return d.map((m) => (
        // visible for testing
        function(R) {
          return {
            field: Lt(R.field),
            direction: dg(R.dir)
          };
        }(m)
      ));
  }(e.orderBy);
  a && (t.structuredQuery.orderBy = a);
  const u = as(n, e.limit);
  return u !== null && (t.structuredQuery.limit = u), e.startAt && (t.structuredQuery.startAt = function(d) {
    return {
      before: d.inclusive,
      values: d.position
    };
  }(e.startAt)), e.endAt && (t.structuredQuery.endAt = function(d) {
    return {
      before: !d.inclusive,
      values: d.position
    };
  }(e.endAt)), {
    _t: t,
    parent: i
  };
}
function lg(n) {
  let e = ig(n.parent);
  const t = n.structuredQuery, r = t.from ? t.from.length : 0;
  let i = null;
  if (r > 0) {
    G(r === 1);
    const m = t.from[0];
    m.allDescendants ? i = m.collectionId : e = e.child(m.collectionId);
  }
  let o = [];
  t.where && (o = function(w) {
    const R = Hu(w);
    return R instanceof Le && Iu(R) ? R.getFilters() : [R];
  }(t.where));
  let a = [];
  t.orderBy && (a = function(w) {
    return w.map((R) => function(V) {
      return new $r(
        Mt(V.field),
        // visible for testing
        function(k) {
          switch (k) {
            case "ASCENDING":
              return "asc";
            case "DESCENDING":
              return "desc";
            default:
              return;
          }
        }(V.direction)
      );
    }(R));
  }(t.orderBy));
  let u = null;
  t.limit && (u = function(w) {
    let R;
    return R = typeof w == "object" ? w.value : w, ti(R) ? null : R;
  }(t.limit));
  let h = null;
  t.startAt && (h = function(w) {
    const R = !!w.before, P = w.values || [];
    return new qr(P, R);
  }(t.startAt));
  let d = null;
  return t.endAt && (d = function(w) {
    const R = !w.before, P = w.values || [];
    return new qr(P, R);
  }(t.endAt)), Pm(e, i, a, o, u, "F", h, d);
}
function hg(n, e) {
  const t = function(i) {
    switch (i) {
      case "TargetPurposeListen":
        return null;
      case "TargetPurposeExistenceFilterMismatch":
        return "existence-filter-mismatch";
      case "TargetPurposeExistenceFilterMismatchBloom":
        return "existence-filter-mismatch-bloom";
      case "TargetPurposeLimboResolution":
        return "limbo-document";
      default:
        return x();
    }
  }(e.purpose);
  return t == null ? null : {
    "goog-listen-tags": t
  };
}
function Hu(n) {
  return n.unaryFilter !== void 0 ? function(t) {
    switch (t.unaryFilter.op) {
      case "IS_NAN":
        const r = Mt(t.unaryFilter.field);
        return ie.create(r, "==", {
          doubleValue: NaN
        });
      case "IS_NULL":
        const i = Mt(t.unaryFilter.field);
        return ie.create(i, "==", {
          nullValue: "NULL_VALUE"
        });
      case "IS_NOT_NAN":
        const o = Mt(t.unaryFilter.field);
        return ie.create(o, "!=", {
          doubleValue: NaN
        });
      case "IS_NOT_NULL":
        const a = Mt(t.unaryFilter.field);
        return ie.create(a, "!=", {
          nullValue: "NULL_VALUE"
        });
      default:
        return x();
    }
  }(n) : n.fieldFilter !== void 0 ? function(t) {
    return ie.create(Mt(t.fieldFilter.field), function(i) {
      switch (i) {
        case "EQUAL":
          return "==";
        case "NOT_EQUAL":
          return "!=";
        case "GREATER_THAN":
          return ">";
        case "GREATER_THAN_OR_EQUAL":
          return ">=";
        case "LESS_THAN":
          return "<";
        case "LESS_THAN_OR_EQUAL":
          return "<=";
        case "ARRAY_CONTAINS":
          return "array-contains";
        case "IN":
          return "in";
        case "NOT_IN":
          return "not-in";
        case "ARRAY_CONTAINS_ANY":
          return "array-contains-any";
        default:
          return x();
      }
    }(t.fieldFilter.op), t.fieldFilter.value);
  }(n) : n.compositeFilter !== void 0 ? function(t) {
    return Le.create(t.compositeFilter.filters.map((r) => Hu(r)), function(i) {
      switch (i) {
        case "AND":
          return "and";
        case "OR":
          return "or";
        default:
          return x();
      }
    }(t.compositeFilter.op));
  }(n) : x();
}
function dg(n) {
  return Zm[n];
}
function fg(n) {
  return eg[n];
}
function pg(n) {
  return tg[n];
}
function Lt(n) {
  return {
    fieldPath: n.canonicalString()
  };
}
function Mt(n) {
  return ue.fromServerFormat(n.fieldPath);
}
function Ku(n) {
  return n instanceof ie ? function(t) {
    if (t.op === "==") {
      if (qa(t.value)) return {
        unaryFilter: {
          field: Lt(t.field),
          op: "IS_NAN"
        }
      };
      if (ja(t.value)) return {
        unaryFilter: {
          field: Lt(t.field),
          op: "IS_NULL"
        }
      };
    } else if (t.op === "!=") {
      if (qa(t.value)) return {
        unaryFilter: {
          field: Lt(t.field),
          op: "IS_NOT_NAN"
        }
      };
      if (ja(t.value)) return {
        unaryFilter: {
          field: Lt(t.field),
          op: "IS_NOT_NULL"
        }
      };
    }
    return {
      fieldFilter: {
        field: Lt(t.field),
        op: fg(t.op),
        value: t.value
      }
    };
  }(n) : n instanceof Le ? function(t) {
    const r = t.getFilters().map((i) => Ku(i));
    return r.length === 1 ? r[0] : {
      compositeFilter: {
        op: pg(t.op),
        filters: r
      }
    };
  }(n) : x();
}
function mg(n) {
  const e = [];
  return n.fields.forEach((t) => e.push(t.canonicalString())), {
    fieldPaths: e
  };
}
function Gu(n) {
  return n.length >= 4 && n.get(0) === "projects" && n.get(2) === "databases";
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class it {
  constructor(e, t, r, i, o = F.min(), a = F.min(), u = he.EMPTY_BYTE_STRING, h = null) {
    this.target = e, this.targetId = t, this.purpose = r, this.sequenceNumber = i, this.snapshotVersion = o, this.lastLimboFreeSnapshotVersion = a, this.resumeToken = u, this.expectedCount = h;
  }
  /** Creates a new target data instance with an updated sequence number. */
  withSequenceNumber(e) {
    return new it(this.target, this.targetId, this.purpose, e, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, this.expectedCount);
  }
  /**
   * Creates a new target data instance with an updated resume token and
   * snapshot version.
   */
  withResumeToken(e, t) {
    return new it(
      this.target,
      this.targetId,
      this.purpose,
      this.sequenceNumber,
      t,
      this.lastLimboFreeSnapshotVersion,
      e,
      /* expectedCount= */
      null
    );
  }
  /**
   * Creates a new target data instance with an updated expected count.
   */
  withExpectedCount(e) {
    return new it(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken, e);
  }
  /**
   * Creates a new target data instance with an updated last limbo free
   * snapshot version number.
   */
  withLastLimboFreeSnapshotVersion(e) {
    return new it(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, e, this.resumeToken, this.expectedCount);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gg {
  constructor(e) {
    this.ct = e;
  }
}
function _g(n) {
  const e = lg({
    parent: n.parent,
    structuredQuery: n.structuredQuery
  });
  return n.limitType === "LAST" ? os(
    e,
    e.limit,
    "L"
    /* LimitType.Last */
  ) : e;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class yg {
  constructor() {
    this.un = new vg();
  }
  addToCollectionParentIndex(e, t) {
    return this.un.add(t), S.resolve();
  }
  getCollectionParents(e, t) {
    return S.resolve(this.un.getEntries(t));
  }
  addFieldIndex(e, t) {
    return S.resolve();
  }
  deleteFieldIndex(e, t) {
    return S.resolve();
  }
  deleteAllFieldIndexes(e) {
    return S.resolve();
  }
  createTargetIndexes(e, t) {
    return S.resolve();
  }
  getDocumentsMatchingTarget(e, t) {
    return S.resolve(null);
  }
  getIndexType(e, t) {
    return S.resolve(
      0
      /* IndexType.NONE */
    );
  }
  getFieldIndexes(e, t) {
    return S.resolve([]);
  }
  getNextCollectionGroupToUpdate(e) {
    return S.resolve(null);
  }
  getMinOffset(e, t) {
    return S.resolve(ht.min());
  }
  getMinOffsetFromCollectionGroup(e, t) {
    return S.resolve(ht.min());
  }
  updateCollectionGroup(e, t, r) {
    return S.resolve();
  }
  updateIndexEntries(e, t) {
    return S.resolve();
  }
}
class vg {
  constructor() {
    this.index = {};
  }
  // Returns false if the entry already existed.
  add(e) {
    const t = e.lastSegment(), r = e.popLast(), i = this.index[t] || new le(J.comparator), o = !i.has(r);
    return this.index[t] = i.add(r), o;
  }
  has(e) {
    const t = e.lastSegment(), r = e.popLast(), i = this.index[t];
    return i && i.has(r);
  }
  getEntries(e) {
    return (this.index[e] || new le(J.comparator)).toArray();
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Qt {
  constructor(e) {
    this.Ln = e;
  }
  next() {
    return this.Ln += 2, this.Ln;
  }
  static Bn() {
    return new Qt(0);
  }
  static kn() {
    return new Qt(-1);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Eg {
  constructor() {
    this.changes = new rn((e) => e.toString(), (e, t) => e.isEqual(t)), this.changesApplied = !1;
  }
  /**
   * Buffers a `RemoteDocumentCache.addEntry()` call.
   *
   * You can only modify documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  addEntry(e) {
    this.assertNotApplied(), this.changes.set(e.key, e);
  }
  /**
   * Buffers a `RemoteDocumentCache.removeEntry()` call.
   *
   * You can only remove documents that have already been retrieved via
   * `getEntry()/getEntries()` (enforced via IndexedDbs `apply()`).
   */
  removeEntry(e, t) {
    this.assertNotApplied(), this.changes.set(e, ye.newInvalidDocument(e).setReadTime(t));
  }
  /**
   * Looks up an entry in the cache. The buffered changes will first be checked,
   * and if no buffered change applies, this will forward to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKey - The key of the entry to look up.
   * @returns The cached document or an invalid document if we have nothing
   * cached.
   */
  getEntry(e, t) {
    this.assertNotApplied();
    const r = this.changes.get(t);
    return r !== void 0 ? S.resolve(r) : this.getFromCache(e, t);
  }
  /**
   * Looks up several entries in the cache, forwarding to
   * `RemoteDocumentCache.getEntry()`.
   *
   * @param transaction - The transaction in which to perform any persistence
   *     operations.
   * @param documentKeys - The keys of the entries to look up.
   * @returns A map of cached documents, indexed by key. If an entry cannot be
   *     found, the corresponding key will be mapped to an invalid document.
   */
  getEntries(e, t) {
    return this.getAllFromCache(e, t);
  }
  /**
   * Applies buffered changes to the underlying RemoteDocumentCache, using
   * the provided transaction.
   */
  apply(e) {
    return this.assertNotApplied(), this.changesApplied = !0, this.applyChanges(e);
  }
  /** Helper to assert this.changes is not null  */
  assertNotApplied() {
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Tg {
  constructor(e, t) {
    this.overlayedDocument = e, this.mutatedFields = t;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ig {
  constructor(e, t, r, i) {
    this.remoteDocumentCache = e, this.mutationQueue = t, this.documentOverlayCache = r, this.indexManager = i;
  }
  /**
   * Get the local view of the document identified by `key`.
   *
   * @returns Local view of the document or null if we don't have any cached
   * state for it.
   */
  getDocument(e, t) {
    let r = null;
    return this.documentOverlayCache.getOverlay(e, t).next((i) => (r = i, this.remoteDocumentCache.getEntry(e, t))).next((i) => (r !== null && Nn(r.mutation, i, Ce.empty(), se.now()), i));
  }
  /**
   * Gets the local view of the documents identified by `keys`.
   *
   * If we don't have cached state for a document in `keys`, a NoDocument will
   * be stored for that key in the resulting set.
   */
  getDocuments(e, t) {
    return this.remoteDocumentCache.getEntries(e, t).next((r) => this.getLocalViewOfDocuments(e, r, B()).next(() => r));
  }
  /**
   * Similar to `getDocuments`, but creates the local view from the given
   * `baseDocs` without retrieving documents from the local store.
   *
   * @param transaction - The transaction this operation is scoped to.
   * @param docs - The documents to apply local mutations to get the local views.
   * @param existenceStateChanged - The set of document keys whose existence state
   *   is changed. This is useful to determine if some documents overlay needs
   *   to be recalculated.
   */
  getLocalViewOfDocuments(e, t, r = B()) {
    const i = Et();
    return this.populateOverlays(e, i, t).next(() => this.computeViews(e, t, i, r).next((o) => {
      let a = Pn();
      return o.forEach((u, h) => {
        a = a.insert(u, h.overlayedDocument);
      }), a;
    }));
  }
  /**
   * Gets the overlayed documents for the given document map, which will include
   * the local view of those documents and a `FieldMask` indicating which fields
   * are mutated locally, `null` if overlay is a Set or Delete mutation.
   */
  getOverlayedDocuments(e, t) {
    const r = Et();
    return this.populateOverlays(e, r, t).next(() => this.computeViews(e, t, r, B()));
  }
  /**
   * Fetches the overlays for {@code docs} and adds them to provided overlay map
   * if the map does not already contain an entry for the given document key.
   */
  populateOverlays(e, t, r) {
    const i = [];
    return r.forEach((o) => {
      t.has(o) || i.push(o);
    }), this.documentOverlayCache.getOverlays(e, i).next((o) => {
      o.forEach((a, u) => {
        t.set(a, u);
      });
    });
  }
  /**
   * Computes the local view for the given documents.
   *
   * @param docs - The documents to compute views for. It also has the base
   *   version of the documents.
   * @param overlays - The overlays that need to be applied to the given base
   *   version of the documents.
   * @param existenceStateChanged - A set of documents whose existence states
   *   might have changed. This is used to determine if we need to re-calculate
   *   overlays from mutation queues.
   * @return A map represents the local documents view.
   */
  computeViews(e, t, r, i) {
    let o = Ke();
    const a = Dn(), u = function() {
      return Dn();
    }();
    return t.forEach((h, d) => {
      const m = r.get(d.key);
      i.has(d.key) && (m === void 0 || m.mutation instanceof Ct) ? o = o.insert(d.key, d) : m !== void 0 ? (a.set(d.key, m.mutation.getFieldMask()), Nn(m.mutation, d, m.mutation.getFieldMask(), se.now())) : (
        // no overlay exists
        // Using EMPTY to indicate there is no overlay for the document.
        a.set(d.key, Ce.empty())
      );
    }), this.recalculateAndSaveOverlays(e, o).next((h) => (h.forEach((d, m) => a.set(d, m)), t.forEach((d, m) => {
      var w;
      return u.set(d, new Tg(m, (w = a.get(d)) !== null && w !== void 0 ? w : null));
    }), u));
  }
  recalculateAndSaveOverlays(e, t) {
    const r = Dn();
    let i = new X((a, u) => a - u), o = B();
    return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e, t).next((a) => {
      for (const u of a) u.keys().forEach((h) => {
        const d = t.get(h);
        if (d === null) return;
        let m = r.get(h) || Ce.empty();
        m = u.applyToLocalView(d, m), r.set(h, m);
        const w = (i.get(u.batchId) || B()).add(h);
        i = i.insert(u.batchId, w);
      });
    }).next(() => {
      const a = [], u = i.getReverseIterator();
      for (; u.hasNext(); ) {
        const h = u.getNext(), d = h.key, m = h.value, w = ku();
        m.forEach((R) => {
          if (!o.has(R)) {
            const P = Mu(t.get(R), r.get(R));
            P !== null && w.set(R, P), o = o.add(R);
          }
        }), a.push(this.documentOverlayCache.saveOverlays(e, d, w));
      }
      return S.waitFor(a);
    }).next(() => r);
  }
  /**
   * Recalculates overlays by reading the documents from remote document cache
   * first, and saves them after they are calculated.
   */
  recalculateAndSaveOverlaysForDocumentKeys(e, t) {
    return this.remoteDocumentCache.getEntries(e, t).next((r) => this.recalculateAndSaveOverlays(e, r));
  }
  /**
   * Performs a query against the local view of all documents.
   *
   * @param transaction - The persistence transaction.
   * @param query - The query to match documents against.
   * @param offset - Read time and key to start scanning by (exclusive).
   * @param context - A optional tracker to keep a record of important details
   *   during database local query execution.
   */
  getDocumentsMatchingQuery(e, t, r, i) {
    return function(a) {
      return L.isDocumentKey(a.path) && a.collectionGroup === null && a.filters.length === 0;
    }(t) ? this.getDocumentsMatchingDocumentQuery(e, t.path) : Cm(t) ? this.getDocumentsMatchingCollectionGroupQuery(e, t, r, i) : this.getDocumentsMatchingCollectionQuery(e, t, r, i);
  }
  /**
   * Given a collection group, returns the next documents that follow the provided offset, along
   * with an updated batch ID.
   *
   * <p>The documents returned by this method are ordered by remote version from the provided
   * offset. If there are no more remote documents after the provided offset, documents with
   * mutations in order of batch id from the offset are returned. Since all documents in a batch are
   * returned together, the total number of documents returned can exceed {@code count}.
   *
   * @param transaction
   * @param collectionGroup The collection group for the documents.
   * @param offset The offset to index into.
   * @param count The number of documents to return
   * @return A LocalWriteResult with the documents that follow the provided offset and the last processed batch id.
   */
  getNextDocuments(e, t, r, i) {
    return this.remoteDocumentCache.getAllFromCollectionGroup(e, t, r, i).next((o) => {
      const a = i - o.size > 0 ? this.documentOverlayCache.getOverlaysForCollectionGroup(e, t, r.largestBatchId, i - o.size) : S.resolve(Et());
      let u = -1, h = o;
      return a.next((d) => S.forEach(d, (m, w) => (u < w.largestBatchId && (u = w.largestBatchId), o.get(m) ? S.resolve() : this.remoteDocumentCache.getEntry(e, m).next((R) => {
        h = h.insert(m, R);
      }))).next(() => this.populateOverlays(e, d, o)).next(() => this.computeViews(e, h, d, B())).next((m) => ({
        batchId: u,
        changes: bu(m)
      })));
    });
  }
  getDocumentsMatchingDocumentQuery(e, t) {
    return this.getDocument(e, new L(t)).next((r) => {
      let i = Pn();
      return r.isFoundDocument() && (i = i.insert(r.key, r)), i;
    });
  }
  getDocumentsMatchingCollectionGroupQuery(e, t, r, i) {
    const o = t.collectionGroup;
    let a = Pn();
    return this.indexManager.getCollectionParents(e, o).next((u) => S.forEach(u, (h) => {
      const d = function(w, R) {
        return new ni(
          R,
          /*collectionGroup=*/
          null,
          w.explicitOrderBy.slice(),
          w.filters.slice(),
          w.limit,
          w.limitType,
          w.startAt,
          w.endAt
        );
      }(t, h.child(o));
      return this.getDocumentsMatchingCollectionQuery(e, d, r, i).next((m) => {
        m.forEach((w, R) => {
          a = a.insert(w, R);
        });
      });
    }).next(() => a));
  }
  getDocumentsMatchingCollectionQuery(e, t, r, i) {
    let o;
    return this.documentOverlayCache.getOverlaysForCollection(e, t.path, r.largestBatchId).next((a) => (o = a, this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, r, o, i))).next((a) => {
      o.forEach((h, d) => {
        const m = d.getKey();
        a.get(m) === null && (a = a.insert(m, ye.newInvalidDocument(m)));
      });
      let u = Pn();
      return a.forEach((h, d) => {
        const m = o.get(h);
        m !== void 0 && Nn(m.mutation, d, Ce.empty(), se.now()), // Finally, insert the documents that still match the query
        ii(t, d) && (u = u.insert(h, d));
      }), u;
    });
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class wg {
  constructor(e) {
    this.serializer = e, this.hr = /* @__PURE__ */ new Map(), this.Pr = /* @__PURE__ */ new Map();
  }
  getBundleMetadata(e, t) {
    return S.resolve(this.hr.get(t));
  }
  saveBundleMetadata(e, t) {
    return this.hr.set(
      t.id,
      /** Decodes a BundleMetadata proto into a BundleMetadata object. */
      function(i) {
        return {
          id: i.id,
          version: i.version,
          createTime: Ne(i.createTime)
        };
      }(t)
    ), S.resolve();
  }
  getNamedQuery(e, t) {
    return S.resolve(this.Pr.get(t));
  }
  saveNamedQuery(e, t) {
    return this.Pr.set(t.name, function(i) {
      return {
        name: i.name,
        query: _g(i.bundledQuery),
        readTime: Ne(i.readTime)
      };
    }(t)), S.resolve();
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ag {
  constructor() {
    this.overlays = new X(L.comparator), this.Ir = /* @__PURE__ */ new Map();
  }
  getOverlay(e, t) {
    return S.resolve(this.overlays.get(t));
  }
  getOverlays(e, t) {
    const r = Et();
    return S.forEach(t, (i) => this.getOverlay(e, i).next((o) => {
      o !== null && r.set(i, o);
    })).next(() => r);
  }
  saveOverlays(e, t, r) {
    return r.forEach((i, o) => {
      this.ht(e, t, o);
    }), S.resolve();
  }
  removeOverlaysForBatchId(e, t, r) {
    const i = this.Ir.get(r);
    return i !== void 0 && (i.forEach((o) => this.overlays = this.overlays.remove(o)), this.Ir.delete(r)), S.resolve();
  }
  getOverlaysForCollection(e, t, r) {
    const i = Et(), o = t.length + 1, a = new L(t.child("")), u = this.overlays.getIteratorFrom(a);
    for (; u.hasNext(); ) {
      const h = u.getNext().value, d = h.getKey();
      if (!t.isPrefixOf(d.path)) break;
      d.path.length === o && h.largestBatchId > r && i.set(h.getKey(), h);
    }
    return S.resolve(i);
  }
  getOverlaysForCollectionGroup(e, t, r, i) {
    let o = new X((d, m) => d - m);
    const a = this.overlays.getIterator();
    for (; a.hasNext(); ) {
      const d = a.getNext().value;
      if (d.getKey().getCollectionGroup() === t && d.largestBatchId > r) {
        let m = o.get(d.largestBatchId);
        m === null && (m = Et(), o = o.insert(d.largestBatchId, m)), m.set(d.getKey(), d);
      }
    }
    const u = Et(), h = o.getIterator();
    for (; h.hasNext() && (h.getNext().value.forEach((d, m) => u.set(d, m)), !(u.size() >= i)); )
      ;
    return S.resolve(u);
  }
  ht(e, t, r) {
    const i = this.overlays.get(r.key);
    if (i !== null) {
      const a = this.Ir.get(i.largestBatchId).delete(r.key);
      this.Ir.set(i.largestBatchId, a);
    }
    this.overlays = this.overlays.insert(r.key, new Km(t, r));
    let o = this.Ir.get(t);
    o === void 0 && (o = B(), this.Ir.set(t, o)), this.Ir.set(t, o.add(r.key));
  }
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Rg {
  constructor() {
    this.sessionToken = he.EMPTY_BYTE_STRING;
  }
  getSessionToken(e) {
    return S.resolve(this.sessionToken);
  }
  setSessionToken(e, t) {
    return this.sessionToken = t, S.resolve();
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Us {
  constructor() {
    this.Tr = new le(oe.Er), // A set of outstanding references to a document sorted by target id.
    this.dr = new le(oe.Ar);
  }
  /** Returns true if the reference set contains no references. */
  isEmpty() {
    return this.Tr.isEmpty();
  }
  /** Adds a reference to the given document key for the given ID. */
  addReference(e, t) {
    const r = new oe(e, t);
    this.Tr = this.Tr.add(r), this.dr = this.dr.add(r);
  }
  /** Add references to the given document keys for the given ID. */
  Rr(e, t) {
    e.forEach((r) => this.addReference(r, t));
  }
  /**
   * Removes a reference to the given document key for the given
   * ID.
   */
  removeReference(e, t) {
    this.Vr(new oe(e, t));
  }
  mr(e, t) {
    e.forEach((r) => this.removeReference(r, t));
  }
  /**
   * Clears all references with a given ID. Calls removeRef() for each key
   * removed.
   */
  gr(e) {
    const t = new L(new J([])), r = new oe(t, e), i = new oe(t, e + 1), o = [];
    return this.dr.forEachInRange([r, i], (a) => {
      this.Vr(a), o.push(a.key);
    }), o;
  }
  pr() {
    this.Tr.forEach((e) => this.Vr(e));
  }
  Vr(e) {
    this.Tr = this.Tr.delete(e), this.dr = this.dr.delete(e);
  }
  yr(e) {
    const t = new L(new J([])), r = new oe(t, e), i = new oe(t, e + 1);
    let o = B();
    return this.dr.forEachInRange([r, i], (a) => {
      o = o.add(a.key);
    }), o;
  }
  containsKey(e) {
    const t = new oe(e, 0), r = this.Tr.firstAfterOrEqual(t);
    return r !== null && e.isEqual(r.key);
  }
}
class oe {
  constructor(e, t) {
    this.key = e, this.wr = t;
  }
  /** Compare by key then by ID */
  static Er(e, t) {
    return L.comparator(e.key, t.key) || z(e.wr, t.wr);
  }
  /** Compare by ID then by key */
  static Ar(e, t) {
    return z(e.wr, t.wr) || L.comparator(e.key, t.key);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Sg {
  constructor(e, t) {
    this.indexManager = e, this.referenceDelegate = t, /**
     * The set of all mutations that have been sent but not yet been applied to
     * the backend.
     */
    this.mutationQueue = [], /** Next value to use when assigning sequential IDs to each mutation batch. */
    this.Sr = 1, /** An ordered mapping between documents and the mutations batch IDs. */
    this.br = new le(oe.Er);
  }
  checkEmpty(e) {
    return S.resolve(this.mutationQueue.length === 0);
  }
  addMutationBatch(e, t, r, i) {
    const o = this.Sr;
    this.Sr++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1];
    const a = new Hm(o, t, r, i);
    this.mutationQueue.push(a);
    for (const u of i) this.br = this.br.add(new oe(u.key, o)), this.indexManager.addToCollectionParentIndex(e, u.key.path.popLast());
    return S.resolve(a);
  }
  lookupMutationBatch(e, t) {
    return S.resolve(this.Dr(t));
  }
  getNextMutationBatchAfterBatchId(e, t) {
    const r = t + 1, i = this.vr(r), o = i < 0 ? 0 : i;
    return S.resolve(this.mutationQueue.length > o ? this.mutationQueue[o] : null);
  }
  getHighestUnacknowledgedBatchId() {
    return S.resolve(this.mutationQueue.length === 0 ? -1 : this.Sr - 1);
  }
  getAllMutationBatches(e) {
    return S.resolve(this.mutationQueue.slice());
  }
  getAllMutationBatchesAffectingDocumentKey(e, t) {
    const r = new oe(t, 0), i = new oe(t, Number.POSITIVE_INFINITY), o = [];
    return this.br.forEachInRange([r, i], (a) => {
      const u = this.Dr(a.wr);
      o.push(u);
    }), S.resolve(o);
  }
  getAllMutationBatchesAffectingDocumentKeys(e, t) {
    let r = new le(z);
    return t.forEach((i) => {
      const o = new oe(i, 0), a = new oe(i, Number.POSITIVE_INFINITY);
      this.br.forEachInRange([o, a], (u) => {
        r = r.add(u.wr);
      });
    }), S.resolve(this.Cr(r));
  }
  getAllMutationBatchesAffectingQuery(e, t) {
    const r = t.path, i = r.length + 1;
    let o = r;
    L.isDocumentKey(o) || (o = o.child(""));
    const a = new oe(new L(o), 0);
    let u = new le(z);
    return this.br.forEachWhile((h) => {
      const d = h.key.path;
      return !!r.isPrefixOf(d) && // Rows with document keys more than one segment longer than the query
      // path can't be matches. For example, a query on 'rooms' can't match
      // the document /rooms/abc/messages/xyx.
      // TODO(mcg): we'll need a different scanner when we implement
      // ancestor queries.
      (d.length === i && (u = u.add(h.wr)), !0);
    }, a), S.resolve(this.Cr(u));
  }
  Cr(e) {
    const t = [];
    return e.forEach((r) => {
      const i = this.Dr(r);
      i !== null && t.push(i);
    }), t;
  }
  removeMutationBatch(e, t) {
    G(this.Fr(t.batchId, "removed") === 0), this.mutationQueue.shift();
    let r = this.br;
    return S.forEach(t.mutations, (i) => {
      const o = new oe(i.key, t.batchId);
      return r = r.delete(o), this.referenceDelegate.markPotentiallyOrphaned(e, i.key);
    }).next(() => {
      this.br = r;
    });
  }
  On(e) {
  }
  containsKey(e, t) {
    const r = new oe(t, 0), i = this.br.firstAfterOrEqual(r);
    return S.resolve(t.isEqual(i && i.key));
  }
  performConsistencyCheck(e) {
    return this.mutationQueue.length, S.resolve();
  }
  /**
   * Finds the index of the given batchId in the mutation queue and asserts that
   * the resulting index is within the bounds of the queue.
   *
   * @param batchId - The batchId to search for
   * @param action - A description of what the caller is doing, phrased in passive
   * form (e.g. "acknowledged" in a routine that acknowledges batches).
   */
  Fr(e, t) {
    return this.vr(e);
  }
  /**
   * Finds the index of the given batchId in the mutation queue. This operation
   * is O(1).
   *
   * @returns The computed index of the batch with the given batchId, based on
   * the state of the queue. Note this index can be negative if the requested
   * batchId has already been removed from the queue or past the end of the
   * queue if the batchId is larger than the last added batch.
   */
  vr(e) {
    return this.mutationQueue.length === 0 ? 0 : e - this.mutationQueue[0].batchId;
  }
  /**
   * A version of lookupMutationBatch that doesn't return a promise, this makes
   * other functions that uses this code easier to read and more efficient.
   */
  Dr(e) {
    const t = this.vr(e);
    return t < 0 || t >= this.mutationQueue.length ? null : this.mutationQueue[t];
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Pg {
  /**
   * @param sizer - Used to assess the size of a document. For eager GC, this is
   * expected to just return 0 to avoid unnecessarily doing the work of
   * calculating the size.
   */
  constructor(e) {
    this.Mr = e, /** Underlying cache of documents and their read times. */
    this.docs = function() {
      return new X(L.comparator);
    }(), /** Size of all cached documents. */
    this.size = 0;
  }
  setIndexManager(e) {
    this.indexManager = e;
  }
  /**
   * Adds the supplied entry to the cache and updates the cache size as appropriate.
   *
   * All calls of `addEntry`  are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  addEntry(e, t) {
    const r = t.key, i = this.docs.get(r), o = i ? i.size : 0, a = this.Mr(t);
    return this.docs = this.docs.insert(r, {
      document: t.mutableCopy(),
      size: a
    }), this.size += a - o, this.indexManager.addToCollectionParentIndex(e, r.path.popLast());
  }
  /**
   * Removes the specified entry from the cache and updates the cache size as appropriate.
   *
   * All calls of `removeEntry` are required to go through the RemoteDocumentChangeBuffer
   * returned by `newChangeBuffer()`.
   */
  removeEntry(e) {
    const t = this.docs.get(e);
    t && (this.docs = this.docs.remove(e), this.size -= t.size);
  }
  getEntry(e, t) {
    const r = this.docs.get(t);
    return S.resolve(r ? r.document.mutableCopy() : ye.newInvalidDocument(t));
  }
  getEntries(e, t) {
    let r = Ke();
    return t.forEach((i) => {
      const o = this.docs.get(i);
      r = r.insert(i, o ? o.document.mutableCopy() : ye.newInvalidDocument(i));
    }), S.resolve(r);
  }
  getDocumentsMatchingQuery(e, t, r, i) {
    let o = Ke();
    const a = t.path, u = new L(a.child("")), h = this.docs.getIteratorFrom(u);
    for (; h.hasNext(); ) {
      const { key: d, value: { document: m } } = h.getNext();
      if (!a.isPrefixOf(d.path)) break;
      d.path.length > a.length + 1 || cm(am(m), r) <= 0 || (i.has(m.key) || ii(t, m)) && (o = o.insert(m.key, m.mutableCopy()));
    }
    return S.resolve(o);
  }
  getAllFromCollectionGroup(e, t, r, i) {
    x();
  }
  Or(e, t) {
    return S.forEach(this.docs, (r) => t(r));
  }
  newChangeBuffer(e) {
    return new Cg(this);
  }
  getSize(e) {
    return S.resolve(this.size);
  }
}
class Cg extends Eg {
  constructor(e) {
    super(), this.cr = e;
  }
  applyChanges(e) {
    const t = [];
    return this.changes.forEach((r, i) => {
      i.isValidDocument() ? t.push(this.cr.addEntry(e, i)) : this.cr.removeEntry(r);
    }), S.waitFor(t);
  }
  getFromCache(e, t) {
    return this.cr.getEntry(e, t);
  }
  getAllFromCache(e, t) {
    return this.cr.getEntries(e, t);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class bg {
  constructor(e) {
    this.persistence = e, /**
     * Maps a target to the data about that target
     */
    this.Nr = new rn((t) => Ds(t), Ns), /** The last received snapshot version. */
    this.lastRemoteSnapshotVersion = F.min(), /** The highest numbered target ID encountered. */
    this.highestTargetId = 0, /** The highest sequence number encountered. */
    this.Lr = 0, /**
     * A ordered bidirectional mapping between documents and the remote target
     * IDs.
     */
    this.Br = new Us(), this.targetCount = 0, this.kr = Qt.Bn();
  }
  forEachTarget(e, t) {
    return this.Nr.forEach((r, i) => t(i)), S.resolve();
  }
  getLastRemoteSnapshotVersion(e) {
    return S.resolve(this.lastRemoteSnapshotVersion);
  }
  getHighestSequenceNumber(e) {
    return S.resolve(this.Lr);
  }
  allocateTargetId(e) {
    return this.highestTargetId = this.kr.next(), S.resolve(this.highestTargetId);
  }
  setTargetsMetadata(e, t, r) {
    return r && (this.lastRemoteSnapshotVersion = r), t > this.Lr && (this.Lr = t), S.resolve();
  }
  Kn(e) {
    this.Nr.set(e.target, e);
    const t = e.targetId;
    t > this.highestTargetId && (this.kr = new Qt(t), this.highestTargetId = t), e.sequenceNumber > this.Lr && (this.Lr = e.sequenceNumber);
  }
  addTargetData(e, t) {
    return this.Kn(t), this.targetCount += 1, S.resolve();
  }
  updateTargetData(e, t) {
    return this.Kn(t), S.resolve();
  }
  removeTargetData(e, t) {
    return this.Nr.delete(t.target), this.Br.gr(t.targetId), this.targetCount -= 1, S.resolve();
  }
  removeTargets(e, t, r) {
    let i = 0;
    const o = [];
    return this.Nr.forEach((a, u) => {
      u.sequenceNumber <= t && r.get(u.targetId) === null && (this.Nr.delete(a), o.push(this.removeMatchingKeysForTargetId(e, u.targetId)), i++);
    }), S.waitFor(o).next(() => i);
  }
  getTargetCount(e) {
    return S.resolve(this.targetCount);
  }
  getTargetData(e, t) {
    const r = this.Nr.get(t) || null;
    return S.resolve(r);
  }
  addMatchingKeys(e, t, r) {
    return this.Br.Rr(t, r), S.resolve();
  }
  removeMatchingKeys(e, t, r) {
    this.Br.mr(t, r);
    const i = this.persistence.referenceDelegate, o = [];
    return i && t.forEach((a) => {
      o.push(i.markPotentiallyOrphaned(e, a));
    }), S.waitFor(o);
  }
  removeMatchingKeysForTargetId(e, t) {
    return this.Br.gr(t), S.resolve();
  }
  getMatchingKeysForTargetId(e, t) {
    const r = this.Br.yr(t);
    return S.resolve(r);
  }
  containsKey(e, t) {
    return S.resolve(this.Br.containsKey(t));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class kg {
  /**
   * The constructor accepts a factory for creating a reference delegate. This
   * allows both the delegate and this instance to have strong references to
   * each other without having nullable fields that would then need to be
   * checked or asserted on every access.
   */
  constructor(e, t) {
    this.qr = {}, this.overlays = {}, this.Qr = new Cs(0), this.Kr = !1, this.Kr = !0, this.$r = new Rg(), this.referenceDelegate = e(this), this.Ur = new bg(this), this.indexManager = new yg(), this.remoteDocumentCache = function(i) {
      return new Pg(i);
    }((r) => this.referenceDelegate.Wr(r)), this.serializer = new gg(t), this.Gr = new wg(this.serializer);
  }
  start() {
    return Promise.resolve();
  }
  shutdown() {
    return this.Kr = !1, Promise.resolve();
  }
  get started() {
    return this.Kr;
  }
  setDatabaseDeletedListener() {
  }
  setNetworkEnabled() {
  }
  getIndexManager(e) {
    return this.indexManager;
  }
  getDocumentOverlayCache(e) {
    let t = this.overlays[e.toKey()];
    return t || (t = new Ag(), this.overlays[e.toKey()] = t), t;
  }
  getMutationQueue(e, t) {
    let r = this.qr[e.toKey()];
    return r || (r = new Sg(t, this.referenceDelegate), this.qr[e.toKey()] = r), r;
  }
  getGlobalsCache() {
    return this.$r;
  }
  getTargetCache() {
    return this.Ur;
  }
  getRemoteDocumentCache() {
    return this.remoteDocumentCache;
  }
  getBundleCache() {
    return this.Gr;
  }
  runTransaction(e, t, r) {
    D("MemoryPersistence", "Starting transaction:", e);
    const i = new Vg(this.Qr.next());
    return this.referenceDelegate.zr(), r(i).next((o) => this.referenceDelegate.jr(i).next(() => o)).toPromise().then((o) => (i.raiseOnCommittedEvent(), o));
  }
  Hr(e, t) {
    return S.or(Object.values(this.qr).map((r) => () => r.containsKey(e, t)));
  }
}
class Vg extends lm {
  constructor(e) {
    super(), this.currentSequenceNumber = e;
  }
}
class Bs {
  constructor(e) {
    this.persistence = e, /** Tracks all documents that are active in Query views. */
    this.Jr = new Us(), /** The list of documents that are potentially GCed after each transaction. */
    this.Yr = null;
  }
  static Zr(e) {
    return new Bs(e);
  }
  get Xr() {
    if (this.Yr) return this.Yr;
    throw x();
  }
  addReference(e, t, r) {
    return this.Jr.addReference(r, t), this.Xr.delete(r.toString()), S.resolve();
  }
  removeReference(e, t, r) {
    return this.Jr.removeReference(r, t), this.Xr.add(r.toString()), S.resolve();
  }
  markPotentiallyOrphaned(e, t) {
    return this.Xr.add(t.toString()), S.resolve();
  }
  removeTarget(e, t) {
    this.Jr.gr(t.targetId).forEach((i) => this.Xr.add(i.toString()));
    const r = this.persistence.getTargetCache();
    return r.getMatchingKeysForTargetId(e, t.targetId).next((i) => {
      i.forEach((o) => this.Xr.add(o.toString()));
    }).next(() => r.removeTargetData(e, t));
  }
  zr() {
    this.Yr = /* @__PURE__ */ new Set();
  }
  jr(e) {
    const t = this.persistence.getRemoteDocumentCache().newChangeBuffer();
    return S.forEach(this.Xr, (r) => {
      const i = L.fromPath(r);
      return this.ei(e, i).next((o) => {
        o || t.removeEntry(i, F.min());
      });
    }).next(() => (this.Yr = null, t.apply(e)));
  }
  updateLimboDocument(e, t) {
    return this.ei(e, t).next((r) => {
      r ? this.Xr.delete(t.toString()) : this.Xr.add(t.toString());
    });
  }
  Wr(e) {
    return 0;
  }
  ei(e, t) {
    return S.or([() => S.resolve(this.Jr.containsKey(t)), () => this.persistence.getTargetCache().containsKey(e, t), () => this.persistence.Hr(e, t)]);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class js {
  constructor(e, t, r, i) {
    this.targetId = e, this.fromCache = t, this.$i = r, this.Ui = i;
  }
  static Wi(e, t) {
    let r = B(), i = B();
    for (const o of t.docChanges) switch (o.type) {
      case 0:
        r = r.add(o.doc.key);
        break;
      case 1:
        i = i.add(o.doc.key);
    }
    return new js(e, t.fromCache, r, i);
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Dg {
  constructor() {
    this._documentReadCount = 0;
  }
  get documentReadCount() {
    return this._documentReadCount;
  }
  incrementDocumentReadCount(e) {
    this._documentReadCount += e;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ng {
  constructor() {
    this.Gi = !1, this.zi = !1, /**
     * SDK only decides whether it should create index when collection size is
     * larger than this.
     */
    this.ji = 100, this.Hi = /**
    * This cost represents the evaluation result of
    * (([index, docKey] + [docKey, docContent]) per document in the result set)
    * / ([docKey, docContent] per documents in full collection scan) coming from
    * experiment [enter PR experiment URL here].
    */
    function() {
      return Ah() ? 8 : hm(ve()) > 0 ? 6 : 4;
    }();
  }
  /** Sets the document view to query against. */
  initialize(e, t) {
    this.Ji = e, this.indexManager = t, this.Gi = !0;
  }
  /** Returns all local documents matching the specified query. */
  getDocumentsMatchingQuery(e, t, r, i) {
    const o = {
      result: null
    };
    return this.Yi(e, t).next((a) => {
      o.result = a;
    }).next(() => {
      if (!o.result) return this.Zi(e, t, i, r).next((a) => {
        o.result = a;
      });
    }).next(() => {
      if (o.result) return;
      const a = new Dg();
      return this.Xi(e, t, a).next((u) => {
        if (o.result = u, this.zi) return this.es(e, t, a, u.size);
      });
    }).next(() => o.result);
  }
  es(e, t, r, i) {
    return r.documentReadCount < this.ji ? (wn() <= j.DEBUG && D("QueryEngine", "SDK will not create cache indexes for query:", Ot(t), "since it only creates cache indexes for collection contains", "more than or equal to", this.ji, "documents"), S.resolve()) : (wn() <= j.DEBUG && D("QueryEngine", "Query:", Ot(t), "scans", r.documentReadCount, "local documents and returns", i, "documents as results."), r.documentReadCount > this.Hi * i ? (wn() <= j.DEBUG && D("QueryEngine", "The SDK decides to create cache indexes for query:", Ot(t), "as using cache indexes may help improve performance."), this.indexManager.createTargetIndexes(e, De(t))) : S.resolve());
  }
  /**
   * Performs an indexed query that evaluates the query based on a collection's
   * persisted index values. Returns `null` if an index is not available.
   */
  Yi(e, t) {
    if (Ha(t))
      return S.resolve(null);
    let r = De(t);
    return this.indexManager.getIndexType(e, r).next((i) => i === 0 ? null : (t.limit !== null && i === 1 && // We cannot apply a limit for targets that are served using a partial
    // index. If a partial index will be used to serve the target, the
    // query may return a superset of documents that match the target
    // (e.g. if the index doesn't include all the target's filters), or
    // may return the correct set of documents in the wrong order (e.g. if
    // the index doesn't include a segment for one of the orderBys).
    // Therefore, a limit should not be applied in such cases.
    (t = os(
      t,
      null,
      "F"
      /* LimitType.First */
    ), r = De(t)), this.indexManager.getDocumentsMatchingTarget(e, r).next((o) => {
      const a = B(...o);
      return this.Ji.getDocuments(e, a).next((u) => this.indexManager.getMinOffset(e, r).next((h) => {
        const d = this.ts(t, u);
        return this.ns(t, d, a, h.readTime) ? this.Yi(e, os(
          t,
          null,
          "F"
          /* LimitType.First */
        )) : this.rs(e, d, t, h);
      }));
    })));
  }
  /**
   * Performs a query based on the target's persisted query mapping. Returns
   * `null` if the mapping is not available or cannot be used.
   */
  Zi(e, t, r, i) {
    return Ha(t) || i.isEqual(F.min()) ? S.resolve(null) : this.Ji.getDocuments(e, r).next((o) => {
      const a = this.ts(t, o);
      return this.ns(t, a, r, i) ? S.resolve(null) : (wn() <= j.DEBUG && D("QueryEngine", "Re-using previous result from %s to execute query: %s", i.toString(), Ot(t)), this.rs(e, a, t, om(i, -1)).next((u) => u));
    });
  }
  /** Applies the query filter and sorting to the provided documents.  */
  ts(e, t) {
    let r = new le(Pu(e));
    return t.forEach((i, o) => {
      ii(e, o) && (r = r.add(o));
    }), r;
  }
  /**
   * Determines if a limit query needs to be refilled from cache, making it
   * ineligible for index-free execution.
   *
   * @param query - The query.
   * @param sortedPreviousResults - The documents that matched the query when it
   * was last synchronized, sorted by the query's comparator.
   * @param remoteKeys - The document keys that matched the query at the last
   * snapshot.
   * @param limboFreeSnapshotVersion - The version of the snapshot when the
   * query was last synchronized.
   */
  ns(e, t, r, i) {
    if (e.limit === null)
      return !1;
    if (r.size !== t.size)
      return !0;
    const o = e.limitType === "F" ? t.last() : t.first();
    return !!o && (o.hasPendingWrites || o.version.compareTo(i) > 0);
  }
  Xi(e, t, r) {
    return wn() <= j.DEBUG && D("QueryEngine", "Using full collection scan to execute query:", Ot(t)), this.Ji.getDocumentsMatchingQuery(e, t, ht.min(), r);
  }
  /**
   * Combines the results from an indexed execution with the remaining documents
   * that have not yet been indexed.
   */
  rs(e, t, r, i) {
    return this.Ji.getDocumentsMatchingQuery(e, r, i).next((o) => (
      // Merge with existing results
      (t.forEach((a) => {
        o = o.insert(a.key, a);
      }), o)
    ));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Og {
  constructor(e, t, r, i) {
    this.persistence = e, this.ss = t, this.serializer = i, /**
     * Maps a targetID to data about its target.
     *
     * PORTING NOTE: We are using an immutable data structure on Web to make re-runs
     * of `applyRemoteEvent()` idempotent.
     */
    this.os = new X(z), /** Maps a target to its targetID. */
    // TODO(wuandy): Evaluate if TargetId can be part of Target.
    this._s = new rn((o) => Ds(o), Ns), /**
     * A per collection group index of the last read time processed by
     * `getNewDocumentChanges()`.
     *
     * PORTING NOTE: This is only used for multi-tab synchronization.
     */
    this.us = /* @__PURE__ */ new Map(), this.cs = e.getRemoteDocumentCache(), this.Ur = e.getTargetCache(), this.Gr = e.getBundleCache(), this.ls(r);
  }
  ls(e) {
    this.documentOverlayCache = this.persistence.getDocumentOverlayCache(e), this.indexManager = this.persistence.getIndexManager(e), this.mutationQueue = this.persistence.getMutationQueue(e, this.indexManager), this.localDocuments = new Ig(this.cs, this.mutationQueue, this.documentOverlayCache, this.indexManager), this.cs.setIndexManager(this.indexManager), this.ss.initialize(this.localDocuments, this.indexManager);
  }
  collectGarbage(e) {
    return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (t) => e.collect(t, this.os));
  }
}
function Lg(n, e, t, r) {
  return new Og(n, e, t, r);
}
async function Qu(n, e) {
  const t = U(n);
  return await t.persistence.runTransaction("Handle user change", "readonly", (r) => {
    let i;
    return t.mutationQueue.getAllMutationBatches(r).next((o) => (i = o, t.ls(e), t.mutationQueue.getAllMutationBatches(r))).next((o) => {
      const a = [], u = [];
      let h = B();
      for (const d of i) {
        a.push(d.batchId);
        for (const m of d.mutations) h = h.add(m.key);
      }
      for (const d of o) {
        u.push(d.batchId);
        for (const m of d.mutations) h = h.add(m.key);
      }
      return t.localDocuments.getDocuments(r, h).next((d) => ({
        hs: d,
        removedBatchIds: a,
        addedBatchIds: u
      }));
    });
  });
}
function Mg(n, e) {
  const t = U(n);
  return t.persistence.runTransaction("Acknowledge batch", "readwrite-primary", (r) => {
    const i = e.batch.keys(), o = t.cs.newChangeBuffer({
      trackRemovals: !0
    });
    return function(u, h, d, m) {
      const w = d.batch, R = w.keys();
      let P = S.resolve();
      return R.forEach((V) => {
        P = P.next(() => m.getEntry(h, V)).next((N) => {
          const k = d.docVersions.get(V);
          G(k !== null), N.version.compareTo(k) < 0 && (w.applyToRemoteDocument(N, d), N.isValidDocument() && // We use the commitVersion as the readTime rather than the
          // document's updateTime since the updateTime is not advanced
          // for updates that do not modify the underlying document.
          (N.setReadTime(d.commitVersion), m.addEntry(N)));
        });
      }), P.next(() => u.mutationQueue.removeMutationBatch(h, w));
    }(t, r, e, o).next(() => o.apply(r)).next(() => t.mutationQueue.performConsistencyCheck(r)).next(() => t.documentOverlayCache.removeOverlaysForBatchId(r, i, e.batch.batchId)).next(() => t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r, function(u) {
      let h = B();
      for (let d = 0; d < u.mutationResults.length; ++d)
        u.mutationResults[d].transformResults.length > 0 && (h = h.add(u.batch.mutations[d].key));
      return h;
    }(e))).next(() => t.localDocuments.getDocuments(r, i));
  });
}
function Yu(n) {
  const e = U(n);
  return e.persistence.runTransaction("Get last remote snapshot version", "readonly", (t) => e.Ur.getLastRemoteSnapshotVersion(t));
}
function xg(n, e) {
  const t = U(n), r = e.snapshotVersion;
  let i = t.os;
  return t.persistence.runTransaction("Apply remote event", "readwrite-primary", (o) => {
    const a = t.cs.newChangeBuffer({
      trackRemovals: !0
    });
    i = t.os;
    const u = [];
    e.targetChanges.forEach((m, w) => {
      const R = i.get(w);
      if (!R) return;
      u.push(t.Ur.removeMatchingKeys(o, m.removedDocuments, w).next(() => t.Ur.addMatchingKeys(o, m.addedDocuments, w)));
      let P = R.withSequenceNumber(o.currentSequenceNumber);
      e.targetMismatches.get(w) !== null ? P = P.withResumeToken(he.EMPTY_BYTE_STRING, F.min()).withLastLimboFreeSnapshotVersion(F.min()) : m.resumeToken.approximateByteSize() > 0 && (P = P.withResumeToken(m.resumeToken, r)), i = i.insert(w, P), // Update the target data if there are target changes (or if
      // sufficient time has passed since the last update).
      /**
      * Returns true if the newTargetData should be persisted during an update of
      * an active target. TargetData should always be persisted when a target is
      * being released and should not call this function.
      *
      * While the target is active, TargetData updates can be omitted when nothing
      * about the target has changed except metadata like the resume token or
      * snapshot version. Occasionally it's worth the extra write to prevent these
      * values from getting too stale after a crash, but this doesn't have to be
      * too frequent.
      */
      function(N, k, W) {
        return N.resumeToken.approximateByteSize() === 0 || k.snapshotVersion.toMicroseconds() - N.snapshotVersion.toMicroseconds() >= 3e8 ? !0 : W.addedDocuments.size + W.modifiedDocuments.size + W.removedDocuments.size > 0;
      }(R, P, m) && u.push(t.Ur.updateTargetData(o, P));
    });
    let h = Ke(), d = B();
    if (e.documentUpdates.forEach((m) => {
      e.resolvedLimboDocuments.has(m) && u.push(t.persistence.referenceDelegate.updateLimboDocument(o, m));
    }), // Each loop iteration only affects its "own" doc, so it's safe to get all
    // the remote documents in advance in a single call.
    u.push(Fg(o, a, e.documentUpdates).next((m) => {
      h = m.Ps, d = m.Is;
    })), !r.isEqual(F.min())) {
      const m = t.Ur.getLastRemoteSnapshotVersion(o).next((w) => t.Ur.setTargetsMetadata(o, o.currentSequenceNumber, r));
      u.push(m);
    }
    return S.waitFor(u).next(() => a.apply(o)).next(() => t.localDocuments.getLocalViewOfDocuments(o, h, d)).next(() => h);
  }).then((o) => (t.os = i, o));
}
function Fg(n, e, t) {
  let r = B(), i = B();
  return t.forEach((o) => r = r.add(o)), e.getEntries(n, r).next((o) => {
    let a = Ke();
    return t.forEach((u, h) => {
      const d = o.get(u);
      h.isFoundDocument() !== d.isFoundDocument() && (i = i.add(u)), // Note: The order of the steps below is important, since we want
      // to ensure that rejected limbo resolutions (which fabricate
      // NoDocuments with SnapshotVersion.min()) never add documents to
      // cache.
      h.isNoDocument() && h.version.isEqual(F.min()) ? (
        // NoDocuments with SnapshotVersion.min() are used in manufactured
        // events. We remove these documents from cache since we lost
        // access.
        (e.removeEntry(u, h.readTime), a = a.insert(u, h))
      ) : !d.isValidDocument() || h.version.compareTo(d.version) > 0 || h.version.compareTo(d.version) === 0 && d.hasPendingWrites ? (e.addEntry(h), a = a.insert(u, h)) : D("LocalStore", "Ignoring outdated watch update for ", u, ". Current version:", d.version, " Watch version:", h.version);
    }), {
      Ps: a,
      Is: i
    };
  });
}
function Ug(n, e) {
  const t = U(n);
  return t.persistence.runTransaction("Get next mutation batch", "readonly", (r) => (e === void 0 && (e = -1), t.mutationQueue.getNextMutationBatchAfterBatchId(r, e)));
}
function Bg(n, e) {
  const t = U(n);
  return t.persistence.runTransaction("Allocate target", "readwrite", (r) => {
    let i;
    return t.Ur.getTargetData(r, e).next((o) => o ? (
      // This target has been listened to previously, so reuse the
      // previous targetID.
      // TODO(mcg): freshen last accessed date?
      (i = o, S.resolve(i))
    ) : t.Ur.allocateTargetId(r).next((a) => (i = new it(e, a, "TargetPurposeListen", r.currentSequenceNumber), t.Ur.addTargetData(r, i).next(() => i))));
  }).then((r) => {
    const i = t.os.get(r.targetId);
    return (i === null || r.snapshotVersion.compareTo(i.snapshotVersion) > 0) && (t.os = t.os.insert(r.targetId, r), t._s.set(e, r.targetId)), r;
  });
}
async function hs(n, e, t) {
  const r = U(n), i = r.os.get(e), o = t ? "readwrite" : "readwrite-primary";
  try {
    t || await r.persistence.runTransaction("Release target", o, (a) => r.persistence.referenceDelegate.removeTarget(a, i));
  } catch (a) {
    if (!Yn(a)) throw a;
    D("LocalStore", `Failed to update sequence numbers for target ${e}: ${a}`);
  }
  r.os = r.os.remove(e), r._s.delete(i.target);
}
function rc(n, e, t) {
  const r = U(n);
  let i = F.min(), o = B();
  return r.persistence.runTransaction(
    "Execute query",
    "readwrite",
    // Use readwrite instead of readonly so indexes can be created
    // Use readwrite instead of readonly so indexes can be created
    (a) => function(h, d, m) {
      const w = U(h), R = w._s.get(m);
      return R !== void 0 ? S.resolve(w.os.get(R)) : w.Ur.getTargetData(d, m);
    }(r, a, De(e)).next((u) => {
      if (u) return i = u.lastLimboFreeSnapshotVersion, r.Ur.getMatchingKeysForTargetId(a, u.targetId).next((h) => {
        o = h;
      });
    }).next(() => r.ss.getDocumentsMatchingQuery(a, e, t ? i : F.min(), t ? o : B())).next((u) => (jg(r, km(e), u), {
      documents: u,
      Ts: o
    }))
  );
}
function jg(n, e, t) {
  let r = n.us.get(e) || F.min();
  t.forEach((i, o) => {
    o.readTime.compareTo(r) > 0 && (r = o.readTime);
  }), n.us.set(e, r);
}
class ic {
  constructor() {
    this.activeTargetIds = Mm();
  }
  fs(e) {
    this.activeTargetIds = this.activeTargetIds.add(e);
  }
  gs(e) {
    this.activeTargetIds = this.activeTargetIds.delete(e);
  }
  /**
   * Converts this entry into a JSON-encoded format we can use for WebStorage.
   * Does not encode `clientId` as it is part of the key in WebStorage.
   */
  Vs() {
    const e = {
      activeTargetIds: this.activeTargetIds.toArray(),
      updateTimeMs: Date.now()
    };
    return JSON.stringify(e);
  }
}
class qg {
  constructor() {
    this.so = new ic(), this.oo = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
  }
  addPendingMutation(e) {
  }
  updateMutationState(e, t, r) {
  }
  addLocalQueryTarget(e, t = !0) {
    return t && this.so.fs(e), this.oo[e] || "not-current";
  }
  updateQueryState(e, t, r) {
    this.oo[e] = t;
  }
  removeLocalQueryTarget(e) {
    this.so.gs(e);
  }
  isLocalQueryTarget(e) {
    return this.so.activeTargetIds.has(e);
  }
  clearQueryState(e) {
    delete this.oo[e];
  }
  getAllActiveQueryTargets() {
    return this.so.activeTargetIds;
  }
  isActiveQueryTarget(e) {
    return this.so.activeTargetIds.has(e);
  }
  start() {
    return this.so = new ic(), Promise.resolve();
  }
  handleUserChange(e, t, r) {
  }
  setOnlineState(e) {
  }
  shutdown() {
  }
  writeSequenceNumber(e) {
  }
  notifyBundleLoaded(e) {
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class $g {
  _o(e) {
  }
  shutdown() {
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class sc {
  constructor() {
    this.ao = () => this.uo(), this.co = () => this.lo(), this.ho = [], this.Po();
  }
  _o(e) {
    this.ho.push(e);
  }
  shutdown() {
    window.removeEventListener("online", this.ao), window.removeEventListener("offline", this.co);
  }
  Po() {
    window.addEventListener("online", this.ao), window.addEventListener("offline", this.co);
  }
  uo() {
    D("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
    for (const e of this.ho) e(
      0
      /* NetworkStatus.AVAILABLE */
    );
  }
  lo() {
    D("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
    for (const e of this.ho) e(
      1
      /* NetworkStatus.UNAVAILABLE */
    );
  }
  // TODO(chenbrian): Consider passing in window either into this component or
  // here for testing via FakeWindow.
  /** Checks that all used attributes of window are available. */
  static D() {
    return typeof window < "u" && window.addEventListener !== void 0 && window.removeEventListener !== void 0;
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let Ar = null;
function zi() {
  return Ar === null ? Ar = function() {
    return 268435456 + Math.round(2147483648 * Math.random());
  }() : Ar++, "0x" + Ar.toString(16);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const zg = {
  BatchGetDocuments: "batchGet",
  Commit: "commit",
  RunQuery: "runQuery",
  RunAggregationQuery: "runAggregationQuery"
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Wg {
  constructor(e) {
    this.Io = e.Io, this.To = e.To;
  }
  Eo(e) {
    this.Ao = e;
  }
  Ro(e) {
    this.Vo = e;
  }
  mo(e) {
    this.fo = e;
  }
  onMessage(e) {
    this.po = e;
  }
  close() {
    this.To();
  }
  send(e) {
    this.Io(e);
  }
  yo() {
    this.Ao();
  }
  wo() {
    this.Vo();
  }
  So(e) {
    this.fo(e);
  }
  bo(e) {
    this.po(e);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ge = "WebChannelConnection";
class Hg extends /**
 * Base class for all Rest-based connections to the backend (WebChannel and
 * HTTP).
 */
class {
  constructor(t) {
    this.databaseInfo = t, this.databaseId = t.databaseId;
    const r = t.ssl ? "https" : "http", i = encodeURIComponent(this.databaseId.projectId), o = encodeURIComponent(this.databaseId.database);
    this.Do = r + "://" + t.host, this.vo = `projects/${i}/databases/${o}`, this.Co = this.databaseId.database === "(default)" ? `project_id=${i}` : `project_id=${i}&database_id=${o}`;
  }
  get Fo() {
    return !1;
  }
  Mo(t, r, i, o, a) {
    const u = zi(), h = this.xo(t, r.toUriEncodedString());
    D("RestConnection", `Sending RPC '${t}' ${u}:`, h, i);
    const d = {
      "google-cloud-resource-prefix": this.vo,
      "x-goog-request-params": this.Co
    };
    return this.Oo(d, o, a), this.No(t, h, d, i).then((m) => (D("RestConnection", `Received RPC '${t}' ${u}: `, m), m), (m) => {
      throw Wt("RestConnection", `RPC '${t}' ${u} failed with error: `, m, "url: ", h, "request:", i), m;
    });
  }
  Lo(t, r, i, o, a, u) {
    return this.Mo(t, r, i, o, a);
  }
  /**
   * Modifies the headers for a request, adding any authorization token if
   * present and any additional headers for the request.
   */
  Oo(t, r, i) {
    t["X-Goog-Api-Client"] = // SDK_VERSION is updated to different value at runtime depending on the entry point,
    // so we need to get its value when we need it in a function.
    function() {
      return "gl-js/ fire/" + tn;
    }(), // Content-Type: text/plain will avoid preflight requests which might
    // mess with CORS and redirects by proxies. If we add custom headers
    // we will need to change this code to potentially use the $httpOverwrite
    // parameter supported by ESF to avoid triggering preflight requests.
    t["Content-Type"] = "text/plain", this.databaseInfo.appId && (t["X-Firebase-GMPID"] = this.databaseInfo.appId), r && r.headers.forEach((o, a) => t[a] = o), i && i.headers.forEach((o, a) => t[a] = o);
  }
  xo(t, r) {
    const i = zg[t];
    return `${this.Do}/v1/${r}:${i}`;
  }
  /**
   * Closes and cleans up any resources associated with the connection. This
   * implementation is a no-op because there are no resources associated
   * with the RestConnection that need to be cleaned up.
   */
  terminate() {
  }
} {
  constructor(e) {
    super(e), this.forceLongPolling = e.forceLongPolling, this.autoDetectLongPolling = e.autoDetectLongPolling, this.useFetchStreams = e.useFetchStreams, this.longPollingOptions = e.longPollingOptions;
  }
  No(e, t, r, i) {
    const o = zi();
    return new Promise((a, u) => {
      const h = new lu();
      h.setWithCredentials(!0), h.listenOnce(hu.COMPLETE, () => {
        try {
          switch (h.getLastErrorCode()) {
            case br.NO_ERROR:
              const m = h.getResponseJson();
              D(ge, `XHR for RPC '${e}' ${o} received:`, JSON.stringify(m)), a(m);
              break;
            case br.TIMEOUT:
              D(ge, `RPC '${e}' ${o} timed out`), u(new O(C.DEADLINE_EXCEEDED, "Request time out"));
              break;
            case br.HTTP_ERROR:
              const w = h.getStatus();
              if (D(ge, `RPC '${e}' ${o} failed with status:`, w, "response text:", h.getResponseText()), w > 0) {
                let R = h.getResponseJson();
                Array.isArray(R) && (R = R[0]);
                const P = R == null ? void 0 : R.error;
                if (P && P.status && P.message) {
                  const V = function(k) {
                    const W = k.toLowerCase().replace(/_/g, "-");
                    return Object.values(C).indexOf(W) >= 0 ? W : C.UNKNOWN;
                  }(P.status);
                  u(new O(V, P.message));
                } else u(new O(C.UNKNOWN, "Server responded with status " + h.getStatus()));
              } else
                u(new O(C.UNAVAILABLE, "Connection failed."));
              break;
            default:
              x();
          }
        } finally {
          D(ge, `RPC '${e}' ${o} completed.`);
        }
      });
      const d = JSON.stringify(i);
      D(ge, `RPC '${e}' ${o} sending request:`, i), h.send(t, "POST", d, r, 15);
    });
  }
  Bo(e, t, r) {
    const i = zi(), o = [this.Do, "/", "google.firestore.v1.Firestore", "/", e, "/channel"], a = pu(), u = fu(), h = {
      // Required for backend stickiness, routing behavior is based on this
      // parameter.
      httpSessionIdParam: "gsessionid",
      initMessageHeaders: {},
      messageUrlParams: {
        // This param is used to improve routing and project isolation by the
        // backend and must be included in every request.
        database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`
      },
      sendRawJson: !0,
      supportsCrossDomainXhr: !0,
      internalChannelParams: {
        // Override the default timeout (randomized between 10-20 seconds) since
        // a large write batch on a slow internet connection may take a long
        // time to send to the backend. Rather than have WebChannel impose a
        // tight timeout which could lead to infinite timeouts and retries, we
        // set it very large (5-10 minutes) and rely on the browser's builtin
        // timeouts to kick in if the request isn't working.
        forwardChannelRequestTimeoutMs: 6e5
      },
      forceLongPolling: this.forceLongPolling,
      detectBufferingProxy: this.autoDetectLongPolling
    }, d = this.longPollingOptions.timeoutSeconds;
    d !== void 0 && (h.longPollingTimeout = Math.round(1e3 * d)), this.useFetchStreams && (h.useFetchStreams = !0), this.Oo(h.initMessageHeaders, t, r), // Sending the custom headers we just added to request.initMessageHeaders
    // (Authorization, etc.) will trigger the browser to make a CORS preflight
    // request because the XHR will no longer meet the criteria for a "simple"
    // CORS request:
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests
    // Therefore to avoid the CORS preflight request (an extra network
    // roundtrip), we use the encodeInitMessageHeaders option to specify that
    // the headers should instead be encoded in the request's POST payload,
    // which is recognized by the webchannel backend.
    h.encodeInitMessageHeaders = !0;
    const m = o.join("");
    D(ge, `Creating RPC '${e}' stream ${i}: ${m}`, h);
    const w = a.createWebChannel(m, h);
    let R = !1, P = !1;
    const V = new Wg({
      Io: (k) => {
        P ? D(ge, `Not sending because RPC '${e}' stream ${i} is closed:`, k) : (R || (D(ge, `Opening RPC '${e}' stream ${i} transport.`), w.open(), R = !0), D(ge, `RPC '${e}' stream ${i} sending:`, k), w.send(k));
      },
      To: () => w.close()
    }), N = (k, W, H) => {
      k.listen(W, (K) => {
        try {
          H(K);
        } catch (ee) {
          setTimeout(() => {
            throw ee;
          }, 0);
        }
      });
    };
    return N(w, Sn.EventType.OPEN, () => {
      P || (D(ge, `RPC '${e}' stream ${i} transport opened.`), V.yo());
    }), N(w, Sn.EventType.CLOSE, () => {
      P || (P = !0, D(ge, `RPC '${e}' stream ${i} transport closed`), V.So());
    }), N(w, Sn.EventType.ERROR, (k) => {
      P || (P = !0, Wt(ge, `RPC '${e}' stream ${i} transport errored:`, k), V.So(new O(C.UNAVAILABLE, "The operation could not be completed")));
    }), N(w, Sn.EventType.MESSAGE, (k) => {
      var W;
      if (!P) {
        const H = k.data[0];
        G(!!H);
        const K = H, ee = K.error || ((W = K[0]) === null || W === void 0 ? void 0 : W.error);
        if (ee) {
          D(ge, `RPC '${e}' stream ${i} received error:`, ee);
          const Ae = ee.status;
          let te = (
            /**
            * Maps an error Code from a GRPC status identifier like 'NOT_FOUND'.
            *
            * @returns The Code equivalent to the given status string or undefined if
            *     there is no match.
            */
            function(_) {
              const y = re[_];
              if (y !== void 0) return Uu(y);
            }(Ae)
          ), v = ee.message;
          te === void 0 && (te = C.INTERNAL, v = "Unknown error status: " + Ae + " with message " + ee.message), // Mark closed so no further events are propagated
          P = !0, V.So(new O(te, v)), w.close();
        } else D(ge, `RPC '${e}' stream ${i} received:`, H), V.bo(H);
      }
    }), N(u, du.STAT_EVENT, (k) => {
      k.stat === ts.PROXY ? D(ge, `RPC '${e}' stream ${i} detected buffering proxy`) : k.stat === ts.NOPROXY && D(ge, `RPC '${e}' stream ${i} detected no buffering proxy`);
    }), setTimeout(() => {
      V.wo();
    }, 0), V;
  }
}
function Wi() {
  return typeof document < "u" ? document : null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ci(n) {
  return new ng(
    n,
    /* useProto3Json= */
    !0
  );
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ju {
  constructor(e, t, r = 1e3, i = 1.5, o = 6e4) {
    this.ui = e, this.timerId = t, this.ko = r, this.qo = i, this.Qo = o, this.Ko = 0, this.$o = null, /** The last backoff attempt, as epoch milliseconds. */
    this.Uo = Date.now(), this.reset();
  }
  /**
   * Resets the backoff delay.
   *
   * The very next backoffAndWait() will have no delay. If it is called again
   * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
   * subsequent ones will increase according to the backoffFactor.
   */
  reset() {
    this.Ko = 0;
  }
  /**
   * Resets the backoff delay to the maximum delay (e.g. for use after a
   * RESOURCE_EXHAUSTED error).
   */
  Wo() {
    this.Ko = this.Qo;
  }
  /**
   * Returns a promise that resolves after currentDelayMs, and increases the
   * delay for any subsequent attempts. If there was a pending backoff operation
   * already, it will be canceled.
   */
  Go(e) {
    this.cancel();
    const t = Math.floor(this.Ko + this.zo()), r = Math.max(0, Date.now() - this.Uo), i = Math.max(0, t - r);
    i > 0 && D("ExponentialBackoff", `Backing off for ${i} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`), this.$o = this.ui.enqueueAfterDelay(this.timerId, i, () => (this.Uo = Date.now(), e())), // Apply backoff factor to determine next delay and ensure it is within
    // bounds.
    this.Ko *= this.qo, this.Ko < this.ko && (this.Ko = this.ko), this.Ko > this.Qo && (this.Ko = this.Qo);
  }
  jo() {
    this.$o !== null && (this.$o.skipDelay(), this.$o = null);
  }
  cancel() {
    this.$o !== null && (this.$o.cancel(), this.$o = null);
  }
  /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */
  zo() {
    return (Math.random() - 0.5) * this.Ko;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Xu {
  constructor(e, t, r, i, o, a, u, h) {
    this.ui = e, this.Ho = r, this.Jo = i, this.connection = o, this.authCredentialsProvider = a, this.appCheckCredentialsProvider = u, this.listener = h, this.state = 0, /**
     * A close count that's incremented every time the stream is closed; used by
     * getCloseGuardedDispatcher() to invalidate callbacks that happen after
     * close.
     */
    this.Yo = 0, this.Zo = null, this.Xo = null, this.stream = null, /**
     * Count of response messages received.
     */
    this.e_ = 0, this.t_ = new Ju(e, t);
  }
  /**
   * Returns true if start() has been called and no error has occurred. True
   * indicates the stream is open or in the process of opening (which
   * encompasses respecting backoff, getting auth tokens, and starting the
   * actual RPC). Use isOpen() to determine if the stream is open and ready for
   * outbound requests.
   */
  n_() {
    return this.state === 1 || this.state === 5 || this.r_();
  }
  /**
   * Returns true if the underlying RPC is open (the onOpen() listener has been
   * called) and the stream is ready for outbound requests.
   */
  r_() {
    return this.state === 2 || this.state === 3;
  }
  /**
   * Starts the RPC. Only allowed if isStarted() returns false. The stream is
   * not immediately ready for use: onOpen() will be invoked when the RPC is
   * ready for outbound requests, at which point isOpen() will return true.
   *
   * When start returns, isStarted() will return true.
   */
  start() {
    this.e_ = 0, this.state !== 4 ? this.auth() : this.i_();
  }
  /**
   * Stops the RPC. This call is idempotent and allowed regardless of the
   * current isStarted() state.
   *
   * When stop returns, isStarted() and isOpen() will both return false.
   */
  async stop() {
    this.n_() && await this.close(
      0
      /* PersistentStreamState.Initial */
    );
  }
  /**
   * After an error the stream will usually back off on the next attempt to
   * start it. If the error warrants an immediate restart of the stream, the
   * sender can use this to indicate that the receiver should not back off.
   *
   * Each error will call the onClose() listener. That function can decide to
   * inhibit backoff if required.
   */
  s_() {
    this.state = 0, this.t_.reset();
  }
  /**
   * Marks this stream as idle. If no further actions are performed on the
   * stream for one minute, the stream will automatically close itself and
   * notify the stream's onClose() handler with Status.OK. The stream will then
   * be in a !isStarted() state, requiring the caller to start the stream again
   * before further use.
   *
   * Only streams that are in state 'Open' can be marked idle, as all other
   * states imply pending network operations.
   */
  o_() {
    this.r_() && this.Zo === null && (this.Zo = this.ui.enqueueAfterDelay(this.Ho, 6e4, () => this.__()));
  }
  /** Sends a message to the underlying stream. */
  a_(e) {
    this.u_(), this.stream.send(e);
  }
  /** Called by the idle timer when the stream should close due to inactivity. */
  async __() {
    if (this.r_())
      return this.close(
        0
        /* PersistentStreamState.Initial */
      );
  }
  /** Marks the stream as active again. */
  u_() {
    this.Zo && (this.Zo.cancel(), this.Zo = null);
  }
  /** Cancels the health check delayed operation. */
  c_() {
    this.Xo && (this.Xo.cancel(), this.Xo = null);
  }
  /**
   * Closes the stream and cleans up as necessary:
   *
   * * closes the underlying GRPC stream;
   * * calls the onClose handler with the given 'error';
   * * sets internal stream state to 'finalState';
   * * adjusts the backoff timer based on the error
   *
   * A new stream can be opened by calling start().
   *
   * @param finalState - the intended state of the stream after closing.
   * @param error - the error the connection was closed with.
   */
  async close(e, t) {
    this.u_(), this.c_(), this.t_.cancel(), // Invalidates any stream-related callbacks (e.g. from auth or the
    // underlying stream), guaranteeing they won't execute.
    this.Yo++, e !== 4 ? (
      // If this is an intentional close ensure we don't delay our next connection attempt.
      this.t_.reset()
    ) : t && t.code === C.RESOURCE_EXHAUSTED ? (
      // Log the error. (Probably either 'quota exceeded' or 'max queue length reached'.)
      (He(t.toString()), He("Using maximum backoff delay to prevent overloading the backend."), this.t_.Wo())
    ) : t && t.code === C.UNAUTHENTICATED && this.state !== 3 && // "unauthenticated" error means the token was rejected. This should rarely
    // happen since both Auth and AppCheck ensure a sufficient TTL when we
    // request a token. If a user manually resets their system clock this can
    // fail, however. In this case, we should get a Code.UNAUTHENTICATED error
    // before we received the first message and we need to invalidate the token
    // to ensure that we fetch a new token.
    (this.authCredentialsProvider.invalidateToken(), this.appCheckCredentialsProvider.invalidateToken()), // Clean up the underlying stream because we are no longer interested in events.
    this.stream !== null && (this.l_(), this.stream.close(), this.stream = null), // This state must be assigned before calling onClose() to allow the callback to
    // inhibit backoff or otherwise manipulate the state in its non-started state.
    this.state = e, // Notify the listener that the stream closed.
    await this.listener.mo(t);
  }
  /**
   * Can be overridden to perform additional cleanup before the stream is closed.
   * Calling super.tearDown() is not required.
   */
  l_() {
  }
  auth() {
    this.state = 1;
    const e = this.h_(this.Yo), t = this.Yo;
    Promise.all([this.authCredentialsProvider.getToken(), this.appCheckCredentialsProvider.getToken()]).then(([r, i]) => {
      this.Yo === t && // Normally we'd have to schedule the callback on the AsyncQueue.
      // However, the following calls are safe to be called outside the
      // AsyncQueue since they don't chain asynchronous calls
      this.P_(r, i);
    }, (r) => {
      e(() => {
        const i = new O(C.UNKNOWN, "Fetching auth token failed: " + r.message);
        return this.I_(i);
      });
    });
  }
  P_(e, t) {
    const r = this.h_(this.Yo);
    this.stream = this.T_(e, t), this.stream.Eo(() => {
      r(() => this.listener.Eo());
    }), this.stream.Ro(() => {
      r(() => (this.state = 2, this.Xo = this.ui.enqueueAfterDelay(this.Jo, 1e4, () => (this.r_() && (this.state = 3), Promise.resolve())), this.listener.Ro()));
    }), this.stream.mo((i) => {
      r(() => this.I_(i));
    }), this.stream.onMessage((i) => {
      r(() => ++this.e_ == 1 ? this.E_(i) : this.onNext(i));
    });
  }
  i_() {
    this.state = 5, this.t_.Go(async () => {
      this.state = 0, this.start();
    });
  }
  // Visible for tests
  I_(e) {
    return D("PersistentStream", `close with error: ${e}`), this.stream = null, this.close(4, e);
  }
  /**
   * Returns a "dispatcher" function that dispatches operations onto the
   * AsyncQueue but only runs them if closeCount remains unchanged. This allows
   * us to turn auth / stream callbacks into no-ops if the stream is closed /
   * re-opened, etc.
   */
  h_(e) {
    return (t) => {
      this.ui.enqueueAndForget(() => this.Yo === e ? t() : (D("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), Promise.resolve()));
    };
  }
}
class Kg extends Xu {
  constructor(e, t, r, i, o, a) {
    super(e, "listen_stream_connection_backoff", "listen_stream_idle", "health_check_timeout", t, r, i, a), this.serializer = o;
  }
  T_(e, t) {
    return this.connection.Bo("Listen", e, t);
  }
  E_(e) {
    return this.onNext(e);
  }
  onNext(e) {
    this.t_.reset();
    const t = sg(this.serializer, e), r = function(o) {
      if (!("targetChange" in o)) return F.min();
      const a = o.targetChange;
      return a.targetIds && a.targetIds.length ? F.min() : a.readTime ? Ne(a.readTime) : F.min();
    }(e);
    return this.listener.d_(t, r);
  }
  /**
   * Registers interest in the results of the given target. If the target
   * includes a resumeToken it will be included in the request. Results that
   * affect the target will be streamed back as WatchChange messages that
   * reference the targetId.
   */
  A_(e) {
    const t = {};
    t.database = ls(this.serializer), t.addTarget = function(o, a) {
      let u;
      const h = a.target;
      if (u = ss(h) ? {
        documents: cg(o, h)
      } : {
        query: ug(o, h)._t
      }, u.targetId = a.targetId, a.resumeToken.approximateByteSize() > 0) {
        u.resumeToken = qu(o, a.resumeToken);
        const d = as(o, a.expectedCount);
        d !== null && (u.expectedCount = d);
      } else if (a.snapshotVersion.compareTo(F.min()) > 0) {
        u.readTime = Wr(o, a.snapshotVersion.toTimestamp());
        const d = as(o, a.expectedCount);
        d !== null && (u.expectedCount = d);
      }
      return u;
    }(this.serializer, e);
    const r = hg(this.serializer, e);
    r && (t.labels = r), this.a_(t);
  }
  /**
   * Unregisters interest in the results of the target associated with the
   * given targetId.
   */
  R_(e) {
    const t = {};
    t.database = ls(this.serializer), t.removeTarget = e, this.a_(t);
  }
}
class Gg extends Xu {
  constructor(e, t, r, i, o, a) {
    super(e, "write_stream_connection_backoff", "write_stream_idle", "health_check_timeout", t, r, i, a), this.serializer = o;
  }
  /**
   * Tracks whether or not a handshake has been successfully exchanged and
   * the stream is ready to accept mutations.
   */
  get V_() {
    return this.e_ > 0;
  }
  // Override of PersistentStream.start
  start() {
    this.lastStreamToken = void 0, super.start();
  }
  l_() {
    this.V_ && this.m_([]);
  }
  T_(e, t) {
    return this.connection.Bo("Write", e, t);
  }
  E_(e) {
    return G(!!e.streamToken), this.lastStreamToken = e.streamToken, // The first response is always the handshake response
    G(!e.writeResults || e.writeResults.length === 0), this.listener.f_();
  }
  onNext(e) {
    G(!!e.streamToken), this.lastStreamToken = e.streamToken, // A successful first write response means the stream is healthy,
    // Note, that we could consider a successful handshake healthy, however,
    // the write itself might be causing an error we want to back off from.
    this.t_.reset();
    const t = ag(e.writeResults, e.commitTime), r = Ne(e.commitTime);
    return this.listener.g_(r, t);
  }
  /**
   * Sends an initial streamToken to the server, performing the handshake
   * required to make the StreamingWrite RPC work. Subsequent
   * calls should wait until onHandshakeComplete was called.
   */
  p_() {
    const e = {};
    e.database = ls(this.serializer), this.a_(e);
  }
  /** Sends a group of mutations to the Firestore backend to apply. */
  m_(e) {
    const t = {
      streamToken: this.lastStreamToken,
      writes: e.map((r) => og(this.serializer, r))
    };
    this.a_(t);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Qg extends class {
} {
  constructor(e, t, r, i) {
    super(), this.authCredentials = e, this.appCheckCredentials = t, this.connection = r, this.serializer = i, this.y_ = !1;
  }
  w_() {
    if (this.y_) throw new O(C.FAILED_PRECONDITION, "The client has already been terminated.");
  }
  /** Invokes the provided RPC with auth and AppCheck tokens. */
  Mo(e, t, r, i) {
    return this.w_(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([o, a]) => this.connection.Mo(e, cs(t, r), i, o, a)).catch((o) => {
      throw o.name === "FirebaseError" ? (o.code === C.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), o) : new O(C.UNKNOWN, o.toString());
    });
  }
  /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */
  Lo(e, t, r, i, o) {
    return this.w_(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([a, u]) => this.connection.Lo(e, cs(t, r), i, a, u, o)).catch((a) => {
      throw a.name === "FirebaseError" ? (a.code === C.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), a) : new O(C.UNKNOWN, a.toString());
    });
  }
  terminate() {
    this.y_ = !0, this.connection.terminate();
  }
}
class Yg {
  constructor(e, t) {
    this.asyncQueue = e, this.onlineStateHandler = t, /** The current OnlineState. */
    this.state = "Unknown", /**
     * A count of consecutive failures to open the stream. If it reaches the
     * maximum defined by MAX_WATCH_STREAM_FAILURES, we'll set the OnlineState to
     * Offline.
     */
    this.S_ = 0, /**
     * A timer that elapses after ONLINE_STATE_TIMEOUT_MS, at which point we
     * transition from OnlineState.Unknown to OnlineState.Offline without waiting
     * for the stream to actually fail (MAX_WATCH_STREAM_FAILURES times).
     */
    this.b_ = null, /**
     * Whether the client should log a warning message if it fails to connect to
     * the backend (initially true, cleared after a successful stream, or if we've
     * logged the message already).
     */
    this.D_ = !0;
  }
  /**
   * Called by RemoteStore when a watch stream is started (including on each
   * backoff attempt).
   *
   * If this is the first attempt, it sets the OnlineState to Unknown and starts
   * the onlineStateTimer.
   */
  v_() {
    this.S_ === 0 && (this.C_(
      "Unknown"
      /* OnlineState.Unknown */
    ), this.b_ = this.asyncQueue.enqueueAfterDelay("online_state_timeout", 1e4, () => (this.b_ = null, this.F_("Backend didn't respond within 10 seconds."), this.C_(
      "Offline"
      /* OnlineState.Offline */
    ), Promise.resolve())));
  }
  /**
   * Updates our OnlineState as appropriate after the watch stream reports a
   * failure. The first failure moves us to the 'Unknown' state. We then may
   * allow multiple failures (based on MAX_WATCH_STREAM_FAILURES) before we
   * actually transition to the 'Offline' state.
   */
  M_(e) {
    this.state === "Online" ? this.C_(
      "Unknown"
      /* OnlineState.Unknown */
    ) : (this.S_++, this.S_ >= 1 && (this.x_(), this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`), this.C_(
      "Offline"
      /* OnlineState.Offline */
    )));
  }
  /**
   * Explicitly sets the OnlineState to the specified state.
   *
   * Note that this resets our timers / failure counters, etc. used by our
   * Offline heuristics, so must not be used in place of
   * handleWatchStreamStart() and handleWatchStreamFailure().
   */
  set(e) {
    this.x_(), this.S_ = 0, e === "Online" && // We've connected to watch at least once. Don't warn the developer
    // about being offline going forward.
    (this.D_ = !1), this.C_(e);
  }
  C_(e) {
    e !== this.state && (this.state = e, this.onlineStateHandler(e));
  }
  F_(e) {
    const t = `Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
    this.D_ ? (He(t), this.D_ = !1) : D("OnlineStateTracker", t);
  }
  x_() {
    this.b_ !== null && (this.b_.cancel(), this.b_ = null);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Jg {
  constructor(e, t, r, i, o) {
    this.localStore = e, this.datastore = t, this.asyncQueue = r, this.remoteSyncer = {}, /**
     * A list of up to MAX_PENDING_WRITES writes that we have fetched from the
     * LocalStore via fillWritePipeline() and have or will send to the write
     * stream.
     *
     * Whenever writePipeline.length > 0 the RemoteStore will attempt to start or
     * restart the write stream. When the stream is established the writes in the
     * pipeline will be sent in order.
     *
     * Writes remain in writePipeline until they are acknowledged by the backend
     * and thus will automatically be re-sent if the stream is interrupted /
     * restarted before they're acknowledged.
     *
     * Write responses from the backend are linked to their originating request
     * purely based on order, and so we can just shift() writes from the front of
     * the writePipeline as we receive responses.
     */
    this.O_ = [], /**
     * A mapping of watched targets that the client cares about tracking and the
     * user has explicitly called a 'listen' for this target.
     *
     * These targets may or may not have been sent to or acknowledged by the
     * server. On re-establishing the listen stream, these targets should be sent
     * to the server. The targets removed with unlistens are removed eagerly
     * without waiting for confirmation from the listen stream.
     */
    this.N_ = /* @__PURE__ */ new Map(), /**
     * A set of reasons for why the RemoteStore may be offline. If empty, the
     * RemoteStore may start its network connections.
     */
    this.L_ = /* @__PURE__ */ new Set(), /**
     * Event handlers that get called when the network is disabled or enabled.
     *
     * PORTING NOTE: These functions are used on the Web client to create the
     * underlying streams (to support tree-shakeable streams). On Android and iOS,
     * the streams are created during construction of RemoteStore.
     */
    this.B_ = [], this.k_ = o, this.k_._o((a) => {
      r.enqueueAndForget(async () => {
        bt(this) && (D("RemoteStore", "Restarting streams for network reachability change."), await async function(h) {
          const d = U(h);
          d.L_.add(
            4
            /* OfflineCause.ConnectivityChange */
          ), await Zn(d), d.q_.set(
            "Unknown"
            /* OnlineState.Unknown */
          ), d.L_.delete(
            4
            /* OfflineCause.ConnectivityChange */
          ), await ui(d);
        }(this));
      });
    }), this.q_ = new Yg(r, i);
  }
}
async function ui(n) {
  if (bt(n)) for (const e of n.B_) await e(
    /* enabled= */
    !0
  );
}
async function Zn(n) {
  for (const e of n.B_) await e(
    /* enabled= */
    !1
  );
}
function Zu(n, e) {
  const t = U(n);
  t.N_.has(e.targetId) || // Mark this as something the client is currently listening for.
  (t.N_.set(e.targetId, e), Ws(t) ? (
    // The listen will be sent in onWatchStreamOpen
    zs(t)
  ) : sn(t).r_() && $s(t, e));
}
function qs(n, e) {
  const t = U(n), r = sn(t);
  t.N_.delete(e), r.r_() && el(t, e), t.N_.size === 0 && (r.r_() ? r.o_() : bt(t) && // Revert to OnlineState.Unknown if the watch stream is not open and we
  // have no listeners, since without any listens to send we cannot
  // confirm if the stream is healthy and upgrade to OnlineState.Online.
  t.q_.set(
    "Unknown"
    /* OnlineState.Unknown */
  ));
}
function $s(n, e) {
  if (n.Q_.xe(e.targetId), e.resumeToken.approximateByteSize() > 0 || e.snapshotVersion.compareTo(F.min()) > 0) {
    const t = n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;
    e = e.withExpectedCount(t);
  }
  sn(n).A_(e);
}
function el(n, e) {
  n.Q_.xe(e), sn(n).R_(e);
}
function zs(n) {
  n.Q_ = new Xm({
    getRemoteKeysForTarget: (e) => n.remoteSyncer.getRemoteKeysForTarget(e),
    ot: (e) => n.N_.get(e) || null,
    tt: () => n.datastore.serializer.databaseId
  }), sn(n).start(), n.q_.v_();
}
function Ws(n) {
  return bt(n) && !sn(n).n_() && n.N_.size > 0;
}
function bt(n) {
  return U(n).L_.size === 0;
}
function tl(n) {
  n.Q_ = void 0;
}
async function Xg(n) {
  n.q_.set(
    "Online"
    /* OnlineState.Online */
  );
}
async function Zg(n) {
  n.N_.forEach((e, t) => {
    $s(n, e);
  });
}
async function e_(n, e) {
  tl(n), // If we still need the watch stream, retry the connection.
  Ws(n) ? (n.q_.M_(e), zs(n)) : (
    // No need to restart watch stream because there are no active targets.
    // The online state is set to unknown because there is no active attempt
    // at establishing a connection
    n.q_.set(
      "Unknown"
      /* OnlineState.Unknown */
    )
  );
}
async function t_(n, e, t) {
  if (
    // Mark the client as online since we got a message from the server
    n.q_.set(
      "Online"
      /* OnlineState.Online */
    ), e instanceof ju && e.state === 2 && e.cause
  )
    try {
      await /** Handles an error on a target */
      async function(i, o) {
        const a = o.cause;
        for (const u of o.targetIds)
          i.N_.has(u) && (await i.remoteSyncer.rejectListen(u, a), i.N_.delete(u), i.Q_.removeTarget(u));
      }(n, e);
    } catch (r) {
      D("RemoteStore", "Failed to remove targets %s: %s ", e.targetIds.join(","), r), await Hr(n, r);
    }
  else if (e instanceof Dr ? n.Q_.Ke(e) : e instanceof Bu ? n.Q_.He(e) : n.Q_.We(e), !t.isEqual(F.min())) try {
    const r = await Yu(n.localStore);
    t.compareTo(r) >= 0 && // We have received a target change with a global snapshot if the snapshot
    // version is not equal to SnapshotVersion.min().
    await /**
    * Takes a batch of changes from the Datastore, repackages them as a
    * RemoteEvent, and passes that on to the listener, which is typically the
    * SyncEngine.
    */
    function(o, a) {
      const u = o.Q_.rt(a);
      return u.targetChanges.forEach((h, d) => {
        if (h.resumeToken.approximateByteSize() > 0) {
          const m = o.N_.get(d);
          m && o.N_.set(d, m.withResumeToken(h.resumeToken, a));
        }
      }), // Re-establish listens for the targets that have been invalidated by
      // existence filter mismatches.
      u.targetMismatches.forEach((h, d) => {
        const m = o.N_.get(h);
        if (!m)
          return;
        o.N_.set(h, m.withResumeToken(he.EMPTY_BYTE_STRING, m.snapshotVersion)), // Cause a hard reset by unwatching and rewatching immediately, but
        // deliberately don't send a resume token so that we get a full update.
        el(o, h);
        const w = new it(m.target, h, d, m.sequenceNumber);
        $s(o, w);
      }), o.remoteSyncer.applyRemoteEvent(u);
    }(n, t);
  } catch (r) {
    D("RemoteStore", "Failed to raise snapshot:", r), await Hr(n, r);
  }
}
async function Hr(n, e, t) {
  if (!Yn(e)) throw e;
  n.L_.add(
    1
    /* OfflineCause.IndexedDbFailed */
  ), // Disable network and raise offline snapshots
  await Zn(n), n.q_.set(
    "Offline"
    /* OnlineState.Offline */
  ), t || // Use a simple read operation to determine if IndexedDB recovered.
  // Ideally, we would expose a health check directly on SimpleDb, but
  // RemoteStore only has access to persistence through LocalStore.
  (t = () => Yu(n.localStore)), // Probe IndexedDB periodically and re-enable network
  n.asyncQueue.enqueueRetryable(async () => {
    D("RemoteStore", "Retrying IndexedDB access"), await t(), n.L_.delete(
      1
      /* OfflineCause.IndexedDbFailed */
    ), await ui(n);
  });
}
function nl(n, e) {
  return e().catch((t) => Hr(n, t, e));
}
async function li(n) {
  const e = U(n), t = ft(e);
  let r = e.O_.length > 0 ? e.O_[e.O_.length - 1].batchId : -1;
  for (; n_(e); ) try {
    const i = await Ug(e.localStore, r);
    if (i === null) {
      e.O_.length === 0 && t.o_();
      break;
    }
    r = i.batchId, r_(e, i);
  } catch (i) {
    await Hr(e, i);
  }
  rl(e) && il(e);
}
function n_(n) {
  return bt(n) && n.O_.length < 10;
}
function r_(n, e) {
  n.O_.push(e);
  const t = ft(n);
  t.r_() && t.V_ && t.m_(e.mutations);
}
function rl(n) {
  return bt(n) && !ft(n).n_() && n.O_.length > 0;
}
function il(n) {
  ft(n).start();
}
async function i_(n) {
  ft(n).p_();
}
async function s_(n) {
  const e = ft(n);
  for (const t of n.O_) e.m_(t.mutations);
}
async function o_(n, e, t) {
  const r = n.O_.shift(), i = Ms.from(r, e, t);
  await nl(n, () => n.remoteSyncer.applySuccessfulWrite(i)), // It's possible that with the completion of this mutation another
  // slot has freed up.
  await li(n);
}
async function a_(n, e) {
  e && ft(n).V_ && // This error affects the actual write.
  await async function(r, i) {
    if (function(a) {
      return Qm(a) && a !== C.ABORTED;
    }(i.code)) {
      const o = r.O_.shift();
      ft(r).s_(), await nl(r, () => r.remoteSyncer.rejectFailedWrite(o.batchId, i)), // It's possible that with the completion of this mutation
      // another slot has freed up.
      await li(r);
    }
  }(n, e), // The write stream might have been started by refilling the write
  // pipeline for failed writes
  rl(n) && il(n);
}
async function oc(n, e) {
  const t = U(n);
  t.asyncQueue.verifyOperationInProgress(), D("RemoteStore", "RemoteStore received new credentials");
  const r = bt(t);
  t.L_.add(
    3
    /* OfflineCause.CredentialChange */
  ), await Zn(t), r && // Don't set the network status to Unknown if we are offline.
  t.q_.set(
    "Unknown"
    /* OnlineState.Unknown */
  ), await t.remoteSyncer.handleCredentialChange(e), t.L_.delete(
    3
    /* OfflineCause.CredentialChange */
  ), await ui(t);
}
async function c_(n, e) {
  const t = U(n);
  e ? (t.L_.delete(
    2
    /* OfflineCause.IsSecondary */
  ), await ui(t)) : e || (t.L_.add(
    2
    /* OfflineCause.IsSecondary */
  ), await Zn(t), t.q_.set(
    "Unknown"
    /* OnlineState.Unknown */
  ));
}
function sn(n) {
  return n.K_ || // Create stream (but note that it is not started yet).
  (n.K_ = function(t, r, i) {
    const o = U(t);
    return o.w_(), new Kg(r, o.connection, o.authCredentials, o.appCheckCredentials, o.serializer, i);
  }(n.datastore, n.asyncQueue, {
    Eo: Xg.bind(null, n),
    Ro: Zg.bind(null, n),
    mo: e_.bind(null, n),
    d_: t_.bind(null, n)
  }), n.B_.push(async (e) => {
    e ? (n.K_.s_(), Ws(n) ? zs(n) : n.q_.set(
      "Unknown"
      /* OnlineState.Unknown */
    )) : (await n.K_.stop(), tl(n));
  })), n.K_;
}
function ft(n) {
  return n.U_ || // Create stream (but note that it is not started yet).
  (n.U_ = function(t, r, i) {
    const o = U(t);
    return o.w_(), new Gg(r, o.connection, o.authCredentials, o.appCheckCredentials, o.serializer, i);
  }(n.datastore, n.asyncQueue, {
    Eo: () => Promise.resolve(),
    Ro: i_.bind(null, n),
    mo: a_.bind(null, n),
    f_: s_.bind(null, n),
    g_: o_.bind(null, n)
  }), n.B_.push(async (e) => {
    e ? (n.U_.s_(), // This will start the write stream if necessary.
    await li(n)) : (await n.U_.stop(), n.O_.length > 0 && (D("RemoteStore", `Stopping write stream with ${n.O_.length} pending writes`), n.O_ = []));
  })), n.U_;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Hs {
  constructor(e, t, r, i, o) {
    this.asyncQueue = e, this.timerId = t, this.targetTimeMs = r, this.op = i, this.removalCallback = o, this.deferred = new ut(), this.then = this.deferred.promise.then.bind(this.deferred.promise), // It's normal for the deferred promise to be canceled (due to cancellation)
    // and so we attach a dummy catch callback to avoid
    // 'UnhandledPromiseRejectionWarning' log spam.
    this.deferred.promise.catch((a) => {
    });
  }
  get promise() {
    return this.deferred.promise;
  }
  /**
   * Creates and returns a DelayedOperation that has been scheduled to be
   * executed on the provided asyncQueue after the provided delayMs.
   *
   * @param asyncQueue - The queue to schedule the operation on.
   * @param id - A Timer ID identifying the type of operation this is.
   * @param delayMs - The delay (ms) before the operation should be scheduled.
   * @param op - The operation to run.
   * @param removalCallback - A callback to be called synchronously once the
   *   operation is executed or canceled, notifying the AsyncQueue to remove it
   *   from its delayedOperations list.
   *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
   *   the DelayedOperation class public.
   */
  static createAndSchedule(e, t, r, i, o) {
    const a = Date.now() + r, u = new Hs(e, t, a, i, o);
    return u.start(r), u;
  }
  /**
   * Starts the timer. This is called immediately after construction by
   * createAndSchedule().
   */
  start(e) {
    this.timerHandle = setTimeout(() => this.handleDelayElapsed(), e);
  }
  /**
   * Queues the operation to run immediately (if it hasn't already been run or
   * canceled).
   */
  skipDelay() {
    return this.handleDelayElapsed();
  }
  /**
   * Cancels the operation if it hasn't already been executed or canceled. The
   * promise will be rejected.
   *
   * As long as the operation has not yet been run, calling cancel() provides a
   * guarantee that the operation will not be run.
   */
  cancel(e) {
    this.timerHandle !== null && (this.clearTimeout(), this.deferred.reject(new O(C.CANCELLED, "Operation cancelled" + (e ? ": " + e : ""))));
  }
  handleDelayElapsed() {
    this.asyncQueue.enqueueAndForget(() => this.timerHandle !== null ? (this.clearTimeout(), this.op().then((e) => this.deferred.resolve(e))) : Promise.resolve());
  }
  clearTimeout() {
    this.timerHandle !== null && (this.removalCallback(this), clearTimeout(this.timerHandle), this.timerHandle = null);
  }
}
function Ks(n, e) {
  if (He("AsyncQueue", `${e}: ${n}`), Yn(n)) return new O(C.UNAVAILABLE, `${e}: ${n}`);
  throw n;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class qt {
  /** The default ordering is by key if the comparator is omitted */
  constructor(e) {
    this.comparator = e ? (t, r) => e(t, r) || L.comparator(t.key, r.key) : (t, r) => L.comparator(t.key, r.key), this.keyedMap = Pn(), this.sortedSet = new X(this.comparator);
  }
  /**
   * Returns an empty copy of the existing DocumentSet, using the same
   * comparator.
   */
  static emptySet(e) {
    return new qt(e.comparator);
  }
  has(e) {
    return this.keyedMap.get(e) != null;
  }
  get(e) {
    return this.keyedMap.get(e);
  }
  first() {
    return this.sortedSet.minKey();
  }
  last() {
    return this.sortedSet.maxKey();
  }
  isEmpty() {
    return this.sortedSet.isEmpty();
  }
  /**
   * Returns the index of the provided key in the document set, or -1 if the
   * document key is not present in the set;
   */
  indexOf(e) {
    const t = this.keyedMap.get(e);
    return t ? this.sortedSet.indexOf(t) : -1;
  }
  get size() {
    return this.sortedSet.size;
  }
  /** Iterates documents in order defined by "comparator" */
  forEach(e) {
    this.sortedSet.inorderTraversal((t, r) => (e(t), !1));
  }
  /** Inserts or updates a document with the same key */
  add(e) {
    const t = this.delete(e.key);
    return t.copy(t.keyedMap.insert(e.key, e), t.sortedSet.insert(e, null));
  }
  /** Deletes a document with a given key */
  delete(e) {
    const t = this.get(e);
    return t ? this.copy(this.keyedMap.remove(e), this.sortedSet.remove(t)) : this;
  }
  isEqual(e) {
    if (!(e instanceof qt) || this.size !== e.size) return !1;
    const t = this.sortedSet.getIterator(), r = e.sortedSet.getIterator();
    for (; t.hasNext(); ) {
      const i = t.getNext().key, o = r.getNext().key;
      if (!i.isEqual(o)) return !1;
    }
    return !0;
  }
  toString() {
    const e = [];
    return this.forEach((t) => {
      e.push(t.toString());
    }), e.length === 0 ? "DocumentSet ()" : `DocumentSet (
  ` + e.join(`  
`) + `
)`;
  }
  copy(e, t) {
    const r = new qt();
    return r.comparator = this.comparator, r.keyedMap = e, r.sortedSet = t, r;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ac {
  constructor() {
    this.W_ = new X(L.comparator);
  }
  track(e) {
    const t = e.doc.key, r = this.W_.get(t);
    r ? (
      // Merge the new change with the existing change.
      e.type !== 0 && r.type === 3 ? this.W_ = this.W_.insert(t, e) : e.type === 3 && r.type !== 1 ? this.W_ = this.W_.insert(t, {
        type: r.type,
        doc: e.doc
      }) : e.type === 2 && r.type === 2 ? this.W_ = this.W_.insert(t, {
        type: 2,
        doc: e.doc
      }) : e.type === 2 && r.type === 0 ? this.W_ = this.W_.insert(t, {
        type: 0,
        doc: e.doc
      }) : e.type === 1 && r.type === 0 ? this.W_ = this.W_.remove(t) : e.type === 1 && r.type === 2 ? this.W_ = this.W_.insert(t, {
        type: 1,
        doc: r.doc
      }) : e.type === 0 && r.type === 1 ? this.W_ = this.W_.insert(t, {
        type: 2,
        doc: e.doc
      }) : (
        // This includes these cases, which don't make sense:
        // Added->Added
        // Removed->Removed
        // Modified->Added
        // Removed->Modified
        // Metadata->Added
        // Removed->Metadata
        x()
      )
    ) : this.W_ = this.W_.insert(t, e);
  }
  G_() {
    const e = [];
    return this.W_.inorderTraversal((t, r) => {
      e.push(r);
    }), e;
  }
}
class Yt {
  constructor(e, t, r, i, o, a, u, h, d) {
    this.query = e, this.docs = t, this.oldDocs = r, this.docChanges = i, this.mutatedKeys = o, this.fromCache = a, this.syncStateChanged = u, this.excludesMetadataChanges = h, this.hasCachedResults = d;
  }
  /** Returns a view snapshot as if all documents in the snapshot were added. */
  static fromInitialDocuments(e, t, r, i, o) {
    const a = [];
    return t.forEach((u) => {
      a.push({
        type: 0,
        doc: u
      });
    }), new Yt(
      e,
      t,
      qt.emptySet(t),
      a,
      r,
      i,
      /* syncStateChanged= */
      !0,
      /* excludesMetadataChanges= */
      !1,
      o
    );
  }
  get hasPendingWrites() {
    return !this.mutatedKeys.isEmpty();
  }
  isEqual(e) {
    if (!(this.fromCache === e.fromCache && this.hasCachedResults === e.hasCachedResults && this.syncStateChanged === e.syncStateChanged && this.mutatedKeys.isEqual(e.mutatedKeys) && ri(this.query, e.query) && this.docs.isEqual(e.docs) && this.oldDocs.isEqual(e.oldDocs))) return !1;
    const t = this.docChanges, r = e.docChanges;
    if (t.length !== r.length) return !1;
    for (let i = 0; i < t.length; i++) if (t[i].type !== r[i].type || !t[i].doc.isEqual(r[i].doc)) return !1;
    return !0;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class u_ {
  constructor() {
    this.z_ = void 0, this.j_ = [];
  }
  // Helper methods that checks if the query has listeners that listening to remote store
  H_() {
    return this.j_.some((e) => e.J_());
  }
}
class l_ {
  constructor() {
    this.queries = cc(), this.onlineState = "Unknown", this.Y_ = /* @__PURE__ */ new Set();
  }
  terminate() {
    (function(t, r) {
      const i = U(t), o = i.queries;
      i.queries = cc(), o.forEach((a, u) => {
        for (const h of u.j_) h.onError(r);
      });
    })(this, new O(C.ABORTED, "Firestore shutting down"));
  }
}
function cc() {
  return new rn((n) => Su(n), ri);
}
async function h_(n, e) {
  const t = U(n);
  let r = 3;
  const i = e.query;
  let o = t.queries.get(i);
  o ? !o.H_() && e.J_() && // Query has been listening to local cache, and tries to add a new listener sourced from watch.
  (r = 2) : (o = new u_(), r = e.J_() ? 0 : 1);
  try {
    switch (r) {
      case 0:
        o.z_ = await t.onListen(
          i,
          /** enableRemoteListen= */
          !0
        );
        break;
      case 1:
        o.z_ = await t.onListen(
          i,
          /** enableRemoteListen= */
          !1
        );
        break;
      case 2:
        await t.onFirstRemoteStoreListen(i);
    }
  } catch (a) {
    const u = Ks(a, `Initialization of query '${Ot(e.query)}' failed`);
    return void e.onError(u);
  }
  t.queries.set(i, o), o.j_.push(e), // Run global snapshot listeners if a consistent snapshot has been emitted.
  e.Z_(t.onlineState), o.z_ && e.X_(o.z_) && Gs(t);
}
async function d_(n, e) {
  const t = U(n), r = e.query;
  let i = 3;
  const o = t.queries.get(r);
  if (o) {
    const a = o.j_.indexOf(e);
    a >= 0 && (o.j_.splice(a, 1), o.j_.length === 0 ? i = e.J_() ? 0 : 1 : !o.H_() && e.J_() && // The removed listener is the last one that sourced from watch.
    (i = 2));
  }
  switch (i) {
    case 0:
      return t.queries.delete(r), t.onUnlisten(
        r,
        /** disableRemoteListen= */
        !0
      );
    case 1:
      return t.queries.delete(r), t.onUnlisten(
        r,
        /** disableRemoteListen= */
        !1
      );
    case 2:
      return t.onLastRemoteStoreUnlisten(r);
    default:
      return;
  }
}
function f_(n, e) {
  const t = U(n);
  let r = !1;
  for (const i of e) {
    const o = i.query, a = t.queries.get(o);
    if (a) {
      for (const u of a.j_) u.X_(i) && (r = !0);
      a.z_ = i;
    }
  }
  r && Gs(t);
}
function p_(n, e, t) {
  const r = U(n), i = r.queries.get(e);
  if (i) for (const o of i.j_) o.onError(t);
  r.queries.delete(e);
}
function Gs(n) {
  n.Y_.forEach((e) => {
    e.next();
  });
}
var ds, uc;
(uc = ds || (ds = {})).ea = "default", /** Listen to changes in cache only */
uc.Cache = "cache";
class m_ {
  constructor(e, t, r) {
    this.query = e, this.ta = t, /**
     * Initial snapshots (e.g. from cache) may not be propagated to the wrapped
     * observer. This flag is set to true once we've actually raised an event.
     */
    this.na = !1, this.ra = null, this.onlineState = "Unknown", this.options = r || {};
  }
  /**
   * Applies the new ViewSnapshot to this listener, raising a user-facing event
   * if applicable (depending on what changed, whether the user has opted into
   * metadata-only changes, etc.). Returns true if a user-facing event was
   * indeed raised.
   */
  X_(e) {
    if (!this.options.includeMetadataChanges) {
      const r = [];
      for (const i of e.docChanges) i.type !== 3 && r.push(i);
      e = new Yt(
        e.query,
        e.docs,
        e.oldDocs,
        r,
        e.mutatedKeys,
        e.fromCache,
        e.syncStateChanged,
        /* excludesMetadataChanges= */
        !0,
        e.hasCachedResults
      );
    }
    let t = !1;
    return this.na ? this.ia(e) && (this.ta.next(e), t = !0) : this.sa(e, this.onlineState) && (this.oa(e), t = !0), this.ra = e, t;
  }
  onError(e) {
    this.ta.error(e);
  }
  /** Returns whether a snapshot was raised. */
  Z_(e) {
    this.onlineState = e;
    let t = !1;
    return this.ra && !this.na && this.sa(this.ra, e) && (this.oa(this.ra), t = !0), t;
  }
  sa(e, t) {
    if (!e.fromCache || !this.J_()) return !0;
    const r = t !== "Offline";
    return (!this.options._a || !r) && (!e.docs.isEmpty() || e.hasCachedResults || t === "Offline");
  }
  ia(e) {
    if (e.docChanges.length > 0) return !0;
    const t = this.ra && this.ra.hasPendingWrites !== e.hasPendingWrites;
    return !(!e.syncStateChanged && !t) && this.options.includeMetadataChanges === !0;
  }
  oa(e) {
    e = Yt.fromInitialDocuments(e.query, e.docs, e.mutatedKeys, e.fromCache, e.hasCachedResults), this.na = !0, this.ta.next(e);
  }
  J_() {
    return this.options.source !== ds.Cache;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class sl {
  constructor(e) {
    this.key = e;
  }
}
class ol {
  constructor(e) {
    this.key = e;
  }
}
class g_ {
  constructor(e, t) {
    this.query = e, this.Ta = t, this.Ea = null, this.hasCachedResults = !1, /**
     * A flag whether the view is current with the backend. A view is considered
     * current after it has seen the current flag from the backend and did not
     * lose consistency within the watch stream (e.g. because of an existence
     * filter mismatch).
     */
    this.current = !1, /** Documents in the view but not in the remote target */
    this.da = B(), /** Document Keys that have local changes */
    this.mutatedKeys = B(), this.Aa = Pu(e), this.Ra = new qt(this.Aa);
  }
  /**
   * The set of remote documents that the server has told us belongs to the target associated with
   * this view.
   */
  get Va() {
    return this.Ta;
  }
  /**
   * Iterates over a set of doc changes, applies the query limit, and computes
   * what the new results should be, what the changes were, and whether we may
   * need to go back to the local cache for more results. Does not make any
   * changes to the view.
   * @param docChanges - The doc changes to apply to this view.
   * @param previousChanges - If this is being called with a refill, then start
   *        with this set of docs and changes instead of the current view.
   * @returns a new set of docs, changes, and refill flag.
   */
  ma(e, t) {
    const r = t ? t.fa : new ac(), i = t ? t.Ra : this.Ra;
    let o = t ? t.mutatedKeys : this.mutatedKeys, a = i, u = !1;
    const h = this.query.limitType === "F" && i.size === this.query.limit ? i.last() : null, d = this.query.limitType === "L" && i.size === this.query.limit ? i.first() : null;
    if (e.inorderTraversal((m, w) => {
      const R = i.get(m), P = ii(this.query, w) ? w : null, V = !!R && this.mutatedKeys.has(R.key), N = !!P && (P.hasLocalMutations || // We only consider committed mutations for documents that were
      // mutated during the lifetime of the view.
      this.mutatedKeys.has(P.key) && P.hasCommittedMutations);
      let k = !1;
      R && P ? R.data.isEqual(P.data) ? V !== N && (r.track({
        type: 3,
        doc: P
      }), k = !0) : this.ga(R, P) || (r.track({
        type: 2,
        doc: P
      }), k = !0, (h && this.Aa(P, h) > 0 || d && this.Aa(P, d) < 0) && // This doc moved from inside the limit to outside the limit.
      // That means there may be some other doc in the local cache
      // that should be included instead.
      (u = !0)) : !R && P ? (r.track({
        type: 0,
        doc: P
      }), k = !0) : R && !P && (r.track({
        type: 1,
        doc: R
      }), k = !0, (h || d) && // A doc was removed from a full limit query. We'll need to
      // requery from the local cache to see if we know about some other
      // doc that should be in the results.
      (u = !0)), k && (P ? (a = a.add(P), o = N ? o.add(m) : o.delete(m)) : (a = a.delete(m), o = o.delete(m)));
    }), this.query.limit !== null) for (; a.size > this.query.limit; ) {
      const m = this.query.limitType === "F" ? a.last() : a.first();
      a = a.delete(m.key), o = o.delete(m.key), r.track({
        type: 1,
        doc: m
      });
    }
    return {
      Ra: a,
      fa: r,
      ns: u,
      mutatedKeys: o
    };
  }
  ga(e, t) {
    return e.hasLocalMutations && t.hasCommittedMutations && !t.hasLocalMutations;
  }
  /**
   * Updates the view with the given ViewDocumentChanges and optionally updates
   * limbo docs and sync state from the provided target change.
   * @param docChanges - The set of changes to make to the view's docs.
   * @param limboResolutionEnabled - Whether to update limbo documents based on
   *        this change.
   * @param targetChange - A target change to apply for computing limbo docs and
   *        sync state.
   * @param targetIsPendingReset - Whether the target is pending to reset due to
   *        existence filter mismatch. If not explicitly specified, it is treated
   *        equivalently to `false`.
   * @returns A new ViewChange with the given docs, changes, and sync state.
   */
  // PORTING NOTE: The iOS/Android clients always compute limbo document changes.
  applyChanges(e, t, r, i) {
    const o = this.Ra;
    this.Ra = e.Ra, this.mutatedKeys = e.mutatedKeys;
    const a = e.fa.G_();
    a.sort((m, w) => function(P, V) {
      const N = (k) => {
        switch (k) {
          case 0:
            return 1;
          case 2:
          case 3:
            return 2;
          case 1:
            return 0;
          default:
            return x();
        }
      };
      return N(P) - N(V);
    }(m.type, w.type) || this.Aa(m.doc, w.doc)), this.pa(r), i = i != null && i;
    const u = t && !i ? this.ya() : [], h = this.da.size === 0 && this.current && !i ? 1 : 0, d = h !== this.Ea;
    return this.Ea = h, a.length !== 0 || d ? {
      snapshot: new Yt(
        this.query,
        e.Ra,
        o,
        a,
        e.mutatedKeys,
        h === 0,
        d,
        /* excludesMetadataChanges= */
        !1,
        !!r && r.resumeToken.approximateByteSize() > 0
      ),
      wa: u
    } : {
      wa: u
    };
  }
  /**
   * Applies an OnlineState change to the view, potentially generating a
   * ViewChange if the view's syncState changes as a result.
   */
  Z_(e) {
    return this.current && e === "Offline" ? (
      // If we're offline, set `current` to false and then call applyChanges()
      // to refresh our syncState and generate a ViewChange as appropriate. We
      // are guaranteed to get a new TargetChange that sets `current` back to
      // true once the client is back online.
      (this.current = !1, this.applyChanges(
        {
          Ra: this.Ra,
          fa: new ac(),
          mutatedKeys: this.mutatedKeys,
          ns: !1
        },
        /* limboResolutionEnabled= */
        !1
      ))
    ) : {
      wa: []
    };
  }
  /**
   * Returns whether the doc for the given key should be in limbo.
   */
  Sa(e) {
    return !this.Ta.has(e) && // The local store doesn't think it's a result, so it shouldn't be in limbo.
    !!this.Ra.has(e) && !this.Ra.get(e).hasLocalMutations;
  }
  /**
   * Updates syncedDocuments, current, and limbo docs based on the given change.
   * Returns the list of changes to which docs are in limbo.
   */
  pa(e) {
    e && (e.addedDocuments.forEach((t) => this.Ta = this.Ta.add(t)), e.modifiedDocuments.forEach((t) => {
    }), e.removedDocuments.forEach((t) => this.Ta = this.Ta.delete(t)), this.current = e.current);
  }
  ya() {
    if (!this.current) return [];
    const e = this.da;
    this.da = B(), this.Ra.forEach((r) => {
      this.Sa(r.key) && (this.da = this.da.add(r.key));
    });
    const t = [];
    return e.forEach((r) => {
      this.da.has(r) || t.push(new ol(r));
    }), this.da.forEach((r) => {
      e.has(r) || t.push(new sl(r));
    }), t;
  }
  /**
   * Update the in-memory state of the current view with the state read from
   * persistence.
   *
   * We update the query view whenever a client's primary status changes:
   * - When a client transitions from primary to secondary, it can miss
   *   LocalStorage updates and its query views may temporarily not be
   *   synchronized with the state on disk.
   * - For secondary to primary transitions, the client needs to update the list
   *   of `syncedDocuments` since secondary clients update their query views
   *   based purely on synthesized RemoteEvents.
   *
   * @param queryResult.documents - The documents that match the query according
   * to the LocalStore.
   * @param queryResult.remoteKeys - The keys of the documents that match the
   * query according to the backend.
   *
   * @returns The ViewChange that resulted from this synchronization.
   */
  // PORTING NOTE: Multi-tab only.
  ba(e) {
    this.Ta = e.Ts, this.da = B();
    const t = this.ma(e.documents);
    return this.applyChanges(
      t,
      /* limboResolutionEnabled= */
      !0
    );
  }
  /**
   * Returns a view snapshot as if this query was just listened to. Contains
   * a document add for every existing document and the `fromCache` and
   * `hasPendingWrites` status of the already established view.
   */
  // PORTING NOTE: Multi-tab only.
  Da() {
    return Yt.fromInitialDocuments(this.query, this.Ra, this.mutatedKeys, this.Ea === 0, this.hasCachedResults);
  }
}
class __ {
  constructor(e, t, r) {
    this.query = e, this.targetId = t, this.view = r;
  }
}
class y_ {
  constructor(e) {
    this.key = e, /**
     * Set to true once we've received a document. This is used in
     * getRemoteKeysForTarget() and ultimately used by WatchChangeAggregator to
     * decide whether it needs to manufacture a delete event for the target once
     * the target is CURRENT.
     */
    this.va = !1;
  }
}
class v_ {
  constructor(e, t, r, i, o, a) {
    this.localStore = e, this.remoteStore = t, this.eventManager = r, this.sharedClientState = i, this.currentUser = o, this.maxConcurrentLimboResolutions = a, this.Ca = {}, this.Fa = new rn((u) => Su(u), ri), this.Ma = /* @__PURE__ */ new Map(), /**
     * The keys of documents that are in limbo for which we haven't yet started a
     * limbo resolution query. The strings in this set are the result of calling
     * `key.path.canonicalString()` where `key` is a `DocumentKey` object.
     *
     * The `Set` type was chosen because it provides efficient lookup and removal
     * of arbitrary elements and it also maintains insertion order, providing the
     * desired queue-like FIFO semantics.
     */
    this.xa = /* @__PURE__ */ new Set(), /**
     * Keeps track of the target ID for each document that is in limbo with an
     * active target.
     */
    this.Oa = new X(L.comparator), /**
     * Keeps track of the information about an active limbo resolution for each
     * active target ID that was started for the purpose of limbo resolution.
     */
    this.Na = /* @__PURE__ */ new Map(), this.La = new Us(), /** Stores user completion handlers, indexed by User and BatchId. */
    this.Ba = {}, /** Stores user callbacks waiting for all pending writes to be acknowledged. */
    this.ka = /* @__PURE__ */ new Map(), this.qa = Qt.kn(), this.onlineState = "Unknown", // The primary state is set to `true` or `false` immediately after Firestore
    // startup. In the interim, a client should only be considered primary if
    // `isPrimary` is true.
    this.Qa = void 0;
  }
  get isPrimaryClient() {
    return this.Qa === !0;
  }
}
async function E_(n, e, t = !0) {
  const r = dl(n);
  let i;
  const o = r.Fa.get(e);
  return o ? (
    // PORTING NOTE: With Multi-Tab Web, it is possible that a query view
    // already exists when EventManager calls us for the first time. This
    // happens when the primary tab is already listening to this query on
    // behalf of another tab and the user of the primary also starts listening
    // to the query. EventManager will not have an assigned target ID in this
    // case and calls `listen` to obtain this ID.
    (r.sharedClientState.addLocalQueryTarget(o.targetId), i = o.view.Da())
  ) : i = await al(
    r,
    e,
    t,
    /** shouldInitializeView= */
    !0
  ), i;
}
async function T_(n, e) {
  const t = dl(n);
  await al(
    t,
    e,
    /** shouldListenToRemote= */
    !0,
    /** shouldInitializeView= */
    !1
  );
}
async function al(n, e, t, r) {
  const i = await Bg(n.localStore, De(e)), o = i.targetId, a = n.sharedClientState.addLocalQueryTarget(o, t);
  let u;
  return r && (u = await I_(n, e, o, a === "current", i.resumeToken)), n.isPrimaryClient && t && Zu(n.remoteStore, i), u;
}
async function I_(n, e, t, r, i) {
  n.Ka = (w, R, P) => async function(N, k, W, H) {
    let K = k.view.ma(W);
    K.ns && // The query has a limit and some docs were removed, so we need
    // to re-run the query against the local store to make sure we
    // didn't lose any good docs that had been past the limit.
    (K = await rc(
      N.localStore,
      k.query,
      /* usePreviousResults= */
      !1
    ).then(({ documents: v }) => k.view.ma(v, K)));
    const ee = H && H.targetChanges.get(k.targetId), Ae = H && H.targetMismatches.get(k.targetId) != null, te = k.view.applyChanges(
      K,
      /* limboResolutionEnabled= */
      N.isPrimaryClient,
      ee,
      Ae
    );
    return hc(N, k.targetId, te.wa), te.snapshot;
  }(n, w, R, P);
  const o = await rc(
    n.localStore,
    e,
    /* usePreviousResults= */
    !0
  ), a = new g_(e, o.Ts), u = a.ma(o.documents), h = Xn.createSynthesizedTargetChangeForCurrentChange(t, r && n.onlineState !== "Offline", i), d = a.applyChanges(
    u,
    /* limboResolutionEnabled= */
    n.isPrimaryClient,
    h
  );
  hc(n, t, d.wa);
  const m = new __(e, t, a);
  return n.Fa.set(e, m), n.Ma.has(t) ? n.Ma.get(t).push(e) : n.Ma.set(t, [e]), d.snapshot;
}
async function w_(n, e, t) {
  const r = U(n), i = r.Fa.get(e), o = r.Ma.get(i.targetId);
  if (o.length > 1) return r.Ma.set(i.targetId, o.filter((a) => !ri(a, e))), void r.Fa.delete(e);
  r.isPrimaryClient ? (r.sharedClientState.removeLocalQueryTarget(i.targetId), r.sharedClientState.isActiveQueryTarget(i.targetId) || await hs(
    r.localStore,
    i.targetId,
    /*keepPersistedTargetData=*/
    !1
  ).then(() => {
    r.sharedClientState.clearQueryState(i.targetId), t && qs(r.remoteStore, i.targetId), fs(r, i.targetId);
  }).catch(Qn)) : (fs(r, i.targetId), await hs(
    r.localStore,
    i.targetId,
    /*keepPersistedTargetData=*/
    !0
  ));
}
async function A_(n, e) {
  const t = U(n), r = t.Fa.get(e), i = t.Ma.get(r.targetId);
  t.isPrimaryClient && i.length === 1 && // PORTING NOTE: Unregister the target ID with local Firestore client as
  // watch target.
  (t.sharedClientState.removeLocalQueryTarget(r.targetId), qs(t.remoteStore, r.targetId));
}
async function R_(n, e, t) {
  const r = D_(n);
  try {
    const i = await function(a, u) {
      const h = U(a), d = se.now(), m = u.reduce((P, V) => P.add(V.key), B());
      let w, R;
      return h.persistence.runTransaction("Locally write mutations", "readwrite", (P) => {
        let V = Ke(), N = B();
        return h.cs.getEntries(P, m).next((k) => {
          V = k, V.forEach((W, H) => {
            H.isValidDocument() || (N = N.add(W));
          });
        }).next(() => h.localDocuments.getOverlayedDocuments(P, V)).next((k) => {
          w = k;
          const W = [];
          for (const H of u) {
            const K = zm(H, w.get(H.key).overlayedDocument);
            K != null && // NOTE: The base state should only be applied if there's some
            // existing document to override, so use a Precondition of
            // exists=true
            W.push(new Ct(H.key, K, vu(K.value.mapValue), $e.exists(!0)));
          }
          return h.mutationQueue.addMutationBatch(P, d, W, u);
        }).next((k) => {
          R = k;
          const W = k.applyToLocalDocumentSet(w, N);
          return h.documentOverlayCache.saveOverlays(P, k.batchId, W);
        });
      }).then(() => ({
        batchId: R.batchId,
        changes: bu(w)
      }));
    }(r.localStore, e);
    r.sharedClientState.addPendingMutation(i.batchId), function(a, u, h) {
      let d = a.Ba[a.currentUser.toKey()];
      d || (d = new X(z)), d = d.insert(u, h), a.Ba[a.currentUser.toKey()] = d;
    }(r, i.batchId, t), await er(r, i.changes), await li(r.remoteStore);
  } catch (i) {
    const o = Ks(i, "Failed to persist write");
    t.reject(o);
  }
}
async function cl(n, e) {
  const t = U(n);
  try {
    const r = await xg(t.localStore, e);
    e.targetChanges.forEach((i, o) => {
      const a = t.Na.get(o);
      a && // Since this is a limbo resolution lookup, it's for a single document
      // and it could be added, modified, or removed, but not a combination.
      (G(i.addedDocuments.size + i.modifiedDocuments.size + i.removedDocuments.size <= 1), i.addedDocuments.size > 0 ? a.va = !0 : i.modifiedDocuments.size > 0 ? G(a.va) : i.removedDocuments.size > 0 && (G(a.va), a.va = !1));
    }), await er(t, r, e);
  } catch (r) {
    await Qn(r);
  }
}
function lc(n, e, t) {
  const r = U(n);
  if (r.isPrimaryClient && t === 0 || !r.isPrimaryClient && t === 1) {
    const i = [];
    r.Fa.forEach((o, a) => {
      const u = a.view.Z_(e);
      u.snapshot && i.push(u.snapshot);
    }), function(a, u) {
      const h = U(a);
      h.onlineState = u;
      let d = !1;
      h.queries.forEach((m, w) => {
        for (const R of w.j_)
          R.Z_(u) && (d = !0);
      }), d && Gs(h);
    }(r.eventManager, e), i.length && r.Ca.d_(i), r.onlineState = e, r.isPrimaryClient && r.sharedClientState.setOnlineState(e);
  }
}
async function S_(n, e, t) {
  const r = U(n);
  r.sharedClientState.updateQueryState(e, "rejected", t);
  const i = r.Na.get(e), o = i && i.key;
  if (o) {
    let a = new X(L.comparator);
    a = a.insert(o, ye.newNoDocument(o, F.min()));
    const u = B().add(o), h = new ai(
      F.min(),
      /* targetChanges= */
      /* @__PURE__ */ new Map(),
      /* targetMismatches= */
      new X(z),
      a,
      u
    );
    await cl(r, h), // Since this query failed, we won't want to manually unlisten to it.
    // We only remove it from bookkeeping after we successfully applied the
    // RemoteEvent. If `applyRemoteEvent()` throws, we want to re-listen to
    // this query when the RemoteStore restarts the Watch stream, which should
    // re-trigger the target failure.
    r.Oa = r.Oa.remove(o), r.Na.delete(e), Qs(r);
  } else await hs(
    r.localStore,
    e,
    /* keepPersistedTargetData */
    !1
  ).then(() => fs(r, e, t)).catch(Qn);
}
async function P_(n, e) {
  const t = U(n), r = e.batch.batchId;
  try {
    const i = await Mg(t.localStore, e);
    ll(
      t,
      r,
      /*error=*/
      null
    ), ul(t, r), t.sharedClientState.updateMutationState(r, "acknowledged"), await er(t, i);
  } catch (i) {
    await Qn(i);
  }
}
async function C_(n, e, t) {
  const r = U(n);
  try {
    const i = await function(a, u) {
      const h = U(a);
      return h.persistence.runTransaction("Reject batch", "readwrite-primary", (d) => {
        let m;
        return h.mutationQueue.lookupMutationBatch(d, u).next((w) => (G(w !== null), m = w.keys(), h.mutationQueue.removeMutationBatch(d, w))).next(() => h.mutationQueue.performConsistencyCheck(d)).next(() => h.documentOverlayCache.removeOverlaysForBatchId(d, m, u)).next(() => h.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d, m)).next(() => h.localDocuments.getDocuments(d, m));
      });
    }(r.localStore, e);
    ll(r, e, t), ul(r, e), r.sharedClientState.updateMutationState(e, "rejected", t), await er(r, i);
  } catch (i) {
    await Qn(i);
  }
}
function ul(n, e) {
  (n.ka.get(e) || []).forEach((t) => {
    t.resolve();
  }), n.ka.delete(e);
}
function ll(n, e, t) {
  const r = U(n);
  let i = r.Ba[r.currentUser.toKey()];
  if (i) {
    const o = i.get(e);
    o && (t ? o.reject(t) : o.resolve(), i = i.remove(e)), r.Ba[r.currentUser.toKey()] = i;
  }
}
function fs(n, e, t = null) {
  n.sharedClientState.removeLocalQueryTarget(e);
  for (const r of n.Ma.get(e)) n.Fa.delete(r), t && n.Ca.$a(r, t);
  n.Ma.delete(e), n.isPrimaryClient && n.La.gr(e).forEach((r) => {
    n.La.containsKey(r) || // We removed the last reference for this key
    hl(n, r);
  });
}
function hl(n, e) {
  n.xa.delete(e.path.canonicalString());
  const t = n.Oa.get(e);
  t !== null && (qs(n.remoteStore, t), n.Oa = n.Oa.remove(e), n.Na.delete(t), Qs(n));
}
function hc(n, e, t) {
  for (const r of t) r instanceof sl ? (n.La.addReference(r.key, e), b_(n, r)) : r instanceof ol ? (D("SyncEngine", "Document no longer in limbo: " + r.key), n.La.removeReference(r.key, e), n.La.containsKey(r.key) || // We removed the last reference for this key
  hl(n, r.key)) : x();
}
function b_(n, e) {
  const t = e.key, r = t.path.canonicalString();
  n.Oa.get(t) || n.xa.has(r) || (D("SyncEngine", "New document in limbo: " + t), n.xa.add(r), Qs(n));
}
function Qs(n) {
  for (; n.xa.size > 0 && n.Oa.size < n.maxConcurrentLimboResolutions; ) {
    const e = n.xa.values().next().value;
    n.xa.delete(e);
    const t = new L(J.fromString(e)), r = n.qa.next();
    n.Na.set(r, new y_(t)), n.Oa = n.Oa.insert(t, r), Zu(n.remoteStore, new it(De(Os(t.path)), r, "TargetPurposeLimboResolution", Cs.oe));
  }
}
async function er(n, e, t) {
  const r = U(n), i = [], o = [], a = [];
  r.Fa.isEmpty() || (r.Fa.forEach((u, h) => {
    a.push(r.Ka(h, e, t).then((d) => {
      var m;
      if ((d || t) && r.isPrimaryClient) {
        const w = d ? !d.fromCache : (m = t == null ? void 0 : t.targetChanges.get(h.targetId)) === null || m === void 0 ? void 0 : m.current;
        r.sharedClientState.updateQueryState(h.targetId, w ? "current" : "not-current");
      }
      if (d) {
        i.push(d);
        const w = js.Wi(h.targetId, d);
        o.push(w);
      }
    }));
  }), await Promise.all(a), r.Ca.d_(i), await async function(h, d) {
    const m = U(h);
    try {
      await m.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (w) => S.forEach(d, (R) => S.forEach(R.$i, (P) => m.persistence.referenceDelegate.addReference(w, R.targetId, P)).next(() => S.forEach(R.Ui, (P) => m.persistence.referenceDelegate.removeReference(w, R.targetId, P)))));
    } catch (w) {
      if (!Yn(w)) throw w;
      D("LocalStore", "Failed to update sequence numbers: " + w);
    }
    for (const w of d) {
      const R = w.targetId;
      if (!w.fromCache) {
        const P = m.os.get(R), V = P.snapshotVersion, N = P.withLastLimboFreeSnapshotVersion(V);
        m.os = m.os.insert(R, N);
      }
    }
  }(r.localStore, o));
}
async function k_(n, e) {
  const t = U(n);
  if (!t.currentUser.isEqual(e)) {
    D("SyncEngine", "User change. New user:", e.toKey());
    const r = await Qu(t.localStore, e);
    t.currentUser = e, // Fails tasks waiting for pending writes requested by previous user.
    function(o, a) {
      o.ka.forEach((u) => {
        u.forEach((h) => {
          h.reject(new O(C.CANCELLED, a));
        });
      }), o.ka.clear();
    }(t, "'waitForPendingWrites' promise is rejected due to a user change."), // TODO(b/114226417): Consider calling this only in the primary tab.
    t.sharedClientState.handleUserChange(e, r.removedBatchIds, r.addedBatchIds), await er(t, r.hs);
  }
}
function V_(n, e) {
  const t = U(n), r = t.Na.get(e);
  if (r && r.va) return B().add(r.key);
  {
    let i = B();
    const o = t.Ma.get(e);
    if (!o) return i;
    for (const a of o) {
      const u = t.Fa.get(a);
      i = i.unionWith(u.view.Va);
    }
    return i;
  }
}
function dl(n) {
  const e = U(n);
  return e.remoteStore.remoteSyncer.applyRemoteEvent = cl.bind(null, e), e.remoteStore.remoteSyncer.getRemoteKeysForTarget = V_.bind(null, e), e.remoteStore.remoteSyncer.rejectListen = S_.bind(null, e), e.Ca.d_ = f_.bind(null, e.eventManager), e.Ca.$a = p_.bind(null, e.eventManager), e;
}
function D_(n) {
  const e = U(n);
  return e.remoteStore.remoteSyncer.applySuccessfulWrite = P_.bind(null, e), e.remoteStore.remoteSyncer.rejectFailedWrite = C_.bind(null, e), e;
}
class Kr {
  constructor() {
    this.kind = "memory", this.synchronizeTabs = !1;
  }
  async initialize(e) {
    this.serializer = ci(e.databaseInfo.databaseId), this.sharedClientState = this.Wa(e), this.persistence = this.Ga(e), await this.persistence.start(), this.localStore = this.za(e), this.gcScheduler = this.ja(e, this.localStore), this.indexBackfillerScheduler = this.Ha(e, this.localStore);
  }
  ja(e, t) {
    return null;
  }
  Ha(e, t) {
    return null;
  }
  za(e) {
    return Lg(this.persistence, new Ng(), e.initialUser, this.serializer);
  }
  Ga(e) {
    return new kg(Bs.Zr, this.serializer);
  }
  Wa(e) {
    return new qg();
  }
  async terminate() {
    var e, t;
    (e = this.gcScheduler) === null || e === void 0 || e.stop(), (t = this.indexBackfillerScheduler) === null || t === void 0 || t.stop(), this.sharedClientState.shutdown(), await this.persistence.shutdown();
  }
}
Kr.provider = {
  build: () => new Kr()
};
class ps {
  async initialize(e, t) {
    this.localStore || (this.localStore = e.localStore, this.sharedClientState = e.sharedClientState, this.datastore = this.createDatastore(t), this.remoteStore = this.createRemoteStore(t), this.eventManager = this.createEventManager(t), this.syncEngine = this.createSyncEngine(
      t,
      /* startAsPrimary=*/
      !e.synchronizeTabs
    ), this.sharedClientState.onlineStateHandler = (r) => lc(
      this.syncEngine,
      r,
      1
      /* OnlineStateSource.SharedClientState */
    ), this.remoteStore.remoteSyncer.handleCredentialChange = k_.bind(null, this.syncEngine), await c_(this.remoteStore, this.syncEngine.isPrimaryClient));
  }
  createEventManager(e) {
    return function() {
      return new l_();
    }();
  }
  createDatastore(e) {
    const t = ci(e.databaseInfo.databaseId), r = function(o) {
      return new Hg(o);
    }(e.databaseInfo);
    return function(o, a, u, h) {
      return new Qg(o, a, u, h);
    }(e.authCredentials, e.appCheckCredentials, r, t);
  }
  createRemoteStore(e) {
    return function(r, i, o, a, u) {
      return new Jg(r, i, o, a, u);
    }(this.localStore, this.datastore, e.asyncQueue, (t) => lc(
      this.syncEngine,
      t,
      0
      /* OnlineStateSource.RemoteStore */
    ), function() {
      return sc.D() ? new sc() : new $g();
    }());
  }
  createSyncEngine(e, t) {
    return function(i, o, a, u, h, d, m) {
      const w = new v_(i, o, a, u, h, d);
      return m && (w.Qa = !0), w;
    }(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, e.initialUser, e.maxConcurrentLimboResolutions, t);
  }
  async terminate() {
    var e, t;
    await async function(i) {
      const o = U(i);
      D("RemoteStore", "RemoteStore shutting down."), o.L_.add(
        5
        /* OfflineCause.Shutdown */
      ), await Zn(o), o.k_.shutdown(), // Set the OnlineState to Unknown (rather than Offline) to avoid potentially
      // triggering spurious listener events with cached data, etc.
      o.q_.set(
        "Unknown"
        /* OnlineState.Unknown */
      );
    }(this.remoteStore), (e = this.datastore) === null || e === void 0 || e.terminate(), (t = this.eventManager) === null || t === void 0 || t.terminate();
  }
}
ps.provider = {
  build: () => new ps()
};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class N_ {
  constructor(e) {
    this.observer = e, /**
     * When set to true, will not raise future events. Necessary to deal with
     * async detachment of listener.
     */
    this.muted = !1;
  }
  next(e) {
    this.muted || this.observer.next && this.Ya(this.observer.next, e);
  }
  error(e) {
    this.muted || (this.observer.error ? this.Ya(this.observer.error, e) : He("Uncaught Error in snapshot listener:", e.toString()));
  }
  Za() {
    this.muted = !0;
  }
  Ya(e, t) {
    setTimeout(() => {
      this.muted || e(t);
    }, 0);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class O_ {
  constructor(e, t, r, i, o) {
    this.authCredentials = e, this.appCheckCredentials = t, this.asyncQueue = r, this.databaseInfo = i, this.user = _e.UNAUTHENTICATED, this.clientId = gu.newId(), this.authCredentialListener = () => Promise.resolve(), this.appCheckCredentialListener = () => Promise.resolve(), this._uninitializedComponentsProvider = o, this.authCredentials.start(r, async (a) => {
      D("FirestoreClient", "Received user=", a.uid), await this.authCredentialListener(a), this.user = a;
    }), this.appCheckCredentials.start(r, (a) => (D("FirestoreClient", "Received new app check token=", a), this.appCheckCredentialListener(a, this.user)));
  }
  get configuration() {
    return {
      asyncQueue: this.asyncQueue,
      databaseInfo: this.databaseInfo,
      clientId: this.clientId,
      authCredentials: this.authCredentials,
      appCheckCredentials: this.appCheckCredentials,
      initialUser: this.user,
      maxConcurrentLimboResolutions: 100
    };
  }
  setCredentialChangeListener(e) {
    this.authCredentialListener = e;
  }
  setAppCheckTokenChangeListener(e) {
    this.appCheckCredentialListener = e;
  }
  terminate() {
    this.asyncQueue.enterRestrictedMode();
    const e = new ut();
    return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async () => {
      try {
        this._onlineComponents && await this._onlineComponents.terminate(), this._offlineComponents && await this._offlineComponents.terminate(), // The credentials provider must be terminated after shutting down the
        // RemoteStore as it will prevent the RemoteStore from retrieving auth
        // tokens.
        this.authCredentials.shutdown(), this.appCheckCredentials.shutdown(), e.resolve();
      } catch (t) {
        const r = Ks(t, "Failed to shutdown persistence");
        e.reject(r);
      }
    }), e.promise;
  }
}
async function Hi(n, e) {
  n.asyncQueue.verifyOperationInProgress(), D("FirestoreClient", "Initializing OfflineComponentProvider");
  const t = n.configuration;
  await e.initialize(t);
  let r = t.initialUser;
  n.setCredentialChangeListener(async (i) => {
    r.isEqual(i) || (await Qu(e.localStore, i), r = i);
  }), // When a user calls clearPersistence() in one client, all other clients
  // need to be terminated to allow the delete to succeed.
  e.persistence.setDatabaseDeletedListener(() => n.terminate()), n._offlineComponents = e;
}
async function dc(n, e) {
  n.asyncQueue.verifyOperationInProgress();
  const t = await L_(n);
  D("FirestoreClient", "Initializing OnlineComponentProvider"), await e.initialize(t, n.configuration), // The CredentialChangeListener of the online component provider takes
  // precedence over the offline component provider.
  n.setCredentialChangeListener((r) => oc(e.remoteStore, r)), n.setAppCheckTokenChangeListener((r, i) => oc(e.remoteStore, i)), n._onlineComponents = e;
}
async function L_(n) {
  if (!n._offlineComponents) if (n._uninitializedComponentsProvider) {
    D("FirestoreClient", "Using user provided OfflineComponentProvider");
    try {
      await Hi(n, n._uninitializedComponentsProvider._offline);
    } catch (e) {
      const t = e;
      if (!function(i) {
        return i.name === "FirebaseError" ? i.code === C.FAILED_PRECONDITION || i.code === C.UNIMPLEMENTED : !(typeof DOMException < "u" && i instanceof DOMException) || // When the browser is out of quota we could get either quota exceeded
        // or an aborted error depending on whether the error happened during
        // schema migration.
        i.code === 22 || i.code === 20 || // Firefox Private Browsing mode disables IndexedDb and returns
        // INVALID_STATE for any usage.
        i.code === 11;
      }(t)) throw t;
      Wt("Error using user provided cache. Falling back to memory cache: " + t), await Hi(n, new Kr());
    }
  } else D("FirestoreClient", "Using default OfflineComponentProvider"), await Hi(n, new Kr());
  return n._offlineComponents;
}
async function fl(n) {
  return n._onlineComponents || (n._uninitializedComponentsProvider ? (D("FirestoreClient", "Using user provided OnlineComponentProvider"), await dc(n, n._uninitializedComponentsProvider._online)) : (D("FirestoreClient", "Using default OnlineComponentProvider"), await dc(n, new ps()))), n._onlineComponents;
}
function M_(n) {
  return fl(n).then((e) => e.syncEngine);
}
async function x_(n) {
  const e = await fl(n), t = e.eventManager;
  return t.onListen = E_.bind(null, e.syncEngine), t.onUnlisten = w_.bind(null, e.syncEngine), t.onFirstRemoteStoreListen = T_.bind(null, e.syncEngine), t.onLastRemoteStoreUnlisten = A_.bind(null, e.syncEngine), t;
}
function F_(n, e, t = {}) {
  const r = new ut();
  return n.asyncQueue.enqueueAndForget(async () => function(o, a, u, h, d) {
    const m = new N_({
      next: (R) => {
        m.Za(), a.enqueueAndForget(() => d_(o, w));
        const P = R.docs.has(u);
        !P && R.fromCache ? (
          // TODO(dimond): If we're online and the document doesn't
          // exist then we resolve with a doc.exists set to false. If
          // we're offline however, we reject the Promise in this
          // case. Two options: 1) Cache the negative response from
          // the server so we can deliver that even when you're
          // offline 2) Actually reject the Promise in the online case
          // if the document doesn't exist.
          d.reject(new O(C.UNAVAILABLE, "Failed to get document because the client is offline."))
        ) : P && R.fromCache && h && h.source === "server" ? d.reject(new O(C.UNAVAILABLE, 'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')) : d.resolve(R);
      },
      error: (R) => d.reject(R)
    }), w = new m_(Os(u.path), m, {
      includeMetadataChanges: !0,
      _a: !0
    });
    return h_(o, w);
  }(await x_(n), n.asyncQueue, e, t, r)), r.promise;
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function pl(n) {
  const e = {};
  return n.timeoutSeconds !== void 0 && (e.timeoutSeconds = n.timeoutSeconds), e;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const fc = /* @__PURE__ */ new Map();
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ml(n, e, t) {
  if (!t) throw new O(C.INVALID_ARGUMENT, `Function ${n}() cannot be called with an empty ${e}.`);
}
function U_(n, e, t, r) {
  if (e === !0 && r === !0) throw new O(C.INVALID_ARGUMENT, `${n} and ${t} cannot be used together.`);
}
function pc(n) {
  if (!L.isDocumentKey(n)) throw new O(C.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`);
}
function mc(n) {
  if (L.isDocumentKey(n)) throw new O(C.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`);
}
function Ys(n) {
  if (n === void 0) return "undefined";
  if (n === null) return "null";
  if (typeof n == "string") return n.length > 20 && (n = `${n.substring(0, 20)}...`), JSON.stringify(n);
  if (typeof n == "number" || typeof n == "boolean") return "" + n;
  if (typeof n == "object") {
    if (n instanceof Array) return "an array";
    {
      const e = (
        /** try to get the constructor name for an object. */
        function(r) {
          return r.constructor ? r.constructor.name : null;
        }(n)
      );
      return e ? `a custom ${e} object` : "an object";
    }
  }
  return typeof n == "function" ? "a function" : x();
}
function Gr(n, e) {
  if ("_delegate" in n && // Unwrap Compat types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (n = n._delegate), !(n instanceof e)) {
    if (e.name === n.constructor.name) throw new O(C.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
    {
      const t = Ys(n);
      throw new O(C.INVALID_ARGUMENT, `Expected type '${e.name}', but it was: ${t}`);
    }
  }
  return n;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gc {
  constructor(e) {
    var t, r;
    if (e.host === void 0) {
      if (e.ssl !== void 0) throw new O(C.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
      this.host = "firestore.googleapis.com", this.ssl = !0;
    } else this.host = e.host, this.ssl = (t = e.ssl) === null || t === void 0 || t;
    if (this.credentials = e.credentials, this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties, this.localCache = e.localCache, e.cacheSizeBytes === void 0) this.cacheSizeBytes = 41943040;
    else {
      if (e.cacheSizeBytes !== -1 && e.cacheSizeBytes < 1048576) throw new O(C.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
      this.cacheSizeBytes = e.cacheSizeBytes;
    }
    U_("experimentalForceLongPolling", e.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", e.experimentalAutoDetectLongPolling), this.experimentalForceLongPolling = !!e.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = !1 : e.experimentalAutoDetectLongPolling === void 0 ? this.experimentalAutoDetectLongPolling = !0 : (
      // For backwards compatibility, coerce the value to boolean even though
      // the TypeScript compiler has narrowed the type to boolean already.
      // noinspection PointlessBooleanExpressionJS
      this.experimentalAutoDetectLongPolling = !!e.experimentalAutoDetectLongPolling
    ), this.experimentalLongPollingOptions = pl((r = e.experimentalLongPollingOptions) !== null && r !== void 0 ? r : {}), function(o) {
      if (o.timeoutSeconds !== void 0) {
        if (isNaN(o.timeoutSeconds)) throw new O(C.INVALID_ARGUMENT, `invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);
        if (o.timeoutSeconds < 5) throw new O(C.INVALID_ARGUMENT, `invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);
        if (o.timeoutSeconds > 30) throw new O(C.INVALID_ARGUMENT, `invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`);
      }
    }(this.experimentalLongPollingOptions), this.useFetchStreams = !!e.useFetchStreams;
  }
  isEqual(e) {
    return this.host === e.host && this.ssl === e.ssl && this.credentials === e.credentials && this.cacheSizeBytes === e.cacheSizeBytes && this.experimentalForceLongPolling === e.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === e.experimentalAutoDetectLongPolling && function(r, i) {
      return r.timeoutSeconds === i.timeoutSeconds;
    }(this.experimentalLongPollingOptions, e.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === e.ignoreUndefinedProperties && this.useFetchStreams === e.useFetchStreams;
  }
}
class hi {
  /** @hideconstructor */
  constructor(e, t, r, i) {
    this._authCredentials = e, this._appCheckCredentials = t, this._databaseId = r, this._app = i, /**
     * Whether it's a Firestore or Firestore Lite instance.
     */
    this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new gc({}), this._settingsFrozen = !1, // A task that is assigned when the terminate() is invoked and resolved when
    // all components have shut down. Otherwise, Firestore is not terminated,
    // which can mean either the FirestoreClient is in the process of starting,
    // or restarting.
    this._terminateTask = "notTerminated";
  }
  /**
   * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
   * instance.
   */
  get app() {
    if (!this._app) throw new O(C.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
    return this._app;
  }
  get _initialized() {
    return this._settingsFrozen;
  }
  get _terminated() {
    return this._terminateTask !== "notTerminated";
  }
  _setSettings(e) {
    if (this._settingsFrozen) throw new O(C.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
    this._settings = new gc(e), e.credentials !== void 0 && (this._authCredentials = function(r) {
      if (!r) return new Jp();
      switch (r.type) {
        case "firstParty":
          return new tm(r.sessionIndex || "0", r.iamToken || null, r.authTokenFactory || null);
        case "provider":
          return r.client;
        default:
          throw new O(C.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
      }
    }(e.credentials));
  }
  _getSettings() {
    return this._settings;
  }
  _freezeSettings() {
    return this._settingsFrozen = !0, this._settings;
  }
  _delete() {
    return this._terminateTask === "notTerminated" && (this._terminateTask = this._terminate()), this._terminateTask;
  }
  async _restart() {
    this._terminateTask === "notTerminated" ? await this._terminate() : this._terminateTask = "notTerminated";
  }
  /** Returns a JSON-serializable representation of this `Firestore` instance. */
  toJSON() {
    return {
      app: this._app,
      databaseId: this._databaseId,
      settings: this._settings
    };
  }
  /**
   * Terminates all components used by this client. Subclasses can override
   * this method to clean up their own dependencies, but must also call this
   * method.
   *
   * Only ever called once.
   */
  _terminate() {
    return function(t) {
      const r = fc.get(t);
      r && (D("ComponentProvider", "Removing Datastore"), fc.delete(t), r.terminate());
    }(this), Promise.resolve();
  }
}
function B_(n, e, t, r = {}) {
  var i;
  const o = (n = Gr(n, hi))._getSettings(), a = `${e}:${t}`;
  if (o.host !== "firestore.googleapis.com" && o.host !== a && Wt("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."), n._setSettings(Object.assign(Object.assign({}, o), {
    host: a,
    ssl: !1
  })), r.mockUserToken) {
    let u, h;
    if (typeof r.mockUserToken == "string") u = r.mockUserToken, h = _e.MOCK_USER;
    else {
      u = _h(r.mockUserToken, (i = n._app) === null || i === void 0 ? void 0 : i.options.projectId);
      const d = r.mockUserToken.sub || r.mockUserToken.user_id;
      if (!d) throw new O(C.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
      h = new _e(d);
    }
    n._authCredentials = new Xp(new mu(u, h));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Js {
  // This is the lite version of the Query class in the main SDK.
  /** @hideconstructor protected */
  constructor(e, t, r) {
    this.converter = t, this._query = r, /** The type of this Firestore reference. */
    this.type = "query", this.firestore = e;
  }
  withConverter(e) {
    return new Js(this.firestore, e, this._query);
  }
}
class Se {
  /** @hideconstructor */
  constructor(e, t, r) {
    this.converter = t, this._key = r, /** The type of this Firestore reference. */
    this.type = "document", this.firestore = e;
  }
  get _path() {
    return this._key.path;
  }
  /**
   * The document's identifier within its collection.
   */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  get path() {
    return this._key.path.canonicalString();
  }
  /**
   * The collection this `DocumentReference` belongs to.
   */
  get parent() {
    return new lt(this.firestore, this.converter, this._key.path.popLast());
  }
  withConverter(e) {
    return new Se(this.firestore, e, this._key);
  }
}
class lt extends Js {
  /** @hideconstructor */
  constructor(e, t, r) {
    super(e, t, Os(r)), this._path = r, /** The type of this Firestore reference. */
    this.type = "collection";
  }
  /** The collection's identifier. */
  get id() {
    return this._query.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced collection (relative
   * to the root of the database).
   */
  get path() {
    return this._query.path.canonicalString();
  }
  /**
   * A reference to the containing `DocumentReference` if this is a
   * subcollection. If this isn't a subcollection, the reference is null.
   */
  get parent() {
    const e = this._path.popLast();
    return e.isEmpty() ? null : new Se(
      this.firestore,
      /* converter= */
      null,
      new L(e)
    );
  }
  withConverter(e) {
    return new lt(this.firestore, e, this._path);
  }
}
function j_(n, e, ...t) {
  if (n = Ie(n), ml("collection", "path", e), n instanceof hi) {
    const r = J.fromString(e, ...t);
    return mc(r), new lt(
      n,
      /* converter= */
      null,
      r
    );
  }
  {
    if (!(n instanceof Se || n instanceof lt)) throw new O(C.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const r = n._path.child(J.fromString(e, ...t));
    return mc(r), new lt(
      n.firestore,
      /* converter= */
      null,
      r
    );
  }
}
function q_(n, e, ...t) {
  if (n = Ie(n), // We allow omission of 'pathString' but explicitly prohibit passing in both
  // 'undefined' and 'null'.
  arguments.length === 1 && (e = gu.newId()), ml("doc", "path", e), n instanceof hi) {
    const r = J.fromString(e, ...t);
    return pc(r), new Se(
      n,
      /* converter= */
      null,
      new L(r)
    );
  }
  {
    if (!(n instanceof Se || n instanceof lt)) throw new O(C.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const r = n._path.child(J.fromString(e, ...t));
    return pc(r), new Se(n.firestore, n instanceof lt ? n.converter : null, new L(r));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class _c {
  constructor(e = Promise.resolve()) {
    this.Pu = [], // Is this AsyncQueue being shut down? Once it is set to true, it will not
    // be changed again.
    this.Iu = !1, // Operations scheduled to be queued in the future. Operations are
    // automatically removed after they are run or canceled.
    this.Tu = [], // visible for testing
    this.Eu = null, // Flag set while there's an outstanding AsyncQueue operation, used for
    // assertion sanity-checks.
    this.du = !1, // Enabled during shutdown on Safari to prevent future access to IndexedDB.
    this.Au = !1, // List of TimerIds to fast-forward delays for.
    this.Ru = [], // Backoff timer used to schedule retries for retryable operations
    this.t_ = new Ju(
      this,
      "async_queue_retry"
      /* TimerId.AsyncQueueRetry */
    ), // Visibility handler that triggers an immediate retry of all retryable
    // operations. Meant to speed up recovery when we regain file system access
    // after page comes into foreground.
    this.Vu = () => {
      const r = Wi();
      r && D("AsyncQueue", "Visibility state changed to " + r.visibilityState), this.t_.jo();
    }, this.mu = e;
    const t = Wi();
    t && typeof t.addEventListener == "function" && t.addEventListener("visibilitychange", this.Vu);
  }
  get isShuttingDown() {
    return this.Iu;
  }
  /**
   * Adds a new operation to the queue without waiting for it to complete (i.e.
   * we ignore the Promise result).
   */
  enqueueAndForget(e) {
    this.enqueue(e);
  }
  enqueueAndForgetEvenWhileRestricted(e) {
    this.fu(), // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.gu(e);
  }
  enterRestrictedMode(e) {
    if (!this.Iu) {
      this.Iu = !0, this.Au = e || !1;
      const t = Wi();
      t && typeof t.removeEventListener == "function" && t.removeEventListener("visibilitychange", this.Vu);
    }
  }
  enqueue(e) {
    if (this.fu(), this.Iu)
      return new Promise(() => {
      });
    const t = new ut();
    return this.gu(() => this.Iu && this.Au ? Promise.resolve() : (e().then(t.resolve, t.reject), t.promise)).then(() => t.promise);
  }
  enqueueRetryable(e) {
    this.enqueueAndForget(() => (this.Pu.push(e), this.pu()));
  }
  /**
   * Runs the next operation from the retryable queue. If the operation fails,
   * reschedules with backoff.
   */
  async pu() {
    if (this.Pu.length !== 0) {
      try {
        await this.Pu[0](), this.Pu.shift(), this.t_.reset();
      } catch (e) {
        if (!Yn(e)) throw e;
        D("AsyncQueue", "Operation failed with retryable error: " + e);
      }
      this.Pu.length > 0 && // If there are additional operations, we re-schedule `retryNextOp()`.
      // This is necessary to run retryable operations that failed during
      // their initial attempt since we don't know whether they are already
      // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
      // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
      // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
      // call scheduled here.
      // Since `backoffAndRun()` cancels an existing backoff and schedules a
      // new backoff on every call, there is only ever a single additional
      // operation in the queue.
      this.t_.Go(() => this.pu());
    }
  }
  gu(e) {
    const t = this.mu.then(() => (this.du = !0, e().catch((r) => {
      this.Eu = r, this.du = !1;
      const i = (
        /**
        * Chrome includes Error.message in Error.stack. Other browsers do not.
        * This returns expected output of message + stack when available.
        * @param error - Error or FirestoreError
        */
        function(a) {
          let u = a.message || "";
          return a.stack && (u = a.stack.includes(a.message) ? a.stack : a.message + `
` + a.stack), u;
        }(r)
      );
      throw He("INTERNAL UNHANDLED ERROR: ", i), r;
    }).then((r) => (this.du = !1, r))));
    return this.mu = t, t;
  }
  enqueueAfterDelay(e, t, r) {
    this.fu(), // Fast-forward delays for timerIds that have been overridden.
    this.Ru.indexOf(e) > -1 && (t = 0);
    const i = Hs.createAndSchedule(this, e, t, r, (o) => this.yu(o));
    return this.Tu.push(i), i;
  }
  fu() {
    this.Eu && x();
  }
  verifyOperationInProgress() {
  }
  /**
   * Waits until all currently queued tasks are finished executing. Delayed
   * operations are not run.
   */
  async wu() {
    let e;
    do
      e = this.mu, await e;
    while (e !== this.mu);
  }
  /**
   * For Tests: Determine if a delayed operation with a particular TimerId
   * exists.
   */
  Su(e) {
    for (const t of this.Tu) if (t.timerId === e) return !0;
    return !1;
  }
  /**
   * For Tests: Runs some or all delayed operations early.
   *
   * @param lastTimerId - Delayed operations up to and including this TimerId
   * will be drained. Pass TimerId.All to run all delayed operations.
   * @returns a Promise that resolves once all operations have been run.
   */
  bu(e) {
    return this.wu().then(() => {
      this.Tu.sort((t, r) => t.targetTimeMs - r.targetTimeMs);
      for (const t of this.Tu) if (t.skipDelay(), e !== "all" && t.timerId === e) break;
      return this.wu();
    });
  }
  /**
   * For Tests: Skip all subsequent delays for a timer id.
   */
  Du(e) {
    this.Ru.push(e);
  }
  /** Called once a DelayedOperation is run or canceled. */
  yu(e) {
    const t = this.Tu.indexOf(e);
    this.Tu.splice(t, 1);
  }
}
class Xs extends hi {
  /** @hideconstructor */
  constructor(e, t, r, i) {
    super(e, t, r, i), /**
     * Whether it's a {@link Firestore} or Firestore Lite instance.
     */
    this.type = "firestore", this._queue = new _c(), this._persistenceKey = (i == null ? void 0 : i.name) || "[DEFAULT]";
  }
  async _terminate() {
    if (this._firestoreClient) {
      const e = this._firestoreClient.terminate();
      this._queue = new _c(e), this._firestoreClient = void 0, await e;
    }
  }
}
function $_(n, e) {
  const t = typeof n == "object" ? n : Pc(), r = typeof n == "string" ? n : "(default)", i = _s(t, "firestore").getImmediate({
    identifier: r
  });
  if (!i._initialized) {
    const o = mh("firestore");
    o && B_(i, ...o);
  }
  return i;
}
function gl(n) {
  if (n._terminated) throw new O(C.FAILED_PRECONDITION, "The client has already been terminated.");
  return n._firestoreClient || z_(n), n._firestoreClient;
}
function z_(n) {
  var e, t, r;
  const i = n._freezeSettings(), o = function(u, h, d, m) {
    return new pm(u, h, d, m.host, m.ssl, m.experimentalForceLongPolling, m.experimentalAutoDetectLongPolling, pl(m.experimentalLongPollingOptions), m.useFetchStreams);
  }(n._databaseId, ((e = n._app) === null || e === void 0 ? void 0 : e.options.appId) || "", n._persistenceKey, i);
  n._componentsProvider || !((t = i.localCache) === null || t === void 0) && t._offlineComponentProvider && (!((r = i.localCache) === null || r === void 0) && r._onlineComponentProvider) && (n._componentsProvider = {
    _offline: i.localCache._offlineComponentProvider,
    _online: i.localCache._onlineComponentProvider
  }), n._firestoreClient = new O_(n._authCredentials, n._appCheckCredentials, n._queue, o, n._componentsProvider && function(u) {
    const h = u == null ? void 0 : u._online.build();
    return {
      _offline: u == null ? void 0 : u._offline.build(h),
      _online: h
    };
  }(n._componentsProvider));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Jt {
  /** @hideconstructor */
  constructor(e) {
    this._byteString = e;
  }
  /**
   * Creates a new `Bytes` object from the given Base64 string, converting it to
   * bytes.
   *
   * @param base64 - The Base64 string used to create the `Bytes` object.
   */
  static fromBase64String(e) {
    try {
      return new Jt(he.fromBase64String(e));
    } catch (t) {
      throw new O(C.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + t);
    }
  }
  /**
   * Creates a new `Bytes` object from the given Uint8Array.
   *
   * @param array - The Uint8Array used to create the `Bytes` object.
   */
  static fromUint8Array(e) {
    return new Jt(he.fromUint8Array(e));
  }
  /**
   * Returns the underlying bytes as a Base64-encoded string.
   *
   * @returns The Base64-encoded string created from the `Bytes` object.
   */
  toBase64() {
    return this._byteString.toBase64();
  }
  /**
   * Returns the underlying bytes in a new `Uint8Array`.
   *
   * @returns The Uint8Array created from the `Bytes` object.
   */
  toUint8Array() {
    return this._byteString.toUint8Array();
  }
  /**
   * Returns a string representation of the `Bytes` object.
   *
   * @returns A string representation of the `Bytes` object.
   */
  toString() {
    return "Bytes(base64: " + this.toBase64() + ")";
  }
  /**
   * Returns true if this `Bytes` object is equal to the provided one.
   *
   * @param other - The `Bytes` object to compare against.
   * @returns true if this `Bytes` object is equal to the provided one.
   */
  isEqual(e) {
    return this._byteString.isEqual(e._byteString);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Zs {
  /**
   * Creates a `FieldPath` from the provided field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   *
   * @param fieldNames - A list of field names.
   */
  constructor(...e) {
    for (let t = 0; t < e.length; ++t) if (e[t].length === 0) throw new O(C.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
    this._internalPath = new ue(e);
  }
  /**
   * Returns true if this `FieldPath` is equal to the provided one.
   *
   * @param other - The `FieldPath` to compare against.
   * @returns true if this `FieldPath` is equal to the provided one.
   */
  isEqual(e) {
    return this._internalPath.isEqual(e._internalPath);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class eo {
  /**
   * @param _methodName - The public API endpoint that returns this class.
   * @hideconstructor
   */
  constructor(e) {
    this._methodName = e;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class to {
  /**
   * Creates a new immutable `GeoPoint` object with the provided latitude and
   * longitude values.
   * @param latitude - The latitude as number between -90 and 90.
   * @param longitude - The longitude as number between -180 and 180.
   */
  constructor(e, t) {
    if (!isFinite(e) || e < -90 || e > 90) throw new O(C.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + e);
    if (!isFinite(t) || t < -180 || t > 180) throw new O(C.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + t);
    this._lat = e, this._long = t;
  }
  /**
   * The latitude of this `GeoPoint` instance.
   */
  get latitude() {
    return this._lat;
  }
  /**
   * The longitude of this `GeoPoint` instance.
   */
  get longitude() {
    return this._long;
  }
  /**
   * Returns true if this `GeoPoint` is equal to the provided one.
   *
   * @param other - The `GeoPoint` to compare against.
   * @returns true if this `GeoPoint` is equal to the provided one.
   */
  isEqual(e) {
    return this._lat === e._lat && this._long === e._long;
  }
  /** Returns a JSON-serializable representation of this GeoPoint. */
  toJSON() {
    return {
      latitude: this._lat,
      longitude: this._long
    };
  }
  /**
   * Actually private to JS consumers of our API, so this function is prefixed
   * with an underscore.
   */
  _compareTo(e) {
    return z(this._lat, e._lat) || z(this._long, e._long);
  }
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class no {
  /**
   * @private
   * @internal
   */
  constructor(e) {
    this._values = (e || []).map((t) => t);
  }
  /**
   * Returns a copy of the raw number array form of the vector.
   */
  toArray() {
    return this._values.map((e) => e);
  }
  /**
   * Returns `true` if the two VectorValue has the same raw number arrays, returns `false` otherwise.
   */
  isEqual(e) {
    return function(r, i) {
      if (r.length !== i.length) return !1;
      for (let o = 0; o < r.length; ++o) if (r[o] !== i[o]) return !1;
      return !0;
    }(this._values, e._values);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const W_ = /^__.*__$/;
class H_ {
  constructor(e, t, r) {
    this.data = e, this.fieldMask = t, this.fieldTransforms = r;
  }
  toMutation(e, t) {
    return this.fieldMask !== null ? new Ct(e, this.data, this.fieldMask, t, this.fieldTransforms) : new Jn(e, this.data, t, this.fieldTransforms);
  }
}
function _l(n) {
  switch (n) {
    case 0:
    case 2:
    case 1:
      return !0;
    case 3:
    case 4:
      return !1;
    default:
      throw x();
  }
}
class ro {
  /**
   * Initializes a ParseContext with the given source and path.
   *
   * @param settings - The settings for the parser.
   * @param databaseId - The database ID of the Firestore instance.
   * @param serializer - The serializer to use to generate the Value proto.
   * @param ignoreUndefinedProperties - Whether to ignore undefined properties
   * rather than throw.
   * @param fieldTransforms - A mutable list of field transforms encountered
   * while parsing the data.
   * @param fieldMask - A mutable list of field paths encountered while parsing
   * the data.
   *
   * TODO(b/34871131): We don't support array paths right now, so path can be
   * null to indicate the context represents any location within an array (in
   * which case certain features will not work and errors will be somewhat
   * compromised).
   */
  constructor(e, t, r, i, o, a) {
    this.settings = e, this.databaseId = t, this.serializer = r, this.ignoreUndefinedProperties = i, // Minor hack: If fieldTransforms is undefined, we assume this is an
    // external call and we need to validate the entire path.
    o === void 0 && this.vu(), this.fieldTransforms = o || [], this.fieldMask = a || [];
  }
  get path() {
    return this.settings.path;
  }
  get Cu() {
    return this.settings.Cu;
  }
  /** Returns a new context with the specified settings overwritten. */
  Fu(e) {
    return new ro(Object.assign(Object.assign({}, this.settings), e), this.databaseId, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
  }
  Mu(e) {
    var t;
    const r = (t = this.path) === null || t === void 0 ? void 0 : t.child(e), i = this.Fu({
      path: r,
      xu: !1
    });
    return i.Ou(e), i;
  }
  Nu(e) {
    var t;
    const r = (t = this.path) === null || t === void 0 ? void 0 : t.child(e), i = this.Fu({
      path: r,
      xu: !1
    });
    return i.vu(), i;
  }
  Lu(e) {
    return this.Fu({
      path: void 0,
      xu: !0
    });
  }
  Bu(e) {
    return Qr(e, this.settings.methodName, this.settings.ku || !1, this.path, this.settings.qu);
  }
  /** Returns 'true' if 'fieldPath' was traversed when creating this context. */
  contains(e) {
    return this.fieldMask.find((t) => e.isPrefixOf(t)) !== void 0 || this.fieldTransforms.find((t) => e.isPrefixOf(t.field)) !== void 0;
  }
  vu() {
    if (this.path) for (let e = 0; e < this.path.length; e++) this.Ou(this.path.get(e));
  }
  Ou(e) {
    if (e.length === 0) throw this.Bu("Document fields must not be empty");
    if (_l(this.Cu) && W_.test(e)) throw this.Bu('Document fields cannot begin and end with "__"');
  }
}
class K_ {
  constructor(e, t, r) {
    this.databaseId = e, this.ignoreUndefinedProperties = t, this.serializer = r || ci(e);
  }
  /** Creates a new top-level parse context. */
  Qu(e, t, r, i = !1) {
    return new ro({
      Cu: e,
      methodName: t,
      qu: r,
      path: ue.emptyPath(),
      xu: !1,
      ku: i
    }, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
  }
}
function G_(n) {
  const e = n._freezeSettings(), t = ci(n._databaseId);
  return new K_(n._databaseId, !!e.ignoreUndefinedProperties, t);
}
function Q_(n, e, t, r, i, o = {}) {
  const a = n.Qu(o.merge || o.mergeFields ? 2 : 0, e, t, i);
  Tl("Data must be an object, but it was:", a, r);
  const u = vl(r, a);
  let h, d;
  if (o.merge) h = new Ce(a.fieldMask), d = a.fieldTransforms;
  else if (o.mergeFields) {
    const m = [];
    for (const w of o.mergeFields) {
      const R = Y_(e, w, t);
      if (!a.contains(R)) throw new O(C.INVALID_ARGUMENT, `Field '${R}' is specified in your field mask but missing from your input data.`);
      X_(m, R) || m.push(R);
    }
    h = new Ce(m), d = a.fieldTransforms.filter((w) => h.covers(w.field));
  } else h = null, d = a.fieldTransforms;
  return new H_(new Re(u), h, d);
}
class io extends eo {
  _toFieldTransform(e) {
    return new Bm(e.path, new jn());
  }
  isEqual(e) {
    return e instanceof io;
  }
}
function yl(n, e) {
  if (El(
    // Unwrap the API type from the Compat SDK. This will return the API type
    // from firestore-exp.
    n = Ie(n)
  )) return Tl("Unsupported field value:", e, n), vl(n, e);
  if (n instanceof eo)
    return function(r, i) {
      if (!_l(i.Cu)) throw i.Bu(`${r._methodName}() can only be used with update() and set()`);
      if (!i.path) throw i.Bu(`${r._methodName}() is not currently supported inside arrays`);
      const o = r._toFieldTransform(i);
      o && i.fieldTransforms.push(o);
    }(n, e), null;
  if (n === void 0 && e.ignoreUndefinedProperties)
    return null;
  if (
    // If context.path is null we are inside an array and we don't support
    // field mask paths more granular than the top-level array.
    e.path && e.fieldMask.push(e.path), n instanceof Array
  ) {
    if (e.settings.xu && e.Cu !== 4) throw e.Bu("Nested arrays are not supported");
    return function(r, i) {
      const o = [];
      let a = 0;
      for (const u of r) {
        let h = yl(u, i.Lu(a));
        h == null && // Just include nulls in the array for fields being replaced with a
        // sentinel.
        (h = {
          nullValue: "NULL_VALUE"
        }), o.push(h), a++;
      }
      return {
        arrayValue: {
          values: o
        }
      };
    }(n, e);
  }
  return function(r, i) {
    if ((r = Ie(r)) === null) return {
      nullValue: "NULL_VALUE"
    };
    if (typeof r == "number") return xm(i.serializer, r);
    if (typeof r == "boolean") return {
      booleanValue: r
    };
    if (typeof r == "string") return {
      stringValue: r
    };
    if (r instanceof Date) {
      const o = se.fromDate(r);
      return {
        timestampValue: Wr(i.serializer, o)
      };
    }
    if (r instanceof se) {
      const o = new se(r.seconds, 1e3 * Math.floor(r.nanoseconds / 1e3));
      return {
        timestampValue: Wr(i.serializer, o)
      };
    }
    if (r instanceof to) return {
      geoPointValue: {
        latitude: r.latitude,
        longitude: r.longitude
      }
    };
    if (r instanceof Jt) return {
      bytesValue: qu(i.serializer, r._byteString)
    };
    if (r instanceof Se) {
      const o = i.databaseId, a = r.firestore._databaseId;
      if (!a.isEqual(o)) throw i.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${o.projectId}/${o.database}`);
      return {
        referenceValue: Fs(r.firestore._databaseId || i.databaseId, r._key.path)
      };
    }
    if (r instanceof no)
      return function(a, u) {
        return {
          mapValue: {
            fields: {
              __type__: {
                stringValue: "__vector__"
              },
              value: {
                arrayValue: {
                  values: a.toArray().map((h) => {
                    if (typeof h != "number") throw u.Bu("VectorValues must only contain numeric values.");
                    return Ls(u.serializer, h);
                  })
                }
              }
            }
          }
        };
      }(r, i);
    throw i.Bu(`Unsupported field value: ${Ys(r)}`);
  }(n, e);
}
function vl(n, e) {
  const t = {};
  return _u(n) ? (
    // If we encounter an empty object, we explicitly add it to the update
    // mask to ensure that the server creates a map entry.
    e.path && e.path.length > 0 && e.fieldMask.push(e.path)
  ) : nn(n, (r, i) => {
    const o = yl(i, e.Mu(r));
    o != null && (t[r] = o);
  }), {
    mapValue: {
      fields: t
    }
  };
}
function El(n) {
  return !(typeof n != "object" || n === null || n instanceof Array || n instanceof Date || n instanceof se || n instanceof to || n instanceof Jt || n instanceof Se || n instanceof eo || n instanceof no);
}
function Tl(n, e, t) {
  if (!El(t) || !function(i) {
    return typeof i == "object" && i !== null && (Object.getPrototypeOf(i) === Object.prototype || Object.getPrototypeOf(i) === null);
  }(t)) {
    const r = Ys(t);
    throw r === "an object" ? e.Bu(n + " a custom object") : e.Bu(n + " " + r);
  }
}
function Y_(n, e, t) {
  if (
    // If required, replace the FieldPath Compat class with the firestore-exp
    // FieldPath.
    (e = Ie(e)) instanceof Zs
  ) return e._internalPath;
  if (typeof e == "string") return Il(n, e);
  throw Qr(
    "Field path arguments must be of type string or ",
    n,
    /* hasConverter= */
    !1,
    /* path= */
    void 0,
    t
  );
}
const J_ = new RegExp("[~\\*/\\[\\]]");
function Il(n, e, t) {
  if (e.search(J_) >= 0) throw Qr(
    `Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,
    n,
    /* hasConverter= */
    !1,
    /* path= */
    void 0,
    t
  );
  try {
    return new Zs(...e.split("."))._internalPath;
  } catch {
    throw Qr(
      `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
      n,
      /* hasConverter= */
      !1,
      /* path= */
      void 0,
      t
    );
  }
}
function Qr(n, e, t, r, i) {
  const o = r && !r.isEmpty(), a = i !== void 0;
  let u = `Function ${e}() called with invalid data`;
  t && (u += " (via `toFirestore()`)"), u += ". ";
  let h = "";
  return (o || a) && (h += " (found", o && (h += ` in field ${r}`), a && (h += ` in document ${i}`), h += ")"), new O(C.INVALID_ARGUMENT, u + n + h);
}
function X_(n, e) {
  return n.some((t) => t.isEqual(e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class wl {
  // Note: This class is stripped down version of the DocumentSnapshot in
  // the legacy SDK. The changes are:
  // - No support for SnapshotMetadata.
  // - No support for SnapshotOptions.
  /** @hideconstructor protected */
  constructor(e, t, r, i, o) {
    this._firestore = e, this._userDataWriter = t, this._key = r, this._document = i, this._converter = o;
  }
  /** Property of the `DocumentSnapshot` that provides the document's ID. */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * The `DocumentReference` for the document included in the `DocumentSnapshot`.
   */
  get ref() {
    return new Se(this._firestore, this._converter, this._key);
  }
  /**
   * Signals whether or not the document at the snapshot's location exists.
   *
   * @returns true if the document exists.
   */
  exists() {
    return this._document !== null;
  }
  /**
   * Retrieves all fields in the document as an `Object`. Returns `undefined` if
   * the document doesn't exist.
   *
   * @returns An `Object` containing all fields in the document or `undefined`
   * if the document doesn't exist.
   */
  data() {
    if (this._document) {
      if (this._converter) {
        const e = new Z_(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          /* converter= */
          null
        );
        return this._converter.fromFirestore(e);
      }
      return this._userDataWriter.convertValue(this._document.data.value);
    }
  }
  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
   * field.
   * @returns The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  // We are using `any` here to avoid an explicit cast by our users.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(e) {
    if (this._document) {
      const t = this._document.data.field(Al("DocumentSnapshot.get", e));
      if (t !== null) return this._userDataWriter.convertValue(t);
    }
  }
}
class Z_ extends wl {
  /**
   * Retrieves all fields in the document as an `Object`.
   *
   * @override
   * @returns An `Object` containing all fields in the document.
   */
  data() {
    return super.data();
  }
}
function Al(n, e) {
  return typeof e == "string" ? Il(n, e) : e instanceof Zs ? e._internalPath : e._delegate._internalPath;
}
class ey {
  convertValue(e, t = "none") {
    switch (St(e)) {
      case 0:
        return null;
      case 1:
        return e.booleanValue;
      case 2:
        return ne(e.integerValue || e.doubleValue);
      case 3:
        return this.convertTimestamp(e.timestampValue);
      case 4:
        return this.convertServerTimestamp(e, t);
      case 5:
        return e.stringValue;
      case 6:
        return this.convertBytes(Rt(e.bytesValue));
      case 7:
        return this.convertReference(e.referenceValue);
      case 8:
        return this.convertGeoPoint(e.geoPointValue);
      case 9:
        return this.convertArray(e.arrayValue, t);
      case 11:
        return this.convertObject(e.mapValue, t);
      case 10:
        return this.convertVectorValue(e.mapValue);
      default:
        throw x();
    }
  }
  convertObject(e, t) {
    return this.convertObjectMap(e.fields, t);
  }
  /**
   * @internal
   */
  convertObjectMap(e, t = "none") {
    const r = {};
    return nn(e, (i, o) => {
      r[i] = this.convertValue(o, t);
    }), r;
  }
  /**
   * @internal
   */
  convertVectorValue(e) {
    var t, r, i;
    const o = (i = (r = (t = e.fields) === null || t === void 0 ? void 0 : t.value.arrayValue) === null || r === void 0 ? void 0 : r.values) === null || i === void 0 ? void 0 : i.map((a) => ne(a.doubleValue));
    return new no(o);
  }
  convertGeoPoint(e) {
    return new to(ne(e.latitude), ne(e.longitude));
  }
  convertArray(e, t) {
    return (e.values || []).map((r) => this.convertValue(r, t));
  }
  convertServerTimestamp(e, t) {
    switch (t) {
      case "previous":
        const r = ks(e);
        return r == null ? null : this.convertValue(r, t);
      case "estimate":
        return this.convertTimestamp(Fn(e));
      default:
        return null;
    }
  }
  convertTimestamp(e) {
    const t = dt(e);
    return new se(t.seconds, t.nanos);
  }
  convertDocumentKey(e, t) {
    const r = J.fromString(e);
    G(Gu(r));
    const i = new Un(r.get(1), r.get(3)), o = new L(r.popFirst(5));
    return i.isEqual(t) || // TODO(b/64130202): Somehow support foreign references.
    He(`Document ${o} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`), o;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function ty(n, e, t) {
  let r;
  return r = n ? n.toFirestore(e) : e, r;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ny {
  /** @hideconstructor */
  constructor(e, t) {
    this.hasPendingWrites = e, this.fromCache = t;
  }
  /**
   * Returns true if this `SnapshotMetadata` is equal to the provided one.
   *
   * @param other - The `SnapshotMetadata` to compare against.
   * @returns true if this `SnapshotMetadata` is equal to the provided one.
   */
  isEqual(e) {
    return this.hasPendingWrites === e.hasPendingWrites && this.fromCache === e.fromCache;
  }
}
class Rl extends wl {
  /** @hideconstructor protected */
  constructor(e, t, r, i, o, a) {
    super(e, t, r, i, a), this._firestore = e, this._firestoreImpl = e, this.metadata = o;
  }
  /**
   * Returns whether or not the data exists. True if the document exists.
   */
  exists() {
    return super.exists();
  }
  /**
   * Retrieves all fields in the document as an `Object`. Returns `undefined` if
   * the document doesn't exist.
   *
   * By default, `serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @param options - An options object to configure how data is retrieved from
   * the snapshot (for example the desired behavior for server timestamps that
   * have not yet been set to their final value).
   * @returns An `Object` containing all fields in the document or `undefined` if
   * the document doesn't exist.
   */
  data(e = {}) {
    if (this._document) {
      if (this._converter) {
        const t = new ry(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          this.metadata,
          /* converter= */
          null
        );
        return this._converter.fromFirestore(t, e);
      }
      return this._userDataWriter.convertValue(this._document.data.value, e.serverTimestamps);
    }
  }
  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * By default, a `serverTimestamp()` that has not yet been set to
   * its final value will be returned as `null`. You can override this by
   * passing an options object.
   *
   * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
   * field.
   * @param options - An options object to configure how the field is retrieved
   * from the snapshot (for example the desired behavior for server timestamps
   * that have not yet been set to their final value).
   * @returns The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  // We are using `any` here to avoid an explicit cast by our users.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(e, t = {}) {
    if (this._document) {
      const r = this._document.data.field(Al("DocumentSnapshot.get", e));
      if (r !== null) return this._userDataWriter.convertValue(r, t.serverTimestamps);
    }
  }
}
class ry extends Rl {
  /**
   * Retrieves all fields in the document as an `Object`.
   *
   * By default, `serverTimestamp()` values that have not yet been
   * set to their final value will be returned as `null`. You can override
   * this by passing an options object.
   *
   * @override
   * @param options - An options object to configure how data is retrieved from
   * the snapshot (for example the desired behavior for server timestamps that
   * have not yet been set to their final value).
   * @returns An `Object` containing all fields in the document.
   */
  data(e = {}) {
    return super.data(e);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ty(n) {
  n = Gr(n, Se);
  const e = Gr(n.firestore, Xs);
  return F_(gl(e), n._key).then((t) => ay(e, n, t));
}
class iy extends ey {
  constructor(e) {
    super(), this.firestore = e;
  }
  convertBytes(e) {
    return new Jt(e);
  }
  convertReference(e) {
    const t = this.convertDocumentKey(e, this.firestore._databaseId);
    return new Se(
      this.firestore,
      /* converter= */
      null,
      t
    );
  }
}
function sy(n, e) {
  const t = Gr(n.firestore, Xs), r = q_(n), i = ty(n.converter, e);
  return oy(t, [Q_(G_(n.firestore), "addDoc", r._key, i, n.converter !== null, {}).toMutation(r._key, $e.exists(!1))]).then(() => r);
}
function oy(n, e) {
  return function(r, i) {
    const o = new ut();
    return r.asyncQueue.enqueueAndForget(async () => R_(await M_(r), i, o)), o.promise;
  }(gl(n), e);
}
function ay(n, e, t) {
  const r = t.docs.get(e._key), i = new iy(n);
  return new Rl(n, i, e._key, r, new ny(t.hasPendingWrites, t.fromCache), e.converter);
}
function cy() {
  return new io("serverTimestamp");
}
(function(e, t = !0) {
  (function(i) {
    tn = i;
  })(Xt), $t(new It("firestore", (r, { instanceIdentifier: i, options: o }) => {
    const a = r.getProvider("app").getImmediate(), u = new Xs(new Zp(r.getProvider("auth-internal")), new rm(r.getProvider("app-check-internal")), function(d, m) {
      if (!Object.prototype.hasOwnProperty.apply(d.options, ["projectId"])) throw new O(C.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
      return new Un(d.options.projectId, m);
    }(a, i), a);
    return o = Object.assign({
      useFetchStreams: t
    }, o), u._setSettings(o), u;
  }, "PUBLIC").setMultipleInstances(!0)), at(Ma, "4.7.3", e), // BUILD_TARGET will be replaced by values like esm5, esm2017, cjs5, etc during the compilation
  at(Ma, "4.7.3", "esm2017");
})();
var uy = "firebase", ly = "10.14.1";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
at(uy, ly, "app");
const hy = {
  apiKey: "AIzaSyCLzrL67qaYtz0Bg6h25k6K-fHrLN3X6No",
  authDomain: "app.revisewise.co",
  projectId: "revisewise",
  storageBucket: "revisewise.firebasestorage.app",
  messagingSenderId: "819105471747",
  appId: "1:819105471747:web:4fba3b988c6d0d9863dd36"
}, Sl = Sc(hy), dy = Qp(Sl), fy = $_(Sl);
class Ft {
  // ms
  constructor() {
    this.MAX_RETRIES = 3, this.RETRY_DELAY = 1e3;
  }
  static getInstance() {
    return Ft.instance || (Ft.instance = new Ft()), Ft.instance;
  }
  async persistLog(e) {
    let t = 0;
    for (; t < this.MAX_RETRIES; )
      try {
        await sy(j_(fy, "logs"), {
          ...e,
          timestamp: cy(),
          userAgent: navigator.userAgent,
          platform: "extension"
        });
        return;
      } catch (r) {
        t++, t === this.MAX_RETRIES && (console.error("Failed to persist log after maximum retries:", r), this.saveToLocalStorage(e)), await new Promise((i) => setTimeout(i, this.RETRY_DELAY));
      }
  }
  saveToLocalStorage(e) {
    try {
      const t = JSON.parse(localStorage.getItem("error_logs") || "[]");
      t.push(e), t.length > 100 && t.shift(), localStorage.setItem("error_logs", JSON.stringify(t));
    } catch (t) {
      console.error("Failed to save log to localStorage:", t);
    }
  }
  formatError(e) {
    return e instanceof Error ? {
      name: e.name,
      message: e.message,
      stack: e.stack
    } : {
      message: String(e)
    };
  }
  async log(e, t, r, i) {
    var a;
    const o = {
      level: e,
      message: t,
      timestamp: /* @__PURE__ */ new Date(),
      userId: (a = dy.currentUser) == null ? void 0 : a.uid,
      context: r,
      ...i && { error: this.formatError(i) }
    };
    console[e](t, r || "", i || ""), await this.persistLog(o);
  }
  async info(e, t) {
    await this.log("info", e, t);
  }
  async warn(e, t, r) {
    await this.log("warn", e, t, r);
  }
  async error(e, t, r) {
    await this.log("error", e, t, r);
  }
  // Utility method to sync local logs when online
  async syncLocalLogs() {
    try {
      const e = JSON.parse(localStorage.getItem("error_logs") || "[]");
      if (e.length === 0) return;
      for (const t of e)
        await this.persistLog(t);
      localStorage.removeItem("error_logs");
    } catch (e) {
      console.error("Failed to sync local logs:", e);
    }
  }
}
const Iy = Ft.getInstance();
export {
  dy as a,
  _y as b,
  fy as c,
  q_ as d,
  Ty as g,
  Iy as l,
  gy as o,
  my as s
};

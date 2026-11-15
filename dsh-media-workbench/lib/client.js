// dsh-media-workbench 0.1.4 client — built from src/client. Do not edit; run npm run build.
window.__ModuleLoader__.load({
  id: "dsh-media-workbench",
  factory: (require) => {
    const module = { exports: {} }
    ;(function (module, exports, require) {
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.jsx
var index_exports = {};
__export(index_exports, {
  REPOSITORY: () => REPOSITORY,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/react.js
var React = require("react");
var h = React.createElement;
var Fragment = React.Fragment;
var { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect, useSyncExternalStore } = React;

// src/client/api.js
var API = "/api/dsh-media-workbench";
var ApiError = class extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
};
async function handle(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
  }
  if (!response.ok) throw new ApiError(data?.error || `\u8BF7\u6C42\u5931\u8D25\uFF08HTTP ${response.status}\uFF09`, response.status, data?.code);
  return data;
}
function get(path, params = {}, signal) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== void 0 && v !== null && v !== "")).toString();
  return fetch(`${API}${path}${query ? `?${query}` : ""}`, { signal, credentials: "same-origin", headers: { accept: "application/json" } }).then(handle);
}
function post(path, body = {}, signal) {
  return fetch(`${API}${path}`, { method: "POST", signal, credentials: "same-origin", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(body) }).then(handle);
}
var fileUrl = (project, path) => `${API}/file?${new URLSearchParams({ project, path })}`;
var storage = {
  get(key, fallback) {
    try {
      const v = window.localStorage.getItem(`dmw:${key}`);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(`dmw:${key}`, JSON.stringify(value));
    } catch {
    }
  }
};
function normPath(p) {
  return String(p || "").replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
}
function timeAgo(iso) {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const diff = (Date.now() - t) / 1e3;
  if (diff < 60) return "\u521A\u521A";
  if (diff < 3600) return `${Math.floor(diff / 60)} \u5206\u949F\u524D`;
  const d = new Date(t);
  const today = /* @__PURE__ */ new Date();
  if (d.toDateString() === today.toDateString()) return `\u4ECA\u5929 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  if (diff < 86400 * 7) return `${Math.max(1, Math.round(diff / 86400))} \u5929\u524D`;
  return `${d.getMonth() + 1}\u6708${d.getDate()}\u65E5`;
}
function clock(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = /* @__PURE__ */ new Date();
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return d.toDateString() === today.toDateString() ? hm : `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}
var pct = (n, total) => total ? `${(Math.round(n / total * 1e3) / 10).toFixed(1)}%` : "0%";
function fmtDuration(seconds) {
  if (!Number.isFinite(seconds)) return "\u2014";
  if (seconds < 60) return `${Math.round(seconds * 10) / 10}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
function fmtSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

// src/client/styles.js
var CSS = `
.dmw-root{--dmw-page:var(--dsw-alias-bg-module-platform,#F4F5F7);--dmw-card:var(--dsw-alias-bg-layer-1,#fff);--dmw-sunken:var(--dsw-alias-bg-layer-2,#FAFBFC);--dmw-line:var(--dsw-alias-border-l2,#E3E5E8);--dmw-line-soft:var(--dsw-alias-border-l1,#EEF0F2);--dmw-text:var(--dsw-alias-label-primary,#1F2329);--dmw-text-2:var(--dsw-alias-label-secondary,#4E5969);--dmw-text-3:var(--dsw-alias-label-tertiary,#8F959E);--dmw-accent:var(--dsw-alias-brand-primary,#3D5AFE);--dmw-accent-fg:var(--dsw-alias-label-primary-foreground,#fff);--dmw-accent-soft:var(--dsw-alias-state-business-tertiary,rgba(61,90,254,.09));--dmw-hover:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04));--dmw-ok:var(--dsw-alias-state-success-primary,#1E8E3E);--dmw-ok-soft:var(--dsw-alias-state-success-tertiary,rgba(30,142,62,.1));--dmw-bad:var(--dsw-alias-state-error-primary,#D93025);--dmw-bad-soft:var(--dsw-alias-state-error-secondary,rgba(217,48,37,.1));--dmw-warn:var(--dsw-alias-state-warn-label,#9A5B00);--dmw-warn-line:var(--dsw-alias-state-warn-primary,#E8A33D);--dmw-warn-soft:var(--dsw-alias-state-warn-tertiary,rgba(232,163,61,.13));--dmw-btn:var(--dsw-alias-button-primary-fill,var(--dmw-accent));--dmw-btn-hover:var(--dsw-alias-button-primary-hover,var(--dmw-accent));--dmw-radius:10px;
  position:relative;display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;width:100%;height:100%;box-sizing:border-box;background:var(--dmw-page);color:var(--dmw-text);font-size:13px;line-height:1.5;overflow:hidden}
.dmw-root *,.dmw-root *::before,.dmw-root *::after{box-sizing:border-box}
.dmw-root button{font:inherit;color:inherit}
.dmw-root :focus-visible{outline:2px solid var(--dmw-accent);outline-offset:1px}
.dmw-toolbar{display:flex;align-items:center;gap:10px;min-height:48px;padding:6px 14px;border-bottom:1px solid var(--dmw-line);background:var(--dmw-card);flex-shrink:0;min-width:0}
.dmw-logo{font-weight:650;color:var(--dmw-accent);letter-spacing:.3px;white-space:nowrap;font-size:14px}
.dmw-spacer{flex:1;min-width:8px}
.dmw-body{display:flex;flex:1;min-height:0;min-width:0}
.dmw-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:12px;padding:12px;container-type:inline-size;container-name:dmw-main;overflow:hidden}
.dmw-card{background:var(--dmw-card);border:1px solid var(--dmw-line);border-radius:var(--dmw-radius)}
.dmw-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid var(--dmw-line);background:var(--dmw-card);border-radius:7px;padding:4px 10px;cursor:pointer;font-size:12px;white-space:nowrap;min-height:28px;color:var(--dmw-text)}
.dmw-btn:hover:not(:disabled){background:var(--dmw-hover)}
.dmw-btn:disabled{opacity:.5;cursor:not-allowed}
.dmw-btn.pri{background:var(--dmw-btn);border-color:var(--dmw-btn);color:var(--dmw-accent-fg)}
.dmw-btn.pri:hover:not(:disabled){background:var(--dmw-btn-hover);filter:brightness(1.05)}
.dmw-btn.danger{color:var(--dmw-bad)}
.dmw-btn.ghost{border-color:transparent;background:transparent}
.dmw-btn.sm{min-height:24px;padding:2px 8px}
.dmw-iconbtn{border:0;background:transparent;width:30px;height:30px;border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:var(--dmw-text-2)}
.dmw-iconbtn:hover{background:var(--dmw-hover)}
.dmw-iconbtn[aria-pressed=true]{color:var(--dmw-accent);background:var(--dmw-accent-soft)}
.dmw-chips{display:flex;gap:6px;flex-wrap:wrap;overflow:hidden;min-width:0;max-height:24px;flex:0 1 auto}
.dmw-chip{background:var(--dmw-sunken);border:1px solid var(--dmw-line-soft);border-radius:12px;padding:2px 9px;font-size:12px;color:var(--dmw-text-2);white-space:nowrap}
.dmw-chip.ok{background:var(--dmw-ok-soft);color:var(--dmw-ok);border-color:transparent}
.dmw-chip.bad{background:var(--dmw-bad-soft);color:var(--dmw-bad);border-color:transparent}
.dmw-chip.warn{background:var(--dmw-warn-soft);color:var(--dmw-warn);border-color:transparent}
@container dmw-tool (max-width:860px){.dmw-chips .dmw-chip.opt{display:none}}
.dmw-dd{position:relative;min-width:150px;flex:0 1 420px}
.dmw-dd-btn{display:flex;align-items:center;gap:8px;border:1px solid var(--dmw-line);border-radius:8px;padding:5px 10px;cursor:pointer;width:100%;min-width:0;background:var(--dmw-card);text-align:left}
.dmw-dd-btn:hover{background:var(--dmw-hover)}
.dmw-dd-btn b{font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dmw-dd-btn .path{color:var(--dmw-text-3);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1}
.dmw-menu{position:absolute;top:calc(100% + 6px);left:0;width:min(440px,90vw);background:var(--dmw-card);border:1px solid var(--dmw-line);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.14);z-index:30;padding:6px;max-height:min(520px,70vh);overflow:auto}
.dmw-menu input.search{width:100%;margin-bottom:6px}
.dmw-mi{padding:7px 9px;border-radius:7px;cursor:pointer;display:flex;align-items:center;gap:10px;min-width:0}
.dmw-mi:hover,.dmw-mi.sel{background:var(--dmw-hover)}
.dmw-mi .name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dmw-mi small{color:var(--dmw-text-3);white-space:nowrap}
.dmw-mi.act{color:var(--dmw-accent)}
.dmw-sep{height:1px;background:var(--dmw-line-soft);margin:5px 2px}
.dmw-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;flex-shrink:0}
.dmw-tab{padding:11px 12px;text-align:center;cursor:pointer;font-size:14px;font-weight:550;color:var(--dmw-text-2);background:var(--dmw-card);border:1px solid var(--dmw-line);border-radius:var(--dmw-radius);min-width:0}
.dmw-tab small{display:block;font-weight:400;font-size:12px;color:var(--dmw-text-3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dmw-tab[aria-selected=true]{border-color:var(--dmw-accent);color:var(--dmw-accent);background:var(--dmw-accent-soft)}
.dmw-tab:hover{background:var(--dmw-hover)}
.dmw-panel{flex:1;min-height:0;overflow:auto;padding:16px}
.dmw-h3{font-size:14px;font-weight:600;margin:0 0 10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dmw-h3 .sub{font-weight:400;color:var(--dmw-text-3);font-size:12px}
.dmw-h3 .right{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}
.dmw-h3 .dmw-btn{font-weight:400;font-size:12px}
.dmw-sec{margin-bottom:16px}
.dmw-box{border:1px solid var(--dmw-line-soft);border-radius:8px;padding:12px;min-width:0;background:var(--dmw-card)}
.dmw-grid2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}
@container dmw-main (max-width:760px){.dmw-grid2{grid-template-columns:minmax(0,1fr)}}
.dmw-muted{color:var(--dmw-text-3);font-size:12px}
.dmw-split{display:flex;gap:14px;min-height:100%}
.dmw-tree{width:270px;flex-shrink:0;border-right:1px solid var(--dmw-line-soft);padding-right:12px;overflow:auto}
.dmw-tree .dir{font-weight:550;padding:5px 6px;color:var(--dmw-text-2);font-size:12px}
.dmw-tree .f{display:flex;align-items:center;gap:6px;padding:5px 8px 5px 18px;border-radius:6px;cursor:pointer;white-space:nowrap;min-width:0;border:0;background:transparent;width:100%;text-align:left}
.dmw-tree .f span.n{overflow:hidden;text-overflow:ellipsis;min-width:0}
.dmw-tree .f:hover{background:var(--dmw-hover)}
.dmw-tree .f[aria-current=true]{background:var(--dmw-accent-soft);color:var(--dmw-accent)}
.dmw-tree .f.missing{color:var(--dmw-text-3)}
.dmw-tree .f.hist{color:var(--dmw-text-3);padding-left:30px;font-size:12px}
.dmw-ver{color:var(--dmw-text-3);font-size:11px;margin-left:auto;flex-shrink:0}
.dmw-ver.use{color:var(--dmw-ok)}
@container dmw-main (max-width:720px){.dmw-split{flex-direction:column}.dmw-tree{width:auto;border-right:0;border-bottom:1px solid var(--dmw-line-soft);padding:0 0 8px;max-height:220px}}
.dmw-preview{flex:1;min-width:0;display:flex;flex-direction:column;min-height:0}
.dmw-bar{display:flex;gap:8px;align-items:center;margin-bottom:10px;color:var(--dmw-text-3);font-size:12px;flex-wrap:wrap}
.dmw-bar .meta{min-width:0;flex:1 1 220px}
.dmw-bar .acts{display:flex;gap:6px;flex-wrap:wrap}
.dmw-doc{background:var(--dmw-sunken);border:1px solid var(--dmw-line-soft);border-radius:8px;padding:14px 16px;line-height:1.75;overflow:auto;min-height:120px;word-break:break-word}
.dmw-doc h1{font-size:17px;margin:2px 0 10px}.dmw-doc h2{font-size:15px;margin:14px 0 6px}.dmw-doc h3{font-size:14px;margin:12px 0 4px}
.dmw-doc p{margin:0 0 8px}.dmw-doc ul,.dmw-doc ol{margin:0 0 8px;padding-left:22px}
.dmw-doc code{background:var(--dmw-hover);padding:1px 4px;border-radius:4px;font-size:12px}
.dmw-doc pre{background:var(--dmw-hover);padding:10px;border-radius:6px;overflow:auto;font-size:12px;line-height:1.5}
.dmw-doc blockquote{margin:0 0 8px;padding:2px 10px;border-left:3px solid var(--dmw-line);color:var(--dmw-text-2)}
.dmw-doc hr{border:0;border-top:1px solid var(--dmw-line);margin:12px 0}
.dmw-tablewrap{overflow:auto;max-width:100%;margin:0 0 10px}
.dmw-table{width:100%;border-collapse:collapse;font-size:12px}
.dmw-table th,.dmw-table td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--dmw-line-soft);vertical-align:top}
.dmw-table th{color:var(--dmw-text-3);font-weight:500;background:var(--dmw-sunken);white-space:nowrap}
.dmw-table tr.warn td{background:var(--dmw-warn-soft)}
.dmw-table td.nowrap{white-space:nowrap}
.dmw-editor{width:100%;flex:1;min-height:360px;border:1px solid var(--dmw-line);border-radius:8px;padding:12px 14px;font:13px/1.7 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:var(--dmw-card);color:var(--dmw-text);resize:vertical}
.dmw-diff{font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;border:1px solid var(--dmw-line-soft);border-radius:8px;overflow:auto;background:var(--dmw-sunken)}
.dmw-diff div{padding:0 10px;white-space:pre-wrap;word-break:break-word}
.dmw-diff .add{background:var(--dsw-alias-file-diff-added-bg,rgba(30,142,62,.12))}
.dmw-diff .del{background:var(--dsw-alias-file-diff-deleted-bg,rgba(217,48,37,.12));text-decoration:line-through;text-decoration-color:rgba(127,127,127,.5)}
.dmw-diff .add::before{content:'+ ';color:var(--dmw-ok)}.dmw-diff .del::before{content:'\u2212 ';color:var(--dmw-bad)}.dmw-diff .same::before{content:'  '}
.dmw-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
@container dmw-main (max-width:820px){.dmw-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}
@container dmw-main (max-width:480px){.dmw-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
.dmw-stat{border:1px solid var(--dmw-line-soft);border-radius:8px;padding:10px 12px;background:var(--dmw-card);min-width:0}
.dmw-stat .n{font-size:22px;font-weight:600;font-variant-numeric:tabular-nums;line-height:1.3}
.dmw-stat .l{color:var(--dmw-text-3);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dmw-stat.g .n{color:var(--dmw-ok)}.dmw-stat.r .n{color:var(--dmw-bad)}
.dmw-reason{display:grid;grid-template-columns:minmax(90px,130px) minmax(0,1fr) 34px;align-items:center;gap:10px;margin:7px 0}
.dmw-reason .track{height:10px;border-radius:5px;background:var(--dmw-sunken);overflow:hidden}
.dmw-reason .fill{height:100%;background:var(--dmw-bad);opacity:.45;border-radius:5px}
.dmw-reason .v{color:var(--dmw-text-2);font-size:12px;text-align:right;font-variant-numeric:tabular-nums}
.dmw-tagdim{margin-bottom:10px}
.dmw-tagdim .dn{color:var(--dmw-text-3);font-size:12px;margin-bottom:5px}
.dmw-tag{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--dmw-line);background:var(--dmw-accent-soft);color:var(--dmw-accent);border-radius:5px;padding:2px 8px;margin:0 6px 6px 0;font-size:12px;cursor:pointer;max-width:100%}
.dmw-tag i{font-style:normal;color:var(--dmw-text-3);font-variant-numeric:tabular-nums}
.dmw-tag.tpl{background:transparent;color:var(--dmw-text-2)}
.dmw-tag.zero{opacity:.6}
.dmw-tag[aria-pressed=true]{outline:2px solid var(--dmw-accent);outline-offset:0}
.dmw-tag.pending{border-style:dashed;background:var(--dmw-warn-soft);border-color:var(--dmw-warn-line);color:var(--dmw-warn)}
.dmw-tag.low{border-style:dashed}
.dmw-tag.static{cursor:default}
.dmw-progress{height:6px;border-radius:3px;background:var(--dmw-sunken);overflow:hidden}
.dmw-progress div{height:100%;background:var(--dmw-accent);transition:width .3s}
@media (prefers-reduced-motion:reduce){.dmw-progress div{transition:none}}
.dmw-job{display:flex;gap:10px;align-items:center;padding:8px 12px;border:1px solid var(--dmw-line-soft);border-radius:8px;background:var(--dmw-card);font-size:12px;flex-wrap:wrap}
.dmw-job .dmw-progress{flex:1 1 140px;min-width:100px}
.dmw-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.dmw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:10px}
.dmw-clip{border:1px solid var(--dmw-line-soft);border-radius:8px;overflow:hidden;cursor:pointer;background:var(--dmw-card);text-align:left;padding:0;display:flex;flex-direction:column;min-width:0}
.dmw-clip:hover{border-color:var(--dmw-accent)}
.dmw-clip img,.dmw-clip .ph{width:100%;aspect-ratio:16/9;object-fit:cover;background:var(--dmw-sunken);display:block}
.dmw-clip .meta{padding:6px 8px;display:flex;flex-direction:column;gap:4px;min-width:0}
.dmw-clip .id{font-size:12px;font-weight:550;display:flex;gap:6px;align-items:center;min-width:0}
.dmw-clip .id span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dmw-clip .tags{display:flex;flex-wrap:wrap;gap:3px;max-height:44px;overflow:hidden}
.dmw-mini{font-size:11px;border-radius:4px;padding:0 5px;background:var(--dmw-accent-soft);color:var(--dmw-accent);white-space:nowrap}
.dmw-mini.low{background:var(--dmw-warn-soft);color:var(--dmw-warn)}
.dmw-mini.pend{background:transparent;border:1px dashed var(--dmw-warn-line);color:var(--dmw-warn)}
.dmw-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;background:var(--dmw-text-3)}
.dmw-dot.ok{background:var(--dmw-ok)}.dmw-dot.warn{background:var(--dmw-warn-line)}.dmw-dot.bad{background:var(--dmw-bad)}
.dmw-pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.dmw-pill{border:1px solid var(--dmw-line);border-radius:14px;padding:2px 10px;font-size:12px;cursor:pointer;background:var(--dmw-card)}
.dmw-pill[aria-pressed=true]{background:var(--dmw-accent-soft);color:var(--dmw-accent);border-color:var(--dmw-accent)}
.dmw-kv{display:grid;grid-template-columns:92px minmax(0,1fr);row-gap:8px;column-gap:10px;font-size:12px;align-items:center}
.dmw-kv > span:nth-child(odd){color:var(--dmw-text-3)}
.dmw-root select,.dmw-root input[type=text],.dmw-root input[type=number],.dmw-root input:not([type]),.dmw-root textarea.plain{border:1px solid var(--dmw-line);border-radius:6px;padding:4px 7px;font:inherit;font-size:12px;background:var(--dmw-card);color:var(--dmw-text);min-width:0;max-width:100%}
.dmw-root input[type=number]{width:90px}
.dmw-ok{color:var(--dmw-ok)}.dmw-bad{color:var(--dmw-bad)}.dmw-warn{color:var(--dmw-warn)}
.dmw-banner{display:flex;gap:8px;align-items:center;padding:8px 12px;border-radius:8px;font-size:12px;margin-bottom:12px;flex-wrap:wrap}
.dmw-banner.warn{background:var(--dmw-warn-soft);color:var(--dmw-warn)}
.dmw-banner.bad{background:var(--dmw-bad-soft);color:var(--dmw-bad)}
.dmw-banner.info{background:var(--dmw-accent-soft);color:var(--dmw-accent)}
.dmw-banner .grow{flex:1;min-width:160px}
.dmw-empty{padding:28px 18px;text-align:center;color:var(--dmw-text-3);display:flex;flex-direction:column;align-items:center;gap:10px}
.dmw-empty b{color:var(--dmw-text);font-size:14px}
.dmw-welcome{max-width:640px;margin:7vh auto 0;padding:28px;display:flex;flex-direction:column;gap:14px}
.dmw-welcome h2{margin:0;font-size:20px}
.dmw-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
@container dmw-main (max-width:900px){.dmw-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container dmw-main (max-width:560px){.dmw-steps{grid-template-columns:minmax(0,1fr)}}
.dmw-steps div{border:1px solid var(--dmw-line-soft);border-radius:8px;padding:10px 12px;background:var(--dmw-card)}
.dmw-steps b{display:block;margin-bottom:3px}
.dmw-chat{width:var(--dmw-chat-w,400px);flex-shrink:0;display:flex;flex-direction:column;min-height:0;border-left:1px solid var(--dmw-line);background:var(--dmw-card);position:relative}
.dmw-chat-resize{position:absolute;left:-4px;top:0;bottom:0;width:8px;cursor:col-resize;z-index:5}
.dmw-chat-resize:hover,.dmw-chat-resize:focus-visible{background:var(--dmw-accent-soft)}
.dmw-chat-h{padding:10px 14px;border-bottom:1px solid var(--dmw-line-soft)}
.dmw-chat-h b{font-size:14px}
.dmw-ctx{margin-top:6px;font-size:12px;color:var(--dmw-text-2);display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.dmw-ctx span{background:var(--dmw-accent-soft);color:var(--dmw-accent);padding:1px 8px;border-radius:10px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.dmw-libs{display:flex;flex-wrap:wrap;gap:5px;align-items:center;padding:8px 14px 0;font-size:12px}
.dmw-libs button{border:1px solid var(--dmw-line);border-radius:6px;padding:2px 8px;font-size:12px;cursor:pointer;background:var(--dmw-card);color:var(--dmw-text-2)}
.dmw-libs button:hover:not(:disabled){background:var(--dmw-hover)}
.dmw-libs button[aria-pressed=true]{background:var(--dmw-accent-soft);color:var(--dmw-accent);border-color:var(--dmw-accent)}
.dmw-libs button:disabled{opacity:.6;cursor:progress}
.dmw-tree-row{display:flex;align-items:center;gap:5px;width:100%;border:0;background:transparent;text-align:left;padding:4px 8px;border-radius:6px;cursor:pointer;white-space:nowrap;min-width:0;font-size:13px;color:var(--dmw-text)}
.dmw-tree-row:hover{background:var(--dmw-hover)}
.dmw-tree-row[aria-current=true]{background:var(--dmw-accent-soft);color:var(--dmw-accent)}
.dmw-tree-row .n{overflow:hidden;text-overflow:ellipsis;min-width:0}
.dmw-tree-row .caret{width:10px;flex-shrink:0;color:var(--dmw-text-3);font-size:10px}
.dmw-tree-row.lib{font-weight:600}
.dmw-tree-row.lib.active{background:var(--dmw-accent-soft);color:var(--dmw-accent)}
.dmw-tree-row.missing{color:var(--dmw-text-3)}
.dmw-tree-row.muted{color:var(--dmw-text-3);cursor:default;font-size:12px}
.dmw-tree-row.muted:hover{background:transparent}
.dmw-tree-row.talk{color:var(--dmw-accent);font-size:12px}
.dmw-chip-btn{cursor:pointer;font:inherit;font-size:12px}
.dmw-chip-btn:hover{border-color:var(--dmw-line)}
.dmw-tplbar-main{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dmw-tplbar-main select{font-weight:600;min-width:140px}
.dmw-tplbar-stat{margin-left:auto}
.dmw-aibox{border-style:dashed}
.dmw-pendbox{border-color:var(--dmw-warn-line)}
.dmw-pendlist{display:flex;flex-direction:column;gap:6px}
.dmw-pendrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dmw-pendrow .dmw-tag{margin:0;min-width:84px}
.dmw-pendrow select{font-size:12px}
.dmw-dimrow .dn{display:flex;align-items:center;gap:6px}
.dmw-dimrow .dn .dmw-mini{background:var(--dmw-sunken);color:var(--dmw-text-3)}
.dmw-tag.add{background:transparent;border-style:dashed;color:var(--dmw-text-3);min-width:26px;justify-content:center}
.dmw-tag.add:hover{color:var(--dmw-accent);border-color:var(--dmw-accent)}
.dmw-tagadd{display:inline-flex;align-items:center;margin:0 6px 6px 0;vertical-align:top}
.dmw-tagadd input{font-size:12px;padding:2px 6px;width:150px}
.dmw-tag .x{border:0;background:transparent;color:var(--dmw-text-3);cursor:pointer;padding:0 0 0 2px;font-size:13px;line-height:1}
.dmw-tag .x:hover{color:var(--dmw-bad)}
.dmw-tag.focus{outline:2px solid var(--dmw-warn);outline-offset:0}
.dmw-tagdetail{border-color:var(--dmw-accent)}
.dmw-clipgrid-embedded{margin-top:4px}
.dmw-tpleditor{max-height:62vh;overflow:auto;padding-right:4px}
.dmw-tplpeek{background:var(--dmw-sunken);border-radius:8px;padding:8px 10px;font-size:12px;line-height:1.7;max-height:150px;overflow:auto}
.dmw-tplpeek .dmw-muted{display:inline-block;width:40px}
.dmw-check{display:flex;align-items:center;gap:6px}
.dmw-quick{display:flex;flex-wrap:wrap;gap:6px;padding:8px 14px;border-bottom:1px solid var(--dmw-line-soft)}
.dmw-quick button{border:1px solid var(--dmw-line);color:var(--dmw-accent);border-radius:12px;padding:2px 10px;font-size:12px;cursor:pointer;background:var(--dmw-card)}
.dmw-quick button:hover{background:var(--dmw-accent-soft)}
.dmw-conv{flex:1;min-height:0;display:flex;flex-direction:column;position:relative}
.dmw-conv > *{min-height:0}
.dmw-note{font-size:11px;color:var(--dmw-text-3);padding:6px 14px 8px;border-top:1px solid var(--dmw-line-soft)}
.dmw-start{padding:22px 18px;display:flex;flex-direction:column;gap:10px;align-items:flex-start}
.dmw-start h4{margin:0;font-size:14px}
.dmw-overlay{position:absolute;inset:0;background:rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px}
.dmw-modal{container-type:inline-size;container-name:dmw-modal;background:var(--dmw-card);color:var(--dmw-text);border-radius:12px;border:1px solid var(--dmw-line);box-shadow:0 18px 48px rgba(0,0,0,.22);width:min(560px,100%);max-height:100%;display:flex;flex-direction:column}
.dmw-modal.wide{width:min(980px,100%)}
.dmw-modal header{padding:14px 18px 6px;font-weight:600;font-size:15px;display:flex;align-items:center;gap:8px}
.dmw-modal header .x{margin-left:auto}
.dmw-modal .content{padding:6px 18px 12px;overflow:auto;min-height:0}
.dmw-modal footer{padding:10px 18px 14px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
.dmw-form{display:grid;grid-template-columns:96px minmax(0,1fr);gap:10px 12px;align-items:center}
.dmw-form label{color:var(--dmw-text-2);font-size:12px}
.dmw-form .full{grid-column:1/-1}
.dmw-seg{display:inline-flex;border:1px solid var(--dmw-line);border-radius:7px;overflow:hidden}
.dmw-seg button{border:0;background:var(--dmw-card);padding:4px 10px;cursor:pointer;font-size:12px}
.dmw-seg button[aria-pressed=true]{background:var(--dmw-accent-soft);color:var(--dmw-accent)}
.dmw-seg button+button{border-left:1px solid var(--dmw-line)}
.dmw-review{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:16px}
@container dmw-modal (max-width:700px){.dmw-review{grid-template-columns:minmax(0,1fr)}}
.dmw-review video{width:100%;border-radius:8px;background:#000;max-height:50vh}
.dmw-toast{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);background:var(--dsw-alias-toast-bg,#1F2329);color:var(--dsw-alias-toast-label,#fff);padding:8px 14px;border-radius:8px;font-size:12px;z-index:60;max-width:80%;box-shadow:0 6px 20px rgba(0,0,0,.2)}
.dmw-match-thumb{width:64px;aspect-ratio:16/9;object-fit:cover;border-radius:4px;background:var(--dmw-sunken);vertical-align:middle}
.dmw-top3{display:flex;flex-direction:column;gap:6px;margin-top:6px}
.dmw-top3 button{display:flex;align-items:center;gap:8px;border:1px solid var(--dmw-line-soft);border-radius:6px;padding:4px 6px;background:var(--dmw-card);cursor:pointer;text-align:left;font-size:12px}
.dmw-top3 button[aria-pressed=true]{border-color:var(--dmw-accent);background:var(--dmw-accent-soft)}
.dmw-link{border:0;background:none;color:var(--dmw-accent);cursor:pointer;padding:0;font-size:12px}
.dmw-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.dmw-toolwrap{container-type:inline-size;container-name:dmw-tool;flex-shrink:0}
@container dmw-tool (max-width:640px){.dmw-dd-btn .path{display:none}.dmw-logo .full{display:none}}
`;
function ensureStyles() {
  if (typeof document === "undefined") return;
  let el = document.getElementById("dsh-media-workbench-css");
  if (el && el.textContent === CSS) return;
  if (!el) {
    el = document.createElement("style");
    el.id = "dsh-media-workbench-css";
    el.setAttribute("data-plugin-css", "dsh-media-workbench");
    document.head.appendChild(el);
  }
  el.textContent = CSS;
}

// src/client/useProject.js
function useOverview(projectId, active) {
  const [state, setState] = useState({ data: null, error: null, loading: false });
  const [running, setRunning] = useState(null);
  const revision = useRef(-1);
  const seq = useRef(0);
  const load = useCallback(async () => {
    if (!projectId) return;
    const mine = ++seq.current;
    setState((s) => ({ ...s, loading: !s.data }));
    try {
      const data = await get("/overview", { project: projectId });
      if (mine !== seq.current) return;
      revision.current = data.revision;
      setRunning(data.jobs?.running || null);
      setState({ data, error: null, loading: false });
    } catch (error) {
      if (mine !== seq.current) return;
      setState((s) => ({ data: error.code === "PATH_MISSING" || error.code === "NO_PROJECT" ? null : s.data, error, loading: false }));
    }
  }, [projectId]);
  useEffect(() => {
    revision.current = -1;
    setState({ data: null, error: null, loading: Boolean(projectId) });
    setRunning(null);
    if (projectId) load();
  }, [projectId, load]);
  useEffect(() => {
    if (!projectId || !active) return;
    let stopped = false;
    let timer;
    const controller = new AbortController();
    const tick = async () => {
      if (stopped) return;
      if (document.visibilityState !== "hidden") {
        try {
          const r = await get("/revision", { project: projectId }, controller.signal);
          setRunning(r.running || null);
          if (r.revision !== revision.current) await load();
        } catch {
        }
      }
      if (!stopped) timer = setTimeout(tick, 1e3);
    };
    timer = setTimeout(tick, 1e3);
    return () => {
      stopped = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [projectId, active, load]);
  return { ...state, running, reload: load };
}

// src/client/host.js
var noop = () => () => {
};
function useHostSession(service, workbenches = service) {
  const ctx = service?.ctx;
  const subscribe = useCallback((listener) => {
    const offs = [
      ctx?.sessions?.list?.subscribe?.(listener),
      ctx?.workspaces?.list?.subscribe?.(listener),
      service?.subscribe?.(listener)
    ].filter(Boolean);
    return () => offs.forEach((off) => off());
  }, [ctx, service]);
  const attempt = (fn) => {
    try {
      return fn();
    } catch {
      return null;
    }
  };
  const read = () => {
    const sessionId2 = attempt(() => service?.currentSession?.()) || null;
    const workspace = sessionId2 ? attempt(() => service?.workspaceFor?.(sessionId2)) : null;
    const owned2 = sessionId2 ? attempt(() => workbenches?.ownsSession?.(sessionId2)) : null;
    return `${sessionId2 || ""}|${workspace?.path || ""}|${owned2}`;
  };
  const key = useSyncExternalStore(ctx || service ? subscribe : noop, read, read);
  const [sessionId, folder, owned] = key.split("|");
  return { sessionId: sessionId || null, folder: folder || null, owned: owned === "true" };
}
async function pickDirectory(service) {
  const ui = service?.ctx?.uiWorkspace;
  if (!ui?.pickDirectory) throw new Error("\u5F53\u524D DSH \u7248\u672C\u4E0D\u652F\u6301\u6587\u4EF6\u5939\u9009\u62E9\u5668\u3002");
  return ui.pickDirectory();
}
async function ensureProjectSession(service, workbenches, folder, sessionId) {
  if (typeof workbenches?.ensureSession === "function") return workbenches.ensureSession({ folder, sessionId: sessionId || void 0 });
  const workspaces = service?.ctx?.workspaces;
  if (!workspaces?.create || typeof service?.newSession !== "function") throw new Error("\u5F53\u524D DSH \u7248\u672C\u4E0D\u652F\u6301\u4ECE\u5DE5\u4F5C\u53F0\u521B\u5EFA\u4F1A\u8BDD\uFF0C\u8BF7\u5347\u7EA7 DSH Desktop\u3002");
  const workspace = await workspaces.create({ path: folder });
  if (typeof service.showWorkspace === "function") await service.showWorkspace(workspace.workspaceId);
  return service.newSession(workspace.workspaceId);
}
function libraryOf(projectPath, folder) {
  if (!projectPath || !folder) return null;
  const root = normPath(projectPath);
  const f = normPath(folder);
  if (f === root) return "";
  if (!f.startsWith(root + "/")) return null;
  const original = String(folder).replace(/\\/g, "/").replace(/\/+$/, "");
  return original.slice(original.length - (f.length - root.length - 1)).split("/")[0];
}
function joinPath(base, name) {
  const sep = String(base).includes("\\") ? "\\" : "/";
  return String(base).replace(/[\\/]+$/, "") + sep + name;
}
async function setDraft(service, sessionId, text) {
  const ctx = service?.ctx;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const conversation = ctx?.get?.("conversation") || ctx?.conversation;
      const shell = conversation?.input?.shell?.(sessionId);
      if (shell?.setDraft) {
        shell.setDraft(text);
        try {
          shell.focus?.();
        } catch {
        }
        return "draft";
      }
    } catch {
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  try {
    await navigator.clipboard.writeText(text);
    return "clipboard";
  } catch {
    return "none";
  }
}

// src/client/ui.jsx
function Modal({ title, onClose, busy = false, wide = false, children, footer, labelledBy }) {
  const ref = useRef(null);
  const previous = useRef(null);
  useEffect(() => {
    previous.current = document.activeElement;
    const node = ref.current;
    const first = node?.querySelector('input,select,textarea,button:not(.x),[tabindex]:not([tabindex="-1"])');
    (first || node)?.focus();
    return () => {
      try {
        previous.current?.focus?.();
      } catch {
      }
    };
  }, []);
  const onKey = (event) => {
    if (event.key === "Escape" && !busy) {
      event.stopPropagation();
      onClose?.();
    }
    if (event.key === "Tab") {
      const items = [...ref.current.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  const id = labelledBy || `dmw-modal-${title}`;
  return /* @__PURE__ */ h("div", { className: "dmw-overlay", "data-dsh-no-drag": "", onMouseDown: (event) => {
    if (event.target === event.currentTarget && !busy) onClose?.();
  } }, /* @__PURE__ */ h("div", { className: `dmw-modal${wide ? " wide" : ""}`, role: "dialog", "aria-modal": "true", "aria-labelledby": id, ref, tabIndex: -1, onKeyDown: onKey }, /* @__PURE__ */ h("header", null, /* @__PURE__ */ h("span", { id }, title), /* @__PURE__ */ h("button", { type: "button", className: "dmw-iconbtn x", "aria-label": "\u5173\u95ED", disabled: busy, onClick: onClose }, "\u2715")), /* @__PURE__ */ h("div", { className: "content" }, children), footer ? /* @__PURE__ */ h("footer", null, footer) : null));
}
function Confirm({ title = "\u9700\u8981\u786E\u8BA4", impact, confirmLabel = "\u786E\u8BA4\u6267\u884C", danger = false, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };
  return /* @__PURE__ */ h(Modal, { title, onClose, busy, footer: /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: onClose, disabled: busy }, "\u53D6\u6D88"), /* @__PURE__ */ h("button", { type: "button", className: `dmw-btn pri${danger ? " danger" : ""}`, onClick: run, disabled: busy }, busy ? "\u6267\u884C\u4E2D\u2026" : confirmLabel)) }, /* @__PURE__ */ h("div", { style: { lineHeight: 1.7 } }, impact), error ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert", style: { marginTop: 10, marginBottom: 0 } }, error) : null);
}
function Progress({ value, total, label }) {
  const ratio = total ? Math.max(0, Math.min(1, value / total)) : 0;
  return /* @__PURE__ */ h("div", { className: "dmw-progress", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": total || 100, "aria-valuenow": value || 0, "aria-label": label }, /* @__PURE__ */ h("div", { style: { width: `${Math.round(ratio * 100)}%` } }));
}
function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const show = useCallback((text, ms = 3200) => {
    clearTimeout(timer.current);
    setToast(text);
    timer.current = setTimeout(() => setToast(null), ms);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = toast ? /* @__PURE__ */ h("div", { className: "dmw-toast", role: "status", "aria-live": "polite" }, toast) : null;
  return [node, show];
}
function useDismiss(open, setOpen, ref) {
  useEffect(() => {
    if (!open) return;
    const onDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen, ref]);
}
function Empty({ title, children, action }) {
  return /* @__PURE__ */ h("div", { className: "dmw-empty" }, /* @__PURE__ */ h("b", null, title), children ? /* @__PURE__ */ h("div", null, children) : null, action || null);
}
function JobBar({ job, onCancel }) {
  if (!job) return null;
  const eta = job.etaSeconds ? `\u9884\u8BA1\u5269\u4F59 ${job.etaSeconds < 60 ? `${job.etaSeconds} \u79D2` : `${Math.round(job.etaSeconds / 60)} \u5206\u949F`}` : "";
  const unit = job.kind?.startsWith("render") || job.kind === "split" ? "\u79D2" : "\u6761";
  return /* @__PURE__ */ h("div", { className: "dmw-job", "aria-live": "polite" }, /* @__PURE__ */ h("b", null, job.label), /* @__PURE__ */ h("span", { className: "dmw-muted" }, job.status === "queued" ? "\u6392\u961F\u4E2D" : `${job.done ?? 0}/${job.total ?? 0} ${unit}`, eta ? ` \xB7 ${eta}` : ""), /* @__PURE__ */ h(Progress, { value: job.done, total: job.total, label: job.label }), job.current ? /* @__PURE__ */ h("span", { className: "dmw-muted", style: { maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, job.current) : null, onCancel ? /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => onCancel(job) }, "\u53D6\u6D88") : null);
}

// src/client/ProjectBar.jsx
function ProjectMenu({ projects, current, onSelect, onNew, onOpenFolder, onChanged, service, notify }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  useDismiss(open, setOpen, ref);
  const list = projects.filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.path.toLowerCase().includes(query.toLowerCase()));
  const relocate = async (p) => {
    try {
      const dir = await pickDirectory(service);
      if (!dir) return;
      await post("/projects/relocate", { project: p.id, path: dir });
      onChanged();
      notify("\u5DF2\u91CD\u65B0\u5B9A\u4F4D\u9879\u76EE\u6587\u4EF6\u5939");
    } catch (error) {
      notify(error.message);
    }
  };
  const archive = async (p, archived) => {
    await post("/projects/patch", { project: p.id, archived }).catch((error) => notify(error.message));
    onChanged();
  };
  const remove = async (p) => {
    await post("/projects/remove", { project: p.id }).catch((error) => notify(error.message));
    onChanged();
    notify(`\u5DF2\u628A\u300C${p.name}\u300D\u79FB\u51FA\u5217\u8868\uFF08\u78C1\u76D8\u6587\u4EF6\u672A\u5220\u9664\uFF09`);
  };
  return /* @__PURE__ */ h("div", { className: "dmw-dd", ref, "data-dsh-no-drag": "" }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-dd-btn", "aria-haspopup": "listbox", "aria-expanded": open, onClick: () => setOpen(!open) }, /* @__PURE__ */ h("b", null, current ? current.name : "\u9009\u62E9\u9879\u76EE"), /* @__PURE__ */ h("span", { className: "path", title: current?.path }, current ? current.path : "\u65B0\u5EFA\u6216\u6253\u5F00\u4E00\u4E2A\u9879\u76EE\u6587\u4EF6\u5939"), /* @__PURE__ */ h("span", { "aria-hidden": "true" }, "\u25BE")), open ? /* @__PURE__ */ h("div", { className: "dmw-menu", role: "listbox", "aria-label": "\u9879\u76EE" }, projects.length > 4 ? /* @__PURE__ */ h("input", { className: "search", "aria-label": "\u641C\u7D22\u9879\u76EE", placeholder: "\u641C\u7D22\u9879\u76EE\u2026", value: query, onChange: (e) => setQuery(e.target.value) }) : null, list.map((p) => /* @__PURE__ */ h(
    "div",
    {
      key: p.id,
      className: `dmw-mi${current?.id === p.id ? " sel" : ""}`,
      role: "option",
      "aria-selected": current?.id === p.id,
      tabIndex: 0,
      onClick: () => {
        if (!p.missing) {
          onSelect(p);
          setOpen(false);
        }
      },
      onKeyDown: (e) => {
        if (e.key === "Enter" && !p.missing) {
          onSelect(p);
          setOpen(false);
        }
      }
    },
    /* @__PURE__ */ h("span", { className: "name", title: p.path }, p.name),
    p.missing ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("small", { className: "dmw-bad" }, "\u8DEF\u5F84\u5931\u6548"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-link", onClick: (e) => {
      e.stopPropagation();
      relocate(p);
    } }, "\u91CD\u65B0\u5B9A\u4F4D")) : /* @__PURE__ */ h("small", null, p.archived ? "\u5DF2\u5F52\u6863" : `\u7D20\u6750 ${p.counts?.raws ?? 0} \xB7 \u5207\u7247 ${p.counts?.clips ?? 0} \xB7 ${timeAgo(p.updatedAt || p.openedAt)}`),
    /* @__PURE__ */ h(ItemMenu, { items: [
      p.archived ? { label: "\u53D6\u6D88\u5F52\u6863", run: () => archive(p, false) } : { label: "\u5F52\u6863", run: () => archive(p, true) },
      { label: "\u79FB\u51FA\u5217\u8868\uFF08\u4E0D\u5220\u6587\u4EF6\uFF09", run: () => remove(p) }
    ] })
  )), !projects.length ? /* @__PURE__ */ h("div", { className: "dmw-muted", style: { padding: "6px 9px" } }, "\u8FD8\u6CA1\u6709\u9879\u76EE") : null, /* @__PURE__ */ h("div", { className: "dmw-sep" }), /* @__PURE__ */ h("div", { className: "dmw-mi act", role: "option", "aria-selected": "false", tabIndex: 0, onClick: () => {
    setOpen(false);
    onNew();
  }, onKeyDown: (e) => e.key === "Enter" && (setOpen(false), onNew()) }, "\uFF0B \u65B0\u5EFA\u9879\u76EE\uFF08\u7ED1\u5B9A\u672C\u5730\u6587\u4EF6\u5939\uFF09"), /* @__PURE__ */ h("div", { className: "dmw-mi act", role: "option", "aria-selected": "false", tabIndex: 0, onClick: () => {
    setOpen(false);
    onOpenFolder();
  }, onKeyDown: (e) => e.key === "Enter" && (setOpen(false), onOpenFolder()) }, "\u{1F4C2} \u6253\u5F00\u5DF2\u6709\u6587\u4EF6\u5939\u4E3A\u9879\u76EE")) : null);
}
function ItemMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(open, setOpen, ref);
  return /* @__PURE__ */ h("span", { ref, style: { position: "relative" }, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-iconbtn", "aria-label": "\u66F4\u591A\u64CD\u4F5C", "aria-expanded": open, onClick: () => setOpen(!open), style: { width: 24, height: 24 } }, "\u22EF"), open ? /* @__PURE__ */ h("div", { className: "dmw-menu", style: { left: "auto", right: 0, width: 190 } }, items.map((item) => /* @__PURE__ */ h("div", { key: item.label, className: "dmw-mi", tabIndex: 0, onClick: () => {
    setOpen(false);
    item.run();
  }, onKeyDown: (e) => e.key === "Enter" && (setOpen(false), item.run()) }, item.label))) : null);
}
function NewProjectDialog({ service, mode = "new", onClose, onCreated }) {
  const [folder, setFolder] = useState("");
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("vlog-base");
  const [templates, setTemplates] = useState(null);
  useEffect(() => {
    get("/templates").then((d) => setTemplates(d.templates)).catch(() => setTemplates([]));
  }, []);
  const chosen = templates?.find((t) => t.key === template);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const choose = async () => {
    setError(null);
    try {
      const dir = await pickDirectory(service);
      if (dir) {
        setFolder(dir);
        if (!name) setName(dir.split(/[\\/]/).filter(Boolean).pop() || "");
      }
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    if (mode === "open") choose();
  }, []);
  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await post("/projects/create", { path: folder, name, template });
      onCreated(result.project, result.created);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };
  return /* @__PURE__ */ h(Modal, { title: mode === "open" ? "\u6253\u5F00\u5DF2\u6709\u6587\u4EF6\u5939\u4E3A\u9879\u76EE" : "\u65B0\u5EFA\u9879\u76EE", onClose, busy, footer: /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: onClose, disabled: busy }, "\u53D6\u6D88"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", disabled: !folder || busy, onClick: create }, busy ? "\u521B\u5EFA\u4E2D\u2026" : mode === "open" ? "\u6253\u5F00" : "\u521B\u5EFA\u9879\u76EE")) }, /* @__PURE__ */ h("div", { className: "dmw-form" }, /* @__PURE__ */ h("label", null, "\u9879\u76EE\u6587\u4EF6\u5939"), /* @__PURE__ */ h("div", { style: { display: "flex", gap: 8, alignItems: "center", minWidth: 0 } }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: choose }, folder ? "\u91CD\u65B0\u9009\u62E9\u2026" : "\u9009\u62E9\u6587\u4EF6\u5939\u2026"), /* @__PURE__ */ h("span", { className: "dmw-muted", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: folder }, folder || "\u53EF\u5728\u7CFB\u7EDF\u7A97\u53E3\u91CC\u65B0\u5EFA\u6587\u4EF6\u5939")), /* @__PURE__ */ h("label", { htmlFor: "dmw-np-name" }, "\u9879\u76EE\u540D"), /* @__PURE__ */ h("input", { id: "dmw-np-name", value: name, onChange: (e) => setName(e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u4E1C\u6E56\u79CB\u65E5 Vlog" }), /* @__PURE__ */ h("label", { htmlFor: "dmw-np-tpl" }, "\u6807\u7B7E\u6A21\u677F"), /* @__PURE__ */ h("select", { id: "dmw-np-tpl", value: template, onChange: (e) => setTemplate(e.target.value) }, (templates || [{ key: "vlog-base", label: "Vlog \u57FA\u7840", builtin: true }, { key: "product-ad", label: "\u4EA7\u54C1\u5E7F\u544A", builtin: true }]).map((t) => /* @__PURE__ */ h("option", { key: t.key, value: t.key }, t.label, t.builtin ? "" : "\uFF08\u6211\u7684\u6A21\u677F\uFF09"))), chosen ? /* @__PURE__ */ h("div", { className: "full dmw-tplpeek", "aria-label": "\u6A21\u677F\u9884\u89C8" }, Object.entries(chosen.dims).filter(([, list]) => list.length).map(([dim, list]) => /* @__PURE__ */ h("div", { key: dim }, /* @__PURE__ */ h("span", { className: "dmw-muted" }, dim), list.slice(0, 10).join("\u3001"), list.length > 10 ? ` \u7B49 ${list.length} \u4E2A` : "")), !Object.values(chosen.dims).some((list) => list.length) ? /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u8FD9\u4E2A\u6A21\u677F\u8FD8\u662F\u7A7A\u7684\uFF0C\u53EF\u4EE5\u521B\u5EFA\u540E\u5728\u300C\u6807\u7B7E\u300D\u9875\u8BA9 AI \u6839\u636E\u7D20\u6750\u5EFA\u8BAE\u6807\u7B7E\u3002") : null) : null, /* @__PURE__ */ h("div", { className: "full dmw-muted" }, "\u4F1A\u5728\u6587\u4EF6\u5939\u91CC\u5EFA\u597D\u300C\u539F\u59CB\u7D20\u6750\u5E93\u300D\u300C\u8F93\u51FA\u7D20\u6750\u5E93\u300D\u300C\u521B\u610F\u526A\u8F91\u300D\u4E09\u4E2A\u6587\u4EF6\u5939\u548C\u9690\u85CF\u7684 .dsh \u914D\u7F6E\uFF08\u6807\u7B7E\u5B58\u5728\u8FD9\u91CC\uFF0C\u5728\u300C\u6807\u7B7E\u300D\u9875\u7BA1\u7406\uFF09\uFF1B\u5DF2\u6709\u6587\u4EF6\u4E0D\u4F1A\u88AB\u79FB\u52A8\u6216\u6539\u540D\uFF0C\u539F\u6709\u89C6\u9891\u4F1A\u4F5C\u4E3A\u539F\u7247\u6765\u6E90\u3002\u753B\u5E45\u3001\u5206\u8FA8\u7387\u3001\u5E27\u7387\u548C\u76EE\u6807\u65F6\u957F\u5230\u300C\u526A\u8F91\u300D\u9875\u518D\u8BBE\u7F6E\uFF1B\u6807\u7B7E\u6A21\u677F\u521B\u5EFA\u540E\u4E5F\u53EF\u4EE5\u5728\u300C\u6807\u7B7E\u300D\u9875\u66F4\u6362\u6216\u7F16\u8F91\u3002")), error ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert", style: { marginTop: 10, marginBottom: 0 } }, error) : null);
}
function SettingsDialog({ overview, onClose, onSaved }) {
  const project = overview?.project;
  const [rules, setRules] = useState({ ...project?.cleanRules || {} });
  const [jy, setJy] = useState(project?.jianyingDraftDir || "");
  const [tools, setTools] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    get("/settings").then(setTools).catch((e) => setError(e.message));
  }, []);
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      if (tools) await post("/settings", { ffmpegPath: tools.settings.ffmpegPath, ffprobePath: tools.settings.ffprobePath, eaglePort: Number(tools.settings.eaglePort) || 41595 });
      if (project) await post("/projects/patch", { project: project.id, jianyingDraftDir: jy, cleanRules: Object.fromEntries(Object.entries(rules).filter(([k]) => k !== "version").map(([k, v]) => [k, Number(v)])) });
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };
  const rule = (key, label, step, suffix) => /* @__PURE__ */ h(Fragment, { key }, /* @__PURE__ */ h("label", { htmlFor: `dmw-r-${key}` }, label), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("input", { id: `dmw-r-${key}`, type: "number", step, value: rules[key] ?? "", onChange: (e) => setRules({ ...rules, [key]: e.target.value }) }), " ", suffix));
  const setTool = (key, value) => setTools({ ...tools, settings: { ...tools.settings, [key]: value } });
  return /* @__PURE__ */ h(Modal, { title: "\u8BBE\u7F6E", onClose, busy, footer: /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: onClose, disabled: busy }, "\u53D6\u6D88"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", onClick: save, disabled: busy }, "\u4FDD\u5B58")) }, project ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u6E05\u6D17\u89C4\u5219 ", /* @__PURE__ */ h("span", { className: "sub" }, "\xB7 ", project.name, " \xB7 \u6539\u52A8\u540E\u9700\u91CD\u65B0\u6E05\u6D17\u624D\u751F\u6548")), /* @__PURE__ */ h("div", { className: "dmw-form", style: { marginBottom: 16 } }, rule("sharpnessMin", "\u6E05\u6670\u5EA6\u4E0B\u9650", 1, "\u5206\uFF080\u2013100\uFF09"), rule("shakeVarianceMax", "\u6296\u52A8\u4E0A\u9650", 0.1, "\u4F4D\u79FB\u65B9\u5DEE"), rule("minDuration", "\u6700\u77ED\u65F6\u957F", 0.1, "\u79D2"), rule("blackLuma", "\u9ED1\u5E27\u4EAE\u5EA6", 1, "\uFF080\u2013255\uFF09"), rule("blackRatioMax", "\u9ED1\u5E27\u5360\u6BD4", 0.05, "\uFF080\u20131\uFF09"), rule("duplicateSimilarity", "\u91CD\u590D\u76F8\u4F3C\u5EA6", 0.01, "\uFF080.5\u20131\uFF09"), /* @__PURE__ */ h("label", { htmlFor: "dmw-jy" }, "\u526A\u6620\u8349\u7A3F\u76EE\u5F55"), /* @__PURE__ */ h("input", { id: "dmw-jy", value: jy, onChange: (e) => setJy(e.target.value), placeholder: overview?.status?.jianying?.dir || "\u7559\u7A7A\u4F7F\u7528\u9ED8\u8BA4\u4F4D\u7F6E" }))) : null, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u5916\u90E8\u5DE5\u5177"), tools ? /* @__PURE__ */ h("div", { className: "dmw-form" }, /* @__PURE__ */ h("label", { htmlFor: "dmw-ff" }, "FFmpeg \u8DEF\u5F84"), /* @__PURE__ */ h("input", { id: "dmw-ff", value: tools.settings.ffmpegPath, onChange: (e) => setTool("ffmpegPath", e.target.value), placeholder: `\u81EA\u52A8\u68C0\u6D4B\uFF1A${tools.ffmpeg?.paths?.ffmpeg || "ffmpeg"}` }), /* @__PURE__ */ h("label", { htmlFor: "dmw-fp" }, "ffprobe \u8DEF\u5F84"), /* @__PURE__ */ h("input", { id: "dmw-fp", value: tools.settings.ffprobePath, onChange: (e) => setTool("ffprobePath", e.target.value), placeholder: "\u7559\u7A7A\u5219\u4E0E FFmpeg \u540C\u76EE\u5F55" }), /* @__PURE__ */ h("label", { htmlFor: "dmw-ep" }, "Eagle \u7AEF\u53E3"), /* @__PURE__ */ h("input", { id: "dmw-ep", type: "number", value: tools.settings.eaglePort, onChange: (e) => setTool("eaglePort", e.target.value) }), /* @__PURE__ */ h("div", { className: "full dmw-muted" }, "FFmpeg\uFF1A", tools.ffmpeg?.ffmpeg ? /* @__PURE__ */ h("span", { className: "dmw-ok" }, "\u5DF2\u5C31\u7EEA ", tools.ffmpeg.version) : /* @__PURE__ */ h("span", { className: "dmw-bad" }, "\u672A\u627E\u5230"), tools.ffmpeg?.ffmpeg ? `\uFF08H.264 ${tools.ffmpeg.encoders?.h264 ? "\u2713" : "\u2717"} \xB7 H.265 ${tools.ffmpeg.encoders?.h265 ? "\u2713" : "\u2717"}\uFF09` : "\u3002Windows \u53EF\u7528 winget install Gyan.FFmpeg \u5B89\u88C5\uFF0C\u88C5\u597D\u540E\u91CD\u542F DSH Desktop\u3002", /* @__PURE__ */ h("br", null), "Eagle\uFF1A", tools.eagle?.connected ? /* @__PURE__ */ h("span", { className: "dmw-ok" }, "\u5DF2\u8FDE\u63A5") : /* @__PURE__ */ h("span", { className: "dmw-bad" }, "\u672A\u8FDE\u63A5\uFF08\u8BF7\u6253\u5F00 Eagle\uFF09"))) : /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u8BFB\u53D6\u4E2D\u2026"), error ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert", style: { marginTop: 10, marginBottom: 0 } }, error) : null);
}

// src/client/ProjectTree.jsx
var ICON = { dir: "\u{1F4C1}", md: "\u{1F4C4}", yaml: "\u{1F3F7}\uFE0F", yml: "\u{1F3F7}\uFE0F", json: "\u{1F9FE}", srt: "\u{1F4AC}", txt: "\u{1F4C4}", mp4: "\u{1F39E}\uFE0F", mov: "\u{1F39E}\uFE0F", m4v: "\u{1F39E}\uFE0F", mts: "\u{1F39E}\uFE0F", jpg: "\u{1F5BC}\uFE0F", jpeg: "\u{1F5BC}\uFE0F", png: "\u{1F5BC}\uFE0F", webp: "\u{1F5BC}\uFE0F", mp3: "\u{1F3B5}", wav: "\u{1F3B5}" };
var extOf = (name) => (name.match(/\.([^.]+)$/)?.[1] || "").toLowerCase();
function ProjectTree({ projectId, revision, docs, libraries, selectedPath, workingLibrary, switching, onSelect, onLibrary }) {
  const [children, setChildren] = useState({});
  const [expanded, setExpanded] = useState(() => new Set(storage.get(`tree:${projectId}`, ["\u521B\u610F\u526A\u8F91"])));
  const [error, setError] = useState(null);
  const loading = useRef(/* @__PURE__ */ new Set());
  const load = useCallback(async (path) => {
    if (loading.current.has(path)) return;
    loading.current.add(path);
    try {
      const data = await get("/tree", { project: projectId, path });
      setChildren((prev) => ({ ...prev, [path]: data.items }));
      setError(null);
    } catch (e) {
      if (path === "") setError(e.message);
      else setChildren((prev) => ({ ...prev, [path]: [] }));
    } finally {
      loading.current.delete(path);
    }
  }, [projectId]);
  useEffect(() => {
    setChildren({});
  }, [projectId]);
  useEffect(() => {
    load("");
    for (const path of expanded) load(path);
  }, [projectId, revision]);
  useEffect(() => {
    storage.set(`tree:${projectId}`, [...expanded]);
  }, [expanded, projectId]);
  const toggle = (path) => {
    const next = new Set(expanded);
    if (next.has(path)) next.delete(path);
    else {
      next.add(path);
      load(path);
    }
    setExpanded(next);
  };
  const withVirtualDocs = (path, items) => {
    const present = new Set(items.map((i) => i.path));
    const missing = docs.filter((d) => !d.exists && d.path.slice(0, d.path.lastIndexOf("/")) === path && !present.has(d.path)).map((d) => ({ name: d.path.split("/").pop(), path: d.path, type: "file", doc: d.key, missing: true }));
    return [...items, ...missing];
  };
  const docByKey = new Map(docs.map((d) => [d.key, d]));
  const libraryHint = new Map(libraries.map((l) => [l.dir, l.hint]));
  const renderItems = (path, depth) => {
    const items = children[path];
    if (!items) return /* @__PURE__ */ h("div", { className: "dmw-tree-row muted", style: { paddingLeft: 10 + depth * 14 } }, "\u8BFB\u53D6\u4E2D\u2026");
    const list = withVirtualDocs(path, items);
    if (!list.length) return /* @__PURE__ */ h("div", { className: "dmw-tree-row muted", style: { paddingLeft: 10 + depth * 14 } }, "\uFF08\u7A7A\uFF09");
    return list.map((item) => {
      const pad = { paddingLeft: 8 + depth * 14 };
      if (item.type === "dir") {
        const open = expanded.has(item.path);
        const isLibrary = Boolean(item.library);
        const active = isLibrary && workingLibrary === item.library;
        return /* @__PURE__ */ h(Fragment, { key: item.path }, /* @__PURE__ */ h(
          "button",
          {
            type: "button",
            className: `dmw-tree-row dir${isLibrary ? " lib" : ""}${active ? " active" : ""}`,
            style: pad,
            "aria-expanded": open,
            title: isLibrary ? `${libraryHint.get(item.library)} \xB7 \u70B9\u51FB\u540E\u53F3\u4FA7\u5BF9\u8BDD\u5207\u6362\u5230\u8FD9\u4E2A\u6587\u4EF6\u5939` : item.path,
            onClick: () => {
              toggle(item.path);
              if (isLibrary && !open) onLibrary(item.library);
            }
          },
          /* @__PURE__ */ h("span", { className: "caret", "aria-hidden": "true" }, open ? "\u25BE" : "\u25B8"),
          /* @__PURE__ */ h("span", { "aria-hidden": "true" }, ICON.dir),
          /* @__PURE__ */ h("span", { className: "n" }, item.name),
          isLibrary ? active ? /* @__PURE__ */ h("span", { className: "dmw-ver use" }, switching === item.library ? "\u5207\u6362\u4E2D\u2026" : "\u5BF9\u8BDD\u4E2D") : switching === item.library ? /* @__PURE__ */ h("span", { className: "dmw-ver" }, "\u5207\u6362\u4E2D\u2026") : null : null
        ), isLibrary && open && !active ? /* @__PURE__ */ h("button", { type: "button", className: "dmw-tree-row talk", style: { paddingLeft: 8 + (depth + 1) * 14 }, onClick: () => onLibrary(item.library) }, "\u{1F4AC} \u5728\u300C", item.library, "\u300D\u91CC\u5BF9\u8BDD") : null, open ? renderItems(item.path, depth + 1) : null);
      }
      const doc = item.doc ? docByKey.get(item.doc) : null;
      return /* @__PURE__ */ h(
        "button",
        {
          type: "button",
          key: item.path,
          className: `dmw-tree-row file${item.missing ? " missing" : ""}`,
          style: pad,
          "aria-current": selectedPath === item.path,
          title: item.size !== null && item.size !== void 0 ? `${item.path} \xB7 ${fmtSize(item.size)}` : item.path,
          onClick: () => onSelect(item)
        },
        /* @__PURE__ */ h("span", { className: "caret", "aria-hidden": "true" }),
        /* @__PURE__ */ h("span", { "aria-hidden": "true" }, ICON[extOf(item.name)] || "\u{1F4C4}"),
        /* @__PURE__ */ h("span", { className: "n" }, item.name),
        doc ? doc.exists ? /* @__PURE__ */ h("span", { className: `dmw-ver${doc.editUse ? " use" : ""}` }, "v", doc.version, doc.editUse ? " \u2713" : "") : /* @__PURE__ */ h("span", { className: "dmw-ver" }, "\u672A\u751F\u6210") : null
      );
    });
  };
  return /* @__PURE__ */ h("nav", { className: "dmw-tree", "aria-label": "\u9879\u76EE\u6587\u4EF6" }, error ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert" }, error) : renderItems("", 0));
}

// src/client/markdown.jsx
function Markdown({ text, rowClass }) {
  const blocks = parseBlocks(String(text || ""));
  return /* @__PURE__ */ h("div", { className: "dmw-doc" }, blocks.map((block, i) => renderBlock(block, i, rowClass)));
}
function parseBlocks(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      const body2 = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) body2.push(lines[i++]);
      i++;
      blocks.push({ type: "code", text: body2.join("\n") });
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "h", level: Math.min(3, heading[1].length), text: heading[2] });
      i++;
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    if (/^\s*\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
      blocks.push({ type: "table", rows: rows.map(splitRow).filter((cells) => !cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) });
      continue;
    }
    if (/^\s*>/.test(line)) {
      const body2 = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body2.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push({ type: "quote", text: body2.join("\n") });
      continue;
    }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]/.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*+]|\d+[.)])\s+/, ""));
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    const body = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*\||\s*```|\s*>|\s*([-*+]|\d+[.)])\s+)/.test(lines[i])) body.push(lines[i++]);
    blocks.push({ type: "p", lines: body });
  }
  return blocks;
}
function splitRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}
function renderBlock(block, key, rowClass) {
  switch (block.type) {
    case "h":
      return h(`h${block.level}`, { key }, inline(block.text));
    case "hr":
      return /* @__PURE__ */ h("hr", { key });
    case "code":
      return /* @__PURE__ */ h("pre", { key }, /* @__PURE__ */ h("code", null, block.text));
    case "quote":
      return /* @__PURE__ */ h("blockquote", { key }, block.text.split("\n").map((l, i) => /* @__PURE__ */ h(Fragment, { key: i }, i ? /* @__PURE__ */ h("br", null) : null, inline(l))));
    case "list":
      return h(block.ordered ? "ol" : "ul", { key }, block.items.map((item, i) => /* @__PURE__ */ h("li", { key: i }, inline(item))));
    case "table": {
      const [head, ...rows] = block.rows;
      if (!head) return null;
      return /* @__PURE__ */ h("div", { className: "dmw-tablewrap", key }, /* @__PURE__ */ h("table", { className: "dmw-table" }, /* @__PURE__ */ h("thead", null, /* @__PURE__ */ h("tr", null, head.map((c, i) => /* @__PURE__ */ h("th", { key: i }, inline(c))))), /* @__PURE__ */ h("tbody", null, rows.map((cells, r) => /* @__PURE__ */ h("tr", { key: r, className: rowClass ? rowClass(cells, head) || void 0 : void 0 }, head.map((_, c) => /* @__PURE__ */ h("td", { key: c }, inline(cells[c] || ""))))))));
    }
    default:
      return /* @__PURE__ */ h("p", { key }, block.lines.map((l, i) => /* @__PURE__ */ h(Fragment, { key: i }, i ? /* @__PURE__ */ h("br", null) : null, inline(l))));
  }
}
function inline(text) {
  const out = [];
  const pattern = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*([^*\s][^*]*)\*)/g;
  let last = 0;
  let match;
  let k = 0;
  while (match = pattern.exec(text)) {
    if (match.index > last) out.push(text.slice(last, match.index));
    if (match[2]) out.push(/* @__PURE__ */ h("strong", { key: k++ }, match[2]));
    else if (match[3]) out.push(/* @__PURE__ */ h("code", { key: k++ }, match[3]));
    else if (match[4]) out.push(/* @__PURE__ */ h("span", { key: k++, title: match[5], style: { textDecoration: "underline dotted" } }, match[4]));
    else if (match[6]) out.push(/* @__PURE__ */ h("em", { key: k++ }, match[6]));
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// src/client/CreativeTab.jsx
var SOURCE = { chat: "\u7531\u5BF9\u8BDD\u751F\u6210", external: "\u5916\u90E8\u4FEE\u6539", manual: "\u624B\u52A8\u521B\u5EFA", rollback: "\u56DE\u6EDA", system: "\u7CFB\u7EDF\u751F\u6210", "tags-op": "\u6807\u7B7E\u64CD\u4F5C", tagger: "\u6253\u6807" };
var ASK = {
  "00_\u4E3B\u9898\u7B80\u62A5.md": "\u5E2E\u6211\u5B8C\u5584\u4E3B\u9898\u7B80\u62A5\uFF1A\u5E73\u53F0\u3001\u76EE\u6807\u65F6\u957F\u3001\u53D7\u4F17\u3001\u57FA\u8C03\u548C\u62CD\u6444\u5B89\u6392",
  "01_\u521B\u610F\u65B9\u5411.md": "\u7ED9\u6211 3 \u4E2A\u521B\u610F\u65B9\u5411\uFF0C\u8BF4\u660E\u5404\u81EA\u7684\u770B\u70B9\u548C\u9002\u5408\u7684\u5E73\u53F0",
  "02_\u6587\u6848.md": "\u6839\u636E\u9009\u5B9A\u7684\u521B\u610F\u65B9\u5411\u751F\u6210\u6587\u6848\uFF0C\u63A7\u5236\u5728\u76EE\u6807\u65F6\u957F\u5185",
  "03_\u5206\u955C\u811A\u672C.md": "\u6839\u636E\u6587\u6848\u51FA\u5206\u955C\u811A\u672C\uFF0C\u6BCF\u955C\u90FD\u8981\u5199\u6240\u9700\u6807\u7B7E",
  "\u6807\u7B7E\u5B57\u5178.yaml": "\u770B\u4E00\u4E0B\u8FD9\u4E2A\u9879\u76EE\u7684\u7D20\u6750\uFF0C\u5E2E\u6211\u5EFA\u8BAE\u4E00\u6279\u6807\u7B7E\uFF1A\u53EA\u653E\u8FDB\u5F85\u5BA1\u533A\uFF0C\u6BCF\u4E2A\u6807\u7B7E\u7ED9\u51FA\u5EFA\u8BAE\u7EF4\u5EA6",
  "\u526A\u8F91\u601D\u8DEF.md": "\u6839\u636E\u6587\u6848\u548C\u5206\u955C\u5199\u526A\u8F91\u601D\u8DEF\uFF1A\u8282\u594F\u3001BGM \u4E0E BPM\u3001\u8F6C\u573A\u3001\u914D\u97F3"
};
function CreativeTab({ overview, projectId, notify, ask, onReveal, workingLibrary, switching, onLibrary }) {
  const docs = overview.creative.docs;
  const [selection, setSelection] = useState(() => {
    const saved = storage.get(`sel:${projectId}`, null);
    const stale = !saved || typeof saved.path !== "string" || saved.doc === "\u6807\u7B7E\u5B57\u5178.yaml" || saved.path.startsWith("\u6807\u7B7E\u7BA1\u7406/") || saved.path.startsWith(".dsh/");
    return stale ? { path: "\u521B\u610F\u526A\u8F91/02_\u6587\u6848.md", doc: "02_\u6587\u6848.md" } : saved;
  });
  useEffect(() => {
    storage.set(`sel:${projectId}`, selection);
  }, [selection, projectId]);
  return /* @__PURE__ */ h("div", { className: "dmw-split" }, /* @__PURE__ */ h(
    ProjectTree,
    {
      projectId,
      revision: overview.revision,
      docs,
      libraries: overview.libraries || [],
      selectedPath: selection.path,
      workingLibrary,
      switching,
      onLibrary,
      onSelect: (item) => setSelection({ path: item.path, doc: item.doc || null })
    }
  ), selection.doc ? /* @__PURE__ */ h(DocView, { key: selection.doc, docKey: selection.doc, overview, projectId, notify, ask, onReveal }) : /* @__PURE__ */ h(FileView, { key: selection.path, path: selection.path, projectId, revision: overview.revision, onReveal }));
}
function FileView({ path, projectId, revision, onReveal }) {
  const [text, setText] = useState(null);
  const [error, setError] = useState(null);
  const ext = (path.match(/\.([^.]+)$/)?.[1] || "").toLowerCase();
  const kind = /^(md|txt|ya?ml|json|jsonl|srt|csv|log|xml|html?)$/.test(ext) ? "text" : /^(jpe?g|png|gif|webp)$/.test(ext) ? "image" : /^(mp4|mov|m4v|webm)$/.test(ext) ? "video" : /^(mp3|wav|m4a|aac)$/.test(ext) ? "audio" : "other";
  useEffect(() => {
    if (kind !== "text") return;
    let cancelled = false;
    get("/text", { project: projectId, path }).then((d) => {
      if (!cancelled) {
        setText(d);
        setError(null);
      }
    }).catch((e) => {
      if (!cancelled) setError(e.message);
    });
    return () => {
      cancelled = true;
    };
  }, [path, revision]);
  return /* @__PURE__ */ h("section", { className: "dmw-preview", "aria-label": "\u6587\u4EF6\u9884\u89C8" }, /* @__PURE__ */ h("div", { className: "dmw-bar" }, /* @__PURE__ */ h("span", { className: "meta" }, path, kind === "text" ? " \xB7 \u53EA\u8BFB\u9884\u89C8" : "", text?.truncated ? "\uFF08\u6587\u4EF6\u8F83\u5927\uFF0C\u53EA\u663E\u793A\u5F00\u5934\uFF09" : ""), /* @__PURE__ */ h("span", { className: "acts" }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => onReveal(path) }, "\u5728\u6587\u4EF6\u5939\u4E2D\u663E\u793A"))), error ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert" }, error) : null, kind === "text" ? text ? ext === "md" ? /* @__PURE__ */ h(Markdown, { text: text.content }) : /* @__PURE__ */ h("pre", { className: "dmw-doc", style: { whiteSpace: "pre-wrap", fontSize: 12 } }, prettyJson(ext, text.content)) : !error ? /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u8BFB\u53D6\u4E2D\u2026") : null : kind === "image" ? /* @__PURE__ */ h("img", { src: fileUrl(projectId, path), alt: path, style: { maxWidth: "100%", maxHeight: "70vh", borderRadius: 8, alignSelf: "flex-start" } }) : kind === "video" ? /* @__PURE__ */ h("video", { key: path, src: fileUrl(projectId, path), controls: true, style: { width: "100%", maxHeight: "70vh", background: "#000", borderRadius: 8 } }) : kind === "audio" ? /* @__PURE__ */ h("audio", { src: fileUrl(projectId, path), controls: true }) : /* @__PURE__ */ h(Empty, { title: "\u8FD9\u4E2A\u6587\u4EF6\u4E0D\u80FD\u5728\u9762\u677F\u91CC\u9884\u89C8" }, "\u53EF\u4EE5\u70B9\u300C\u5728\u6587\u4EF6\u5939\u4E2D\u663E\u793A\u300D\u7528\u5176\u4ED6\u8F6F\u4EF6\u6253\u5F00\u3002", ext === "mts" ? "MTS \u539F\u7247\u5BFC\u5165\u5E76\u5207\u7247\u540E\uFF0C\u53EF\u5728\u300C\u8F93\u51FA\u7D20\u6750\u5E93/\u5207\u7247\u7D20\u6750\u300D\u91CC\u9884\u89C8\u3002" : ""));
}
function prettyJson(ext, content) {
  if (ext !== "json") return content;
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    return content;
  }
}
function DocView({ docKey, overview, projectId, notify, ask, onReveal }) {
  const docs = overview.creative.docs;
  const selected = docKey;
  const [view, setView] = useState({ mode: "read", ref: null });
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft2] = useState("");
  const [diff, setDiff] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const entry = docs.find((d) => d.key === selected);
  const warnings = overview.storyboard?.warnings || [];
  const warnNos = useMemo(() => new Set(warnings.map((w) => w.no)), [warnings]);
  const signature = `${selected}|${view.ref}|${entry?.version}|${entry?.manualEdits}|${overview.revision}`;
  useEffect(() => {
    let cancelled = false;
    if (view.mode === "edit") return;
    setError(null);
    get("/doc", { project: projectId, file: selected, ref: view.ref || void 0 }).then((d) => {
      if (!cancelled) setDoc(d);
    }).catch((e) => {
      if (!cancelled) setError(e.message);
    });
    return () => {
      cancelled = true;
    };
  }, [signature, view.mode]);
  useEffect(() => {
    if (view.mode !== "diff") return;
    let cancelled = false;
    get("/doc/diff", { project: projectId, file: selected, from: view.ref }).then((d) => {
      if (!cancelled) setDiff(d);
    }).catch((e) => {
      if (!cancelled) setError(e.message);
    });
    return () => {
      cancelled = true;
    };
  }, [view.mode, view.ref, selected, entry?.version, overview.revision]);
  const open = (ref = null, mode = "read") => {
    setView({ mode, ref });
    setDiff(null);
  };
  const startEdit = () => {
    setDraft2(doc?.content || "");
    setView({ mode: "edit", ref: null });
  };
  const save = async () => {
    try {
      await post("/doc/save", { project: projectId, file: selected, content: draft, expectedHash: doc?.meta?.hash });
      setView({ mode: "read", ref: null });
      notify("\u5DF2\u4FDD\u5B58\uFF08\u8BB0\u4E3A\u4EBA\u5DE5\u6539\u52A8\uFF09");
    } catch (e) {
      setError(e.message);
    }
  };
  const setEditUse = async () => {
    try {
      await post("/doc/edit-use", { project: projectId, file: selected });
      notify(`\u5DF2\u628A ${selected} v${entry.version} \u8BBE\u4E3A\u526A\u8F91\u4F7F\u7528\u7248\u672C`);
    } catch (e) {
      notify(e.message);
    }
  };
  const previous = entry?.history?.find((h2) => h2.ref === `v${entry.version - 1}`) || entry?.history?.find((h2) => !h2.ref.includes("\u624B\u6539\u524D")) || entry?.history?.[0];
  const isYaml = selected.endsWith(".yaml");
  const meta = () => {
    if (!entry?.exists) return `${entry?.path || selected} \xB7 \u8FD8\u6CA1\u6709\u5185\u5BB9`;
    if (view.ref) return `${entry.path} \xB7 ${doc?.label || view.ref}\uFF08\u5386\u53F2\u7248\u672C\uFF0C\u53EA\u8BFB\uFF09`;
    const parts = [entry.path, `v${entry.version}`];
    if (entry.source) parts.push(`${SOURCE[entry.source] || entry.source}${entry.generatedAt ? `\u4E8E ${clock(entry.generatedAt)}` : ""}`);
    if (entry.model) parts.push(entry.model);
    if (entry.manualEdits) parts.push(`\u4EBA\u5DE5\u6539\u52A8 ${entry.manualEdits} \u5904`);
    if (entry.note) parts.push(entry.note);
    return parts.join(" \xB7 ");
  };
  return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("section", { className: "dmw-preview", "aria-label": "\u6587\u4EF6\u9884\u89C8" }, /* @__PURE__ */ h("div", { className: "dmw-bar" }, /* @__PURE__ */ h("span", { className: "meta" }, meta()), /* @__PURE__ */ h("span", { className: "acts" }, view.mode === "edit" ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => setView({ mode: "read", ref: null }) }, "\u53D6\u6D88"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", onClick: save }, "\u4FDD\u5B58")) : view.ref ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => setView({ mode: view.mode === "diff" ? "read" : "diff", ref: view.ref }) }, view.mode === "diff" ? "\u67E5\u770B\u5168\u6587" : "\u4E0E\u5F53\u524D\u5BF9\u6BD4"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => setConfirm({ ref: view.ref }) }, "\u56DE\u6EDA\u5230\u6B64\u7248\u672C"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => open() }, "\u56DE\u5230\u5F53\u524D\u7248\u672C")) : entry?.exists ? /* @__PURE__ */ h(Fragment, null, previous ? /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => setView({ mode: "diff", ref: previous.ref }) }, "\u5BF9\u6BD4 ", previous.label) : null, entry.history?.length ? /* @__PURE__ */ h("select", { "aria-label": "\u5386\u53F2\u7248\u672C", value: "", onChange: (e) => e.target.value && open(e.target.value) }, /* @__PURE__ */ h("option", { value: "" }, "\u5386\u53F2\u7248\u672C\uFF08", entry.history.length, "\uFF09"), entry.history.map((item) => /* @__PURE__ */ h("option", { key: item.ref, value: item.ref }, item.label))) : null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: startEdit }, "\u7F16\u8F91"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => onReveal(entry.path) }, "\u5728\u6587\u4EF6\u5939\u4E2D\u663E\u793A"), ["02_\u6587\u6848.md", "03_\u5206\u955C\u811A\u672C.md"].includes(selected) ? entry.editUse === entry.version ? /* @__PURE__ */ h("span", { className: "dmw-chip ok" }, "\u526A\u8F91\u4F7F\u7528\u7248\u672C v", entry.editUse) : /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", onClick: setEditUse }, entry.editUse ? `\u8BBE\u4E3A\u526A\u8F91\u4F7F\u7528\u7248\u672C\uFF08\u5F53\u524D\u7528 v${entry.editUse}\uFF09` : "\u8BBE\u4E3A\u526A\u8F91\u4F7F\u7528\u7248\u672C") : null) : null)), selected === "03_\u5206\u955C\u811A\u672C.md" && !view.ref && warnings.length && view.mode === "read" ? /* @__PURE__ */ h("div", { className: "dmw-banner warn", role: "status" }, warnings.length, " \u955C\u7F3A\u5C11\u300C\u6240\u9700\u6807\u7B7E\u300D\u6216\u65F6\u957F\uFF08\u5DF2\u6807\u9EC4\uFF09\uFF0C\u526A\u8F91\u65E0\u6CD5\u81EA\u52A8\u5339\u914D\uFF1A", warnings.map((w) => w.no).join("\u3001")) : null, error ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert" }, error) : null, view.mode === "edit" ? /* @__PURE__ */ h("textarea", { className: "dmw-editor", "aria-label": `\u7F16\u8F91 ${selected}`, value: draft, onChange: (e) => setDraft2(e.target.value), spellCheck: false }) : view.mode === "diff" ? diff ? /* @__PURE__ */ h("div", { className: "dmw-diff", role: "region", "aria-label": `\u5BF9\u6BD4 ${diff.from} \u2192 ${diff.to}` }, /* @__PURE__ */ h("div", { className: "same dmw-muted" }, diff.from, " \u2192 ", diff.to), diff.lines.map((line, i) => /* @__PURE__ */ h("div", { key: i, className: line.type }, line.text || " "))) : /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u5BF9\u6BD4\u4E2D\u2026") : !entry?.exists && !view.ref ? /* @__PURE__ */ h(Empty, { title: `\u8FD8\u6CA1\u6709 ${selected}`, action: /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", onClick: () => ask(ASK[selected]) }, "\u8BA9 AI \u751F\u6210") }, "\u5728\u53F3\u4FA7\u5BF9 AI \u8BF4\u300C", ASK[selected], "\u300D\uFF0C\u751F\u6210\u540E\u8FD9\u91CC\u4F1A\u81EA\u52A8\u5237\u65B0\u3002\u4E5F\u53EF\u4EE5\u624B\u52A8\u7F16\u5199\u3002", /* @__PURE__ */ h("div", { style: { marginTop: 8 } }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => {
    setDraft2("");
    setView({ mode: "edit", ref: null });
  } }, "\u624B\u52A8\u7F16\u5199"))) : doc ? isYaml ? /* @__PURE__ */ h(YamlView, { text: doc.content }) : /* @__PURE__ */ h(Markdown, { text: doc.content, rowClass: selected === "03_\u5206\u955C\u811A\u672C.md" ? (cells, head) => {
    const col = head.findIndex((c) => c === "\u955C\u53F7");
    const no = (cells[col] || "").replace(/[^\dA-Za-z-]/g, "").padStart(2, "0");
    return warnNos.has(no) ? "warn" : "";
  } : void 0 }) : /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u8BFB\u53D6\u4E2D\u2026")), confirm ? /* @__PURE__ */ h(
    Confirm,
    {
      impact: `\u628A ${selected} \u56DE\u6EDA\u5230 ${confirm.ref}\u3002\u5F53\u524D\u7248\u672C\u4F1A\u5148\u5B58\u5165 _history\uFF0C\u53EF\u4EE5\u968F\u65F6\u518D\u6539\u56DE\u6765\u3002`,
      confirmLabel: "\u786E\u8BA4\u56DE\u6EDA",
      onConfirm: async () => {
        await post("/doc/rollback", { project: projectId, file: selected, ref: confirm.ref });
        open();
        notify("\u5DF2\u56DE\u6EDA");
      },
      onClose: () => setConfirm(null)
    }
  ) : null);
}
function YamlView({ text }) {
  const lines = String(text || "").split("\n");
  const rows = [];
  for (const line of lines) {
    const m = line.match(/^([^#:\s][^:]*):\s*\[(.*)\]\s*(#.*)?$/);
    if (m) rows.push({ key: m[1].trim(), tags: m[2].split(",").map((t) => t.trim().replace(/^["']|["']$/g, "")).filter(Boolean), note: m[3] });
  }
  const inherit = text.match(/^继承:\s*(.+)$/m)?.[1];
  return /* @__PURE__ */ h("div", { className: "dmw-doc" }, inherit ? /* @__PURE__ */ h("p", { className: "dmw-muted" }, "\u7EE7\u627F\u6807\u7B7E\u6A21\u677F\uFF1A", inherit, "\uFF08\u6A21\u677F\u91CC\u7684\u8BCD\u4E0D\u5728\u8FD9\u4E2A\u6587\u4EF6\u91CC\u91CD\u590D\u5217\u51FA\uFF09") : null, rows.map((row) => /* @__PURE__ */ h("div", { key: row.key, className: "dmw-tagdim" }, /* @__PURE__ */ h("div", { className: "dn" }, row.key, row.key === "\u5F85\u5BA1" ? "\uFF08AI \u5EFA\u8BAE\u7684\u65B0\u6807\u7B7E\uFF0C\u5728\u300C\u6807\u7B7E\u300D\u9875\u8F6C\u6B63\u6216\u9A73\u56DE\uFF09" : ""), row.tags.length ? row.tags.map((t) => /* @__PURE__ */ h("span", { key: t, className: `dmw-tag static${row.key === "\u5F85\u5BA1" ? " pending" : ""}` }, t)) : /* @__PURE__ */ h("span", { className: "dmw-muted" }, "\uFF08\u7A7A\uFF09"))), /* @__PURE__ */ h("details", null, /* @__PURE__ */ h("summary", { className: "dmw-muted", style: { cursor: "pointer" } }, "\u67E5\u770B YAML \u539F\u6587"), /* @__PURE__ */ h("pre", null, text)));
}

// src/client/MaterialTab.jsx
var REASON_LABEL = { blur: "\u753B\u9762\u6A21\u7CCA/\u5931\u7126", shake: "\u5267\u70C8\u6296\u52A8", short: "\u65F6\u957F\u8FC7\u77ED", black: "\u9ED1\u5C4F/\u8BEF\u89E6\u62CD\u6444", duplicate: "\u91CD\u590D\u955C\u5934" };
function MaterialTab({ overview, projectId, notify, ask, running, onCancelJob }) {
  const report = overview.material.report;
  const tags = overview.material.tags;
  const status = overview.status;
  const [confirm, setConfirm] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState({ kind: "all", tag: null });
  const run = async (step, extra = {}) => {
    try {
      const { job, joined } = await post("/media/run", { project: projectId, step, ...extra });
      notify(joined ? `${job.label}\u5DF2\u5728\u8FDB\u884C\u4E2D` : `\u5DF2\u5F00\u59CB\uFF1A${job.label}`);
    } catch (e) {
      notify(e.message);
    }
  };
  const confirmRun = (step, impact, label, extra) => setConfirm({ impact, label, run: () => post("/media/run", { project: projectId, step, ...extra }).then(({ job }) => notify(`\u5DF2\u5F00\u59CB\uFF1A${job.label}`)) });
  const ffOk = status.ffmpeg.ok;
  const eagleOk = status.eagle.connected;
  const pendingCount = report.pending;
  const untagged = report.tagging.untagged;
  const maxReason = Math.max(1, ...Object.values(report.reasons));
  const details = showAll ? report.details : report.details.slice(0, 6);
  const restore = (d) => setConfirm({ impact: `\u6062\u590D ${d.rawId}\uFF08${d.reason}\uFF1A${d.evidence}\uFF09\u3002\u6062\u590D\u540E\u4F1A\u4FDD\u7559\u5B83\uFF0C\u5E76\u9700\u8981\u91CD\u65B0\u5207\u7247\u3002`, label: "\u6062\u590D", run: async () => {
    await post("/media/restore", { project: projectId, rawIds: [d.rawId] });
    notify(`\u5DF2\u6062\u590D ${d.rawId}\uFF0C\u8BB0\u5F97\u91CD\u65B0\u5207\u7247`);
  } });
  const ttl = (t) => t === "eagle" ? "Eagle \u672A\u8FDE\u63A5\uFF1A\u8BF7\u5148\u6253\u5F00 Eagle" : !ffOk ? "\u672A\u68C0\u6D4B\u5230 FFmpeg\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u91CC\u914D\u7F6E" : void 0;
  return /* @__PURE__ */ h(Fragment, null, !ffOk ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert" }, /* @__PURE__ */ h("span", { className: "grow" }, "\u672A\u68C0\u6D4B\u5230 FFmpeg / ffprobe\uFF0C\u5BFC\u5165\u3001\u6E05\u6D17\u3001\u5207\u7247\u548C\u51FA\u7247\u90FD\u9700\u8981\u5B83\u3002Windows \u53EF\u8FD0\u884C ", /* @__PURE__ */ h("code", null, "winget install Gyan.FFmpeg"), " \u5B89\u88C5\uFF0C\u7136\u540E\u91CD\u542F DSH Desktop\uFF1B\u6216\u5728\u53F3\u4E0A\u89D2 \u2699 \u8BBE\u7F6E\u91CC\u586B\u5199 ffmpeg.exe \u8DEF\u5F84\u3002")) : null, /* @__PURE__ */ h("div", { className: "dmw-sec dmw-actions" }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", disabled: !ffOk, title: ttl(), onClick: () => run("import") }, "\u5BFC\u5165\u7D20\u6750"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", disabled: !ffOk || !pendingCount && !report.imported, title: ttl(), onClick: () => pendingCount ? confirmRun("clean", `\u6E05\u6D17 ${pendingCount} \u6761\u5F85\u5904\u7406\u539F\u7247\u3002\u5224\u5B9A\u4E22\u5F03\u7684\u53EA\u505A\u767B\u8BB0\uFF0C\u539F\u7247\u4E0D\u79FB\u52A8\u3001\u4E0D\u5220\u9664\uFF0C\u53EF\u4E00\u952E\u6062\u590D\u3002`, "\u5F00\u59CB\u6E05\u6D17") : confirmRun("clean", `\u6309\u5F53\u524D\u89C4\u5219\u91CD\u65B0\u8BC4\u4F30\u5168\u90E8 ${report.imported} \u6761\u539F\u7247\uFF08\u4F60\u624B\u52A8\u6062\u590D\u8FC7\u7684\u4E0D\u4F1A\u518D\u88AB\u4E22\u5F03\uFF09\u3002`, "\u91CD\u65B0\u6E05\u6D17", { force: true }) }, pendingCount ? `\u6E05\u6D17\uFF08${pendingCount} \u6761\u5F85\u5904\u7406\uFF09` : "\u91CD\u65B0\u6E05\u6D17"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", disabled: !ffOk || !report.kept, title: ttl(), onClick: () => run("split") }, "\u955C\u5934\u5207\u7247"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", disabled: !report.clips, onClick: () => ask(untagged ? `\u7ED9 ${untagged} \u6761\u672A\u6253\u6807\u5207\u7247\u6253\u6807\uFF1A\u5148\u62BD\u5173\u952E\u5E27\uFF0C\u770B\u56FE\u540E\u53EA\u4ECE\u6807\u7B7E\u5B57\u5178\u91CC\u9009` : "\u68C0\u67E5\u5F85\u590D\u6838\u7684\u5207\u7247\uFF0C\u7ED9\u51FA\u4FEE\u6539\u5EFA\u8BAE") }, untagged ? `AI \u6253\u6807\uFF08${untagged} \u6761\uFF09` : "AI \u590D\u6838\u5EFA\u8BAE"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", disabled: !eagleOk || !report.clips, title: ttl(eagleOk ? null : "eagle"), onClick: () => confirmRun("eagle-push", `\u540C\u6B65 Eagle\uFF1A\u65B0\u589E ${report.clips - report.eagleSynced} \u6761\u4EE3\u7406\u5207\u7247\uFF08\u4F1A\u590D\u5236\u8FDB Eagle \u8D44\u6599\u5E93\uFF09\uFF0C\u66F4\u65B0 ${report.eagleDirty} \u6761\u5DF2\u6539\u6807\u7B7E\u3002`, "\u540C\u6B65") }, "\u540C\u6B65\u5230 Eagle"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn ghost", disabled: !eagleOk || !overview.project.eagle.folderId, title: ttl(eagleOk ? null : "eagle"), onClick: () => confirmRun("eagle-pull", `\u4ECE Eagle \u62C9\u53D6\u6807\u7B7E\uFF0C\u4F1A\u6539\u5199\u672C\u5730 ${report.eagleSynced} \u6761\u5DF2\u5165\u5E93\u5207\u7247\u4E2D\u88AB\u4F60\u5728 Eagle \u91CC\u6539\u8FC7\u7684\u6807\u7B7E\u3002`, "\u62C9\u53D6") }, "\u4ECE Eagle \u62C9\u53D6")), running ? /* @__PURE__ */ h("div", { className: "dmw-sec" }, /* @__PURE__ */ h(JobBar, { job: running, onCancel: onCancelJob })) : null, /* @__PURE__ */ h("div", { className: "dmw-sec" }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u6E05\u6D17\u62A5\u544A ", /* @__PURE__ */ h("span", { className: "sub" }, "\xB7 ", report.lastCleanAt ? `\u6700\u8FD1\u4E00\u6B21\u8FD0\u884C ${clock(report.lastCleanAt)}` : "\u8FD8\u6CA1\u6709\u8FD0\u884C\u6E05\u6D17", " \xB7 \u89C4\u5219\u7248\u672C ", report.rulesVersion)), !report.balanced ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert" }, "\u7EDF\u8BA1\u4E0D\u5E73\uFF1A\u4FDD\u7559 + \u4E22\u5F03 + \u5F85\u6E05\u6D17 \u2260 \u5BFC\u5165\uFF0C\u8BF7\u91CD\u65B0\u5BFC\u5165\u3002") : null, /* @__PURE__ */ h("div", { className: "dmw-stats" }, /* @__PURE__ */ h("div", { className: "dmw-stat" }, /* @__PURE__ */ h("div", { className: "n" }, report.imported), /* @__PURE__ */ h("div", { className: "l" }, "\u5BFC\u5165\u539F\u7247\uFF08\u6761\uFF09", report.pending ? ` \xB7 \u5F85\u6E05\u6D17 ${report.pending}` : "")), /* @__PURE__ */ h("div", { className: "dmw-stat g" }, /* @__PURE__ */ h("div", { className: "n" }, report.kept), /* @__PURE__ */ h("div", { className: "l" }, "\u4FDD\u7559\uFF08", pct(report.kept, report.imported), "\uFF09")), /* @__PURE__ */ h("div", { className: "dmw-stat r" }, /* @__PURE__ */ h("div", { className: "n" }, report.rejected), /* @__PURE__ */ h("div", { className: "l" }, "\u4E22\u5F03\uFF08", pct(report.rejected, report.imported), "\uFF09")), /* @__PURE__ */ h("div", { className: "dmw-stat" }, /* @__PURE__ */ h("div", { className: "n" }, report.clips), /* @__PURE__ */ h("div", { className: "l" }, "\u955C\u5934\u5207\u7247\uFF08\u6761\uFF09")), /* @__PURE__ */ h("div", { className: "dmw-stat" }, /* @__PURE__ */ h("div", { className: "n" }, report.eagleSynced), /* @__PURE__ */ h("div", { className: "l" }, "\u5DF2\u5165 Eagle", report.eagleMissing ? ` \xB7 \u7F3A\u5931 ${report.eagleMissing}` : ""))), report.unsupported?.length ? /* @__PURE__ */ h("details", { style: { marginTop: 8 } }, /* @__PURE__ */ h("summary", { className: "dmw-muted", style: { cursor: "pointer" } }, "\u65E0\u6CD5\u8BC6\u522B ", report.unsupported.length, " \u4E2A\u6587\u4EF6\uFF08\u4E0D\u8BA1\u5165\u4E22\u5F03\uFF09"), /* @__PURE__ */ h("ul", { className: "dmw-muted" }, report.unsupported.map((u) => /* @__PURE__ */ h("li", { key: u.path }, u.path, " \u2014 ", u.reason)))) : null, report.missing ? /* @__PURE__ */ h("div", { className: "dmw-muted", style: { marginTop: 6 } }, report.missing, " \u6761\u539F\u7247\u5DF2\u4E0D\u5728\u78C1\u76D8\u4E0A\uFF08\u672A\u8BA1\u5165\u7EDF\u8BA1\uFF09") : null), /* @__PURE__ */ h("div", { className: "dmw-grid2 dmw-sec" }, /* @__PURE__ */ h("div", { className: "dmw-box" }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u4E22\u5F03\u539F\u56E0\u5206\u5E03 ", /* @__PURE__ */ h("span", { className: "sub" }, "\uFF08", report.rejected, " \u6761\uFF09")), Object.entries(REASON_LABEL).map(([code, label]) => /* @__PURE__ */ h("div", { className: "dmw-reason", key: code }, /* @__PURE__ */ h("span", null, label), /* @__PURE__ */ h("span", { className: "track" }, /* @__PURE__ */ h("span", { className: "fill", style: { display: "block", width: `${report.reasons[code] / maxReason * 100}%` } })), /* @__PURE__ */ h("span", { className: "v" }, report.reasons[code] || 0))), /* @__PURE__ */ h("div", { className: "dmw-muted", style: { marginTop: 8 } }, "\u4E22\u5F03 \u2260 \u5220\u9664\uFF1A\u53EA\u505A\u767B\u8BB0\uFF0C\u539F\u7247\u7559\u5728\u539F\u5904\uFF0C\u53EF\u968F\u65F6\u6062\u590D")), /* @__PURE__ */ h("div", { className: "dmw-box" }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u4E22\u5F03\u660E\u7EC6 ", report.details.length > 6 ? /* @__PURE__ */ h("span", { className: "right" }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-link", onClick: () => setShowAll(!showAll) }, showAll ? "\u6536\u8D77" : `\u5168\u90E8 ${report.details.length} \u6761`)) : null), report.details.length ? /* @__PURE__ */ h("div", { className: "dmw-tablewrap" }, /* @__PURE__ */ h("table", { className: "dmw-table" }, /* @__PURE__ */ h("thead", null, /* @__PURE__ */ h("tr", null, /* @__PURE__ */ h("th", null, "\u6587\u4EF6"), /* @__PURE__ */ h("th", null, "\u539F\u56E0"), /* @__PURE__ */ h("th", null, "\u4F9D\u636E"), /* @__PURE__ */ h("th", null))), /* @__PURE__ */ h("tbody", null, details.map((d) => /* @__PURE__ */ h("tr", { key: d.rawId }, /* @__PURE__ */ h("td", { className: "nowrap", title: d.file }, d.file.split("/").pop()), /* @__PURE__ */ h("td", { className: "nowrap" }, d.reason), /* @__PURE__ */ h("td", null, d.evidence), /* @__PURE__ */ h("td", null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => restore(d) }, "\u6062\u590D"))))))) : /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u6CA1\u6709\u4E22\u5F03\u7684\u539F\u7247"))), /* @__PURE__ */ h("div", { className: "dmw-sec dmw-muted" }, "\u6253\u6807\u8D28\u91CF\uFF1AAI \u6807\u7B7E ", report.tagging.aiTags.toLocaleString(), " \u4E2A\uFF0C\u5207\u7247 ", report.clips, " \u6761\u4E2D\u5DF2\u6253\u6807 ", report.tagging.tagged, "\u3001\u5F85\u590D\u6838 ", report.tagging.needsReview, "\u3001\u4EBA\u5DE5\u5DF2\u590D\u6838 ", report.tagging.reviewed, report.tagging.adoption !== null ? `\uFF0C\u91C7\u7EB3\u7387 ${Math.round(report.tagging.adoption * 100)}%\uFF08${report.tagging.adoptionSample} \u6761\u590D\u6838\u6837\u672C\u53E3\u5F84\uFF09` : "\uFF0C\u590D\u6838\u540E\u663E\u793A\u91C7\u7EB3\u7387", "\u3002\u6807\u7B7E\u5B57\u5178\u5728\u300C\u6807\u7B7E\u300D\u9875\u7BA1\u7406", tags.pending.length ? `\uFF08\u6709 ${tags.pending.length} \u4E2A\u5F85\u5BA1\u6807\u7B7E\uFF09` : "", "\u3002"), /* @__PURE__ */ h(ClipGrid, { projectId, filter, setFilter, revision: overview.revision, dims: tags.dims, notify, total: report.clips }), confirm ? /* @__PURE__ */ h(Confirm, { impact: confirm.impact, confirmLabel: confirm.label, onConfirm: confirm.run, onClose: () => setConfirm(null) }) : null);
}
function ClipGrid({ projectId, filter, setFilter, revision, dims, notify, total, embedded = false }) {
  const [data, setData] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const params = { project: projectId, limit: 300 };
    if (filter.kind === "tag") params.tag = filter.tag;
    else if (filter.kind !== "all") params.filter = filter.kind;
    get("/clips", params).then((d) => {
      if (!cancelled) setData(d);
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, filter.kind, filter.tag, revision]);
  if (!total) return /* @__PURE__ */ h("div", { className: "dmw-sec dmw-box" }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u5207\u7247\u590D\u6838"), /* @__PURE__ */ h(Empty, { title: "\u8FD8\u6CA1\u6709\u5207\u7247" }, "\u5BFC\u5165 \u2192 \u6E05\u6D17 \u2192 \u5207\u7247\u540E\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A\u5207\u7247\u7F29\u7565\u56FE\uFF0C\u53EF\u4EE5\u9010\u6761\u590D\u6838\u6807\u7B7E\u3002"));
  const pills = [["all", "\u5168\u90E8"], ["review", "\u5F85\u590D\u6838"], ["untagged", "\u672A\u6253\u6807"], ["reviewed", "\u5DF2\u590D\u6838"]];
  const clips = data?.clips || [];
  return /* @__PURE__ */ h("div", { className: embedded ? "dmw-clipgrid-embedded" : "dmw-sec dmw-box" }, embedded ? null : /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u5207\u7247\u590D\u6838 ", /* @__PURE__ */ h("span", { className: "sub" }, "\xB7 \u70B9\u7F29\u7565\u56FE\u590D\u6838\u6807\u7B7E\uFF0C\u952E\u76D8 \u2190 \u2192 \u5207\u6362\uFF0CEnter \u786E\u8BA4")), embedded ? null : /* @__PURE__ */ h("div", { className: "dmw-pills" }, pills.map(([kind, label]) => /* @__PURE__ */ h("button", { type: "button", key: kind, className: "dmw-pill", "aria-pressed": filter.kind === kind, onClick: () => setFilter({ kind, tag: null }) }, label)), filter.tag ? /* @__PURE__ */ h("button", { type: "button", className: "dmw-pill", "aria-pressed": "true", onClick: () => setFilter({ kind: "all", tag: null }) }, "\u6807\u7B7E\uFF1A", filter.tag, " \u2715") : null, /* @__PURE__ */ h("span", { className: "dmw-muted", style: { alignSelf: "center" } }, data ? `${data.total} \u6761` : "")), data && !clips.length ? /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u5207\u7247") : null, /* @__PURE__ */ h("div", { className: "dmw-grid" }, clips.map((clip, i) => /* @__PURE__ */ h(ClipCard, { key: clip.id, clip, projectId, onOpen: () => setReviewing(i) }))), data && data.total > clips.length ? /* @__PURE__ */ h("div", { className: "dmw-muted", style: { marginTop: 8 } }, "\u53EA\u663E\u793A\u524D ", clips.length, " \u6761\uFF0C\u53EF\u7528\u6807\u7B7E\u6216\u72B6\u6001\u7B5B\u9009") : null, reviewing !== null && clips[reviewing] ? /* @__PURE__ */ h(
    ReviewDialog,
    {
      clip: clips[reviewing],
      index: reviewing,
      count: clips.length,
      projectId,
      dims,
      notify,
      onMove: (delta) => setReviewing(Math.max(0, Math.min(clips.length - 1, reviewing + delta))),
      onClose: () => setReviewing(null)
    }
  ) : null);
}
function ClipCard({ clip, projectId, onOpen }) {
  const low = new Set((clip.aiTags || []).filter((t) => t.confidence < 0.6).map((t) => t.tag));
  const state = clip.reviewed ? ["ok", "\u5DF2\u590D\u6838"] : clip.needsReview ? ["warn", "\u5F85\u590D\u6838"] : clip.tagStatus === "tagged" ? ["", "AI \u5DF2\u6253\u6807"] : ["bad", "\u672A\u6253\u6807"];
  return /* @__PURE__ */ h("button", { type: "button", className: "dmw-clip", onClick: onOpen, "aria-label": `${clip.id}\uFF0C${state[1]}\uFF0C${(clip.tags || []).join("\u3001")}` }, clip.thumb ? /* @__PURE__ */ h("img", { src: fileUrl(projectId, clip.thumb), alt: "", loading: "lazy" }) : /* @__PURE__ */ h("div", { className: "ph" }), /* @__PURE__ */ h("div", { className: "meta" }, /* @__PURE__ */ h("div", { className: "id" }, /* @__PURE__ */ h("span", { className: `dmw-dot ${state[0]}`, title: state[1] }), /* @__PURE__ */ h("span", null, clip.id), /* @__PURE__ */ h("span", { className: "dmw-muted", style: { marginLeft: "auto" } }, fmtDuration(clip.duration))), /* @__PURE__ */ h("div", { className: "tags" }, (clip.tags || []).map((t) => /* @__PURE__ */ h("span", { key: t, className: `dmw-mini${low.has(t) ? " low" : ""}` }, t)), (clip.pendingTags || []).map((p) => /* @__PURE__ */ h("span", { key: `p-${p.tag}`, className: "dmw-mini pend" }, p.tag, "?")))));
}
function ReviewDialog({ clip, index, count, projectId, dims, notify, onMove, onClose }) {
  const [selected, setSelected] = useState(new Set(clip.tags || []));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setSelected(new Set(clip.tags || []));
  }, [clip.id]);
  const confidence = Object.fromEntries((clip.aiTags || []).map((t) => [t.tag, t.confidence]));
  const save = useCallback(async (advance) => {
    setBusy(true);
    try {
      await post("/clips/review", { project: projectId, clipId: clip.id, tags: [...selected] });
      notify(`${clip.id} \u5DF2\u590D\u6838`);
      if (advance && index < count - 1) onMove(1);
    } catch (e) {
      notify(e.message);
    }
    setBusy(false);
  }, [selected, clip.id, index, count]);
  const onKey = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "VIDEO") return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onMove(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onMove(-1);
    }
    if (e.key === "Enter" && e.target.tagName !== "BUTTON") {
      e.preventDefault();
      save(true);
    }
  };
  const toggle = (tag) => {
    const next = new Set(selected);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setSelected(next);
  };
  return /* @__PURE__ */ h(Modal, { title: `\u590D\u6838 ${clip.id}\uFF08${index + 1}/${count}\uFF09`, wide: true, onClose, busy, footer: /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => onMove(-1), disabled: index === 0 || busy }, "\u2190 \u4E0A\u4E00\u6761"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => onMove(1), disabled: index >= count - 1 || busy }, "\u4E0B\u4E00\u6761 \u2192"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", onClick: () => save(true), disabled: busy }, "\u786E\u8BA4\u590D\u6838\uFF08Enter\uFF09")) }, /* @__PURE__ */ h("div", { className: "dmw-review", onKeyDown: onKey }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("video", { key: clip.id, src: fileUrl(projectId, clip.proxy), poster: clip.thumb ? fileUrl(projectId, clip.thumb) : void 0, controls: true, muted: true, playsInline: true }), /* @__PURE__ */ h("div", { className: "dmw-muted", style: { marginTop: 6 } }, "\u539F\u7247 ", clip.raw, " \xB7 \u5165\u70B9 ", clip.start, "s \xB7 \u51FA\u70B9 ", clip.end, "s \xB7 ", fmtDuration(clip.duration), clip.tagModel ? ` \xB7 \u6253\u6807\u6A21\u578B ${clip.tagModel}` : ""), clip.transcript ? /* @__PURE__ */ h("div", { style: { marginTop: 6 } }, "\u8F6C\u5199\uFF1A", clip.transcript) : null), /* @__PURE__ */ h("div", null, dims.map((dim) => /* @__PURE__ */ h("div", { className: "dmw-tagdim", key: dim.dim }, /* @__PURE__ */ h("div", { className: "dn" }, dim.dim), dim.tags.map((t) => /* @__PURE__ */ h("button", { type: "button", key: t.tag, className: `dmw-tag${selected.has(t.tag) ? "" : " tpl"}${confidence[t.tag] !== void 0 && confidence[t.tag] < 0.6 ? " low" : ""}`, "aria-pressed": selected.has(t.tag), onClick: () => toggle(t.tag) }, t.tag, confidence[t.tag] !== void 0 ? /* @__PURE__ */ h("i", null, Math.round(confidence[t.tag] * 100), "%") : null)))), clip.pendingTags?.length ? /* @__PURE__ */ h("div", { className: "dmw-muted" }, "AI \u5EFA\u8BAE\u7684\u5B57\u5178\u5916\u6807\u7B7E\uFF1A", clip.pendingTags.map((p) => p.tag).join("\u3001"), "\uFF08\u5230\u300C\u5F85\u5BA1\u300D\u91CC\u8F6C\u6B63\u540E\u53EF\u9009\uFF09") : null)));
}

// src/client/EditTab.jsx
var SUBS = { "burn+srt": "\u70E7\u5F55 + \u5BFC\u51FA SRT", srt: "\u53EA\u5BFC\u51FA SRT", burn: "\u53EA\u70E7\u5F55", none: "\u4E0D\u8981\u5B57\u5E55" };
var ENGINES = { ffmpeg: "FFmpeg \u76F4\u51FA MP4", jianying: "\u526A\u6620\u8349\u7A3F\uFF08\u53EF\u7CBE\u4FEE\uFF09", both: "\u4E24\u8005\u90FD\u8981" };
var ASPECTS = [["16:9", "\u6A2A\u5C4F 16:9"], ["9:16", "\u7AD6\u5C4F 9:16"], ["1:1", "\u65B9\u5F62 1:1"]];
function TargetInput({ value, onCommit }) {
  const [text, setText] = useState(value ? String(value) : "");
  useEffect(() => {
    setText(value ? String(value) : "");
  }, [value]);
  const commit = () => {
    const n = Number(text);
    const next = text.trim() === "" ? null : Number.isFinite(n) && n > 0 ? Math.round(n) : value;
    if (next !== (value || null)) onCommit(next);
    else setText(value ? String(value) : "");
  };
  return /* @__PURE__ */ h("input", { "aria-label": "\u76EE\u6807\u65F6\u957F", type: "number", min: "1", max: "7200", placeholder: "\u672A\u8BBE\u7F6E", value: text, onChange: (e) => setText(e.target.value), onBlur: commit, onKeyDown: (e) => {
    if (e.key === "Enter") e.currentTarget.blur();
  }, style: { width: 80 } });
}
function EditTab({ overview, projectId, notify, ask, running, onCancelJob, onReveal, onInfo }) {
  const { spec, options, match, staleMatch, timeline, exports: outputs, idea } = overview.edit;
  const docs = overview.creative.docs;
  const script = docs.find((d) => d.key === "02_\u6587\u6848.md");
  const board = overview.storyboard;
  const [confirm, setConfirm] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [player, setPlayer] = useState(null);
  const [busy, setBusy] = useState(null);
  const ffOk = overview.status.ffmpeg.ok;
  const setSpec = async (patch) => {
    try {
      await post("/edit/spec", { project: projectId, spec: { ...spec, ...patch } });
    } catch (e) {
      notify(e.message);
    }
  };
  const act = async (name, path, body = {}, message) => {
    setBusy(name);
    try {
      const r = await post(path, { project: projectId, ...body });
      if (message) notify(typeof message === "function" ? message(r) : message);
      return r;
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(null);
    }
  };
  const render = (kind) => post("/media/run", { project: projectId, step: kind === "final" ? "render-final" : "render-preview" }).then(({ job }) => notify(`\u5DF2\u5F00\u59CB\uFF1A${job.label}`)).catch((e) => notify(e.message));
  const res = options.resolutions[spec.resolution];
  const total = board?.total || 0;
  return /* @__PURE__ */ h(Fragment, null, staleMatch ? /* @__PURE__ */ h("div", { className: "dmw-banner warn", role: "status" }, /* @__PURE__ */ h("span", { className: "grow" }, "\u5206\u955C\u5DF2\u66F4\u65B0\u4E3A v", board.version, "\uFF08\u5339\u914D\u7ED3\u679C\u57FA\u4E8E v", match.storyboardVersion, "\uFF09\uFF0C\u9700\u8981\u91CD\u65B0\u5339\u914D\u3002"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => act("match", "/edit/match", {}, (r) => r && `\u5DF2\u91CD\u65B0\u5339\u914D\uFF1A${r.matched}/${r.total} \u955C`) }, "\u91CD\u65B0\u5339\u914D")) : null, board && !board.missing && board.editUse && board.currentVersion !== board.editUse ? /* @__PURE__ */ h("div", { className: "dmw-banner info", role: "status" }, "\u5206\u955C\u5F53\u524D\u662F v", board.currentVersion, "\uFF0C\u526A\u8F91\u4ECD\u5728\u7528\u300C\u526A\u8F91\u4F7F\u7528\u7248\u672C\u300Dv", board.editUse, "\u3002\u9700\u8981\u6362\u7248\u672C\u8BF7\u5230\u521B\u610F\u6A21\u5757\u70B9\u300C\u8BBE\u4E3A\u526A\u8F91\u4F7F\u7528\u7248\u672C\u300D\u3002") : null, /* @__PURE__ */ h("div", { className: "dmw-grid2 dmw-sec" }, /* @__PURE__ */ h("div", { className: "dmw-box" }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u8F93\u51FA\u89C4\u683C ", /* @__PURE__ */ h("span", { className: "sub" }, "\xB7 \u521B\u610F\u526A\u8F91/\u526A\u8F91\u6570\u636E/edit_spec.json")), /* @__PURE__ */ h("div", { className: "dmw-kv" }, /* @__PURE__ */ h("span", null, "\u753B\u5E45"), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("span", { className: "dmw-seg", role: "group", "aria-label": "\u753B\u5E45" }, ASPECTS.map(([a, label]) => /* @__PURE__ */ h("button", { type: "button", key: a, "aria-pressed": res?.aspect === a, onClick: () => {
    if (res?.aspect !== a) setSpec({ resolution: Object.keys(options.resolutions).find((k) => options.resolutions[k].aspect === a) });
  } }, label)))), /* @__PURE__ */ h("span", null, "\u5206\u8FA8\u7387"), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("select", { "aria-label": "\u5206\u8FA8\u7387", value: spec.resolution, onChange: (e) => setSpec({ resolution: e.target.value }) }, Object.entries(options.resolutions).filter(([, v]) => v.aspect === res?.aspect).map(([k, v]) => /* @__PURE__ */ h("option", { key: k, value: k }, v.label)))), /* @__PURE__ */ h("span", null, "\u5E27\u7387"), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("select", { "aria-label": "\u5E27\u7387", value: spec.fps, onChange: (e) => setSpec({ fps: Number(e.target.value) }) }, options.fps.map((f) => /* @__PURE__ */ h("option", { key: f, value: f }, f, " fps")))), /* @__PURE__ */ h("span", null, "\u7F16\u7801 / \u7801\u7387"), /* @__PURE__ */ h("span", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ h("select", { "aria-label": "\u7F16\u7801", value: spec.codec, onChange: (e) => setSpec({ codec: e.target.value }) }, /* @__PURE__ */ h("option", { value: "h265" }, "H.265"), /* @__PURE__ */ h("option", { value: "h264" }, "H.264")), /* @__PURE__ */ h("input", { "aria-label": "\u7801\u7387", type: "number", min: "1", max: "400", value: spec.bitrateMbps, onChange: (e) => setSpec({ bitrateMbps: Number(e.target.value) }) }), " Mbps", spec.codec === "h265" && !overview.status.ffmpeg.h265 && ffOk ? /* @__PURE__ */ h("span", { className: "dmw-warn" }, "\u672C\u673A FFmpeg \u65E0 H.265\uFF0C\u4F1A\u6539\u7528 H.264") : null), /* @__PURE__ */ h("span", null, "\u76EE\u6807\u65F6\u957F"), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h(TargetInput, { value: spec.targetDuration, onCommit: (v) => setSpec({ targetDuration: v }) }), " \u79D2 ", total ? /* @__PURE__ */ h("span", { className: spec.targetDuration && Math.abs(total - spec.targetDuration) > spec.targetDuration * 0.1 ? "dmw-warn" : "dmw-muted" }, "\uFF08\u5206\u955C\u5408\u8BA1 ", total, "s\uFF09") : null, !spec.targetDuration ? /* @__PURE__ */ h("span", { className: "dmw-muted", style: { display: "block", marginTop: 4 } }, "\u672A\u8BBE\u7F6E\u65F6\uFF0CAI \u5199\u6587\u6848\u4F1A\u6309\u7B80\u62A5\u91CC\u7684\u65F6\u957F\uFF0C\u6216\u5148\u95EE\u4F60") : null), /* @__PURE__ */ h("span", null, "\u5B57\u5E55"), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("select", { "aria-label": "\u5B57\u5E55", value: spec.subtitles, onChange: (e) => setSpec({ subtitles: e.target.value }) }, Object.entries(SUBS).map(([k, v]) => /* @__PURE__ */ h("option", { key: k, value: k }, v)))), /* @__PURE__ */ h("span", null, "\u8F6C\u573A"), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("select", { "aria-label": "\u8F6C\u573A", value: spec.transition, onChange: (e) => setSpec({ transition: e.target.value }) }, /* @__PURE__ */ h("option", { value: "cut" }, "\u786C\u5207"), /* @__PURE__ */ h("option", { value: "dissolve" }, "\u573A\u666F\u5207\u6362\u5904 0.5s \u53E0\u5316"))), /* @__PURE__ */ h("span", null, "\u8F93\u51FA\u5F15\u64CE"), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("select", { "aria-label": "\u8F93\u51FA\u5F15\u64CE", value: spec.engine, onChange: (e) => setSpec({ engine: e.target.value }) }, Object.entries(ENGINES).map(([k, v]) => /* @__PURE__ */ h("option", { key: k, value: k }, v)))))), /* @__PURE__ */ h("div", { className: "dmw-box" }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u526A\u8F91\u601D\u8DEF ", /* @__PURE__ */ h("span", { className: "sub" }, "\xB7 \u5173\u8054 \u6587\u6848 ", script?.exists ? `v${script.editUse || script.version}${script.editUse ? "\uFF08\u526A\u8F91\u4F7F\u7528\uFF09" : ""}` : "\u2014", " / \u5206\u955C ", board && !board.missing ? `v${board.version}${board.editUse ? "\uFF08\u526A\u8F91\u4F7F\u7528\uFF09" : ""}` : "\u2014")), idea ? /* @__PURE__ */ h("div", { style: { maxHeight: 260, overflow: "auto" } }, /* @__PURE__ */ h(Markdown, { text: idea.content.replace(/^#.*\n/, "") })) : /* @__PURE__ */ h(Empty, { title: "\u8FD8\u6CA1\u6709\u526A\u8F91\u601D\u8DEF", action: /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", onClick: () => ask("\u6839\u636E\u6587\u6848\u548C\u5206\u955C\u5199\u526A\u8F91\u601D\u8DEF\uFF1A\u8282\u594F\u3001BGM \u4E0E BPM\u3001\u8F6C\u573A\u3001\u914D\u97F3\u65B9\u6848") }, "\u8BA9 AI \u5199\u526A\u8F91\u601D\u8DEF") }, "\u8282\u594F\u5B89\u6392\u3001BGM \u4E0E BPM\u3001\u8F6C\u573A\u7B56\u7565\u3001\u914D\u97F3\u65B9\u6848\uFF0C\u4FDD\u5B58\u5728 \u521B\u610F\u526A\u8F91/\u526A\u8F91\u601D\u8DEF.md\uFF0C\u53EF\u5728\u521B\u610F\u6A21\u5757\u91CC\u7F16\u8F91\u3002"))), /* @__PURE__ */ h("div", { className: "dmw-box dmw-sec" }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u5206\u955C \xD7 \u7D20\u6750\u5339\u914D ", /* @__PURE__ */ h("span", { className: "sub" }, match ? `\xB7 \u5DF2\u5339\u914D ${match.matched} / ${match.total} \u955C${match.total - match.matched ? `\uFF0C\u7F3A ${match.total - match.matched} \u955C` : ""} \xB7 ${clock(match.at)}` : "")), !board || board.missing ? /* @__PURE__ */ h(Empty, { title: "\u8FD8\u6CA1\u6709\u5206\u955C\u811A\u672C", action: /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", onClick: () => ask("\u6839\u636E\u6587\u6848\u51FA\u5206\u955C\u811A\u672C\uFF0C\u6BCF\u955C\u90FD\u8981\u5199\u6240\u9700\u6807\u7B7E") }, "\u8BA9 AI \u51FA\u5206\u955C") }, "\u5339\u914D\u6309\u5206\u955C\u91CC\u6BCF\u4E00\u955C\u7684\u300C\u6240\u9700\u6807\u7B7E\u300D\u53BB\u7D20\u6750\u5E93\u68C0\u7D22\u5207\u7247\u3002") : !match ? /* @__PURE__ */ h(Empty, { title: "\u8FD8\u6CA1\u6709\u5339\u914D", action: /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", disabled: !!busy, onClick: () => act("match", "/edit/match", {}, (r) => r && `\u5339\u914D\u5B8C\u6210\uFF1A${r.matched}/${r.total} \u955C`) }, "\u6309\u5206\u955C\u5339\u914D\u7D20\u6750") }, "\u5206\u955C v", board.version, " \u5171 ", board.count, " \u955C\uFF0C\u5408\u8BA1 ", board.total, "s\u3002") : /* @__PURE__ */ h("div", { className: "dmw-tablewrap" }, /* @__PURE__ */ h("table", { className: "dmw-table" }, /* @__PURE__ */ h("thead", null, /* @__PURE__ */ h("tr", null, /* @__PURE__ */ h("th", null, "\u955C\u53F7"), /* @__PURE__ */ h("th", null, "\u65F6\u957F"), /* @__PURE__ */ h("th", null, "\u753B\u9762 / \u53F0\u8BCD"), /* @__PURE__ */ h("th", null, "\u6240\u9700\u6807\u7B7E"), /* @__PURE__ */ h("th", null, "\u5339\u914D\u7D20\u6750\uFF08Top1\uFF09"), /* @__PURE__ */ h("th", null, "\u72B6\u6001"))), /* @__PURE__ */ h("tbody", null, match.shots.map((shot) => {
    const top1 = shot.top.find((t) => t.clipId === shot.selected);
    return /* @__PURE__ */ h("tr", { key: shot.no, className: shot.warnings?.length ? "warn" : void 0 }, /* @__PURE__ */ h("td", { className: "nowrap" }, shot.no), /* @__PURE__ */ h("td", { className: "nowrap" }, shot.duration, "s"), /* @__PURE__ */ h("td", { style: { minWidth: 160 } }, shot.desc, shot.line ? /* @__PURE__ */ h("span", { className: "dmw-muted" }, " \xB7\u300C", shot.line, "\u300D") : ""), /* @__PURE__ */ h("td", { style: { minWidth: 100 } }, shot.required.join(" ") || /* @__PURE__ */ h("span", { className: "dmw-warn" }, "\u7F3A\u6240\u9700\u6807\u7B7E")), /* @__PURE__ */ h("td", { style: { minWidth: 170 } }, shot.selected ? /* @__PURE__ */ h("span", { style: { display: "inline-flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ h("img", { className: "dmw-match-thumb", alt: "", src: fileUrl(projectId, `.dsh/cache/thumbs/${shot.selected}.jpg`) }), " ", shot.selected, /* @__PURE__ */ h("span", { className: "dmw-muted" }, "\uFF08", top1?.score ?? "\u624B\u9009", "\uFF09")) : "\u2014", shot.top.length ? /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-link", "aria-expanded": expanded === shot.no, onClick: () => setExpanded(expanded === shot.no ? null : shot.no) }, expanded === shot.no ? "\u6536\u8D77" : `Top${Math.min(3, shot.top.length)} \u66FF\u6362`)) : null, expanded === shot.no ? /* @__PURE__ */ h("div", { className: "dmw-top3" }, shot.top.map((t) => /* @__PURE__ */ h("button", { type: "button", key: t.clipId, "aria-pressed": t.clipId === shot.selected, onClick: () => act("select", "/edit/select", { no: shot.no, clipId: t.clipId }, `\u955C ${shot.no} \u6539\u7528 ${t.clipId}`) }, /* @__PURE__ */ h("img", { className: "dmw-match-thumb", alt: "", src: fileUrl(projectId, `.dsh/cache/thumbs/${t.clipId}.jpg`) }), /* @__PURE__ */ h("span", null, t.clipId, /* @__PURE__ */ h("br", null), /* @__PURE__ */ h("span", { className: "dmw-muted" }, t.score ?? "\u624B\u9009", " \xB7 ", fmtDuration(t.duration), t.short ? " \xB7 \u65F6\u957F\u4E0D\u8DB3" : "", t.missing?.length ? ` \xB7 \u7F3A ${t.missing.join(" ")}` : "")))), shot.selected ? /* @__PURE__ */ h("button", { type: "button", onClick: () => act("select", "/edit/select", { no: shot.no, clipId: "" }, `\u5DF2\u6E05\u7A7A\u955C ${shot.no}`) }, "\u4E0D\u4F7F\u7528\u7D20\u6750\uFF08\u5217\u5165\u7F3A\u53E3\uFF09") : null) : null), /* @__PURE__ */ h("td", { className: shot.status === "matched" ? "dmw-ok nowrap" : shot.status === "short" ? "dmw-warn nowrap" : "dmw-bad" }, shot.status === "matched" ? shot.manual ? "\u5DF2\u5339\u914D\uFF08\u624B\u9009\uFF09" : "\u5DF2\u5339\u914D" : shot.status === "short" ? "\u65F6\u957F\u4E0D\u8DB3" : `\u7F3A\u7D20\u6750${shot.note ? ` \xB7 ${shot.note}` : ""}`));
  })))), board && !board.missing ? /* @__PURE__ */ h("div", { className: "dmw-actions", style: { marginTop: 10 } }, match ? /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", disabled: !!busy, onClick: () => act("match", "/edit/match", {}, (r) => r && `\u5DF2\u91CD\u65B0\u5339\u914D\uFF1A${r.matched}/${r.total} \u955C`) }, "\u91CD\u65B0\u5339\u914D") : null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", disabled: !match || !!busy, onClick: () => act("gaps", "/edit/gaps", {}, (r) => r && `\u7F3A\u53E3\u6E05\u5355\u5DF2\u5BFC\u51FA\uFF1A${r.count} \u955C \u2192 ${r.file}`) }, "\u5BFC\u51FA\u7F3A\u53E3\u6E05\u5355"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", disabled: !match?.matched || !!busy, onClick: () => act("timeline", "/edit/timeline", {}, (r) => r && `\u65F6\u95F4\u7EBF\u5DF2\u751F\u6210\uFF1A${r.segments} \u6BB5\uFF0C${r.duration}s`) }, "\u751F\u6210\u65F6\u95F4\u7EBF"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", disabled: !timeline || !ffOk, onClick: () => render("preview") }, "FFmpeg \u7C97\u526A\u9884\u89C8"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", disabled: !timeline || !ffOk, onClick: () => setConfirm({ impact: `\u6B63\u5F0F\u6E32\u67D3\uFF1A${res?.label} \xB7 ${spec.fps}fps \xB7 ${spec.codec.toUpperCase()} ${spec.bitrateMbps}Mbps \xB7 \u5B57\u5E55${SUBS[spec.subtitles]}\uFF0C\u65F6\u957F\u7EA6 ${timeline?.duration}s\uFF08${timeline?.segments} \u6BB5\uFF09\uFF0C\u7528\u539F\u7247\u8F93\u51FA\u5230\u300C\u8F93\u51FA\u7D20\u6750\u5E93/\u6210\u7247\u300D\uFF0C\u5E76\u5199\u5165 manifest.json\u3002`, label: "\u5F00\u59CB\u6E32\u67D3", run: () => render("final") }) }, "FFmpeg \u76F4\u51FA"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", title: "\u526A\u6620\u8349\u7A3F\u9002\u914D\u5668\u5F85\u9A8C\u8BC1\u63A5\u5165", disabled: !timeline, onClick: () => post("/edit/capcut", { project: projectId }).catch((e) => onInfo({ title: "\u526A\u6620\u8349\u7A3F", text: e.message })) }, "\u751F\u6210\u526A\u6620\u8349\u7A3F\uFF08\u5F85\u63A5\u5165\uFF09"), timeline ? /* @__PURE__ */ h("span", { className: "dmw-muted" }, "\u65F6\u95F4\u7EBF ", timeline.segments, " \u6BB5 \xB7 ", timeline.duration, "s \xB7 ", clock(timeline.at), timeline.warnings?.length ? ` \xB7 ${timeline.warnings.length} \u6761\u63D0\u793A` : "") : null) : null, timeline?.warnings?.length ? /* @__PURE__ */ h("ul", { className: "dmw-muted", style: { margin: "8px 0 0", paddingLeft: 18 } }, timeline.warnings.map((w) => /* @__PURE__ */ h("li", { key: w }, w))) : null), running && running.kind?.startsWith("render") ? /* @__PURE__ */ h("div", { className: "dmw-sec" }, /* @__PURE__ */ h(JobBar, { job: running, onCancel: onCancelJob })) : null, /* @__PURE__ */ h("div", { className: "dmw-box dmw-sec" }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u6210\u7247 ", /* @__PURE__ */ h("span", { className: "sub" }, "\xB7 \u8F93\u51FA\u7D20\u6750\u5E93/\u6210\u7247")), outputs.length ? /* @__PURE__ */ h("div", { className: "dmw-tablewrap" }, /* @__PURE__ */ h("table", { className: "dmw-table" }, /* @__PURE__ */ h("thead", null, /* @__PURE__ */ h("tr", null, /* @__PURE__ */ h("th", null, "\u6587\u4EF6"), /* @__PURE__ */ h("th", null, "\u89C4\u683C"), /* @__PURE__ */ h("th", null, "\u65F6\u957F"), /* @__PURE__ */ h("th", null, "\u7248\u672C"), /* @__PURE__ */ h("th", null))), /* @__PURE__ */ h("tbody", null, outputs.map((o) => /* @__PURE__ */ h("tr", { key: o.name }, /* @__PURE__ */ h("td", { style: { minWidth: 180 } }, o.name, /* @__PURE__ */ h("div", { className: "dmw-muted" }, clock(o.at), " \xB7 ", fmtSize(o.size), o.manifest?.kind === "preview" ? " \xB7 \u7C97\u526A\u9884\u89C8" : "")), /* @__PURE__ */ h("td", { className: "nowrap" }, o.manifest ? `${o.manifest.width}\xD7${o.manifest.height} \xB7 ${o.manifest.fps}fps` : "\u2014"), /* @__PURE__ */ h("td", { className: "nowrap" }, o.manifest ? `${fmtDuration(o.manifest.duration)}${o.manifest.durationError !== void 0 ? `\uFF08\u8BEF\u5DEE ${o.manifest.durationError}s\uFF09` : ""}` : "\u2014"), /* @__PURE__ */ h("td", { className: "nowrap" }, o.manifest?.versions ? `\u6587\u6848 v${o.manifest.versions.scriptEditUse ?? o.manifest.versions.script ?? "\u2014"} / \u5206\u955C v${o.manifest.versions.storyboard}` : "\u2014"), /* @__PURE__ */ h("td", { className: "nowrap" }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => setPlayer(o) }, "\u64AD\u653E"), " ", /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => onReveal(o.path) }, "\u5728\u6587\u4EF6\u5939\u4E2D\u663E\u793A"))))))) : /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u8FD8\u6CA1\u6709\u6210\u7247\u3002\u751F\u6210\u65F6\u95F4\u7EBF\u540E\u53EF\u4EE5\u5148\u51FA\u4E00\u7248\u7C97\u526A\u9884\u89C8\u3002")), confirm ? /* @__PURE__ */ h(Confirm, { impact: confirm.impact, confirmLabel: confirm.label, onConfirm: confirm.run, onClose: () => setConfirm(null) }) : null, player ? /* @__PURE__ */ h(Modal, { title: player.name, wide: true, onClose: () => setPlayer(null) }, /* @__PURE__ */ h("video", { src: fileUrl(projectId, player.path), controls: true, autoPlay: true, style: { width: "100%", maxHeight: "65vh", background: "#000", borderRadius: 8 } }), player.manifest?.notes?.length ? /* @__PURE__ */ h("ul", { className: "dmw-muted" }, player.manifest.notes.map((n) => /* @__PURE__ */ h("li", { key: n }, n))) : null) : null);
}

// src/client/TagTab.jsx
var BASE_DIMS = ["\u573A\u666F", "\u4E3B\u4F53", "\u666F\u522B", "\u8FD0\u955C", "\u60C5\u7EEA", "\u7528\u9014"];
var OPS = { add: "\u65B0\u589E", rename: "\u6539\u540D", merge: "\u5408\u5E76", delete: "\u5220\u9664", move: "\u79FB\u52A8\u7EF4\u5EA6", approve: "\u8F6C\u6B63", reject: "\u9A73\u56DE" };
var TAG_PROMPTS = {
  footage: "\u770B\u4E00\u4E0B\u8FD9\u4E2A\u9879\u76EE\u7684\u7D20\u6750\uFF08\u5DF2\u5207\u7247\u5C31\u770B\u5207\u7247\uFF0C\u5426\u5219\u770B\u539F\u7247\uFF09\uFF0C\u5E2E\u6211\u5EFA\u8BAE\u4E00\u6279\u6807\u7B7E\uFF1A\u53EA\u653E\u8FDB\u5F85\u5BA1\u533A\uFF0C\u6BCF\u4E2A\u6807\u7B7E\u7ED9\u51FA\u5EFA\u8BAE\u7EF4\u5EA6\uFF0C\u5E76\u8BF4\u660E\u7406\u7531",
  script: "\u6839\u636E\u4E3B\u9898\u7B80\u62A5\u3001\u6587\u6848\u548C\u5206\u955C\uFF0C\u8865\u5145\u526A\u8F91\u9700\u8981\u7684\u6807\u7B7E\uFF1A\u5B57\u5178\u91CC\u6CA1\u6709\u7684\u653E\u8FDB\u5F85\u5BA1\u533A\uFF0C\u5E76\u7ED9\u51FA\u5EFA\u8BAE\u7EF4\u5EA6",
  tidy: "\u68C0\u67E5\u6807\u7B7E\u5B57\u5178\u91CC\u610F\u601D\u76F8\u8FD1\u6216\u91CD\u590D\u7684\u6807\u7B7E\uFF0C\u7ED9\u6211\u4E00\u4E2A\u5408\u5E76 / \u6539\u540D\u7684\u5EFA\u8BAE\u6E05\u5355\uFF0C\u5148\u4E0D\u8981\u76F4\u63A5\u6539",
  tagClips: "\u7ED9\u672A\u6253\u6807\u7684\u5207\u7247\u6253\u6807\uFF1A\u5148\u62BD\u5173\u952E\u5E27\uFF0C\u770B\u56FE\u540E\u53EA\u4ECE\u6807\u7B7E\u5B57\u5178\u91CC\u9009"
};
function TagTab({ overview, projectId, notify, ask, onReveal }) {
  const tags = overview.material.tags;
  const templates = overview.templates || [];
  const [selected, setSelected] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [switching, setSwitching] = useState(null);
  const [editor, setEditor] = useState(null);
  const [saveAs, setSaveAs] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const current = templates.find((t) => t.key === tags.inherit);
  const dims = tags.dims;
  const allTags = dims.flatMap((d) => d.tags.map((t) => ({ ...t, dim: d.dim })));
  const selectedInfo = selected ? allTags.find((t) => t.tag === selected) : null;
  useEffect(() => {
    if (selected && !selectedInfo) setSelected(null);
  }, [selected, selectedInfo]);
  const detailRef = useRef(null);
  useEffect(() => {
    if (selected) detailRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }, [selected]);
  const runOp = async (body, message) => {
    try {
      const r = await post("/tags/op", { project: projectId, ...body });
      notify(message || `${r.summary}${r.clips ? `\uFF0C\u66F4\u65B0 ${r.clips} \u6761\u5207\u7247` : ""}`);
      return r;
    } catch (e) {
      notify(e.message);
      return null;
    }
  };
  const previewSwitch = async (key) => {
    if (!key || key === tags.inherit) return;
    try {
      const preview = await post("/templates/switch", { project: projectId, key });
      setSwitching({ key, ...preview });
    } catch (e) {
      notify(e.message);
    }
  };
  const pending = tags.pending;
  const approveAll = () => setDialog({ kind: "bulk", ops: pending.map((p) => ({ op: "approve", tag: p.tag, dim: p.suggestedDim && dims.some((d) => d.dim === p.suggestedDim) ? p.suggestedDim : "\u573A\u666F" })), label: `\u628A ${pending.length} \u4E2A\u5F85\u5BA1\u6807\u7B7E\u6309\u5EFA\u8BAE\u7EF4\u5EA6\u5168\u90E8\u8F6C\u6B63` });
  const rejectAll = () => setDialog({ kind: "bulk", ops: pending.map((p) => ({ op: "reject", tag: p.tag })), label: `\u9A73\u56DE\u5168\u90E8 ${pending.length} \u4E2A\u5F85\u5BA1\u6807\u7B7E` });
  return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("div", { className: "dmw-sec dmw-box dmw-tplbar" }, /* @__PURE__ */ h("div", { className: "dmw-tplbar-main" }, /* @__PURE__ */ h("span", { className: "dmw-muted" }, "\u6807\u7B7E\u6A21\u677F"), /* @__PURE__ */ h("select", { "aria-label": "\u5207\u6362\u6807\u7B7E\u6A21\u677F", value: tags.inherit || "", onChange: (e) => previewSwitch(e.target.value) }, !current ? /* @__PURE__ */ h("option", { value: tags.inherit || "" }, tags.inherit ? `${tags.inheritLabel}\uFF08\u6A21\u677F\u5DF2\u4E0D\u5B58\u5728\uFF09` : "\u672A\u9009\u62E9") : null, templates.map((t) => /* @__PURE__ */ h("option", { key: t.key, value: t.key }, t.label, t.builtin ? "" : "\uFF08\u6211\u7684\u6A21\u677F\uFF09"))), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => setEditor({ key: tags.inherit }), disabled: !current }, "\u7F16\u8F91\u6A21\u677F"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => setSaveAs(true) }, "\u53E6\u5B58\u4E3A\u6A21\u677F"), /* @__PURE__ */ h("span", { className: "dmw-muted dmw-tplbar-stat" }, "\u5171 ", tags.totalTags, " \u4E2A\u6807\u7B7E \xB7 ", tags.clips, " \u6761\u5207\u7247", pending.length ? ` \xB7 \u5F85\u5BA1 ${pending.length}` : "")), tags.templateMissing ? /* @__PURE__ */ h("div", { className: "dmw-banner warn", style: { margin: "8px 0 0" } }, "\u8FD9\u4E2A\u9879\u76EE\u7EE7\u627F\u7684\u6A21\u677F\u300C", tags.inheritLabel, "\u300D\u5DF2\u88AB\u5220\u9664\uFF0C\u6A21\u677F\u91CC\u7684\u6807\u7B7E\u4E0D\u53EF\u7528\u4E86\u3002\u8BF7\u6362\u4E00\u4E2A\u6A21\u677F\u3002") : null, /* @__PURE__ */ h("div", { className: "dmw-muted", style: { marginTop: 6 } }, "\u6A21\u677F\u91CC\u7684\u6807\u7B7E\uFF08\u6D45\u8272\uFF09\u6240\u6709\u7528\u8FD9\u4E2A\u6A21\u677F\u7684\u9879\u76EE\u5171\u7528\uFF1B\u5728\u8FD9\u91CC\u65B0\u589E\u7684\u662F\u672C\u9879\u76EE\u81EA\u5DF1\u7684\u6807\u7B7E\uFF08\u6DF1\u8272\uFF09\u3002\u6253\u6807\u548C\u5339\u914D\u53EA\u7528\u8FD9\u4E9B\u8BCD\u3002")), /* @__PURE__ */ h("div", { className: "dmw-sec dmw-box dmw-aibox" }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u8BA9 AI \u751F\u6210\u6807\u7B7E ", /* @__PURE__ */ h("span", { className: "sub" }, "\xB7 \u5728\u53F3\u4FA7\u5BF9\u8BDD\u91CC\u8FDB\u884C\uFF0C\u5EFA\u8BAE\u7684\u65B0\u6807\u7B7E\u4F1A\u5148\u8FDB\u300C\u5F85\u5BA1\u300D\uFF0C\u7531\u4F60\u8F6C\u6B63")), /* @__PURE__ */ h("div", { className: "dmw-actions" }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", onClick: () => ask(TAG_PROMPTS.footage) }, "\u6839\u636E\u7D20\u6750\u5EFA\u8BAE\u6807\u7B7E"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => ask(TAG_PROMPTS.script) }, "\u6839\u636E\u6587\u6848\u548C\u5206\u955C\u8865\u6807\u7B7E"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: () => ask(TAG_PROMPTS.tidy) }, "\u6574\u7406\u76F8\u8FD1\u7684\u6807\u7B7E"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn ghost", disabled: !tags.clips, title: tags.clips ? void 0 : "\u5148\u5728\u7D20\u6750\u9875\u5BFC\u5165\u3001\u6E05\u6D17\u3001\u5207\u7247", onClick: () => ask(TAG_PROMPTS.tagClips) }, "\u7ED9\u5207\u7247\u6253\u6807")), !overview.material.report.imported ? /* @__PURE__ */ h("div", { className: "dmw-muted", style: { marginTop: 8 } }, "\u8FD8\u6CA1\u6709\u5BFC\u5165\u7D20\u6750\u3002AI \u4F1A\u5148\u5BFC\u5165\u300C\u539F\u59CB\u7D20\u6750\u5E93\u300D\u91CC\u7684\u89C6\u9891\u518D\u770B\u56FE\uFF1B\u4E5F\u53EF\u4EE5\u5148\u53BB\u7D20\u6750\u9875\u5BFC\u5165\u3002") : null), pending.length ? /* @__PURE__ */ h("div", { className: "dmw-sec dmw-box dmw-pendbox" }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u5F85\u5BA1 ", /* @__PURE__ */ h("span", { className: "sub" }, "\xB7 AI \u5EFA\u8BAE\u7684\u65B0\u6807\u7B7E\uFF0C\u8F6C\u6B63\u540E\u624D\u53C2\u4E0E\u6253\u6807\u548C\u5339\u914D"), /* @__PURE__ */ h("span", { className: "right" }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm pri", onClick: approveAll }, "\u5168\u90E8\u8F6C\u6B63"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: rejectAll }, "\u5168\u90E8\u9A73\u56DE"))), /* @__PURE__ */ h("div", { className: "dmw-pendlist" }, pending.map((p) => /* @__PURE__ */ h(PendingRow, { key: p.tag, item: p, dims, onApprove: (dim) => runOp({ op: "approve", tag: p.tag, dim }), onReject: () => runOp({ op: "reject", tag: p.tag }) })))) : null, /* @__PURE__ */ h("div", { className: "dmw-sec dmw-box" }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u6807\u7B7E\u5B57\u5178 ", /* @__PURE__ */ h("span", { className: "sub" }, "\xB7 \u70B9\u6807\u7B7E\u67E5\u770B\u7528\u5230\u5B83\u7684\u5207\u7247\u548C\u66F4\u591A\u64CD\u4F5C \xB7 \u6570\u5B57\u4E3A\u5207\u7247\u6570"), /* @__PURE__ */ h("span", { className: "right" }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => setDialog({ kind: "dim" }) }, "\uFF0B \u65B0\u589E\u7EF4\u5EA6"))), !tags.exists ? /* @__PURE__ */ h("div", { className: "dmw-banner warn" }, "\u8FD8\u6CA1\u6709\u6807\u7B7E\u5B57\u5178\u3002\u9009\u4E00\u4E2A\u6807\u7B7E\u6A21\u677F\uFF0C\u6216\u70B9\u4E0A\u9762\u7684\u300C\u6839\u636E\u7D20\u6750\u5EFA\u8BAE\u6807\u7B7E\u300D\u3002") : null, dims.map((dim) => /* @__PURE__ */ h(
    DimRow,
    {
      key: dim.dim,
      dim,
      selected,
      onSelect: (tag) => setSelected(selected === tag ? null : tag),
      onAdd: (tag) => runOp({ op: "add", tag, dim: dim.dim }, `\u5DF2\u5728\u3010${dim.dim}\u3011\u65B0\u589E\u300C${tag}\u300D`),
      onDeleteDim: !dim.base && !dim.tags.length ? () => runOp({ op: "delete-dim", dim: dim.dim }) : null
    }
  ))), selectedInfo ? /* @__PURE__ */ h("div", { className: "dmw-sec dmw-box dmw-tagdetail", "aria-live": "polite", ref: detailRef }, /* @__PURE__ */ h("h3", { className: "dmw-h3" }, "\u300C", selectedInfo.tag, "\u300D", /* @__PURE__ */ h("span", { className: "sub" }, "\xB7 ", selectedInfo.dim, " \xB7 ", selectedInfo.fromTemplate ? `\u6765\u81EA\u6A21\u677F\u300C${tags.inheritLabel}\u300D` : "\u672C\u9879\u76EE\u6807\u7B7E", " \xB7 ", selectedInfo.count, " \u6761\u5207\u7247"), /* @__PURE__ */ h("span", { className: "right" }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => setDialog({ kind: "op", op: "rename", tag: selectedInfo.tag }) }, "\u6539\u540D"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => setDialog({ kind: "op", op: "merge", tag: selectedInfo.tag }) }, "\u5408\u5E76\u5230\u2026"), !selectedInfo.fromTemplate ? /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => setDialog({ kind: "op", op: "move", tag: selectedInfo.tag, dim: selectedInfo.dim }) }, "\u79FB\u5230\u7EF4\u5EA6\u2026") : null, !selectedInfo.fromTemplate ? /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm danger", onClick: () => setDialog({ kind: "op", op: "delete", tag: selectedInfo.tag }) }, "\u5220\u9664") : /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => setEditor({ key: tags.inherit, focus: selectedInfo.tag }) }, "\u5728\u6A21\u677F\u91CC\u4FEE\u6539"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm ghost", onClick: () => setSelected(null) }, "\u5173\u95ED"))), selectedInfo.count ? /* @__PURE__ */ h(ClipGrid, { projectId, filter: { kind: "tag", tag: selectedInfo.tag }, setFilter: () => setSelected(null), revision: overview.revision, dims, notify, total: selectedInfo.count, embedded: true }) : /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u8FD8\u6CA1\u6709\u5207\u7247\u7528\u5230\u8FD9\u4E2A\u6807\u7B7E\u3002")) : null, /* @__PURE__ */ h("div", { className: "dmw-sec" }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-link", onClick: () => setShowFile(!showFile) }, showFile ? "\u6536\u8D77\u5B57\u5178\u6587\u4EF6" : "\u67E5\u770B\u5B57\u5178\u6587\u4EF6\u4E0E\u5386\u53F2\u7248\u672C"), showFile ? /* @__PURE__ */ h("div", { className: "dmw-box", style: { marginTop: 8 } }, /* @__PURE__ */ h(DocView, { docKey: "\u6807\u7B7E\u5B57\u5178.yaml", overview, projectId, notify, ask, onReveal })) : null), dialog?.kind === "op" ? /* @__PURE__ */ h(TagOpDialog, { projectId, initial: dialog, dims, onClose: () => setDialog(null), notify, onDone: (op, to) => setSelected(op === "delete" || op === "merge" ? op === "merge" ? to : null : op === "rename" ? to : selected) }) : null, dialog?.kind === "dim" ? /* @__PURE__ */ h(NewDimDialog, { onClose: () => setDialog(null), onSubmit: async (name) => {
    if (await runOp({ op: "add-dim", dim: name })) setDialog(null);
  } }) : null, dialog?.kind === "bulk" ? /* @__PURE__ */ h(BulkConfirm, { projectId, ops: dialog.ops, label: dialog.label, notify, onClose: () => setDialog(null) }) : null, switching ? /* @__PURE__ */ h(
    Confirm,
    {
      title: "\u66F4\u6362\u6807\u7B7E\u6A21\u677F",
      confirmLabel: "\u66F4\u6362",
      impact: `\u628A\u6A21\u677F\u4ECE\u300C${switching.from}\u300D\u6362\u6210\u300C${switching.to}\u300D\uFF1A\u65B0\u589E ${switching.added.length} \u4E2A\u6A21\u677F\u6807\u7B7E\uFF0C\u53BB\u6389 ${switching.dropped.length} \u4E2A\u65E7\u6A21\u677F\u91CC\u6CA1\u4EBA\u7528\u7684\u6807\u7B7E${switching.kept.length ? `\uFF1B\u5207\u7247\u5DF2\u7ECF\u5728\u7528\u7684 ${switching.kept.length} \u4E2A\u65E7\u6A21\u677F\u6807\u7B7E\uFF08${switching.kept.slice(0, 6).join("\u3001")}${switching.kept.length > 6 ? "\u2026" : ""}\uFF09\u4F1A\u4FDD\u7559\u4E3A\u672C\u9879\u76EE\u6807\u7B7E` : ""}\u3002\u9879\u76EE\u81EA\u5DF1\u7684\u6807\u7B7E\u548C\u5F85\u5BA1\u4E0D\u53D8\uFF0C\u5B57\u5178\u65E7\u7248\u672C\u81EA\u52A8\u7559\u6863\u3002`,
      onConfirm: async () => {
        await post("/templates/switch", { project: projectId, key: switching.key, apply: true });
        notify(`\u5DF2\u6539\u7528\u6A21\u677F\u300C${switching.to}\u300D`);
      },
      onClose: () => setSwitching(null)
    }
  ) : null, editor ? /* @__PURE__ */ h(TemplateEditor, { initialKey: editor.key, focus: editor.focus, currentKey: tags.inherit, notify, onClose: () => setEditor(null) }) : null, saveAs ? /* @__PURE__ */ h(SaveAsDialog, { projectId, notify, onClose: () => setSaveAs(false) }) : null);
}
function PendingRow({ item, dims, onApprove, onReject }) {
  const fallback = item.suggestedDim && dims.some((d) => d.dim === item.suggestedDim) ? item.suggestedDim : "\u573A\u666F";
  const [dim, setDim] = useState(fallback);
  useEffect(() => {
    setDim(fallback);
  }, [fallback]);
  return /* @__PURE__ */ h("div", { className: "dmw-pendrow" }, /* @__PURE__ */ h("span", { className: "dmw-tag pending static" }, item.tag, item.count ? /* @__PURE__ */ h("i", null, item.count) : null), /* @__PURE__ */ h("select", { "aria-label": `\u300C${item.tag}\u300D\u8F6C\u6B63\u5230\u54EA\u4E2A\u7EF4\u5EA6`, value: dim, onChange: (e) => setDim(e.target.value) }, dims.map((d) => /* @__PURE__ */ h("option", { key: d.dim, value: d.dim }, d.dim))), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm pri", onClick: () => onApprove(dim) }, "\u8F6C\u6B63"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: onReject }, "\u9A73\u56DE"));
}
function DimRow({ dim, selected, onSelect, onAdd, onDeleteDim }) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const input = useRef(null);
  useEffect(() => {
    if (adding) input.current?.focus();
  }, [adding]);
  const submit = async () => {
    const tag = value.trim();
    if (!tag) {
      setAdding(false);
      return;
    }
    await onAdd(tag);
    setValue("");
    input.current?.focus();
  };
  return /* @__PURE__ */ h("div", { className: "dmw-tagdim dmw-dimrow" }, /* @__PURE__ */ h("div", { className: "dn" }, dim.dim, dim.base ? "" : /* @__PURE__ */ h("span", { className: "dmw-mini" }, "\u81EA\u5B9A\u4E49"), onDeleteDim ? /* @__PURE__ */ h("button", { type: "button", className: "dmw-link", onClick: onDeleteDim }, "\u5220\u9664\u7EF4\u5EA6") : null), /* @__PURE__ */ h("div", null, dim.tags.map((t) => /* @__PURE__ */ h(
    "button",
    {
      type: "button",
      key: t.tag,
      className: `dmw-tag${t.fromTemplate ? " tpl" : ""}${t.count ? "" : " zero"}`,
      "aria-pressed": selected === t.tag,
      title: t.fromTemplate ? "\u6765\u81EA\u6A21\u677F" : "\u672C\u9879\u76EE\u6807\u7B7E",
      onClick: () => onSelect(t.tag)
    },
    t.tag,
    /* @__PURE__ */ h("i", null, t.count)
  )), adding ? /* @__PURE__ */ h("span", { className: "dmw-tagadd" }, /* @__PURE__ */ h(
    "input",
    {
      ref: input,
      value,
      "aria-label": `\u5728\u3010${dim.dim}\u3011\u65B0\u589E\u6807\u7B7E`,
      placeholder: "\u8F93\u5165\u6807\u7B7E\uFF0C\u56DE\u8F66\u6DFB\u52A0",
      maxLength: 30,
      onChange: (e) => setValue(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submit();
        }
        if (e.key === "Escape") {
          setAdding(false);
          setValue("");
        }
      },
      onBlur: () => {
        if (!value.trim()) setAdding(false);
      }
    }
  )) : /* @__PURE__ */ h("button", { type: "button", className: "dmw-tag add", onClick: () => setAdding(true), "aria-label": `\u5728\u3010${dim.dim}\u3011\u65B0\u589E\u6807\u7B7E` }, "\uFF0B")));
}
function useImpact(projectId, body, ready) {
  const [impact, setImpact] = useState(null);
  const [error, setError] = useState(null);
  const timer = useRef(null);
  const key = JSON.stringify(body);
  useEffect(() => {
    clearTimeout(timer.current);
    setImpact(null);
    setError(null);
    if (!ready) return;
    timer.current = setTimeout(() => {
      get("/tags/impact", { project: projectId, ...body }).then(setImpact).catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(timer.current);
  }, [key, ready]);
  return [impact, error, setError];
}
function TagOpDialog({ projectId, initial, dims, onClose, notify, onDone }) {
  const op = initial.op;
  const tag = initial.tag;
  const [to, setTo] = useState("");
  const [dim, setDim] = useState(initial.dim || dims[0]?.dim || "\u573A\u666F");
  const [busy, setBusy] = useState(false);
  const allTags = dims.flatMap((d) => d.tags.map((t) => t.tag));
  const body = { op, tag, to, dim };
  const ready = op === "delete" || op === "move" && dim !== initial.dim || ["rename", "merge"].includes(op) && to;
  const [impact, error, setError] = useImpact(projectId, body, ready);
  const submit = async () => {
    setBusy(true);
    try {
      const r = await post("/tags/op", { project: projectId, ...body });
      notify(`${r.summary}${r.clips ? `\uFF0C\u66F4\u65B0 ${r.clips} \u6761\u5207\u7247` : ""}`);
      onDone?.(op, to);
      onClose();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };
  return /* @__PURE__ */ h(Modal, { title: `${OPS[op]}\u300C${tag}\u300D`, onClose, busy, footer: /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: onClose, disabled: busy }, "\u53D6\u6D88"), /* @__PURE__ */ h("button", { type: "button", className: `dmw-btn pri${op === "delete" ? " danger" : ""}`, onClick: submit, disabled: busy || !impact }, "\u786E\u8BA4", OPS[op])) }, /* @__PURE__ */ h("div", { className: "dmw-form" }, op === "rename" ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("label", { htmlFor: "dmw-tag-to" }, "\u6539\u4E3A"), /* @__PURE__ */ h("input", { id: "dmw-tag-to", value: to, onChange: (e) => setTo(e.target.value.trim()), maxLength: 30 })) : null, op === "merge" ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("label", { htmlFor: "dmw-tag-to" }, "\u5408\u5E76\u5230"), /* @__PURE__ */ h("select", { id: "dmw-tag-to", value: to, onChange: (e) => setTo(e.target.value) }, /* @__PURE__ */ h("option", { value: "" }, "\u9009\u62E9\u76EE\u6807\u6807\u7B7E\u2026"), allTags.filter((t) => t !== tag).map((t) => /* @__PURE__ */ h("option", { key: t }, t)))) : null, op === "move" ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("label", { htmlFor: "dmw-tag-dim" }, "\u79FB\u5230\u7EF4\u5EA6"), /* @__PURE__ */ h("select", { id: "dmw-tag-dim", value: dim, onChange: (e) => setDim(e.target.value) }, dims.map((d) => /* @__PURE__ */ h("option", { key: d.dim }, d.dim)))) : null, op === "delete" ? /* @__PURE__ */ h("div", { className: "full" }, "\u4ECE\u6807\u7B7E\u5B57\u5178\u5220\u9664\u300C", tag, "\u300D\uFF0C\u6240\u6709\u5207\u7247\u4E0A\u7684\u8FD9\u4E2A\u6807\u7B7E\u4E5F\u4F1A\u53BB\u6389\u3002") : null), /* @__PURE__ */ h("div", { className: "dmw-banner info", style: { marginTop: 12, marginBottom: 0 }, "aria-live": "polite" }, error ? /* @__PURE__ */ h("span", { className: "dmw-bad" }, error) : impact ? `${impact.summary}\uFF1A\u5F71\u54CD ${impact.clips} \u6761\u5207\u7247${impact.eagle ? `\uFF0C\u5176\u4E2D ${impact.eagle} \u6761\u4F1A\u6807\u8BB0\u4E3A\u5F85\u540C\u6B65 Eagle` : ""}\u3002\u5B57\u5178\u65E7\u7248\u672C\u81EA\u52A8\u7559\u6863\uFF0C\u53EF\u5728\u300C\u67E5\u770B\u5B57\u5178\u6587\u4EF6\u4E0E\u5386\u53F2\u7248\u672C\u300D\u91CC\u56DE\u6EDA\u3002` : ready ? "\u8BA1\u7B97\u5F71\u54CD\u8303\u56F4\u2026" : "\u586B\u5199\u540E\u663E\u793A\u5F71\u54CD\u8303\u56F4"));
}
function BulkConfirm({ projectId, ops, label, notify, onClose }) {
  return /* @__PURE__ */ h(
    Confirm,
    {
      title: "\u6279\u91CF\u5904\u7406\u5F85\u5BA1\u6807\u7B7E",
      confirmLabel: "\u786E\u8BA4",
      impact: `${label}\u3002\u8F6C\u6B63\u540E\u8FD9\u4E9B\u8BCD\u624D\u4F1A\u7528\u4E8E\u6253\u6807\u548C\u5339\u914D\uFF1B\u5B57\u5178\u65E7\u7248\u672C\u81EA\u52A8\u7559\u6863\u3002`,
      onConfirm: async () => {
        const r = await post("/tags/op", { project: projectId, ops });
        notify(`${r.summary}${r.clips ? `\uFF0C\u66F4\u65B0 ${r.clips} \u6761\u5207\u7247` : ""}`);
      },
      onClose
    }
  );
}
function NewDimDialog({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  return /* @__PURE__ */ h(Modal, { title: "\u65B0\u589E\u7EF4\u5EA6", onClose, footer: /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: onClose }, "\u53D6\u6D88"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", disabled: !name.trim(), onClick: () => onSubmit(name.trim()) }, "\u65B0\u589E")) }, /* @__PURE__ */ h("div", { className: "dmw-form" }, /* @__PURE__ */ h("label", { htmlFor: "dmw-dim-name" }, "\u7EF4\u5EA6\u540D\u79F0"), /* @__PURE__ */ h("input", { id: "dmw-dim-name", value: name, maxLength: 20, onChange: (e) => setName(e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u4EA7\u54C1\u90E8\u4EF6\u3001\u5149\u7EBF\u3001\u8272\u8C03", onKeyDown: (e) => {
    if (e.key === "Enter" && name.trim()) onSubmit(name.trim());
  } }), /* @__PURE__ */ h("div", { className: "full dmw-muted" }, "\u7EF4\u5EA6\u7528\u6765\u7ED9\u6807\u7B7E\u5206\u7EC4\uFF0C\u6BD4\u5982\u4EA7\u54C1\u5E7F\u544A\u53EF\u4EE5\u52A0\u300C\u4EA7\u54C1\u90E8\u4EF6\u300D\u300C\u5149\u7EBF\u300D\u300C\u8272\u8C03\u300D\u3002\u53EA\u52A0\u5728\u672C\u9879\u76EE\uFF1B\u60F3\u8BA9\u4EE5\u540E\u7684\u9879\u76EE\u4E5F\u6709\uFF0C\u7528\u300C\u53E6\u5B58\u4E3A\u6A21\u677F\u300D\u6216\u5728\u300C\u7F16\u8F91\u6A21\u677F\u300D\u91CC\u52A0\u3002")));
}
function SaveAsDialog({ projectId, notify, onClose }) {
  const [label, setLabel] = useState("");
  const [use, setUse] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const submit = async () => {
    setBusy(true);
    try {
      const r = await post("/templates/create", { label: label.trim(), fromProject: projectId, use });
      notify(`\u5DF2\u4FDD\u5B58\u6A21\u677F\u300C${r.template.label}\u300D${r.switched ? "\uFF0C\u672C\u9879\u76EE\u6539\u7528\u5B83" : ""}`);
      onClose();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };
  return /* @__PURE__ */ h(Modal, { title: "\u53E6\u5B58\u4E3A\u6807\u7B7E\u6A21\u677F", onClose, busy, footer: /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: onClose, disabled: busy }, "\u53D6\u6D88"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", disabled: busy || !label.trim(), onClick: submit }, "\u4FDD\u5B58\u6A21\u677F")) }, /* @__PURE__ */ h("div", { className: "dmw-form" }, /* @__PURE__ */ h("label", { htmlFor: "dmw-tpl-name" }, "\u6A21\u677F\u540D\u79F0"), /* @__PURE__ */ h("input", { id: "dmw-tpl-name", value: label, maxLength: 40, onChange: (e) => setLabel(e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u5BB6\u7535\u5E7F\u544A\u3001\u7F8E\u5986\u4EA7\u54C1" }), /* @__PURE__ */ h("span", null), /* @__PURE__ */ h("label", { className: "dmw-check" }, /* @__PURE__ */ h("input", { type: "checkbox", checked: use, onChange: (e) => setUse(e.target.checked) }), " \u672C\u9879\u76EE\u6539\u7528\u8FD9\u4E2A\u65B0\u6A21\u677F"), /* @__PURE__ */ h("div", { className: "full dmw-muted" }, "\u628A\u672C\u9879\u76EE\u73B0\u5728\u7684\u5168\u90E8\u6807\u7B7E\uFF08\u6A21\u677F + \u9879\u76EE\u81EA\u5DF1\u7684\uFF0C\u4E0D\u542B\u5F85\u5BA1\uFF09\u5B58\u6210\u4E00\u4E2A\u65B0\u6A21\u677F\u3002\u4EE5\u540E\u65B0\u5EFA\u9879\u76EE\u65F6\u53EF\u4EE5\u76F4\u63A5\u9009\u5B83\uFF0C\u4E5F\u80FD\u5728\u300C\u7F16\u8F91\u6A21\u677F\u300D\u91CC\u7EE7\u7EED\u6539\u3002")), error ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert", style: { marginTop: 10, marginBottom: 0 } }, error) : null);
}
function TemplateEditor({ initialKey, focus, currentKey, notify, onClose }) {
  const [list, setList] = useState(null);
  const [key, setKey] = useState(initialKey);
  const [draft, setDraft2] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [newDim, setNewDim] = useState("");
  const load = async (k = key) => {
    try {
      const { templates } = await get("/templates");
      setList(templates);
      const t = templates.find((x) => x.key === k) || templates[0];
      setKey(t.key);
      setDraft2({ label: t.label, dims: Object.entries(t.dims).map(([dim, tags]) => ({ dim, tags: [...tags] })) });
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    load(initialKey);
  }, []);
  const template = list?.find((t) => t.key === key);
  const original = template ? JSON.stringify({ label: template.label, dims: template.dims }) : "";
  const dimsObject = draft ? Object.fromEntries(draft.dims.map((d) => [d.dim, d.tags])) : {};
  const dirty = draft && JSON.stringify({ label: draft.label, dims: dimsObject }) !== original;
  const removed = template && draft ? Object.values(template.dims).flat().filter((t) => !Object.values(dimsObject).flat().includes(t)) : [];
  const update = (fn) => setDraft2((d) => {
    const next = { label: d.label, dims: d.dims.map((x) => ({ dim: x.dim, tags: [...x.tags] })) };
    fn(next);
    return next;
  });
  const allDraftTags = new Set(draft ? draft.dims.flatMap((d) => d.tags) : []);
  const save = async () => {
    setBusy(true);
    try {
      const r = await post("/templates/save", { key, label: draft.label, dims: dimsObject });
      const kept = r.preserved || [];
      notify(`\u6A21\u677F\u300C${r.template.label}\u300D\u5DF2\u4FDD\u5B58${kept.length ? `\uFF1B${kept.map((p) => `\u300C${p.project}\u300D\u4FDD\u7559\u4E86 ${p.tags.length} \u4E2A\u5207\u7247\u5728\u7528\u7684\u6807\u7B7E`).join("\uFF0C")}` : ""}`);
      await load(key);
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };
  const switchTo = (k) => {
    if (dirty && !window.confirm?.("\u5F53\u524D\u6A21\u677F\u7684\u4FEE\u6539\u8FD8\u6CA1\u4FDD\u5B58\uFF0C\u8981\u653E\u5F03\u5417\uFF1F")) return;
    load(k);
  };
  return /* @__PURE__ */ h(Modal, { title: "\u7F16\u8F91\u6807\u7B7E\u6A21\u677F", wide: true, onClose, busy, footer: /* @__PURE__ */ h(Fragment, null, template && !template.builtin ? /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn danger", style: { marginRight: "auto" }, disabled: busy, onClick: () => setConfirm("remove") }, "\u5220\u9664\u6A21\u677F") : null, template?.builtin && template.edited ? /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", style: { marginRight: "auto" }, disabled: busy, onClick: () => setConfirm("reset") }, "\u6062\u590D\u9ED8\u8BA4") : null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: onClose, disabled: busy }, "\u5173\u95ED"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", disabled: busy || !dirty || !draft?.label.trim(), onClick: save }, "\u4FDD\u5B58\u6A21\u677F")) }, !draft ? error ? /* @__PURE__ */ h("div", { className: "dmw-banner bad" }, error) : /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u8BFB\u53D6\u6A21\u677F\u2026") : /* @__PURE__ */ h("div", { className: "dmw-tpleditor" }, /* @__PURE__ */ h("div", { className: "dmw-form" }, /* @__PURE__ */ h("label", { htmlFor: "dmw-tpl-pick" }, "\u6A21\u677F"), /* @__PURE__ */ h("select", { id: "dmw-tpl-pick", value: key, onChange: (e) => switchTo(e.target.value) }, list.map((t) => /* @__PURE__ */ h("option", { key: t.key, value: t.key }, t.label, t.builtin ? "\uFF08\u5185\u7F6E\uFF09" : "", t.key === currentKey ? " \xB7 \u672C\u9879\u76EE\u5728\u7528" : ""))), /* @__PURE__ */ h("label", { htmlFor: "dmw-tpl-label" }, "\u540D\u79F0"), /* @__PURE__ */ h("input", { id: "dmw-tpl-label", value: draft.label, maxLength: 40, onChange: (e) => update((d) => {
    d.label = e.target.value;
  }) })), /* @__PURE__ */ h("div", { className: "dmw-muted", style: { margin: "10px 0" } }, "\u6539\u6A21\u677F\u4F1A\u5F71\u54CD\u6240\u6709\u4F7F\u7528\u300C", template?.label, "\u300D\u7684\u9879\u76EE\u548C\u4EE5\u540E\u65B0\u5EFA\u7684\u9879\u76EE\u3002\u5220\u6389\u7684\u6807\u7B7E\u5982\u679C\u6709\u9879\u76EE\u7684\u5207\u7247\u5728\u7528\uFF0C\u4F1A\u81EA\u52A8\u4FDD\u7559\u4E3A\u90A3\u4E2A\u9879\u76EE\u81EA\u5DF1\u7684\u6807\u7B7E\uFF0C\u4E0D\u4F1A\u4ECE\u5207\u7247\u4E0A\u6D88\u5931\u3002"), draft.dims.map((d, i) => /* @__PURE__ */ h("div", { key: d.dim, className: "dmw-tagdim dmw-dimrow" }, /* @__PURE__ */ h("div", { className: "dn" }, d.dim, !BASE_DIMS.includes(d.dim) ? /* @__PURE__ */ h("button", { type: "button", className: "dmw-link", onClick: () => update((x) => {
    x.dims.splice(i, 1);
  }) }, "\u5220\u9664\u7EF4\u5EA6") : null), /* @__PURE__ */ h("div", null, d.tags.map((t, j) => /* @__PURE__ */ h("span", { key: t, className: `dmw-tag static${focus === t ? " focus" : ""}` }, t, /* @__PURE__ */ h("button", { type: "button", className: "x", "aria-label": `\u4ECE\u6A21\u677F\u5220\u9664\u300C${t}\u300D`, onClick: () => update((x) => {
    x.dims[i].tags.splice(j, 1);
  }) }, "\xD7"))), /* @__PURE__ */ h(TemplateTagInput, { dim: d.dim, exists: (t) => allDraftTags.has(t), onAdd: (t) => update((x) => {
    x.dims[i].tags.push(t);
  }) })))), /* @__PURE__ */ h("div", { className: "dmw-actions", style: { marginTop: 6 } }, /* @__PURE__ */ h("input", { "aria-label": "\u65B0\u7EF4\u5EA6\u540D\u79F0", value: newDim, maxLength: 20, placeholder: "\u65B0\u7EF4\u5EA6\u540D\u79F0\uFF0C\u5982 \u5149\u7EBF", onChange: (e) => setNewDim(e.target.value) }), /* @__PURE__ */ h(
    "button",
    {
      type: "button",
      className: "dmw-btn sm",
      disabled: !newDim.trim() || draft.dims.some((d) => d.dim === newDim.trim()) || ["\u7EE7\u627F", "\u5F85\u5BA1"].includes(newDim.trim()),
      onClick: () => {
        update((x) => {
          x.dims.push({ dim: newDim.trim(), tags: [] });
        });
        setNewDim("");
      }
    },
    "\uFF0B \u65B0\u589E\u7EF4\u5EA6"
  )), removed.length ? /* @__PURE__ */ h("div", { className: "dmw-banner warn", style: { marginTop: 10, marginBottom: 0 } }, "\u5C06\u4ECE\u6A21\u677F\u5220\u9664\uFF1A", removed.join("\u3001")) : null, error ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert", style: { marginTop: 10, marginBottom: 0 } }, error) : null), confirm === "remove" ? /* @__PURE__ */ h(
    Confirm,
    {
      title: "\u5220\u9664\u6A21\u677F",
      danger: true,
      confirmLabel: "\u5220\u9664",
      impact: `\u5220\u9664\u6A21\u677F\u300C${template.label}\u300D\u3002\u53EA\u6709\u6CA1\u6709\u9879\u76EE\u5728\u7528\u65F6\u624D\u80FD\u5220\u9664\u3002`,
      onConfirm: async () => {
        await post("/templates/remove", { key });
        notify(`\u5DF2\u5220\u9664\u6A21\u677F\u300C${template.label}\u300D`);
        await load(currentKey);
      },
      onClose: () => setConfirm(null)
    }
  ) : null, confirm === "reset" ? /* @__PURE__ */ h(
    Confirm,
    {
      title: "\u6062\u590D\u9ED8\u8BA4",
      confirmLabel: "\u6062\u590D\u9ED8\u8BA4",
      impact: `\u628A\u5185\u7F6E\u6A21\u677F\u300C${template.label}\u300D\u6062\u590D\u6210\u51FA\u5382\u5185\u5BB9\uFF0C\u4F60\u5BF9\u5B83\u7684\u4FEE\u6539\u4F1A\u4E22\u5F03\uFF08\u5207\u7247\u5728\u7528\u7684\u6807\u7B7E\u4F1A\u4FDD\u7559\u5728\u5404\u81EA\u9879\u76EE\u91CC\uFF09\u3002`,
      onConfirm: async () => {
        await post("/templates/reset", { key });
        notify("\u5DF2\u6062\u590D\u9ED8\u8BA4");
        await load(key);
      },
      onClose: () => setConfirm(null)
    }
  ) : null);
}
function TemplateTagInput({ dim, exists, onAdd }) {
  const [value, setValue] = useState("");
  const [warn, setWarn] = useState(null);
  const add = () => {
    const tag = value.trim();
    if (!tag) return;
    if (exists(tag)) {
      setWarn(`\u300C${tag}\u300D\u5DF2\u5728\u6A21\u677F\u91CC`);
      return;
    }
    onAdd(tag);
    setValue("");
    setWarn(null);
  };
  return /* @__PURE__ */ h("span", { className: "dmw-tagadd" }, /* @__PURE__ */ h(
    "input",
    {
      value,
      maxLength: 30,
      "aria-label": `\u7ED9\u6A21\u677F\u7684\u3010${dim}\u3011\u65B0\u589E\u6807\u7B7E`,
      placeholder: "\uFF0B \u6807\u7B7E\uFF0C\u56DE\u8F66",
      onChange: (e) => {
        setValue(e.target.value);
        setWarn(null);
      },
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          add();
        }
      }
    }
  ), warn ? /* @__PURE__ */ h("span", { className: "dmw-warn", style: { marginLeft: 6 } }, warn) : null);
}

// src/client/AgentPane.jsx
var QUICK = {
  creative: ["\u5B8C\u5584\u4E3B\u9898\u7B80\u62A5", "\u7ED9\u6211 3 \u4E2A\u521B\u610F\u65B9\u5411", "\u751F\u6210\u6587\u6848", "\u6839\u636E\u6587\u6848\u51FA\u5206\u955C"],
  tags: [["\u6839\u636E\u7D20\u6750\u5EFA\u8BAE\u6807\u7B7E", TAG_PROMPTS.footage], ["\u6839\u636E\u6587\u6848\u548C\u5206\u955C\u8865\u6807\u7B7E", TAG_PROMPTS.script], ["\u6574\u7406\u76F8\u8FD1\u7684\u6807\u7B7E", TAG_PROMPTS.tidy], ["\u7ED9\u5207\u7247\u6253\u6807", TAG_PROMPTS.tagClips]],
  material: ["\u5BFC\u5165\u5E76\u6E05\u6D17\u7D20\u6750", "\u81EA\u52A8\u5207\u7247\u6253\u6807", "\u540C\u6B65\u5230 Eagle", "\u89E3\u91CA\u4E3A\u4EC0\u4E48\u4E22\u5F03\u8FD9\u4E9B\u7D20\u6750"],
  edit: ["\u6309\u5206\u955C\u5339\u914D\u7D20\u6750", "\u5199\u526A\u8F91\u601D\u8DEF", "\u751F\u6210\u65F6\u95F4\u7EBF\u5E76\u51FA\u7C97\u526A\u9884\u89C8", "\u5BFC\u51FA\u7F3A\u53E3\u6E05\u5355"]
};
var TAB_NAMES = { creative: "\u521B\u610F", tags: "\u6807\u7B7E", material: "\u7D20\u6750", edit: "\u526A\u8F91" };
function AgentPane({ project, tab, overview, conversation, sessionReady, otherProjectSession, legacySession = false, starting, onStart, onQuick, running, onCancelJob, width, onResize, onClose, libraries = [], workingLibrary = null, switching = null, onLibrary }) {
  const docs = overview?.creative?.docs || [];
  const script = docs.find((d) => d.key === "02_\u6587\u6848.md");
  const board = docs.find((d) => d.key === "03_\u5206\u955C\u811A\u672C.md");
  const drag = useRef(null);
  const startDrag = (event) => {
    event.preventDefault();
    drag.current = { x: event.clientX, w: width };
    const move = (e) => onResize(Math.max(320, Math.min(620, drag.current.w + (drag.current.x - e.clientX))));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const onKeyResize = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onResize(Math.min(620, width + 20));
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onResize(Math.max(320, width - 20));
    }
  };
  return /* @__PURE__ */ h("aside", { className: "dmw-chat", "aria-label": "AI \u5BF9\u8BDD", style: { "--dmw-chat-w": `${width}px` } }, /* @__PURE__ */ h("div", { className: "dmw-chat-resize", role: "separator", "aria-orientation": "vertical", "aria-label": "\u8C03\u6574\u5BF9\u8BDD\u680F\u5BBD\u5EA6", tabIndex: 0, onPointerDown: startDrag, onKeyDown: onKeyResize, "data-dsh-no-drag": "" }), /* @__PURE__ */ h("div", { className: "dmw-chat-h" }, /* @__PURE__ */ h("div", { style: { display: "flex", alignItems: "center" } }, /* @__PURE__ */ h("b", null, "DSH Agent"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-iconbtn", style: { marginLeft: "auto", width: 26, height: 26 }, "aria-label": "\u6536\u8D77 AI \u5BF9\u8BDD", title: "\u6536\u8D77", onClick: onClose }, "\u27E9")), /* @__PURE__ */ h("div", { className: "dmw-ctx" }, "\u4E0A\u4E0B\u6587\uFF1A", project ? /* @__PURE__ */ h("span", { title: project.path }, project.name) : /* @__PURE__ */ h("span", null, "\u672A\u9009\u62E9\u9879\u76EE"), sessionReady ? /* @__PURE__ */ h("span", { title: "\u5BF9\u8BDD\u7684\u5DE5\u4F5C\u76EE\u5F55" }, "\u{1F4C2} ", workingLibrary || "\u9879\u76EE\u6839\u76EE\u5F55") : null, /* @__PURE__ */ h("span", null, TAB_NAMES[tab] || ""), script?.exists ? /* @__PURE__ */ h("span", null, "\u6587\u6848 v", script.version) : null, board?.exists ? /* @__PURE__ */ h("span", null, "\u5206\u955C v", board.version) : null)), running ? /* @__PURE__ */ h("div", { style: { padding: "8px 14px 0" } }, /* @__PURE__ */ h(JobBar, { job: running, onCancel: onCancelJob })) : null, project && libraries.length ? /* @__PURE__ */ h("div", { className: "dmw-libs", role: "group", "aria-label": "\u5BF9\u8BDD\u5DE5\u4F5C\u76EE\u5F55" }, /* @__PURE__ */ h("span", { className: "dmw-muted" }, "\u5DE5\u4F5C\u76EE\u5F55"), libraries.map((l) => /* @__PURE__ */ h(
    "button",
    {
      type: "button",
      key: l.dir,
      "aria-pressed": sessionReady && workingLibrary === l.dir,
      title: `${l.hint} \xB7 \u70B9\u51FB\u540E\u5BF9\u8BDD\u5728\u8FD9\u4E2A\u6587\u4EF6\u5939\u91CC\u8FDB\u884C`,
      disabled: Boolean(switching),
      onClick: () => onLibrary(l.dir)
    },
    switching === l.dir ? "\u5207\u6362\u4E2D\u2026" : l.label
  ))) : null, project ? /* @__PURE__ */ h("div", { className: "dmw-quick", "aria-label": "\u5FEB\u6377\u6307\u4EE4" }, (QUICK[tab] || QUICK.creative).map((q) => {
    const [label, text] = Array.isArray(q) ? q : [q, q];
    return /* @__PURE__ */ h("button", { type: "button", key: label, title: text !== label ? text : void 0, onClick: () => onQuick(text) }, label);
  })) : null, /* @__PURE__ */ h("div", { className: "dmw-conv" }, !project ? /* @__PURE__ */ h("div", { className: "dmw-start" }, /* @__PURE__ */ h("h4", null, "\u5148\u9009\u62E9\u6216\u65B0\u5EFA\u4E00\u4E2A\u9879\u76EE"), /* @__PURE__ */ h("div", { className: "dmw-muted" }, "AI \u5BF9\u8BDD\u4F1A\u5173\u8054\u5230\u9879\u76EE\u6587\u4EF6\u5939\uFF0CAgent \u5199\u7684\u6587\u4EF6\u4F1A\u5B9E\u65F6\u663E\u793A\u5728\u5DE6\u4FA7\u9762\u677F\u3002")) : !sessionReady ? /* @__PURE__ */ h("div", { className: "dmw-start" }, /* @__PURE__ */ h("h4", null, "\u9700\u8981 AI \u534F\u52A9\u65F6\uFF0C\u5F00\u59CB\u5BF9\u8BDD"), /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u4F1A\u4EE5\u9879\u76EE\u6587\u4EF6\u5939\u300C", project.path, "\u300D\u4F5C\u4E3A\u5DE5\u4F5C\u533A\u5F00\u59CB\u4E00\u4E2A\u5C5E\u4E8E\u672C\u5DE5\u4F5C\u53F0\u7684\u4F1A\u8BDD\u3002\u5DE6\u4FA7\u9762\u677F\u4E0D\u4F9D\u8D56\u5BF9\u8BDD\uFF0C\u4E5F\u53EF\u4EE5\u5148\u81EA\u5DF1\u64CD\u4F5C\u3002", otherProjectSession ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("br", null), "\u5F53\u524D\u6253\u5F00\u7684\u5BF9\u8BDD\u5C5E\u4E8E\u5176\u4ED6\u9879\u76EE\uFF0C\u5207\u6362\u540E\u4F1A\u4FDD\u7559\u5B83\u3002") : null, legacySession ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("br", null), "\u539F\u6765\u300C\u6807\u7B7E\u7BA1\u7406\u300D\u6587\u4EF6\u5939\u91CC\u7684\u5BF9\u8BDD\u5DF2\u505C\u7528\uFF1A\u6807\u7B7E\u6539\u5230\u5DE6\u4FA7\u300C\u6807\u7B7E\u300D\u9875\u7BA1\u7406\u3002\u70B9\u4E0B\u9762\u7684\u6309\u94AE\u5728\u9879\u76EE\u91CC\u7EE7\u7EED\u5BF9\u8BDD\uFF0C\u6216\u5728\u4E0A\u65B9\u9009\u4E00\u4E2A\u5DE5\u4F5C\u76EE\u5F55\u3002") : null), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", disabled: starting, onClick: () => onStart() }, starting ? "\u6B63\u5728\u6253\u5F00\u5BF9\u8BDD\u2026" : project.sessionId ? "\u7EE7\u7EED\u8FD9\u4E2A\u9879\u76EE\u7684\u5BF9\u8BDD" : "\u4E3A\u8FD9\u4E2A\u9879\u76EE\u5F00\u59CB\u5BF9\u8BDD")) : null, /* @__PURE__ */ h("div", { style: { display: project && sessionReady ? "flex" : "none", flexDirection: "column", flex: 1, minHeight: 0 } }, conversation)), /* @__PURE__ */ h("div", { className: "dmw-note" }, "\u5199\u6587\u4EF6\u3001\u6539\u6807\u7B7E\u3001\u6062\u590D\u7D20\u6750\u3001\u540C\u6B65 Eagle\u3001\u6B63\u5F0F\u6E32\u67D3\u524D\u90FD\u4F1A\u5148\u8BA9\u4F60\u786E\u8BA4\uFF1B\u6240\u6709\u6539\u52A8\u8BB0\u5F55\u5728 .dsh/log \u4E2D\u53EF\u8FFD\u6EAF"));
}

// src/client/App.jsx
var LEGACY_TAGS_DIR = "\u6807\u7B7E\u7BA1\u7406";
var RES_LABEL = (edit) => {
  const spec = edit?.spec;
  const res = spec && edit.options?.resolutions?.[spec.resolution];
  if (!res) return "";
  const long = Math.max(res.width, res.height);
  const tag = long >= 3840 ? "4K" : long >= 2560 ? "2.7K" : long >= 1920 ? "1080P" : `${res.width}\xD7${res.height}`;
  return `${res.aspect} \xB7 ${tag} \xB7 ${spec.fps}fps`;
};
function App({ service, workbenches, active = true, conversation }) {
  useLayoutEffect(ensureStyles);
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [listError, setListError] = useState(null);
  const [currentId, setCurrentId] = useState(() => storage.get("project", null));
  const [tab, setTab] = useState(() => {
    const saved = storage.get("tab", "creative");
    return TAB_NAMES[saved] ? saved : "creative";
  });
  const [chatOpen, setChatOpen] = useState(() => storage.get("chat", true));
  const [chatWidth, setChatWidth] = useState(() => storage.get("chatWidth", 400));
  const [dialog, setDialog] = useState(null);
  const [info, setInfo] = useState(null);
  const [starting, setStarting] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [switching, setSwitching] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [toastNode, notify] = useToast();
  const rootRef = useRef(null);
  const host = useHostSession(service, workbenches);
  const refreshProjects = useCallback(async () => {
    try {
      const { projects: list } = await get("/projects");
      setProjects(list);
      setListError(null);
      return list;
    } catch (e) {
      setListError(e.message);
      return null;
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    refreshProjects();
  }, []);
  const visible = projects.filter((p) => !p.archived || p.id === currentId);
  const current = projects.find((p) => p.id === currentId) || null;
  useEffect(() => {
    if (!loaded) return;
    if (currentId && projects.some((p) => p.id === currentId)) return;
    const first = projects.find((p) => !p.archived && !p.missing);
    setCurrentId(first ? first.id : null);
  }, [loaded, projects, currentId]);
  useEffect(() => {
    storage.set("project", currentId);
  }, [currentId]);
  useEffect(() => {
    storage.set("tab", tab);
  }, [tab]);
  useEffect(() => {
    storage.set("chat", chatOpen);
  }, [chatOpen]);
  useEffect(() => {
    storage.set("chatWidth", chatWidth);
  }, [chatWidth]);
  useEffect(() => {
    if (!host.sessionId || !host.folder) return;
    const match2 = projects.find((p) => libraryOf(p.path, host.folder) !== null);
    if (!match2) return;
    if (match2.id !== currentId) setCurrentId(match2.id);
    const library = libraryOf(match2.path, host.folder);
    if (library === LEGACY_TAGS_DIR) return;
    const saved = library ? match2.sessions?.[library] : match2.sessionId;
    if (saved !== host.sessionId && host.owned) post("/projects/patch", { project: match2.id, library, sessionId: host.sessionId }).then(refreshProjects).catch(() => {
    });
  }, [host.sessionId, host.folder, projects]);
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < 980));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const { data: overview, error, running, reload } = useOverview(current && !current.missing ? current.id : null, active);
  useEffect(() => {
    if (current && active) post("/context", { project: current.id, tab, sessionId: host.sessionId }).catch(() => {
    });
  }, [current?.id, tab, active, host.sessionId]);
  const rawLibrary = current && host.sessionId && host.folder ? libraryOf(current.path, host.folder) : null;
  const legacySession = rawLibrary === LEGACY_TAGS_DIR;
  const workingLibrary = legacySession ? null : rawLibrary;
  const sessionReady = workingLibrary !== null;
  const otherProjectSession = Boolean(host.sessionId && host.folder && current && workingLibrary === null && !legacySession);
  const openConversation = useCallback(async (library = "") => {
    if (!current) return null;
    const folder = library ? joinPath(current.path, library) : current.path;
    const saved = (library ? current.sessions?.[library] : current.sessionId) || null;
    setStarting(true);
    setSwitching(library || null);
    const remember = async (sessionId) => {
      if (sessionId && sessionId !== saved) {
        await post("/projects/patch", { project: current.id, library, sessionId });
        refreshProjects();
      }
      return sessionId || null;
    };
    try {
      const id = await remember(await ensureProjectSession(service, workbenches, folder, saved));
      if (library) notify(`\u53F3\u4FA7\u5BF9\u8BDD\u5DF2\u5207\u6362\u5230\u300C${library}\u300D`);
      return id;
    } catch (e) {
      if (saved) {
        try {
          return await remember(await ensureProjectSession(service, workbenches, folder, null));
        } catch (e2) {
          notify(e2.message);
        }
      } else notify(e.message);
      return null;
    } finally {
      setStarting(false);
      setSwitching(null);
    }
  }, [service, workbenches, current]);
  const start = useCallback(() => openConversation(""), [openConversation]);
  const switchLibrary = useCallback((library) => {
    if (narrow) setDrawer(true);
    else setChatOpen(true);
    if (workingLibrary === library) return;
    openConversation(library);
  }, [openConversation, workingLibrary, narrow]);
  const ask = useCallback(async (text) => {
    if (!current) return;
    if (narrow) setDrawer(true);
    else setChatOpen(true);
    let sessionId = sessionReady ? host.sessionId : await start();
    if (!sessionId) return;
    const result = await setDraft(service, sessionId, text);
    if (result === "clipboard") notify("\u5DF2\u590D\u5236\u6307\u4EE4\uFF0C\u7C98\u8D34\u5230\u5BF9\u8BDD\u6846\u53D1\u9001\u5373\u53EF");
    else if (result === "none") notify(`\u8BF7\u5728\u5BF9\u8BDD\u6846\u8F93\u5165\uFF1A${text}`);
  }, [current, sessionReady, host.sessionId, start, service]);
  const selectProject = (p) => {
    setCurrentId(p.id);
    post("/projects/patch", { project: p.id }).catch(() => {
    });
    if (p.sessionId && libraryOf(p.path, host.folder) === null) ensureProjectSession(service, workbenches, p.path, p.sessionId).catch(() => {
    });
  };
  const cancelJob = (job) => current && post("/jobs/cancel", { project: current.id, jobId: job.id }).then(() => notify("\u5DF2\u8BF7\u6C42\u53D6\u6D88")).catch((e) => notify(e.message));
  const reveal = (path) => current && post("/reveal", { project: current.id, path }).catch((e) => notify(e.message));
  const onCreated = async (project, created) => {
    setDialog(null);
    const list = await refreshProjects();
    const entry = list?.find((p) => p.id === project.id) || project;
    setCurrentId(entry.id);
    notify(created ? `\u5DF2\u521B\u5EFA\u9879\u76EE\u300C${entry.name}\u300D` : `\u5DF2\u6253\u5F00\u9879\u76EE\u300C${entry.name}\u300D`);
  };
  const st = overview?.status;
  const docs = overview?.creative?.docs || [];
  const scriptDoc = docs.find((d) => d.key === "02_\u6587\u6848.md");
  const report = overview?.material?.report;
  const match = overview?.edit?.match;
  const tagInfo = overview?.material?.tags;
  const progress = {
    tags: tagInfo ? [`${tagInfo.inheritLabel || "\u65E0\u6A21\u677F"} \xB7 ${tagInfo.totalTags} \u4E2A\u6807\u7B7E`, tagInfo.pending.length ? `\u5F85\u5BA1 ${tagInfo.pending.length}` : null].filter(Boolean).join(" \xB7 ") : "",
    creative: overview ? [scriptDoc?.exists ? `\u6587\u6848 v${scriptDoc.version}` : "\u6587\u6848\u672A\u751F\u6210", overview.storyboard && !overview.storyboard.missing ? `\u5206\u955C ${overview.storyboard.count} \u955C` : "\u5206\u955C\u672A\u751F\u6210"].join(" \xB7 ") : "",
    material: report ? report.imported ? `\u4FDD\u7559 ${report.kept} / \u4E22\u5F03 ${report.rejected} \xB7 \u5207\u7247 ${report.clips}` : "\u8FD8\u6CA1\u6709\u5BFC\u5165\u7D20\u6750" : "",
    edit: overview ? `${match ? `\u5339\u914D ${match.matched}/${match.total}` : "\u672A\u5339\u914D"} \xB7 ${overview.edit.exports.some((e) => e.manifest?.kind === "final") ? "\u5DF2\u51FA\u6210\u7247" : overview.edit.exports.length ? "\u5DF2\u51FA\u7C97\u526A" : overview.edit.timeline ? "\u65F6\u95F4\u7EBF\u5DF2\u751F\u6210" : "\u672A\u51FA\u7247"}` : ""
  };
  const showChat = narrow ? drawer : chatOpen;
  const toggleChat = () => narrow ? setDrawer(!drawer) : setChatOpen(!chatOpen);
  return /* @__PURE__ */ h("div", { className: "dmw-root", ref: rootRef, "data-dsh-media-workbench": "" }, /* @__PURE__ */ h("div", { className: "dmw-toolwrap" }, /* @__PURE__ */ h("header", { className: "dmw-toolbar", "data-dsh-workbench-toolbar": "" }, /* @__PURE__ */ h("span", { className: "dmw-logo" }, "DSH", /* @__PURE__ */ h("span", { className: "full" }, " \u526A\u8F91")), /* @__PURE__ */ h(
    ProjectMenu,
    {
      projects: visible,
      current,
      service,
      notify,
      onChanged: refreshProjects,
      onSelect: selectProject,
      onNew: () => setDialog({ type: "new" }),
      onOpenFolder: () => setDialog({ type: "open" })
    }
  ), /* @__PURE__ */ h("div", { className: "dmw-chips", "aria-label": "\u9879\u76EE\u72B6\u6001" }, overview ? /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("button", { type: "button", className: "dmw-chip dmw-chip-btn", title: "\u8F93\u51FA\u89C4\u683C\u5728\u300C\u526A\u8F91\u300D\u9875\u8BBE\u7F6E", onClick: () => setTab("edit") }, RES_LABEL(overview.edit)), /* @__PURE__ */ h("button", { type: "button", className: "dmw-chip opt dmw-chip-btn", title: "\u76EE\u6807\u65F6\u957F\u5728\u300C\u526A\u8F91\u300D\u9875\u8BBE\u7F6E", onClick: () => setTab("edit") }, overview.edit.spec.targetDuration ? `\u76EE\u6807 ${overview.edit.spec.targetDuration}s` : "\u76EE\u6807\u65F6\u957F\u672A\u8BBE"), /* @__PURE__ */ h("span", { className: `dmw-chip ${st.ffmpeg.ok ? "ok" : "bad"}`, title: st.ffmpeg.path }, st.ffmpeg.ok ? "FFmpeg \u2713" : "FFmpeg \u672A\u627E\u5230"), /* @__PURE__ */ h("span", { className: `dmw-chip ${st.eagle.connected ? "ok" : "bad"}` }, st.eagle.connected ? "Eagle \u5DF2\u8FDE\u63A5" : "Eagle \u672A\u8FDE\u63A5"), /* @__PURE__ */ h("span", { className: `dmw-chip opt ${st.jianying.ok ? "ok" : "warn"}`, title: st.jianying.dir || st.jianying.reason }, st.jianying.ok ? "\u526A\u6620\u8349\u7A3F\u76EE\u5F55 \u2713" : "\u526A\u6620\u672A\u627E\u5230")) : null), /* @__PURE__ */ h("span", { className: "dmw-spacer" }), /* @__PURE__ */ h("button", { type: "button", className: "dmw-iconbtn", "aria-label": "\u8BBE\u7F6E", title: "\u8BBE\u7F6E", onClick: () => setDialog({ type: "settings" }) }, "\u2699"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-iconbtn", "aria-label": "AI \u5BF9\u8BDD\u680F", title: chatOpen ? "\u6536\u8D77 AI \u5BF9\u8BDD" : "\u6253\u5F00 AI \u5BF9\u8BDD", "aria-pressed": showChat, onClick: toggleChat }, "\u{1F4AC}"))), /* @__PURE__ */ h("div", { className: "dmw-body" }, /* @__PURE__ */ h("main", { className: "dmw-main" }, !loaded ? /* @__PURE__ */ h("div", { className: "dmw-muted", style: { padding: 20 } }, "\u52A0\u8F7D\u4E2D\u2026") : listError ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert" }, "\u5DE5\u4F5C\u53F0\u670D\u52A1\u672A\u5C31\u7EEA\uFF1A", listError, "\u3002\u8BF7\u786E\u8BA4\u63D2\u4EF6\u5DF2\u542F\u7528\u5E76\u91CD\u542F DSH Desktop\u3002") : !current ? /* @__PURE__ */ h(Welcome, { onNew: () => setDialog({ type: "new" }), onOpen: () => setDialog({ type: "open" }) }) : current.missing || error?.code === "PATH_MISSING" ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert" }, /* @__PURE__ */ h("span", { className: "grow" }, "\u9879\u76EE\u6587\u4EF6\u5939\u627E\u4E0D\u5230\u4E86\uFF1A", current.path, "\u3002\u53EF\u80FD\u88AB\u79FB\u52A8\u6216\u5220\u9664\u3002"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: () => document.querySelector(".dmw-dd-btn")?.click() }, "\u5728\u9879\u76EE\u5217\u8868\u91CC\u91CD\u65B0\u5B9A\u4F4D")) : /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h("div", { className: "dmw-tabs", role: "tablist", "aria-label": "\u6A21\u5757" }, Object.entries(TAB_NAMES).map(([key, label]) => /* @__PURE__ */ h("button", { type: "button", key, role: "tab", id: `dmw-tab-${key}`, "aria-controls": "dmw-panel", "aria-selected": tab === key, className: "dmw-tab", onClick: () => setTab(key) }, label, /* @__PURE__ */ h("small", null, progress[key] || "\u2026")))), /* @__PURE__ */ h("section", { key: tab, className: "dmw-card dmw-panel", id: "dmw-panel", role: "tabpanel", "aria-labelledby": `dmw-tab-${tab}` }, error && error.code !== "PATH_MISSING" ? /* @__PURE__ */ h("div", { className: "dmw-banner bad", role: "alert" }, /* @__PURE__ */ h("span", { className: "grow" }, error.message), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn sm", onClick: reload }, "\u91CD\u8BD5")) : null, !overview ? /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u8BFB\u53D6\u9879\u76EE\u2026") : tab === "creative" ? /* @__PURE__ */ h(CreativeTab, { overview, projectId: current.id, notify, ask, onReveal: reveal, workingLibrary, switching, onLibrary: switchLibrary }) : tab === "tags" ? /* @__PURE__ */ h(TagTab, { overview, projectId: current.id, notify, ask, onReveal: reveal }) : tab === "material" ? /* @__PURE__ */ h(MaterialTab, { overview, projectId: current.id, notify, ask, running, onCancelJob: cancelJob }) : /* @__PURE__ */ h(EditTab, { overview, projectId: current.id, notify, ask, running, onCancelJob: cancelJob, onReveal: reveal, onInfo: setInfo })))), showChat ? /* @__PURE__ */ h("div", { style: narrow ? { position: "absolute", right: 0, top: 49, bottom: 0, zIndex: 20, display: "flex", boxShadow: "-8px 0 24px rgba(0,0,0,.12)" } : { display: "flex", minHeight: 0 }, onKeyDown: narrow ? (e) => {
    if (e.key === "Escape") setDrawer(false);
  } : void 0 }, /* @__PURE__ */ h(
    AgentPane,
    {
      project: current && !current.missing ? current : null,
      tab,
      overview,
      conversation,
      sessionReady,
      otherProjectSession,
      legacySession,
      starting,
      onStart: start,
      onQuick: ask,
      libraries: overview?.libraries || [],
      workingLibrary,
      switching,
      onLibrary: switchLibrary,
      running,
      onCancelJob: cancelJob,
      width: narrow ? Math.min(chatWidth, 380) : chatWidth,
      onResize: setChatWidth,
      onClose: narrow ? () => setDrawer(false) : () => setChatOpen(false)
    }
  )) : /* @__PURE__ */ h("div", { style: { display: "none" } }, conversation)), dialog?.type === "new" || dialog?.type === "open" ? /* @__PURE__ */ h(NewProjectDialog, { service, mode: dialog.type, onClose: () => setDialog(null), onCreated }) : null, dialog?.type === "settings" ? /* @__PURE__ */ h(SettingsDialog, { overview, onClose: () => setDialog(null), onSaved: () => {
    reload();
    notify("\u8BBE\u7F6E\u5DF2\u4FDD\u5B58");
  } }) : null, info ? /* @__PURE__ */ h(Modal, { title: info.title, onClose: () => setInfo(null), footer: /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", onClick: () => setInfo(null) }, "\u77E5\u9053\u4E86") }, /* @__PURE__ */ h("div", { style: { lineHeight: 1.75 } }, info.text)) : null, toastNode);
}
function Welcome({ onNew, onOpen }) {
  return /* @__PURE__ */ h("div", { className: "dmw-card dmw-welcome" }, /* @__PURE__ */ h("h2", null, "\u5A92\u4F53\u81EA\u52A8\u5316\u526A\u8F91\u5DE5\u4F5C\u53F0"), /* @__PURE__ */ h("div", { className: "dmw-muted", style: { fontSize: 13 } }, "\u5DE6\u8FB9\u770B\u7ED3\u679C\uFF0C\u53F3\u8FB9\u8DDF AI \u8BF4\u3002\u6BCF\u4E2A\u9879\u76EE\u5C31\u662F\u4E00\u4E2A\u672C\u5730\u6587\u4EF6\u5939\uFF0C\u6240\u6709\u4EA7\u51FA\u90FD\u662F\u6587\u4EF6\uFF1A\u6362\u7535\u8111\u3001\u4E0D\u5F00\u8F6F\u4EF6\uFF0C\u6570\u636E\u4F9D\u7136\u5B8C\u6574\u3002"), /* @__PURE__ */ h("div", { className: "dmw-steps" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, "\u2460 \u521B\u610F"), /* @__PURE__ */ h("span", { className: "dmw-muted" }, "\u7B80\u62A5 \u2192 \u521B\u610F\u65B9\u5411 \u2192 \u6587\u6848 \u2192 \u5206\u955C\uFF0C\u81EA\u52A8\u7559\u7248\u672C")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, "\u2461 \u6807\u7B7E"), /* @__PURE__ */ h("span", { className: "dmw-muted" }, "\u9009\u6807\u7B7E\u6A21\u677F \u2192 AI \u770B\u7D20\u6750\u5EFA\u8BAE\u6807\u7B7E \u2192 \u4F60\u8F6C\u6B63 \u2192 \u53EF\u53E6\u5B58\u4E3A\u81EA\u5DF1\u7684\u6A21\u677F")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, "\u2462 \u7D20\u6750"), /* @__PURE__ */ h("span", { className: "dmw-muted" }, "\u5BFC\u5165 \u2192 \u6E05\u6D17\uFF08\u5E26\u91CF\u5316\u4F9D\u636E\uFF09\u2192 \u5207\u7247 \u2192 AI \u6253\u6807 \u2192 \u590D\u6838 \u2192 Eagle")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, "\u2463 \u526A\u8F91"), /* @__PURE__ */ h("span", { className: "dmw-muted" }, "\u8F93\u51FA\u89C4\u683C \u2192 \u5206\u955C\u5339\u914D\u7D20\u6750 \u2192 \u7F3A\u53E3\u6E05\u5355 \u2192 \u65F6\u95F4\u7EBF \u2192 FFmpeg \u51FA\u7247"))), /* @__PURE__ */ h("div", { className: "dmw-actions" }, /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn pri", onClick: onNew }, "\uFF0B \u65B0\u5EFA\u9879\u76EE"), /* @__PURE__ */ h("button", { type: "button", className: "dmw-btn", onClick: onOpen }, "\u{1F4C2} \u6253\u5F00\u5DF2\u6709\u6587\u4EF6\u5939")), /* @__PURE__ */ h("div", { className: "dmw-muted" }, "\u9700\u8981\u672C\u673A\u5B89\u88C5 FFmpeg\uFF08\u5BFC\u5165\u3001\u6E05\u6D17\u3001\u5207\u7247\u3001\u51FA\u7247\uFF09\uFF1BEagle \u6253\u5F00\u65F6\u53EF\u540C\u6B65\u7D20\u6750\u5E93\u3002"));
}

// src/client/index.jsx
var REPOSITORY = "https://github.com/dsh-local/dsh-media-workbench";
var PanelBoundary = class extends require("react").Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return h("div", { className: "dmw-root" }, h(
        "div",
        { className: "dmw-banner bad", role: "alert", style: { margin: 16 } },
        h("span", { className: "grow" }, `\u5DE5\u4F5C\u53F0\u754C\u9762\u51FA\u9519\uFF1A${this.state.error.message || this.state.error}`),
        h("button", { type: "button", className: "dmw-btn sm", onClick: () => this.setState({ error: null }) }, "\u91CD\u65B0\u52A0\u8F7D\u9762\u677F")
      ));
    }
    return this.props.children;
  }
};
var ownWorkbenches = null;
function MediaWorkbench({ service, active, conversation }) {
  return h(PanelBoundary, null, h(App, { service, workbenches: ownWorkbenches || service, active: active !== false, conversation }));
}
function apply(ctx) {
  ensureStyles();
  const handle2 = ctx.desktopWorkbenches;
  ownWorkbenches = handle2;
  ctx.effect(() => () => {
    if (ownWorkbenches === handle2) ownWorkbenches = null;
  }, "media-workbench: identity handle");
  ctx.effect(() => ctx.desktopWorkbenches.register({
    title: "\u5A92\u4F53\u526A\u8F91\u5DE5\u4F5C\u53F0",
    panelTitle: "\u5A92\u4F53\u526A\u8F91",
    repository: REPOSITORY,
    description: "\u521B\u610F\u6587\u6848\u3001\u7D20\u6750\u6E05\u6D17\u6253\u6807\u3001\u5206\u955C\u5339\u914D\u4E0E FFmpeg \u51FA\u7247\uFF1A\u5DE6\u8FB9\u770B\u7ED3\u679C\uFF0C\u53F3\u8FB9\u8DDF AI \u8BF4\u3002",
    audience: "\u62CD Vlog\u3001\u4EA7\u54C1\u5E7F\u544A\u7B49\u77ED\u89C6\u9891\u7684\u521B\u4F5C\u8005\u4E0E\u5BFC\u6F14",
    requirements: "\u9700\u8981\u672C\u673A\u5B89\u88C5 FFmpeg\uFF1B\u53EF\u9009 Eagle\u3001\u672C\u5730 Whisper",
    category: "\u5185\u5BB9\u521B\u4F5C",
    icon: "\u{1F3AC}",
    customFrame: true,
    headerLayout: "compact"
  }, MediaWorkbench), "media-workbench: register");
}
var inject = ["desktopWorkbenches"];

    })(module, module.exports, require)
    return module.exports
  }
})

// Styles use the host theme aliases (--dsw-alias-*) so light/dark follow DSH
// automatically; the second value of each var() only applies outside DSH.
const CSS = `
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
.dmw-diff .add::before{content:'+ ';color:var(--dmw-ok)}.dmw-diff .del::before{content:'− ';color:var(--dmw-bad)}.dmw-diff .same::before{content:'  '}
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
`

export function ensureStyles() {
  if (typeof document === 'undefined') return
  let el = document.getElementById('dsh-media-workbench-css')
  if (el && el.textContent === CSS) return
  if (!el) {
    el = document.createElement('style')
    el.id = 'dsh-media-workbench-css'
    el.setAttribute('data-plugin-css', 'dsh-media-workbench')
    document.head.appendChild(el)
  }
  el.textContent = CSS
}

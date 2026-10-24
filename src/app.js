/* Escritura a cuatro voces (SATB) — Lenguaje Musical III */
(function () {
'use strict';
var VF = (window.Vex && window.Vex.Flow) ? window.Vex.Flow : window.VexFlow;
if (!VF) { document.getElementById('app').insertAdjacentHTML('afterbegin', '<p style="color:#b00">No se pudo cargar la librería de notación.</p>'); return; }

/* ================= datos ================= */
var LET = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
var SEMI = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
var SHARPS = ['f', 'c', 'g', 'd', 'a', 'e', 'b'];
var FLATS = ['b', 'e', 'a', 'd', 'g', 'c', 'f'];
// [spec VexFlow, nombre, etiqueta cifrado americano, n.º alteraciones (+# / -b), menor]
var KEYS = [
  ['C', 'Do mayor', 'C', 0, 0], ['G', 'Sol mayor', 'G', 1, 0], ['D', 'Re mayor', 'D', 2, 0], ['A', 'La mayor', 'A', 3, 0],
  ['E', 'Mi mayor', 'E', 4, 0], ['B', 'Si mayor', 'B', 5, 0], ['F#', 'Fa♯ mayor', 'F♯', 6, 0], ['C#', 'Do♯ mayor', 'C♯', 7, 0],
  ['F', 'Fa mayor', 'F', -1, 0], ['Bb', 'Si♭ mayor', 'B♭', -2, 0], ['Eb', 'Mi♭ mayor', 'E♭', -3, 0], ['Ab', 'La♭ mayor', 'A♭', -4, 0],
  ['Db', 'Re♭ mayor', 'D♭', -5, 0], ['Gb', 'Sol♭ mayor', 'G♭', -6, 0], ['Cb', 'Do♭ mayor', 'C♭', -7, 0],
  ['Am', 'la menor', 'a', 0, 1], ['Em', 'mi menor', 'e', 1, 1], ['Bm', 'si menor', 'b', 2, 1], ['F#m', 'fa♯ menor', 'f♯', 3, 1],
  ['C#m', 'do♯ menor', 'c♯', 4, 1], ['G#m', 'sol♯ menor', 'g♯', 5, 1], ['D#m', 're♯ menor', 'd♯', 6, 1], ['A#m', 'la♯ menor', 'a♯', 7, 1],
  ['Dm', 're menor', 'd', -1, 1], ['Gm', 'sol menor', 'g', -2, 1], ['Cm', 'do menor', 'c', -3, 1], ['Fm', 'fa menor', 'f', -4, 1],
  ['Bbm', 'si♭ menor', 'b♭', -5, 1], ['Ebm', 'mi♭ menor', 'e♭', -6, 1], ['Abm', 'la♭ menor', 'a♭', -7, 1]
];
var TIMES = {
  '4/4': { b: 4, nb: 4, bv: 4, sym: 'C', g: 1 },
  '3/4': { b: 3, nb: 3, bv: 4, sym: '3/4', g: 1 },
  '2/4': { b: 2, nb: 2, bv: 4, sym: '2/4', g: 1 },
  '2/2': { b: 4, nb: 2, bv: 2, sym: 'C|', g: 1 },
  '6/8': { b: 3, nb: 6, bv: 8, sym: '6/8', g: 1.5 }
};
var DUR = {
  w: { b: 4, vf: 'w', dots: 0, name: 'Redonda' },
  hd: { b: 3, vf: 'h', dots: 1, name: 'Blanca con puntillo' },
  h: { b: 2, vf: 'h', dots: 0, name: 'Blanca' },
  qd: { b: 1.5, vf: 'q', dots: 1, name: 'Negra con puntillo' },
  q: { b: 1, vf: 'q', dots: 0, name: 'Negra' },
  ed: { b: 0.75, vf: '8', dots: 1, name: 'Corchea con puntillo' },
  e: { b: 0.5, vf: '8', dots: 0, name: 'Corchea' },
  s: { b: 0.25, vf: '16', dots: 0, name: 'Semicorchea' }
};
var DUR_ORDER = ['w', 'hd', 'h', 'qd', 'q', 'ed', 'e', 's'];
var VOICES = [
  { k: 'S', n: 'Soprano', c: '#1f6fd6', clef: 'treble', dir: 1, lo: 60, hi: 81 },
  { k: 'A', n: 'Alto', c: '#168a4f', clef: 'treble', dir: -1, lo: 53, hi: 74 },
  { k: 'T', n: 'Tenor', c: '#d2691e', clef: 'bass', dir: 1, lo: 47, hi: 67 },
  { k: 'B', n: 'Bajo', c: '#8b3fc2', clef: 'bass', dir: -1, lo: 38, hi: 62 }
];
var RN_MAJ = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°', 'viiø', 'iiø', 'iv', '♭VI', '♭VII', '♭III'];
var RN_MIN = ['i', 'ii°', 'III', 'iv', 'V', 'VI', 'VII', 'vii°', 'viiø', 'iiø', 'v', 'IV'];
var RN_SPECIAL = [['N', '6', 'N'], ['It', '6', 'It⁶'], ['Fr', '43', 'Fr⁴₃'], ['Ger', '65', 'Ger⁶₅']];
var RN_TGT_MAJ = ['ii', 'iii', 'IV', 'V', 'vi', '♭VII'];
var RN_TGT_MIN = ['III', 'iv', 'V', 'VI', 'VII', 'ii°'];
var RN_SEC = { 'V': 1, 'vii°': 1, 'viiø': 1, 'VII': 1 };
var FIGS = [['', 'Fund.'], ['6', '6'], ['64', '6/4'], ['7', '7'], ['65', '6/5'], ['43', '4/3'], ['42', '4/2']];
var QUAL = { M: '', m: 'm', dim: 'dim', aug: 'aug', '7': '7', maj7: 'maj7', m7: 'm7', m7b5: 'm7(♭5)', dim7: 'dim7', mmaj7: 'm(maj7)' };
var NO_F5 = { m7b5: 1, dim: 1, dim7: 1 };
var EPS = 1e-6;

/* ================= estado ================= */
var W = 960, SYSH = 290, TOPPAD = 76, GAP = 56, LEFT = 54, RIGHT = 26;
var S = newState();
var info = { name: '', group: '', date: today(), inst: 'piano', bpm: 76 };
var ui = { voice: 0, dur: 'q', rest: false, acc: 'auto', mode: 'write', own: false };
var hist = [], redo = [], layout = null, scale = 1, errCols = [], playing = null;

function newState() {
  return { etitle: '', key: 'C', time: '4/4', measures: 4, pickup: 0, perSystem: 4, cols: [], lines: true, lock: false, chk: true };
}
function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }

/* ================= música ================= */
function keyInfo(spec) { for (var i = 0; i < KEYS.length; i++) if (KEYS[i][0] === spec) return KEYS[i]; return KEYS[0]; }
function isMinor() { return !!keyInfo(S.key)[4]; }
function keyAlts(spec) {
  var n = keyInfo(spec)[3], a = { c: 0, d: 0, e: 0, f: 0, g: 0, a: 0, b: 0 }, i;
  if (n > 0) { for (i = 0; i < n; i++) a[SHARPS[i]] = 1; } else { for (i = 0; i < -n; i++) a[FLATS[i]] = -1; }
  return a;
}
function tonicPC(spec) { var l = spec[0].toLowerCase(), a = spec[1] === '#' ? 1 : (spec[1] === 'b' ? -1 : 0); return ((SEMI[l] + a) % 12 + 12) % 12; }
function midi(p) { return 12 * (p.o + 1) + SEMI[p.l] + p.a; }
function dnum(p) { return p.o * 7 + LET.indexOf(p.l); }
function accSym(a) { return a === -1 ? '♭' : a === 1 ? '♯' : a === -2 ? '♭♭' : a === 2 ? '♯♯' : ''; }
function vfKey(p, alts) {
  var s = p.l;
  if (p.a === -1) s += 'b'; else if (p.a === 1) s += '#'; else if (p.a === -2) s += 'bb'; else if (p.a === 2) s += '##';
  else if (alts[p.l] !== 0) s += 'n';
  return s + '/' + p.o;
}
function partition(cols, mlen, pk) {
  if (pk === undefined) pk = S.pickup || 0;
  var ms = [[]], acc = 0, ok = true, bad = -1;
  cols.forEach(function (c, i) {
    var b = DUR[c.d].b, ml = (ms.length === 1 && pk) ? pk : mlen;
    if (acc + b > ml + EPS) { ok = false; if (bad < 0) bad = i; }
    ms[ms.length - 1].push(i); acc += b;
    if (Math.abs(acc - ml) < EPS || acc > ml) { ms.push([]); acc = 0; }
  });
  return { ms: ms, acc: acc, ok: ok, bad: bad };
}
function usedMeasures(part) { return part.ms[part.ms.length - 1].length ? part.ms.length : part.ms.length - 1; }
function isMajorDeg(b) { return isMinor() ? (b === 'III' || b === 'V' || b === 'VI') : (b === 'IV' || b === 'V'); }
function rnText(rn) { return rn.b; }
function figParts(f) { return f === '6' ? ['6'] : f === '64' ? ['6', '4'] : f === '7' ? ['7'] : f === '65' ? ['6', '5'] : f === '43' ? ['4', '3'] : f === '42' ? ['4', '2'] : []; }
function rnHTML(rn) {
  var fp = figParts(rn.f), mj = S.lines && !rn.of && isMajorDeg(rn.b);
  return '<span class="rnb' + (mj ? ' mj' : '') + '">' + esc(rn.b) + '</span>' + (fp.length ? '<span class="fig">' + fp.map(function (p) { return '<i>' + p + '</i>'; }).join('') + '</span>' : '') + (rn.of ? '<span class="rnb">/' + esc(rn.of) + '</span>' : '');
}
function noteName(n) { return n.l.toUpperCase() + accSym(n.a); }
function csText(cs) { return noteName(cs) + QUAL[cs.q] + (cs.f && !NO_F5[cs.q] ? '(' + (cs.f === 'b5' ? '♭' : '♯') + '5)' : '') + (cs.bl ? '/' + noteName(cs.bl) : ''); }
function keyLabel() { return keyInfo(S.key)[2] + ':'; }

/* ================= historial ================= */
function pushHist() { hist.push(JSON.stringify(S)); if (hist.length > 120) hist.shift(); redo = []; }
function undo() { if (!hist.length) return; redo.push(JSON.stringify(S)); S = JSON.parse(hist.pop()); refresh(); }
function redoIt() { if (!redo.length) return; hist.push(JSON.stringify(S)); S = JSON.parse(redo.pop()); refresh(); }
function keyOfB(b) { var k = null; Object.keys(DUR).forEach(function (x) { if (Math.abs(DUR[x].b - b) < EPS) k = x; }); return k; }
function startOf(ci, vi) { for (var j = ci; j >= 0; j--) { var e = S.cols[j].v[vi]; if (!e) return -1; if (!e.h) return j; } return -1; }
function effEntry(cols, ci, vi) { var e = cols[ci].v[vi]; if (!e || !e.h) return e; for (var j = ci - 1; j >= 0; j--) { var f = cols[j].v[vi]; if (f && !f.h) return f; if (!f) return null; } return null; }
function fixHolds(cols) {
  cols.forEach(function (c) { for (var vi = 0; vi < 4; vi++) if (c.v[vi] && c.v[vi].h) c.v[vi] = null; });
  var part = partition(cols, TIMES[S.time].b), mi = {};
  part.ms.forEach(function (m, k) { m.forEach(function (i) { mi[i] = k; }); });
  for (var vi = 0; vi < 4; vi++) {
    for (var ci = 0; ci < cols.length; ci++) {
      var e = cols[ci].v[vi]; if (!e || !e.d) continue;
      var need = DUR[e.d] ? DUR[e.d].b : 0, acc = DUR[cols[ci].d].b, j = ci + 1, cov = [];
      while (acc < need - EPS && j < cols.length && mi[j] === mi[ci] && !cols[j].v[vi]) { acc += DUR[cols[j].d].b; cov.push(j); j++; }
      if (cov.length && Math.abs(acc - need) < EPS) cov.forEach(function (x) { cols[x].v[vi] = { h: 1 }; }); else delete e.d;
    }
  }
}
function tryEdit(fn) {
  var before = JSON.stringify(S), err = fn();
  if (err) { S = JSON.parse(before); msg(err); return false; }
  hist.push(before); if (hist.length > 120) hist.shift(); redo = [];
  normalize(); refresh(); return true;
}
function normalize() {
  fixHolds(S.cols);
  if (!S.lock) {
    while (S.cols.length) {
      var c = S.cols[S.cols.length - 1];
      if (!c.v[0] && !c.v[1] && !c.v[2] && !c.v[3] && !c.rn && !c.cs) S.cols.pop(); else break;
    }
  }
  var u = usedMeasures(partition(S.cols, TIMES[S.time].b));
  if (S.measures < u) S.measures = u;
  if (S.measures < 1) S.measures = 1;
}
var PICKS = [[0.25, 'Semicorchea'], [0.5, 'Corchea'], [0.75, 'Corchea con puntillo'], [1, 'Negra'], [1.5, 'Negra con puntillo'], [2, 'Blanca'], [3, 'Blanca con puntillo']];
function fillPick() {
  var sel = $('sPick'), b = TIMES[S.time].b, h = '<option value="0">Sin anacrusa</option>';
  PICKS.forEach(function (p) { if (p[0] < b) h += '<option value="' + p[0] + '">' + p[1] + '</option>'; });
  if (sel.dataset.b !== String(b)) { sel.innerHTML = h; sel.dataset.b = String(b); }
  sel.value = String(S.pickup || 0);
}
function mutate(fn) { pushHist(); fn(); normalize(); refresh(); }
function save() { try { localStorage.setItem('lm3_satb_v1', JSON.stringify({ S: S, info: info })); } catch (e) { } }
function msg(t, ok) { var m = $('msg'); m.textContent = t || ''; m.className = ok ? 'ok' : ''; }

/* ================= dibujo ================= */
function styleNote(n, o, vi) { if (o.color) { var c = VOICES[vi].c; n.setStyle({ fillStyle: c, strokeStyle: c }); } }
function makeBeams(idxs, notes, kinds, o, vi, bs) {
  var bl = TIMES[S.time].g, pos = (idxs[0] === 0 && S.pickup) ? TIMES[S.time].b - S.pickup : 0, groups = {}, out = [];
  bs.forEach(function (b, i) {
    if (kinds[i]) { var g = Math.floor((pos + EPS) / bl); (groups[g] = groups[g] || []).push(i); }
    pos += b;
  });
  Object.keys(groups).forEach(function (g) {
    var a = groups[g], ok = a.length >= 2;
    for (var j = 1; j < a.length; j++) if (a[j] !== a[j - 1] + 1) ok = false;
    if (ok) { var bm = new VF.Beam(a.map(function (i) { return notes[i]; })); if (o.color) bm.setStyle({ fillStyle: VOICES[vi].c, strokeStyle: VOICES[vi].c }); out.push(bm); }
  });
  return out;
}
var PADS = [[4, 'w'], [3, 'hd'], [2, 'h'], [1.5, 'qd'], [1, 'q'], [0.75, '8d'], [0.5, '8'], [0.25, '16']];
function padsFor(idxs, mlen) {
  var acc = 0, out = [];
  idxs.forEach(function (i) { acc += DUR[S.cols[i].d].b; });
  var rem = mlen - acc;
  if (!idxs.length || rem < EPS) return out;
  for (var j = 0; j < PADS.length && rem > EPS; j++) { while (rem + EPS >= PADS[j][0]) { out.push(PADS[j][1]); rem -= PADS[j][0]; } }
  return out;
}
function mkVoices(idxs, vis, clef, o, alts, pads) {
  var T = TIMES[S.time], voices = [], notes = [], beams = [];
  vis.forEach(function (vi) {
    var arr = [], kinds = [], bs = [];
    idxs.forEach(function (ci) {
      var c = S.cols[ci], e = c.v[vi], n;
      if (e && e.h) return;
      var key = (e && e.d) ? e.d : c.d, d = DUR[key], dstr = d.vf + (d.dots ? 'd' : '');
      if (!e) { n = new VF.GhostNote({ duration: dstr }); kinds.push(false); }
      else if (e.r) {
        n = new VF.StaveNote({ keys: [clef === 'treble' ? 'b/4' : 'd/3'], duration: dstr + 'r', clef: clef });
        if (d.dots) n.addModifier(new VF.Dot(), 0);
        styleNote(n, o, vi); kinds.push(false);
      } else {
        n = new VF.StaveNote({ keys: [vfKey(e, alts)], duration: dstr, clef: clef, stem_direction: VOICES[vi].dir });
        if (d.dots) n.addModifier(new VF.Dot(), 0);
        styleNote(n, o, vi); kinds.push(key === 'e' || key === 'ed' || key === 's');
      }
      arr.push(n); bs.push(d.b);
    });
    (pads || []).forEach(function (ds) { arr.push(new VF.GhostNote({ duration: ds })); });
    var v = new VF.Voice({ num_beats: T.nb, beat_value: T.bv }).setStrict(false);
    v.addTickables(arr);
    voices.push(v); notes.push(arr);
    beams = beams.concat(makeBeams(idxs, arr, kinds, o, vi, bs));
  });
  var grid = idxs.map(function (ci) { var d = DUR[S.cols[ci].d]; return new VF.GhostNote({ duration: d.vf + (d.dots ? 'd' : '') }); });
  (pads || []).forEach(function (ds) { grid.push(new VF.GhostNote({ duration: ds })); });
  var gv = new VF.Voice({ num_beats: T.nb, beat_value: T.bv }).setStrict(false); gv.addTickables(grid); voices.push(gv);
  return { voices: voices, notes: notes, beams: beams, grid: grid };
}
var SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(name, attrs, parent) {
  var e = document.createElementNS(SVGNS, name);
  Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
  if (parent) parent.appendChild(e);
  return e;
}
function svgText(parent, x, y, str, size, extra) {
  var a = { x: x, y: y, 'font-size': size, 'font-family': 'Arial, Helvetica, sans-serif', fill: '#111' };
  Object.keys(extra || {}).forEach(function (k) { a[k] = extra[k]; });
  var t = svgEl('text', a, parent); t.textContent = str; return t;
}
var measCanvas = document.createElement('canvas').getContext('2d');
function textW(str, font) { measCanvas.font = font; return measCanvas.measureText(str).width; }

function render(host, o) {
  host.innerHTML = '';
  var mlen = TIMES[S.time].b, part = partition(S.cols, mlen), N = Math.max(S.measures, usedMeasures(part));
  var per = S.perSystem, nSys = Math.ceil(N / per), headerH = o.header ? 92 : 6;
  var H = headerH + nSys * SYSH + 8;
  var r = new VF.Renderer(host, VF.Renderer.Backends.SVG);
  r.resize(W, H);
  var ctx = r.getContext(), svg = host.querySelector('svg');
  var alts = keyAlts(S.key), nAcc = Math.abs(keyInfo(S.key)[3]);
  var L = { H: H, W: W, systems: [], part: part, N: N, cols: {} };
  var stOpt = { space_above_staff_ln: 0, space_below_staff_ln: 0 };
  for (var s = 0; s < nSys; s++) {
    var top = headerH + s * SYSH, yT = top + TOPPAD, yB = yT + 40 + GAP;
    var m0 = s * per, m1 = Math.min(N, m0 + per), cnt = m1 - m0;
    var pad0 = 46 + 10 * nAcc + (s === 0 ? 30 : 0);
    var avail = W - LEFT - RIGHT - pad0, wts = [], tot = 0, k;
    var padsK = {};
    for (k = m0; k < m1; k++) { padsK[k] = padsFor(part.ms[k] || [], (k === 0 && S.pickup) ? S.pickup : mlen); var w = Math.max(3, (part.ms[k] || []).length + padsK[k].length); wts.push(w); tot += w; }
    if (nSys > 1) tot += 4 * (per - cnt);
    var x = LEFT, sys = { i: s, top: top, yT: yT, yB: yB, ms: [], cols: [] };
    for (k = m0; k < m1; k++) {
      var idxs = part.ms[k] || [];
      var mw = avail * wts[k - m0] / tot + (k === m0 ? pad0 : 0);
      var tr = new VF.Stave(x, yT, mw, stOpt), ba = new VF.Stave(x, yB, mw, stOpt);
      if (k === m0) {
        tr.addClef('treble').addKeySignature(S.key); ba.addClef('bass').addKeySignature(S.key);
        if (s === 0) { tr.addTimeSignature(TIMES[S.time].sym); ba.addTimeSignature(TIMES[S.time].sym); }
      }
      if (k === N - 1) { tr.setEndBarType(VF.Barline.type.END); ba.setEndBarType(VF.Barline.type.END); }
      tr.setContext(ctx).draw(); ba.setContext(ctx).draw();
      var CT = VF.StaveConnector.type;
      if (k === m0) {
        new VF.StaveConnector(tr, ba).setType(CT.BRACE).setContext(ctx).draw();
        new VF.StaveConnector(tr, ba).setType(CT.SINGLE_LEFT).setContext(ctx).draw();
      }
      new VF.StaveConnector(tr, ba).setType(k === N - 1 ? CT.BOLD_DOUBLE_RIGHT : CT.SINGLE_RIGHT).setContext(ctx).draw();
      var rec = { k: k, x0: x, x1: x + mw, idxs: idxs, nsx: tr.getNoteStartX() };
      if (idxs.length) {
        var tv = mkVoices(idxs, [0, 1], 'treble', o, alts, padsK[k]), bv = mkVoices(idxs, [2, 3], 'bass', o, alts, padsK[k]);
        VF.Accidental.applyAccidentals(tv.voices, S.key);
        VF.Accidental.applyAccidentals(bv.voices, S.key);
        var fmt = new VF.Formatter();
        fmt.joinVoices(tv.voices); fmt.joinVoices(bv.voices);
        fmt.format(tv.voices.concat(bv.voices), Math.max(40, tr.getNoteEndX() - tr.getNoteStartX() - 16), { align_rests: true });
        tv.voices.forEach(function (v) { v.draw(ctx, tr); });
        bv.voices.forEach(function (v) { v.draw(ctx, ba); });
        tv.beams.concat(bv.beams).forEach(function (b) { b.setContext(ctx).draw(); });
        idxs.forEach(function (ci, j) {
          var cx = tv.grid[j].getAbsoluteX() + 6;
          sys.cols.push({ idx: ci, x: cx, k: k }); L.cols[ci] = { sys: s, x: cx };
        });
      }
      sys.ms.push(rec);
      x += mw;
    }
    L.systems.push(sys);
    svgText(svg, LEFT + 4, yB + 40 + 58, keyLabel(), 16, { 'font-family': 'Georgia, Times New Roman, serif' });
  }
  if (o.header) drawHeader(svg);
  if (o.labels) drawLabels(svg, L);
  return L;
}
function drawHeader(svg) {
  var title = S.etitle || 'Escritura a cuatro voces';
  svgText(svg, LEFT, 30, title, 20, { 'font-weight': '700' });
  svgText(svg, LEFT, 52, 'Lenguaje Musical III · Instituto de Bellas Artes · Universidad del Quindío', 11.5, { fill: '#555' });
  var d = info.date ? info.date.split('-').reverse().join('/') : '';
  svgText(svg, LEFT, 76, 'Nombre: ' + (info.name || ''), 14);
  svgText(svg, 560, 76, 'Grupo: ' + (info.group || ''), 14);
  svgText(svg, 720, 76, 'Fecha: ' + d, 14);
}
function csRows(sys) {
  var rows = {}, end = [-1e9, -1e9];
  sys.cols.forEach(function (c) {
    var col = S.cols[c.idx]; if (!col.cs) return;
    var w = csText(col.cs).length * 6.6 + 6, x0 = c.x - w / 2, r = x0 >= end[0] + 2 ? 0 : (x0 >= end[1] + 2 ? 1 : (end[0] <= end[1] ? 0 : 1));
    rows[c.idx] = r; end[r] = c.x + w / 2;
  });
  return rows;
}
function drawLabels(svg, L) {
  S.cols.forEach(function (c, ci) {
    var p = L.cols[ci]; if (!p) return; var sys = L.systems[p.sys];
    if (c.cs) svgText(svg, p.x, sys.yT - 36 - 18 * (csRows(sys)[ci] || 0), csText(c.cs), csText(c.cs).length > 8 ? 11 : csText(c.cs).length > 5 ? 13 : 15, { 'text-anchor': 'middle', 'font-weight': '600' });
    if (c.rn) {
      var y = sys.yB + 40 + 58, font = '17px Georgia, serif', bw = textW(c.rn.b, font);
      svgText(svg, p.x, y, c.rn.b, 17, { 'text-anchor': 'middle', 'font-family': 'Georgia, Times New Roman, serif' });
      if (S.lines && !c.rn.of && isMajorDeg(c.rn.b)) {
        svgEl('line', { x1: p.x - bw / 2 - 2, x2: p.x + bw / 2 + 2, y1: y - 15, y2: y - 15, stroke: '#111', 'stroke-width': 1.5 }, svg);
        svgEl('line', { x1: p.x - bw / 2 - 2, x2: p.x + bw / 2 + 2, y1: y + 4, y2: y + 4, stroke: '#111', 'stroke-width': 1.5 }, svg);
      }
      var fp = figParts(c.rn.f);
      fp.forEach(function (t, i) { svgText(svg, p.x + bw / 2 + 4, y - 7 + i * 9, t, 10, { 'font-family': 'Georgia, serif' }); });
      if (c.rn.of) svgText(svg, p.x + bw / 2 + (fp.length ? 13 : 2), y, '/' + c.rn.of, 17, { 'font-family': 'Georgia, Times New Roman, serif' });
    }
  });
}

/* ================= superposición interactiva ================= */
function buildOverlay() {
  var slots = $('slots'), ov = $('ov');
  slots.innerHTML = ''; ov.innerHTML = '';
  ov.setAttribute('width', W); ov.setAttribute('height', layout.H); ov.setAttribute('viewBox', '0 0 ' + W + ' ' + layout.H);
  // zona del siguiente acorde
  var band = openBand();
  layout.band = band;
  if (band) svgEl('rect', { x: band.x0, y: band.y0, width: band.x1 - band.x0, height: band.y1 - band.y0, fill: '#ffd966', 'fill-opacity': 0.28, stroke: '#d9a400', 'stroke-dasharray': '4 3', rx: 6 }, ov);
  // errores
  errCols.forEach(function (ci) {
    var p = layout.cols[ci]; if (!p) return; var sys = layout.systems[p.sys];
    svgEl('rect', { x: p.x - 18, y: sys.yT - 8, width: 36, height: sys.yB + 52 - sys.yT, fill: '#e53935', 'fill-opacity': 0.14, stroke: '#e53935', rx: 6 }, ov);
  });
  svgEl('g', { id: 'pv' }, ov);
  svgEl('g', { id: 'play' }, ov);
  layout.systems.forEach(function (sys) {
    var xs = sys.cols, rws = csRows(sys);
    xs.forEach(function (c, j) {
      var gap = 60;
      if (j > 0) gap = Math.min(gap, c.x - xs[j - 1].x);
      if (j < xs.length - 1) gap = Math.min(gap, xs[j + 1].x - c.x);
      var wd = Math.max(22, Math.min(46, gap - 3)), col = S.cols[c.idx];
      slots.appendChild(makeSlot('cs', c.idx, c.x - wd / 2, sys.yT - 54 - 18 * (rws[c.idx] || 0), wd, col.cs ? csText(col.cs) : '', col.cs));
      var rw = col.rn && (col.rn.of || col.rn.b.length > 3) ? Math.max(wd, col.rn.of ? 64 : 44) : wd;
      slots.appendChild(makeSlot('rn', c.idx, c.x - rw / 2, sys.yB + 40 + 40, rw, col.rn ? rnHTML(col.rn) : '', col.rn));
    });
  });
}
function makeSlot(kind, ci, x, y, wd, html, filled) {
  var b = document.createElement('button');
  b.className = 'slot ' + kind + (filled ? ' filled' : '');
  b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.width = wd + 'px';
  b.title = kind === 'cs' ? 'Cifrado americano' : 'Grado (cifrado romano)';
  if (kind === 'cs') { b.textContent = html; var L = html.length; b.style.fontSize = L > 8 ? '10px' : L > 5 ? '12px' : ''; if (L > 5) b.style.width = Math.max(wd, Math.min(78, L * 6.4 + 8)) + 'px', b.style.left = (x - (Math.max(wd, Math.min(78, L * 6.4 + 8)) - wd) / 2) + 'px'; } else b.innerHTML = html;
  if (!filled) b.innerHTML = '<span style="color:#aab3c0;font-size:15px;font-family:system-ui,Arial,sans-serif">+</span>';
  b.addEventListener('click', function (e) { e.stopPropagation(); if (kind === 'cs') openChordPalette(ci, b); else openRomanPalette(ci, b); });
  return b;
}
function openBand() {
  if (S.lock) return null;
  var part = layout.part, k = part.ms.length - 1;
  if (k >= layout.N) return null;
  var per = S.perSystem, s = Math.floor(k / per), sys = layout.systems[s]; if (!sys) return null;
  var rec = null; sys.ms.forEach(function (m) { if (m.k === k) rec = m; });
  if (!rec) return null;
  var x0 = rec.idxs.length ? layout.cols[rec.idxs[rec.idxs.length - 1]].x + 12 : rec.nsx + 2;
  var x1 = Math.max(rec.x1 - 3, x0 + 26);
  return { sys: s, k: k, x0: x0, x1: x1, y0: sys.yT - 10, y1: sys.yB + 52 };
}
function stagePos(e) {
  var r = $('stage').getBoundingClientRect(), t = (e.touches && e.touches[0]) ? e.touches[0] : e;
  return { x: (t.clientX - r.left) / scale, y: (t.clientY - r.top) / scale };
}
function hitTest(p) {
  if (!layout) return null;
  for (var i = 0; i < layout.systems.length; i++) {
    var sys = layout.systems[i];
    if (p.y >= sys.top && p.y < sys.top + SYSH) {
      var bnd = layout.band;
      if (bnd && bnd.sys === i && p.x >= bnd.x0 && p.x <= bnd.x1 && p.y >= bnd.y0 && p.y <= bnd.y1) return { sys: i, append: true, bx: bnd.x0 + 12 };
      var best = null, bd = 1e9;
      sys.cols.forEach(function (c, j) {
        var d = Math.abs(p.x - c.x), gap = 40;
        if (j > 0) gap = Math.min(gap, c.x - sys.cols[j - 1].x);
        if (j < sys.cols.length - 1) gap = Math.min(gap, sys.cols[j + 1].x - c.x);
        var th = Math.max(11, Math.min(gap / 2, 22));
        if (d < th && d < bd) { bd = d; best = c; }
      });
      if (best) return { sys: i, col: best.idx };
      var b = layout.band;
      if (b && b.sys === i && p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1) return { sys: i, append: true, bx: b.x0 + 12 };
      return { sys: i };
    }
  }
  return null;
}
function pitchAt(vi, y, sysI) {
  var sys = layout.systems[sysI], clef = VOICES[vi].clef, yb = (clef === 'treble' ? sys.yT : sys.yB) + 40;
  var step = Math.round((yb - y) / 5); step = clef === 'treble' ? Math.max(-8, Math.min(14, step)) : Math.max(-9, Math.min(16, step));
  var d = (clef === 'treble' ? 30 : 18) + step, l = LET[((d % 7) + 7) % 7], o = Math.floor(d / 7);
  var a = ui.acc === 'auto' ? keyAlts(S.key)[l] : ui.acc;
  return { l: l, o: o, a: a, step: step, y: yb - step * 5 };
}
function updatePreview(p) {
  var g = $('pv'); if (!g) return; g.innerHTML = '';
  if (ui.mode !== 'write' || ui.rest) return;
  var h = hitTest(p); if (!h || (h.col == null && !h.append)) return;
  if (S.lock && ui.voice === 0) return;
  var pt = pitchAt(ui.voice, p.y, h.sys), x = h.col != null ? layout.cols[h.col].x : h.bx;
  var c = VOICES[ui.voice].c;
  if (pt.step < 0 || pt.step > 8) {
    var from = pt.step < 0 ? pt.step : 8, to = pt.step < 0 ? 0 : pt.step;
    var sys = layout.systems[h.sys], yb = (VOICES[ui.voice].clef === 'treble' ? sys.yT : sys.yB) + 40;
    for (var s = Math.min(from, to); s <= Math.max(from, to); s++) {
      if (s % 2 === 0 && (s < 0 || s > 8)) svgEl('line', { x1: x - 11, x2: x + 11, y1: yb - s * 5, y2: yb - s * 5, stroke: c, 'stroke-opacity': 0.5 }, g);
    }
  }
  svgEl('ellipse', { cx: x, cy: pt.y, rx: 6.4, ry: 4.6, fill: c, 'fill-opacity': 0.55, transform: 'rotate(-18 ' + x + ' ' + pt.y + ')' }, g);
  if (ui.acc !== 'auto') svgText(g, x - 17, pt.y + 5, accSym(ui.acc) || '♮', 15, { fill: c });
}
function writeNote(ci, vi, nv, D) {
  var c = S.cols[ci], cur = c.v[vi];
  if (cur && cur.h) { var st = startOf(ci, vi); if (st >= 0 && S.cols[st].v[vi]) delete S.cols[st].v[vi].d; fixHolds(S.cols); cur = c.v[vi]; }
  if (nv === null) { c.v[vi] = null; return null; }
  var cb = DUR[c.d].b, Db = DUR[D].b, k;
  if (Math.abs(Db - cb) < EPS) { c.v[vi] = nv; return null; }
  if (Db < cb) {
    var rk = keyOfB(cb - Db);
    if (!rk) return 'Esa figura no deja un valor posible para el resto del acorde. Prueba con otra figura.';
    for (k = 0; k < 4; k++) { var e = c.v[k]; if (k !== vi && e && !e.h && !e.d) e.d = c.d; }
    c.d = D; S.cols.splice(ci + 1, 0, { d: rk, v: [null, null, null, null], rn: null, cs: null });
    c.v[vi] = nv; fixHolds(S.cols); return null;
  }
  nv.d = D; c.v[vi] = nv;
  var acc = cb, j = ci + 1;
  while (acc < Db - EPS && j < S.cols.length && !S.cols[j].v[vi]) { acc += DUR[S.cols[j].d].b; j++; }
  if (acc < Db - EPS && j >= S.cols.length) {
    var rem = Db - acc, PK = ['w', 'hd', 'h', 'qd', 'q', 'ed', 'e', 's'];
    for (k = 0; k < PK.length && rem > EPS; k++) while (rem + EPS >= DUR[PK[k]].b) { S.cols.push({ d: PK[k], v: [null, null, null, null], rn: null, cs: null }); rem -= DUR[PK[k]].b; }
    if (!partition(S.cols, TIMES[S.time].b).ok || usedMeasures(partition(S.cols, TIMES[S.time].b)) > S.measures) return 'No cabe: se pasaría del compás o del número de compases.';
  }
  fixHolds(S.cols);
  if (!c.v[vi].d) return 'No cabe esa figura: la voz tiene notas en los acordes siguientes del compás, o no completa el tiempo. Bórralas o elige una figura más corta.';
  return null;
}
function onClick(p, right) {
  var h = hitTest(p); if (!h) { msg('No pude ubicar la nota: escríbela dentro del pentagrama, sobre el acorde o en el compás sombreado.'); return; }
  var vi = ui.voice, mode = right ? 'del' : ui.mode, mlen = TIMES[S.time].b;
  msg('');
  if (S.lock && vi === 0 && mode !== 'delchord') { msg('La soprano es la melodía dada y no se puede modificar.'); return; }
  if (mode === 'write') {
    if (h.col != null) {
      var cc = S.cols[h.col], cur0 = cc.v[vi], nv;
      if (ui.rest) nv = { r: 1 };
      else {
        var pt = pitchAt(vi, p.y, h.sys); nv = { l: pt.l, o: pt.o, a: pt.a };
        if (cur0 && !cur0.r && !cur0.h && cur0.l === nv.l && cur0.o === nv.o && cur0.a === nv.a) nv = null;
      }
      var D = ui.own ? ui.dur : cc.d;
      if (!ui.own && ui.dur !== cc.d && nv) msg('La nota usa la figura de ese acorde. Para otra figura en esta voz, activa «Ritmo propio por voz».');
      tryEdit(function () { return writeNote(h.col, vi, nv, D); });
      ui.acc = 'auto'; syncUI();
    } else if (h.append) {
      if (S.lock) { msg('Este ejercicio tiene el ritmo fijo: completa las voces sobre los acordes existentes.'); return; }
      var part = layout.part, last = part.ms[part.ms.length - 1], acc = 0;
      last.forEach(function (i) { acc += DUR[S.cols[i].d].b; });
      if (acc + DUR[ui.dur].b > ((part.ms.length === 1 && S.pickup) ? S.pickup : mlen) + EPS) { msg('Esa figura no cabe en lo que queda del compás. Elige una figura más corta.'); return; }
      mutate(function () {
        var v = [null, null, null, null];
        if (ui.rest) v[vi] = { r: 1 }; else { var pt = pitchAt(vi, p.y, h.sys); v[vi] = { l: pt.l, o: pt.o, a: pt.a }; }
        S.cols.push({ d: ui.dur, v: v, rn: null, cs: null });
      });
      ui.acc = 'auto'; syncUI();
    } else {
      msg(layout.band ? 'Escribe los acordes en orden: el siguiente va en el compás sombreado.' : 'Todos los compases están llenos. Si necesitas más, aumenta «N.º de compases».');
    }
  } else if (mode === 'dur') {
    if (S.lock) { msg('Este ejercicio tiene el ritmo fijo.'); return; }
    if (h.col == null) { msg('Haz clic sobre un acorde ya escrito para cambiar su figura.'); return; }
    var old = S.cols[h.col].d; if (old === ui.dur) return;
    S.cols[h.col].d = ui.dur;
    var pt2 = partition(S.cols, mlen), total = usedMeasures(pt2);
    S.cols[h.col].d = old;
    if (!pt2.ok) { msg('Esa figura haría que un acorde cruce la barra de compás. Prueba con otra figura.'); return; }
    if (total > S.measures) { msg('No cabe: se pasaría del número de compases.'); return; }
    mutate(function () { S.cols[h.col].d = ui.dur; });
  } else if (mode === 'del') {
    if (h.col == null) return;
    mutate(function () { var st = startOf(h.col, vi); if (st < 0) st = h.col; S.cols[st].v[vi] = null; });
  } else if (mode === 'delchord') {
    if (h.col == null) return;
    mutate(function () { var c = S.cols[h.col]; for (var i = S.lock ? 1 : 0; i < 4; i++) c.v[i] = null; c.rn = null; c.cs = null; });
  }
}

/* ================= lápiz (dibujar la nota a mano) ================= */
var PEN = { strokes: [], cur: null, timer: null, sawPen: false, S: 10, hinted: false };
function pbox(pts) {
  var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  pts.forEach(function (p) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; });
  return { x0: x0, y0: y0, x1: x1, y1: y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}
function plen(pts) { var L = 0; for (var i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return L; }
function penClear() { clearTimeout(PEN.timer); PEN.strokes = []; PEN.cur = null; var g = $('ov') && $('ov').querySelector('#ink'); if (g) g.innerHTML = ''; }
function drawInk() {
  var ov = $('ov'), g = ov.querySelector('#ink') || svgEl('g', { id: 'ink' }, ov); g.innerHTML = '';
  var col = VOICES[ui.voice].c, all = PEN.strokes.concat(PEN.cur ? [PEN.cur.pts] : []);
  all.forEach(function (pts) {
    var pl = svgEl('polyline', { points: pts.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '), fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    if (PEN.cur && pts === PEN.cur.pts) PEN.cur.pl = pl;
  });
}
function reversals(pts) {
  var q = [pts[0]], i, n = 0;
  for (i = 1; i < pts.length; i++) { var l = q[q.length - 1]; if (Math.hypot(pts[i].x - l.x, pts[i].y - l.y) >= 2.5) q.push(pts[i]); }
  for (i = 1; i < q.length - 1; i++) {
    var ax = q[i].x - q[i - 1].x, ay = q[i].y - q[i - 1].y, bx = q[i + 1].x - q[i].x, by = q[i + 1].y - q[i].y;
    var c = (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by) || 1);
    if (c < 0.2) n++;
  }
  return n;
}
function centerInk(pts, b) {
  var rc = 0.2 * Math.min(b.w, b.h) + 0.5;
  for (var i = 1; i < pts.length; i++) {
    var x0 = pts[i - 1].x, y0 = pts[i - 1].y, x1 = pts[i].x, y1 = pts[i].y, n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (var k = 0; k <= n; k++) if (Math.hypot(x0 + (x1 - x0) * k / n - b.cx, y0 + (y1 - y0) * k / n - b.cy) <= rc) return true;
  }
  return false;
}
function thin(pts) {
  var q = [pts[0]];
  for (var i = 1; i < pts.length; i++) { var l = q[q.length - 1]; if (Math.hypot(pts[i].x - l.x, pts[i].y - l.y) >= 2.5) q.push(pts[i]); }
  var z = pts[pts.length - 1], l2 = q[q.length - 1]; if (l2 !== z) q.push(z);
  return q;
}
function classifyStroke(pts) {
  pts = thin(pts);
  var S = PEN.S, b = pbox(pts), L = plen(pts), a = pts[0], z = pts[pts.length - 1], d = Math.hypot(a.x - z.x, a.y - z.y);
  var md = Math.max(b.w, b.h), diag = Math.hypot(b.w, b.h);
  if (md < 0.7 * S) return { k: 'dot', b: b };
  if (b.h >= 2 * S && b.w <= 0.5 * b.h && L > 0 && d / L > 0.72) return { k: 'stem', b: b };
  if (md <= 3 * S && md >= 0.55 * S && b.h > 0 && b.w / b.h >= 0.35 && b.w / b.h <= 4) {
    var r = L / (Math.PI * (b.w + b.h) / 2), scrib = r > 2.2 || reversals(pts) >= 3, closed = d <= 0.55 * diag;
    if (scrib || closed) return { k: 'head', b: b, filled: scrib || centerInk(pts, b) };
  }
  if (b.w >= 0.35 * S || b.h >= 0.5 * S) return { k: 'flag', b: b };
  return { k: '?', b: b };
}
function isStemLike(pts) {
  var S = PEN.S, b = pbox(pts), L = plen(pts), a = pts[0], z = pts[pts.length - 1], d = Math.hypot(a.x - z.x, a.y - z.y);
  return b.h >= 2 * S && b.w <= 0.5 * b.h && L > 0 && d / L > 0.72;
}
function splitStemFlag(pts0) {
  var S = PEN.S, pts = thin(pts0), b = pbox(pts);
  if (b.h < 2 * S || isStemLike(pts)) return null;
  for (var dir = 0; dir < 2; dir++) {
    var p = dir ? pts.slice().reverse() : pts;
    var ext = [0, 0];
    p.forEach(function (q, i) { if (q.y < p[ext[0]].y) ext[0] = i; if (q.y > p[ext[1]].y) ext[1] = i; });
    for (var e = 0; e < 2; e++) {
      var k = ext[e]; if (k < 2 || k > p.length - 2) continue;
      var lead = p.slice(0, k + 1), trail = p.slice(k);
      if (isStemLike(lead) && plen(trail) >= 0.4 * S) return [lead, trail];
    }
  }
  return null;
}
function recognizePen(strokes) {
  var ex = [];
  strokes.forEach(function (st) { var sp = splitStemFlag(st); if (sp) { ex.push(sp[0]); ex.push(sp[1]); } else ex.push(st); });
  strokes = ex;
  var S = PEN.S, cl = strokes.map(classifyStroke);
  var heads = cl.filter(function (c) { return c.k === 'head'; }), stems = cl.filter(function (c) { return c.k === 'stem'; });
  var flags = cl.filter(function (c) { return c.k === 'flag'; }), dots = cl.filter(function (c) { return c.k === 'dot'; });
  if (heads.length !== 1) return { noHead: !heads.length, err: heads.length ? 'Dibuja una sola nota a la vez.' : 'No vi la cabeza de la nota. Dibuja un óvalo vacío (blanca, redonda) o un óvalo relleno (negra, corchea).' };
  var h = heads[0], hb = h.b;
  var stem = stems.filter(function (s) { return s.b.cx > hb.x0 - 0.9 * S && s.b.cx < hb.x1 + 0.9 * S && s.b.y0 < hb.y1 + 0.7 * S && s.b.y1 > hb.y0 - 0.7 * S; })[0] || null;
  var nFlag = 0;
  if (stem) {
    var up = stem.b.cy < hb.cy, endY = up ? stem.b.y0 : stem.b.y1;
    nFlag = flags.filter(function (f) { return Math.abs((up ? f.b.y0 : f.b.y1) - endY) < 4 * S && f.b.cx > stem.b.cx - 1.5 * S && f.b.cx < stem.b.cx + 3.5 * S; }).length;
  }
  var dot = dots.some(function (p) { return p.b.cx > hb.x1 - 0.3 * S && p.b.cx < hb.x1 + 3 * S && Math.abs(p.b.cy - hb.cy) < 1.3 * S; });
  var dur;
  if (!h.filled) dur = stem ? (dot ? 'hd' : 'h') : 'w';
  else dur = stem ? (nFlag >= 2 ? 's' : nFlag === 1 ? (dot ? 'ed' : 'e') : (dot ? 'qd' : 'q')) : (dot ? 'qd' : 'q');
  var note = '';
  if (dur === 's' && dot) note = ' (la semicorchea con puntillo no está disponible)';
  if (!h.filled && !stem && dot) note = ' (la redonda con puntillo no está disponible)';
  return { dur: dur, cx: hb.cx, cy: hb.cy, note: note, stem: !!stem, info: (h.filled ? 'cabeza llena' : 'cabeza vacía') + ', ' + (stem ? 'plica' : 'sin plica') + ', ' + nFlag + ' corchete' + (nFlag === 1 ? '' : 's') + (dot ? ', puntillo' : '') };
}
function penFinish() {
  clearTimeout(PEN.timer);
  var strokes = PEN.strokes; PEN.strokes = []; var g = $('ov').querySelector('#ink'); if (g) g.innerHTML = '';
  if (!strokes.length) return;
  var r = recognizePen(strokes);
  if (r.noHead && PEN.last && Date.now() - PEN.last.t < 8000 && JSON.stringify(S) === PEN.last.snap) {
    undo(); strokes = PEN.last.strokes.concat(strokes); r = recognizePen(strokes);
  }
  if (r.err) { msg(r.err); return; }
  ui.dur = r.dur; ui.rest = false; syncUI();
  var m = ui.mode; ui.mode = 'write'; onClick({ x: r.cx, y: r.cy }, false); ui.mode = m; syncUI();
  if (!$('msg').textContent) {
    PEN.last = { strokes: strokes, t: Date.now(), snap: JSON.stringify(S) };
    msg('Reconocí: ' + DUR[r.dur].name.toLowerCase() + r.note + ' (' + r.info + '). Si falta el corchete o el puntillo, dibújalo ahora junto a la nota; si no, «Deshacer».', true);
  }
}
function initPen() {
  var stage = $('stage'), touches = {};
  function contact(e) {
    if (e.pointerType === 'mouse') return !!(e.buttons & 1);
    return true;
  }
  function abort() { if (PEN.cur) { try { stage.releasePointerCapture(PEN.cur.id); } catch (x) { } } PEN.cur = null; drawInk(); }
  ['touchstart', 'touchmove'].forEach(function (t) { stage.addEventListener(t, function (e) { if (ui.mode === 'pen') e.preventDefault(); }, { passive: false }); });
  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch') { touches[e.pointerId] = 1; if (Object.keys(touches).length > 1) { abort(); return; } }
    if (ui.mode !== 'pen' || e.target.closest('.slot')) return;
    if (e.pointerType === 'pen') PEN.sawPen = true;
    if (e.pointerType === 'touch' && (PEN.sawPen || Math.max(e.width || 0, e.height || 0) > 45)) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!contact(e)) return;
    e.preventDefault();
    var p = stagePos(e);
    if (PEN.strokes.length) {
      var gb = pbox([].concat.apply([], PEN.strokes));
      if (p.x > gb.x1 + 3 * PEN.S || p.x < gb.x0 - 3 * PEN.S || Math.abs(p.y - gb.cy) > 9 * PEN.S) penFinish();
    }
    clearTimeout(PEN.timer);
    PEN.cur = { pts: [p], t0: Date.now(), id: e.pointerId, type: e.pointerType };
    try { stage.setPointerCapture(e.pointerId); } catch (x) { }
    drawInk();
  });
  stage.addEventListener('pointermove', function (e) {
    if (!PEN.cur || e.pointerId !== PEN.cur.id) return;
    if (ui.mode !== 'pen') { abort(); return; }
    if (!contact(e)) { up(e); return; }
    var evs = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    evs.forEach(function (ev) { PEN.cur.pts.push(stagePos(ev)); });
    var pl = PEN.cur.pl; if (pl) pl.setAttribute('points', PEN.cur.pts.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ')); else drawInk();
  });
  function up(e) {
    delete touches[e.pointerId];
    if (!PEN.cur || e.pointerId !== PEN.cur.id) return;
    var st = PEN.cur; PEN.cur = null;
    try { stage.releasePointerCapture(e.pointerId); } catch (x) { }
    var b = pbox(st.pts);
    if (Math.max(b.w, b.h) < 0.7 * PEN.S && !PEN.strokes.length && Date.now() - st.t0 < 350) {
      var g = $('ov').querySelector('#ink'); if (g) g.innerHTML = '';
      var m = ui.mode; ui.mode = 'write'; onClick(st.pts[0], false); ui.mode = m; syncUI(); return;
    }
    PEN.strokes.push(st.pts); drawInk();
    clearTimeout(PEN.timer); PEN.timer = setTimeout(penFinish, 600);
  }
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  window.addEventListener('pointerup', function (e) { delete touches[e.pointerId]; });
  window.addEventListener('pointercancel', function (e) { delete touches[e.pointerId]; });
  window.addEventListener('blur', abort);
}

/* ================= paletas ================= */
var pal = $('palette');
function closePalette() { pal.hidden = true; pal.innerHTML = ''; }
function placePalette(anchor) {
  pal.hidden = false;
  var r = anchor.getBoundingClientRect(), pw = pal.offsetWidth, ph = pal.offsetHeight;
  var x = Math.max(6, Math.min(window.innerWidth - pw - 6, r.left + r.width / 2 - pw / 2));
  var y = r.bottom + 6; if (y + ph > window.innerHeight - 6) y = Math.max(6, r.top - ph - 6);
  pal.style.left = x + 'px'; pal.style.top = y + 'px';
}
function pbtn(label, fn, sel, html) {
  var b = document.createElement('button'); if (html) b.innerHTML = label; else b.textContent = label;
  if (sel) b.className = 'sel'; b.addEventListener('click', fn); return b;
}
function openRomanPalette(ci, anchor) {
  pal.innerHTML = '';
  var minor = isMinor(), bases = minor ? RN_MIN : RN_MAJ;
  function build() {
    pal.innerHTML = '';
    var c = S.cols[ci], cur = c.rn;
    var h = document.createElement('h4'); h.textContent = 'Grado (' + keyInfo(S.key)[1] + ')'; pal.appendChild(h);
    var r1 = document.createElement('div'); r1.className = 'pr';
    bases.forEach(function (b) {
      r1.appendChild(pbtn(b, function () { setRN({ b: b, f: cur ? cur.f : '', of: cur && cur.of && RN_SEC[b] ? cur.of : '' }); }, cur && cur.b === b));
    });
    pal.appendChild(r1);
    var hs = document.createElement('h4'); hs.textContent = 'Sexta aumentada / napolitana'; pal.appendChild(hs);
    var rs = document.createElement('div'); rs.className = 'pr';
    RN_SPECIAL.forEach(function (q) {
      rs.appendChild(pbtn(q[2], function () { setRN({ b: q[0], f: q[1], of: '' }); }, cur && cur.b === q[0]));
    });
    pal.appendChild(rs);
    var ht = document.createElement('h4'); ht.textContent = 'Función secundaria: elige V o vii°, luego «de…» (ej. V/V)'; pal.appendChild(ht);
    var rt = document.createElement('div'); rt.className = 'pr';
    (minor ? RN_TGT_MIN : RN_TGT_MAJ).forEach(function (t) {
      rt.appendChild(pbtn('/' + t, function () {
        if (!cur || !RN_SEC[cur.b]) { msg('Primero elige V, vii° o viiø (o VII en menor).'); return; }
        setRN({ b: cur.b, f: cur.f, of: cur.of === t ? '' : t });
      }, cur && cur.of === t));
    });
    pal.appendChild(rt);
    var h2 = document.createElement('h4'); h2.textContent = 'Cifra (inversión / séptima)'; pal.appendChild(h2);
    var r2 = document.createElement('div'); r2.className = 'pr';
    FIGS.forEach(function (f) {
      var parts = figParts(f[0]);
      var lab = f[0] === '' ? 'Fund.' : (parts.length > 1 ? '<span class="fig" style="font-size:.8em"><i>' + parts[0] + '</i><i>' + parts[1] + '</i></span>' : parts[0]);
      r2.appendChild(pbtn(lab, function () { if (!cur) { msg('Primero elige el grado.'); return; } setRN({ b: cur.b, f: f[0], of: cur.of || '' }); }, cur && cur.f === f[0], true));
    });
    pal.appendChild(r2);
    var ft = document.createElement('div'); ft.className = 'foot';
    ft.appendChild(pbtn('Quitar', function () { setRN(null); closePalette(); }));
    ft.appendChild(pbtn('Listo', closePalette));
    pal.appendChild(ft);
  }
  function setRN(v) { mutate(function () { S.cols[ci].rn = v; }); build(); }
  build(); placePalette(anchor);
}
function openChordPalette(ci, anchor) {
  function build() {
    pal.innerHTML = '';
    var c = S.cols[ci], cs = c.cs;
    function mk(o) { return { l: o.l, a: o.a, q: o.q, f: o.f || '', bl: o.bl || null }; }
    function qrow(list) {
      var r = document.createElement('div'); r.className = 'pr';
      list.forEach(function (q) {
        var b = pbtn(q[1], function () { if (!cs) { msg('Primero elige la fundamental.'); return; } var o = mk(cs); o.q = q[0]; if (NO_F5[q[0]]) o.f = ''; setCS(o); }, cs && cs.q === q[0]);
        b.style.fontFamily = 'system-ui,Arial,sans-serif'; b.style.fontSize = '13px'; r.appendChild(b);
      });
      return r;
    }
    function head(t) { var h = document.createElement('h4'); h.textContent = t; pal.appendChild(h); }
    head('Fundamental del acorde');
    pal.appendChild(grid(cs, function (n) { var o = mk({ l: n.l, a: n.a, q: cs ? cs.q : 'M', f: cs ? cs.f : '', bl: cs ? cs.bl : null }); setCS(o); }, function (n) { return cs && cs.l === n.l && cs.a === n.a; }));
    head('Tríada');
    pal.appendChild(qrow([['M', 'Mayor'], ['m', 'm'], ['dim', 'dim'], ['aug', 'aug']]));
    head('Con séptima');
    pal.appendChild(qrow([['7', '7'], ['maj7', 'maj7'], ['m7', 'm7'], ['m7b5', 'm7(♭5)'], ['dim7', 'dim7'], ['mmaj7', 'm(maj7)']]));
    head('Quinta alterada (ej. C7(♭5))');
    var rf = document.createElement('div'); rf.className = 'pr';
    [['b5', '♭5'], ['#5', '♯5']].forEach(function (f) {
      var b = pbtn(f[1], function () {
        if (!cs) { msg('Primero elige la fundamental.'); return; }
        if (NO_F5[cs.q]) { msg('Ese tipo de acorde ya lleva la quinta disminuida.'); return; }
        var o = mk(cs); o.f = (cs.f === f[0]) ? '' : f[0]; setCS(o);
      }, cs && cs.f === f[0]);
      b.style.fontFamily = 'system-ui,Arial,sans-serif'; rf.appendChild(b);
    });
    pal.appendChild(rf);
    head('Bajo (solo si el acorde está invertido, ej. C/E)');
    pal.appendChild(grid(cs && cs.bl, function (n) { if (!cs) { msg('Primero elige la fundamental.'); return; } var o = mk(cs); o.bl = (cs.bl && cs.bl.l === n.l && cs.bl.a === n.a) ? null : { l: n.l, a: n.a }; setCS(o); }, function (n) { return cs && cs.bl && cs.bl.l === n.l && cs.bl.a === n.a; }));
    var ft = document.createElement('div'); ft.className = 'foot';
    ft.appendChild(pbtn('Quitar', function () { setCS(null); closePalette(); }));
    ft.appendChild(pbtn('Listo', closePalette));
    pal.appendChild(ft);
  }
  function grid(cur, onPick, isSel) {
    var g = document.createElement('div'); g.className = 'grid';
    [[-1, '♭'], [0, '♮'], [1, '♯']].forEach(function (ac) {
      var sp = document.createElement('span'); sp.textContent = ac[1]; g.appendChild(sp);
      LET.forEach(function (l) {
        var n = { l: l, a: ac[0] }, b = pbtn(l.toUpperCase(), function () { onPick(n); }, isSel(n)); g.appendChild(b);
      });
    });
    return g;
  }
  function setCS(v) { mutate(function () { S.cols[ci].cs = v; }); build(); placePalette(anchor); }
  build(); placePalette(anchor);
}
document.addEventListener('mousedown', function (e) { if (!pal.hidden && !pal.contains(e.target) && !e.target.closest('.slot')) closePalette(); });

/* ================= interfaz ================= */
function durIcon(code) {
  var d = DUR[code], filled = (d.vf === 'q' || d.vf === '8' || d.vf === '16'), stem = d.vf !== 'w', flag = d.vf === '8' || d.vf === '16';
  var s = '<svg width="26" height="32" viewBox="0 0 26 32">';
  s += '<ellipse cx="10" cy="25" rx="6.2" ry="4.4" transform="rotate(-20 10 25)" fill="' + (filled ? '#111' : '#fff') + '" stroke="#111" stroke-width="1.6"/>';
  if (stem) s += '<line x1="15.6" y1="23.5" x2="15.6" y2="4" stroke="#111" stroke-width="1.5"/>';
  if (flag) s += '<path d="M15.6 4 C 20 8, 24 12, 20 19" fill="none" stroke="#111" stroke-width="1.6"/>';
  if (d.vf === '16') s += '<path d="M15.6 9.5 C 20 13.5, 24 17.5, 20 24" fill="none" stroke="#111" stroke-width="1.6"/>';
  if (d.dots) s += '<circle cx="21" cy="25" r="1.7" fill="#111"/>';
  return s + '</svg>';
}
function buildStaticUI() {
  var sk = $('sKey'), g1 = document.createElement('optgroup'), g2 = document.createElement('optgroup');
  g1.label = 'Mayores'; g2.label = 'Menores';
  KEYS.forEach(function (k) { var o = document.createElement('option'); o.value = k[0]; o.textContent = k[1]; (k[4] ? g2 : g1).appendChild(o); });
  sk.appendChild(g1); sk.appendChild(g2);
  var bv = $('bVoice');
  VOICES.forEach(function (v, i) {
    var b = document.createElement('button'); b.className = 'vb'; b.style.setProperty('--c', v.c);
    b.textContent = v.k; b.title = v.n + ' (tecla ' + (i + 1) + ')'; b.dataset.v = i;
    b.addEventListener('click', function () { ui.voice = i; syncUI(); }); bv.appendChild(b);
  });
  var bd = $('bDur');
  DUR_ORDER.forEach(function (code) {
    var b = document.createElement('button'); b.className = 'db'; b.title = DUR[code].name; b.dataset.d = code; b.innerHTML = durIcon(code);
    b.addEventListener('click', function () { ui.dur = code; ui.rest = ui.rest; syncUI(); }); bd.appendChild(b);
  });
  $('bRest').addEventListener('click', function () { ui.rest = !ui.rest; syncUI(); });
  Array.prototype.forEach.call(document.querySelectorAll('button.ac'), function (b) {
    b.addEventListener('click', function () { var a = parseInt(b.dataset.acc, 10); ui.acc = (ui.acc === a) ? 'auto' : a; ui.rest = false; syncUI(); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('#bMode button'), function (b) {
    var go = function () { var m = b.dataset.mode; ui.mode = (m === 'pen' && ui.mode === 'pen') ? 'write' : m; PEN.cur = null; syncUI(); };
    b.addEventListener('click', go);
  });
  $('bNew').addEventListener('click', newExercise);
  $('bUndo').addEventListener('click', undo); $('bRedo').addEventListener('click', redoIt);
  $('sKey').addEventListener('change', function () { var v = this.value; mutate(function () { S.key = v; }); });
  $('sTime').addEventListener('change', function () {
    var v = this.value, old = S.time; S.time = v;
    var pk = S.pickup && S.pickup < TIMES[v].b ? S.pickup : 0;
    var p = partition(S.cols, TIMES[v].b, pk); S.time = old;
    if (!p.ok) { msg('Con ese compás algún acorde cruzaría la barra. Cambia o borra figuras primero.'); syncUI(); return; }
    mutate(function () { S.time = v; if ((S.pickup || 0) !== pk) { S.pickup = pk; if (!pk) S.measures = Math.max(1, S.measures - 1); } });
  });
  $('nMeas').addEventListener('change', function () {
    var n = Math.max(1, Math.min(16, parseInt(this.value, 10) || 1)); mutate(function () { S.measures = n + (S.pickup ? 1 : 0); });
  });
  $('sPick').addEventListener('change', function () {
    var v = parseFloat(this.value) || 0, cur = S.pickup || 0; if (v === cur) return;
    var p = partition(S.cols, TIMES[S.time].b, v);
    if (!p.ok) { msg('Con esa anacrusa algún acorde cruzaría la barra. Borra o cambia figuras primero.'); syncUI(); return; }
    mutate(function () { S.pickup = v; if (v && !cur) S.measures += 1; else if (!v && cur) S.measures = Math.max(1, S.measures - 1); });
  });
  $('sPer').addEventListener('change', function () { var n = parseInt(this.value, 10); mutate(function () { S.perSystem = n; }); });
  $('cOwn').addEventListener('change', function () { ui.own = this.checked; msg(ui.own ? 'Ritmo propio activado: la figura elegida vale solo para la voz que escribes.' : '', true); });
  $('cLines').addEventListener('change', function () { var v = this.checked; mutate(function () { S.lines = v; }); });
  $('iName').addEventListener('input', function () { info.name = this.value; save(); });
  $('iGroup').addEventListener('input', function () { info.group = this.value; save(); });
  $('iDate').addEventListener('change', function () { info.date = this.value; save(); });
  $('bPlay').addEventListener('click', togglePlay);
  var si = $('sInst'); INSTS.forEach(function (i) { var o = document.createElement('option'); o.value = i[0]; o.textContent = i[1]; si.appendChild(o); });
  si.addEventListener('change', function () { info.inst = this.value; save(); if (playing) { stopPlay(); togglePlay(); } });
  $('nBpm').addEventListener('change', function () { var n = Math.max(40, Math.min(160, parseInt(this.value, 10) || 76)); info.bpm = n; this.value = n; save(); });
  $('bCheck').addEventListener('click', runChecks);
  $('bPng').addEventListener('click', exportPNG);
  $('bPrint').addEventListener('click', printPDF);
  $('bSave').addEventListener('click', saveJSON);
  $('bOpen').addEventListener('click', function () { $('fOpen').click(); });
  $('fOpen').addEventListener('change', openJSON);
  $('bLoad').addEventListener('click', function () { loadCode($('iCode').value); });
  $('tGen').addEventListener('click', genCode);
  $('tCopy').addEventListener('click', function () { copyText($('tOut').value, 'Código copiado.'); });
  $('tLink').addEventListener('click', function () { copyText(location.href.split('#')[0] + '#ej=' + $('tOut').value, 'Enlace copiado.'); });
  var stage = $('stage');
  stage.addEventListener('mousemove', function (e) { updatePreview(stagePos(e)); });
  stage.addEventListener('mouseleave', function () { var g = $('pv'); if (g) g.innerHTML = ''; });
  stage.addEventListener('click', function (e) { if (e.target.closest('.slot') || ui.mode === 'pen') return; onClick(stagePos(e), false); });
  stage.addEventListener('contextmenu', function (e) { if (e.target.closest('.slot')) return; e.preventDefault(); if (ui.mode !== 'pen') onClick(stagePos(e), true); });
  initPen();
  document.addEventListener('keydown', function (e) {
    var t = e.target && e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
    if (e.key >= '1' && e.key <= '4') { ui.voice = parseInt(e.key, 10) - 1; syncUI(); }
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); undo(); }
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); redoIt(); }
    else if (e.key === 'Escape') closePalette();
  });
  window.addEventListener('resize', fit);
}
function syncUI() {
  $('sKey').value = S.key; $('sTime').value = S.time; $('nMeas').value = S.measures - (S.pickup ? 1 : 0); fillPick(); $('sPer').value = S.perSystem; $('cLines').checked = !!S.lines;
  $('iName').value = info.name; $('iGroup').value = info.group; $('iDate').value = info.date; $('sInst').value = info.inst || 'piano'; $('nBpm').value = info.bpm || 76;
  Array.prototype.forEach.call(document.querySelectorAll('#bVoice button'), function (b) { b.classList.toggle('on', parseInt(b.dataset.v, 10) === ui.voice); });
  Array.prototype.forEach.call(document.querySelectorAll('#bDur button'), function (b) { b.classList.toggle('on', b.dataset.d === ui.dur); });
  $('bRest').classList.toggle('on', ui.rest);
  Array.prototype.forEach.call(document.querySelectorAll('button.ac'), function (b) { b.classList.toggle('on', ui.acc === parseInt(b.dataset.acc, 10)); });
  Array.prototype.forEach.call(document.querySelectorAll('#bMode button'), function (b) { b.classList.toggle('on', b.dataset.mode === ui.mode); });
  document.body.classList.toggle('pen-on', ui.mode === 'pen');
  if (ui.mode !== 'pen' && typeof penClear === 'function') penClear();
  var lk = !!S.lock;
  ['sKey', 'sTime', 'nMeas', 'sPick'].forEach(function (id) { $(id).disabled = lk; });
  $('bCheck').style.display = S.chk ? '' : 'none';
  $('bUndo').disabled = !hist.length; $('bRedo').disabled = !redo.length;
  var sb = document.querySelector('#bVoice button[data-v="0"]'); sb.textContent = lk ? 'S 🔒' : 'S';
}
function fit() {
  if (!layout) return;
  var vp = $('viewport'), st = $('stage'), avail = vp.clientWidth;
  scale = Math.max(0.62, Math.min(1, avail / W));
  st.style.width = W + 'px'; st.style.height = layout.H + 'px';
  st.style.transform = 'scale(' + scale + ')';
  vp.style.height = (layout.H * scale + 2) + 'px';
}
function refresh() {
  closePaletteIfStale();
  layout = render($('scoreHost'), { color: true, labels: false, header: false });
  buildOverlay(); fit(); syncUI(); save();
}
function closePaletteIfStale() { /* la paleta se redibuja desde sus propias acciones */ }

/* ================= reproducción ================= */
var INSTS = [['piano', 'Piano'], ['organ', 'Órgano'], ['flute', 'Flauta'], ['strings', 'Cuerdas'], ['choir', 'Coro']];
var LEVEL = { piano: 0.4, organ: 1.2, flute: 0.42, strings: 1.45, choir: 0.85 };
function noiseBuf(ctx) {
  if (ctx._nb) return ctx._nb;
  var n = Math.floor(ctx.sampleRate * 0.8), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  ctx._nb = b; return b;
}
function envSus(ctx, a, t, end, peak, att, rel) {
  a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(peak, t + att);
  a.gain.setValueAtTime(peak, end); a.gain.setTargetAtTime(0, end, rel / 3);
}
function vibrato(ctx, t, end, rel, f, rate, depth, delay) {
  var l = ctx.createOscillator(), g = ctx.createGain();
  l.frequency.value = rate; g.gain.setValueAtTime(0, t); g.gain.setValueAtTime(0, t + delay); g.gain.linearRampToValueAtTime(f * depth, t + delay + 0.4);
  l.connect(g); l.start(t); l.stop(end + rel * 3 + 0.1); return g;
}
var SYN = {
  piano: function (ctx, out, f, t, dur, g) {
    var tau = Math.max(0.6, Math.min(6, 2.4 * Math.pow(261.6 / f, 0.6))), end = t + Math.max(dur, 0.3), rel = 0.25;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.5;
    lp.frequency.setValueAtTime(Math.min(10000, f * 16), t); lp.frequency.setTargetAtTime(Math.max(1200, f * 3), t, tau * 0.5);
    lp.connect(out);
    var amps = [1, 0.62, 0.4, 0.27, 0.18, 0.11, 0.07, 0.045];
    for (var k = 1; k <= 8; k++) {
      var fk = f * k * Math.sqrt(1 + 0.0004 * k * k); if (fk > 11000) break;
      var o = ctx.createOscillator(), a = ctx.createGain(), dk = tau / (1 + 0.7 * (k - 1));
      o.type = 'sine'; o.frequency.value = fk;
      a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(g * amps[k - 1], t + 0.004);
      a.gain.setTargetAtTime(0, t + 0.004, dk); a.gain.setTargetAtTime(0, end, rel / 3);
      o.connect(a); a.connect(lp); o.start(t); o.stop(end + rel * 3 + 0.1);
    }
    var ns = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
    ns.buffer = noiseBuf(ctx); bp.type = 'bandpass'; bp.frequency.value = Math.min(6000, f * 5); bp.Q.value = 0.8;
    ng.gain.setValueAtTime(g * 0.5, t); ng.gain.setTargetAtTime(0, t, 0.012);
    ns.connect(bp); bp.connect(ng); ng.connect(out); ns.start(t); ns.stop(t + 0.15);
  },
  organ: function (ctx, out, f, t, dur, g) {
    var end = t + Math.max(dur, 0.2), rel = 0.09, a = ctx.createGain(); a.connect(out);
    envSus(ctx, a, t, end, g * 0.55, 0.02, rel);
    [[1, 1], [2, 0.7], [3, 0.45], [4, 0.3], [6, 0.18], [8, 0.1]].forEach(function (h) {
      if (f * h[0] > 10000) return;
      var o = ctx.createOscillator(), gg = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * h[0]; gg.gain.value = h[1] / 2.6;
      o.connect(gg); gg.connect(a); o.start(t); o.stop(end + rel * 3 + 0.1);
    });
  },
  flute: function (ctx, out, f, t, dur, g) {
    var end = t + Math.max(dur, 0.25), rel = 0.12, a = ctx.createGain(); a.connect(out);
    envSus(ctx, a, t, end, g * 0.9, 0.07, rel);
    var vg = vibrato(ctx, t, end, rel, f, 5, 0.004, 0.15);
    [[1, 1], [2, 0.2], [3, 0.07]].forEach(function (h, i) {
      var o = ctx.createOscillator(), gg = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * h[0]; gg.gain.value = h[1];
      if (i === 0) vg.connect(o.frequency); o.connect(gg); gg.connect(a); o.start(t); o.stop(end + rel * 3 + 0.1);
    });
    var ns = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
    ns.buffer = noiseBuf(ctx); ns.loop = true; bp.type = 'bandpass'; bp.frequency.value = Math.min(5000, f * 3); bp.Q.value = 0.7; ng.gain.value = 0.07;
    ns.connect(bp); bp.connect(ng); ng.connect(a); ns.start(t); ns.stop(end + rel * 3 + 0.1);
  },
  strings: function (ctx, out, f, t, dur, g) {
    var end = t + Math.max(dur, 0.3) + 0.05, rel = 0.22, a = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = Math.min(6000, f * 7); lp.Q.value = 0.7; a.connect(lp); lp.connect(out);
    envSus(ctx, a, t, end, g * 0.3, 0.13, rel);
    var vg = vibrato(ctx, t, end, rel, f, 5.3, 0.003, 0.2);
    [-7, 7].forEach(function (c) {
      var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = c; vg.connect(o.frequency);
      o.connect(a); o.start(t); o.stop(end + rel * 3 + 0.1);
    });
  },
  choir: function (ctx, out, f, t, dur, g, m) {
    var end = t + Math.max(dur, 0.3) + 0.05, rel = 0.2, a = ctx.createGain(); a.connect(out);
    envSus(ctx, a, t, end, g * 0.9, 0.1, rel);
    var vg = vibrato(ctx, t, end, rel, f, 5.2, 0.0035, 0.25);
    var F = m < 55 ? [[600, 1], [1040, 0.5], [2250, 0.25]] : [[800, 1], [1150, 0.55], [2900, 0.25]];
    var src = ctx.createOscillator(); src.type = 'sawtooth'; src.frequency.value = f; vg.connect(src.frequency);
    F.forEach(function (fm) {
      var bp = ctx.createBiquadFilter(), gg = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.value = fm[0]; bp.Q.value = 9; gg.gain.value = fm[1] * 2.4;
      src.connect(bp); bp.connect(gg); gg.connect(a);
    });
    src.start(t); src.stop(end + rel * 3 + 0.1);
  }
};
function playNote(ctx, out, inst, m, t, dur) {
  var f = 440 * Math.pow(2, (m - 69) / 12);
  SYN[inst](ctx, out, f, t, dur, 0.16 * (LEVEL[inst] || 1), m);
}
function togglePlay() {
  if (playing) { stopPlay(); return; }
  if (!S.cols.length) { msg('No hay nada que escuchar todavía.'); return; }
  var AC = window.AudioContext || window.webkitAudioContext; if (!AC) { msg('Tu navegador no puede reproducir audio.'); return; }
  var ctx = new AC(); if (ctx.resume) ctx.resume();
  var master = ctx.createGain(), comp = ctx.createDynamicsCompressor(); master.gain.value = 0.9; master.connect(comp); comp.connect(ctx.destination);
  var spq = 60 / (info.bpm || 76), inst = info.inst || 'piano', ev = [], tt = 0, timers = [];
  S.cols.forEach(function (c, i) {
    var dur = DUR[c.d].b * spq;
    c.v.forEach(function (e) { if (e && !e.r && !e.h) ev.push({ t: tt, dur: e.d ? DUR[e.d].b * spq : dur, m: midi(e) }); });
    ev.push({ t: tt, hl: i });
    tt += dur;
  });
  var start = ctx.currentTime + 0.2, ei = 0, st = { ctx: ctx, timers: timers, pump: null };
  function pump() {
    var now = ctx.currentTime;
    while (ei < ev.length && start + ev[ei].t < now + 0.8) {
      var e = ev[ei++];
      if (e.hl != null) { (function (h, ms) { timers.push(setTimeout(function () { highlight(h); }, ms)); })(e.hl, Math.max(0, (start + e.t - ctx.currentTime) * 1000)); }
      else playNote(ctx, master, inst, e.m, start + e.t, e.dur);
    }
    if (ei < ev.length) st.pump = setTimeout(pump, 150);
  }
  playing = st; pump();
  timers.push(setTimeout(stopPlay, (start + tt - ctx.currentTime) * 1000 + 900));
  $('bPlay').textContent = '■ Detener'; $('bPlay').classList.add('on');
}
function stopPlay() {
  if (!playing) return;
  playing.timers.forEach(clearTimeout); if (playing.pump) clearTimeout(playing.pump);
  try { playing.ctx.close(); } catch (e) { }
  playing = null; $('bPlay').textContent = '▶ Escuchar'; $('bPlay').classList.remove('on'); highlight(-1);
}
function highlight(ci) {
  var g = $('play'); if (!g) return; g.innerHTML = '';
  var p = layout.cols[ci]; if (ci < 0 || !p) return; var sys = layout.systems[p.sys];
  svgEl('rect', { x: p.x - 16, y: sys.yT - 8, width: 32, height: sys.yB + 52 - sys.yT, fill: '#2a5db0', 'fill-opacity': 0.16, rx: 6 }, g);
}

/* ================= revisor ================= */
function runChecks() {
  var cols = S.cols, mlen = TIMES[S.time].b, part = partition(cols, mlen), where = {}, out = [], pos = {};
  var pk = S.pickup || 0;
  part.ms.forEach(function (m, k) { var a = (k === 0 && pk) ? mlen - pk : 0; m.forEach(function (i) { where[i] = (pk ? (k === 0 ? 'Anacrusa' : 'Compás ' + k) : 'Compás ' + (k + 1)) + ', tiempo ' + (Math.floor(a + EPS) + 1); a += DUR[cols[i].d].b; }); });
  var lt = (tonicPC(S.key) + 11) % 12;
  var EFF = new Map(); cols.forEach(function (c, i) { EFF.set(c, [0, 1, 2, 3].map(function (v) { return effEntry(cols, i, v); })); });
  function np(c, vi) { var e = EFF.get(c)[vi]; return e && !e.r ? e : null; }
  function add(i, t) { out.push({ ci: i, t: where[i] + ': ' + t }); }
  var names = VOICES.map(function (v) { return v.n; });
  cols.forEach(function (c, i) {
    var all = [0, 1, 2, 3].every(function (v) { return np(c, v); });
    [0, 1, 2, 3].forEach(function (v) { var e = np(c, v); if (e) { var m = midi(e); if (m < VOICES[v].lo || m > VOICES[v].hi) add(i, names[v] + ' fuera de su registro.'); } });
    if (all) {
      [[0, 1], [1, 2], [2, 3]].forEach(function (pr) {
        var a = midi(np(c, pr[0])), b = midi(np(c, pr[1]));
        if (b > a) add(i, 'cruce de voces (' + names[pr[1]] + ' por encima de ' + names[pr[0]] + ').');
      });
      if (midi(np(c, 0)) - midi(np(c, 1)) > 12) add(i, 'espaciamiento mayor a una 8.ª entre Soprano y Alto.');
      if (midi(np(c, 1)) - midi(np(c, 2)) > 12) add(i, 'espaciamiento mayor a una 8.ª entre Alto y Tenor.');
      var cnt = 0; [0, 1, 2, 3].forEach(function (v) { if (((midi(np(c, v)) % 12) + 12) % 12 === lt) cnt++; });
      if (cnt >= 2) add(i, 'sensible duplicada.');
    }
    if (i > 0) {
      var p = cols[i - 1], full = all && [0, 1, 2, 3].every(function (v) { return np(p, v); });
      if (!full) return;
      for (var a = 0; a < 4; a++) for (var b = a + 1; b < 4; b++) {
        var u0 = np(p, a), l0 = np(p, b), u1 = np(c, a), l1 = np(c, b);
        var i0 = ((midi(u0) - midi(l0)) % 12 + 12) % 12, i1 = ((midi(u1) - midi(l1)) % 12 + 12) % 12;
        var moved = midi(u0) !== midi(u1) && midi(l0) !== midi(l1);
        if (moved && i0 === i1 && (i0 === 7 || i0 === 0)) add(i, (i0 === 7 ? 'quintas' : 'octavas') + ' paralelas entre ' + names[a] + ' y ' + names[b] + '.');
        else if (a === 0 && b === 3 && (i1 === 7 || i1 === 0) && moved) {
          var su = Math.sign(midi(u1) - midi(u0)), sl = Math.sign(midi(l1) - midi(l0)), leap = Math.abs(dnum(u1) - dnum(u0)) > 1;
          if (su === sl && leap) add(i, (i1 === 7 ? 'quintas' : 'octavas') + ' directas entre Soprano y Bajo (la soprano salta).');
        }
      }
      [[0, 1], [1, 2], [2, 3]].forEach(function (pr) {
        var up = pr[0], lo = pr[1];
        if (midi(np(c, up)) < midi(np(p, lo))) add(i, 'superposición: ' + names[up] + ' queda por debajo de la nota anterior de ' + names[lo] + '.');
        if (midi(np(c, lo)) > midi(np(p, up))) add(i, 'superposición: ' + names[lo] + ' sube por encima de la nota anterior de ' + names[up] + '.');
      });
    }
  });
  errCols = []; out.forEach(function (o) { if (errCols.indexOf(o.ci) < 0) errCols.push(o.ci); });
  var rep = $('report');
  if (!cols.length) { rep.innerHTML = '<p class="note">Escribe algo primero.</p>'; return; }
  rep.innerHTML = out.length
    ? '<b>Posibles errores de conducción de voces:</b><ul>' + out.map(function (o) { return '<li>' + esc(o.t) + '</li>'; }).join('') + '</ul>'
    : '<p class="good">No se detectaron errores de conducción de voces entre acordes completos (4 voces).</p>';
  rep.innerHTML += '<p class="note">El revisor solo mira conducción de voces entre acordes con las cuatro voces escritas. El grado, el cifrado, los dobles y las resoluciones debes comprobarlos tú.</p>';
  buildOverlay();
}

/* ================= exportar / guardar ================= */
function needName() {
  if (info.name.trim()) return false;
  msg('Escribe tu nombre antes de descargar o imprimir.'); $('iName').focus(); return true;
}
function buildExport() { var h = document.createElement('div'); render(h, { color: false, labels: true, header: true }); return h.querySelector('svg'); }
function exportPNG() {
  if (needName()) return;
  var svg = buildExport(), w = parseFloat(svg.getAttribute('width')), h = parseFloat(svg.getAttribute('height'));
  svg.setAttribute('xmlns', SVGNS);
  var xml = new XMLSerializer().serializeToString(svg), img = new Image();
  img.onload = function () {
    var k = 2, cv = document.createElement('canvas'); cv.width = w * k; cv.height = h * k;
    var c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height); c.drawImage(img, 0, 0, cv.width, cv.height);
    cv.toBlob(function (b) {
      b.arrayBuffer().then(function (ab) {
        var out; try { out = new Blob([pngEmbed(new Uint8Array(ab), b64u(JSON.stringify({ v: 1, info: info, S: S })))], { type: 'image/png' }); } catch (e) { out = b; }
        download(out, fileBase() + '.png'); msg('Imagen descargada. Súbela en la tarea de Moodle.', true);
      });
    }, 'image/png');
  };
  img.onerror = function () { msg('No se pudo crear la imagen. Prueba con «Imprimir / guardar PDF».'); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
}
var CRC_T = null;
function crc32(u) {
  if (!CRC_T) { CRC_T = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC_T[n] = c >>> 0; } }
  var r = 0xFFFFFFFF; for (var i = 0; i < u.length; i++) r = CRC_T[(r ^ u[i]) & 255] ^ (r >>> 8); return (r ^ 0xFFFFFFFF) >>> 0;
}
function pngEmbed(png, text) {
  var kw = 'lm3satb', body = new Uint8Array(kw.length + 1 + text.length), i;
  for (i = 0; i < kw.length; i++) body[i] = kw.charCodeAt(i);
  body[kw.length] = 0; for (i = 0; i < text.length; i++) body[kw.length + 1 + i] = text.charCodeAt(i);
  var chunk = new Uint8Array(12 + body.length), dv = new DataView(chunk.buffer);
  dv.setUint32(0, body.length); chunk.set([0x74, 0x45, 0x58, 0x74], 4); chunk.set(body, 8);
  dv.setUint32(8 + body.length, crc32(chunk.subarray(4, 8 + body.length)));
  var pos = 8 + 8 + 13 + 4, out = new Uint8Array(png.length + chunk.length); // tras IHDR
  out.set(png.subarray(0, pos), 0); out.set(chunk, pos); out.set(png.subarray(pos), pos + chunk.length); return out;
}
function pngExtract(u) {
  if (u[0] !== 0x89 || u[1] !== 0x50) return null;
  var dv = new DataView(u.buffer, u.byteOffset, u.byteLength), p = 8;
  while (p + 12 <= u.length) {
    var len = dv.getUint32(p), type = String.fromCharCode(u[p + 4], u[p + 5], u[p + 6], u[p + 7]);
    if (type === 'tEXt') { var t = ''; for (var i = 0; i < len; i++) t += String.fromCharCode(u[p + 8 + i]); if (t.indexOf('lm3satb\0') === 0) return t.slice(8); }
    if (type === 'IDAT' || type === 'IEND') break;
    p += 12 + len;
  }
  return null;
}
function printPDF() {
  if (needName()) return;
  var pa = $('printArea'); pa.innerHTML = ''; pa.appendChild(buildExport());
  msg('En la ventana de impresión elige «Guardar como PDF» y luego sube el archivo en la tarea.', true);
  setTimeout(function () { window.print(); }, 60);
}
function fileBase() { return 'Armonizacion_' + (info.name.trim().replace(/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]+/g, '_') || 'ejercicio'); }
function download(blob, name) {
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function saveJSON() { download(new Blob([JSON.stringify({ v: 1, info: info, S: S })], { type: 'application/json' }), fileBase() + '.json'); msg('Trabajo guardado. Para seguir después, usa «Abrir trabajo».', true); }
function openJSON() {
  var f = this.files[0]; if (!f) return; var r = new FileReader(), inp = this;
  function apply(d) { if (!d.S || !d.S.cols) throw 0; pushHist(); S = d.S; info = d.info || info; if (!info.inst) info.inst = 'piano'; if (!info.bpm) info.bpm = 76; refresh(); }
  r.onload = function () {
    try {
      var u = new Uint8Array(r.result);
      if (u[0] === 0x89 && u[1] === 0x50) {
        var t = pngExtract(u); if (!t) { msg('Esa imagen no trae datos del ejercicio (¿no fue descargada desde esta página?).'); return; }
        apply(JSON.parse(unb64u(t))); msg('Ejercicio abierto desde la imagen. Puedes revisarlo, escucharlo y usar «Revisar errores».', true);
      } else { apply(JSON.parse(new TextDecoder().decode(u))); msg('Trabajo abierto.', true); }
    } catch (e) { msg('Ese archivo no es un trabajo válido.'); }
  };
  r.readAsArrayBuffer(f); inp.value = '';
}
function copyText(t, ok) {
  if (!t) { msg('Primero genera el código.'); return; }
  function fb() { var ta = $('tOut'); ta.select(); try { document.execCommand('copy'); msg(ok, true); } catch (e) { msg('Selecciona el texto y cópialo con Ctrl+C.'); } }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { msg(ok, true); }, fb); else fb();
}

/* ================= código de ejercicio (modo docente) ================= */
function b64u(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return decodeURIComponent(escape(atob(s))); }
var DCH = { w: 'w', hd: 'H', h: 'h', qd: 'Q', q: 'q', ed: 'E', e: 'e', s: 's' }, DCH_R = {}; Object.keys(DCH).forEach(function (k) { DCH_R[DCH[k]] = k; });
function packCode(o) {
  var notes = o.s.map(function (r) { var p = r[1] === 'r' ? 'r' : r[1].replace(/^([a-g])(\d):(-?\d)$/, function (_, l, oc, a) { return l + oc + (a === '-1' ? '-' : a === '1' ? '+' : a === '0' ? '' : a); }); return DCH[r[0]] + p; }).join('');
  return 'A1.' + o.k.replace('#', 's') + '.' + o.m.replace('/', '') + '.' + o.n + '-' + o.p + '-' + o.l + o.c + '-' + Math.round((o.pk || 0) * 2) + '.' + encodeURIComponent(o.t || '').replace(/\./g, '%2E') + '.' + notes;
}
function unpackCode(str) {
  var p = str.split('.'); if (p[0] !== 'A1' || p.length !== 6) throw 0;
  var key = p[1].replace('s', '#'), tm = p[2].replace(/^(\d)(\d)$/, '$1/$2'), g = p[3].split('-');
  var o = { v: 1, t: decodeURIComponent(p[4]), k: key, m: tm, n: +g[0], p: +g[1], l: +g[2][0], c: +g[2][1], pk: (+g[3] || 0) / 2, s: [] };
  var re = /([wHhQqEes])(r|([a-g])(\d)([-+]?))/g, m, used = 0;
  while ((m = re.exec(p[5]))) { used += m[0].length; o.s.push([DCH_R[m[1]], m[2] === 'r' ? 'r' : m[3] + m[4] + ':' + (m[5] === '-' ? -1 : m[5] === '+' ? 1 : 0)]); }
  if (used !== p[5].length) throw 0;
  return o;
}
function genCode() {
  var bad = S.cols.some(function (c) { return !c.v[0]; });
  if (!S.cols.length) { msg('Escribe primero la melodía en la voz Soprano.'); return; }
  if (bad) { msg('Hay acordes sin nota de soprano. Completa la melodía antes de generar el código.'); return; }
  var o = {
    v: 1, t: $('tTitle').value.trim(), k: S.key, m: S.time, n: S.measures, pk: S.pickup || 0, p: S.perSystem, l: $('tLock').checked ? 1 : 0, c: $('tChk').checked ? 1 : 0,
    s: S.cols.filter(function (c) { return !c.v[0].h; }).map(function (c) { var e = c.v[0]; return [e.d || c.d, e.r ? 'r' : e.l + e.o + ':' + e.a]; })
  };
  $('tOut').value = packCode(o); msg('Código generado.', true);
}
function newExercise() {
  if (S.cols.length && !confirm('¿Empezar un ejercicio nuevo? Se borrará lo que hay en pantalla (puedes recuperarlo con «Deshacer»).')) return;
  var ns = newState(); ns.lines = S.lines;
  pushHist(); S = ns; ui.voice = 0; ui.mode = 'write'; ui.own = false; $('cOwn').checked = false;
  $('iCode').value = '';
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
  normalize(); refresh();
  msg('Ejercicio nuevo: todas las voces y controles están libres.', true);
}
function loadCode(str) {
  str = (str || '').trim(); if (!str) { msg('Pega primero el código del ejercicio.'); return; }
  var i = str.indexOf('#ej='); if (i >= 0) str = str.slice(i + 4);
  try {
    var o = str.indexOf('A1.') === 0 ? unpackCode(str) : JSON.parse(unb64u(str));
    if (!o || o.v !== 1 || !KEYS.some(function (k) { return k[0] === o.k; }) || !TIMES[o.m]) throw 0;
    var ns = newState(); ns.etitle = o.t || ''; ns.key = o.k; ns.time = o.m; ns.measures = o.n || 4; ns.pickup = o.pk || 0; ns.perSystem = o.p || 4; ns.lock = !!o.l; ns.chk = o.c !== 0;
    ns.lines = S.lines;
    o.s.forEach(function (r) {
      if (!DUR[r[0]]) throw 0; var v = [null, null, null, null];
      if (r[1] === 'r') v[0] = { r: 1 }; else { var m = /^([a-g])(\d):(-?\d)$/.exec(r[1]); if (!m) throw 0; v[0] = { l: m[1], o: +m[2], a: +m[3] }; }
      ns.cols.push({ d: r[0], v: v, rn: null, cs: null });
    });
    if (!partition(ns.cols, TIMES[ns.time].b, ns.pickup).ok) throw 0;
    pushHist(); S = ns; ui.voice = ns.lock ? 1 : 0; normalize(); refresh();
    msg((S.etitle ? S.etitle + ': ' : '') + 'ejercicio cargado.' + (S.lock ? ' Completa Alto, Tenor y Bajo, y pon grados y cifrado.' : ''), true);
  } catch (e) { msg('El código no es válido. Cópialo completo, tal como lo dejó el docente.'); }
}

$('bCite').addEventListener('click', function () {
  var tx = $('citeTxt').textContent.trim();
  function fb() { var r = document.createRange(); r.selectNodeContents($('citeTxt')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); try { document.execCommand('copy'); msg('Cita copiada.', true); } catch (e) { msg('Selecciona la cita y cópiala con Ctrl+C.'); } }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tx).then(function () { msg('Cita copiada.', true); }, fb); else fb();
});

/* ================= inicio ================= */
buildStaticUI();
(function board() {
  var cv = $('bdCv'), cx = cv.getContext('2d'), tool = 'pen', drawing = null, KEY = 'lm3_board_v1';
  function size() { var w = cv.clientWidth, h = cv.clientHeight, old = null; if (drawing || (w === cw && cv.width)) return; cw = w; try { old = cv.toDataURL(); } catch (e) { }
    var r = Math.min(2, window.devicePixelRatio || 1); cv.width = w * r; cv.height = h * r; cx.setTransform(r, 0, 0, r, 0, 0); cx.lineCap = 'round'; cx.lineJoin = 'round';
    if (old) { var im = new Image(); im.onload = function () { cx.drawImage(im, 0, 0, w, h); }; im.src = old; } }
  function W0() { return parseFloat($('bdW').value) || 2.4; }
  var svT = null, cw = 0;
  function save() { clearTimeout(svT); svT = setTimeout(function () { try { localStorage.setItem(KEY, cv.toDataURL()); } catch (e) { } }, 3000); }
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function seg(a, b, w) {
    cx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'; cx.strokeStyle = $('bdCol').value;
    cx.lineWidth = tool === 'eraser' ? 6 * w : w; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
  }
  cv.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.pointerType === 'pen') cv._pen = true; if (e.pointerType === 'touch' && cv._pen) return;
    e.preventDefault(); drawing = { id: e.pointerId, p: pos(e) }; try { cv.setPointerCapture(e.pointerId); } catch (x) { }
    seg(drawing.p, { x: drawing.p.x + 0.01, y: drawing.p.y }, W0());
  });
  var mv = function (e) {
    if (!drawing || e.pointerId !== drawing.id) return;
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) { drawing = null; save(); return; }
    var evs = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    cx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'; cx.strokeStyle = $('bdCol').value; cx.lineWidth = tool === 'eraser' ? 6 * W0() : W0();
    cx.beginPath(); cx.moveTo(drawing.p.x, drawing.p.y);
    evs.forEach(function (ev) { var q = pos(ev); cx.lineTo(q.x, q.y); drawing.p = q; });
    cx.stroke();
  };
  cv.addEventListener('pointerrawupdate' in window ? 'pointerrawupdate' : 'pointermove', mv);
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  ['touchstart', 'touchmove', 'touchend'].forEach(function (t) { cv.addEventListener(t, function (e) { e.preventDefault(); }, { passive: false }); });
  cv.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  function end(e) { if (drawing && e.pointerId === drawing.id) { drawing = null; save(); } }
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  $('bdPen').addEventListener('click', function () { tool = 'pen'; $('bdPen').classList.add('on'); $('bdEr').classList.remove('on'); });
  $('bdEr').addEventListener('click', function () { tool = 'eraser'; $('bdEr').classList.add('on'); $('bdPen').classList.remove('on'); });
  $('bdClr').addEventListener('click', function () { if (confirm('¿Borrar toda la pizarra?')) { cx.clearRect(0, 0, cv.width, cv.height); save(); } });
  $('bdPen').classList.add('on');
  $('board').addEventListener('toggle', function () { if ($('board').open) { size(); try { var d = localStorage.getItem(KEY); if (d) { var im = new Image(); im.onload = function () { cx.drawImage(im, 0, 0, cv.clientWidth, cv.clientHeight); }; im.src = d; } } catch (e) { } } });
  window.addEventListener('resize', function () { if ($('board').open && !drawing) size(); });
  size(); try { var d0 = localStorage.getItem(KEY); if (d0) { var im0 = new Image(); im0.onload = function () { cx.drawImage(im0, 0, 0, cv.clientWidth, cv.clientHeight); }; im0.src = d0; } } catch (e) { }
})();
try {
  var sv = JSON.parse(localStorage.getItem('lm3_satb_v1') || 'null');
  if (sv && sv.S && sv.S.cols) { S = sv.S; info = sv.info || info; if (!info.date) info.date = today(); if (!info.inst) info.inst = 'piano'; if (!info.bpm) info.bpm = 76; }
} catch (e) { }
refresh();
if (location.hash.indexOf('#ej=') === 0) loadCode(location.hash);
window.__lm3 = { penFinish: penFinish, recognizePen: recognizePen, PEN: PEN, SYN: SYN, LEVEL: LEVEL, playNote: playNote, get S() { return S; }, get layout() { return layout; }, ui: ui, onClick: onClick, loadCode: loadCode, runChecks: runChecks };
})();

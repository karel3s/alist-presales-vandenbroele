(function () {
  "use strict";
  var VB = window.VB, TITLES = VB.TITLES, BY_ID = {}, BY_ISBN = {};
  TITLES.forEach(function (t) { BY_ID[t.id] = t; BY_ISBN[t.isbn] = t; });

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; }); }
  var nf = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" });
  function eur(cents) { return nf.format(cents / 100); }
  function cents(t) { return Math.round(t.price * 100); }
  function inclCents(c) { return Math.round(c * (1 + VB.VAT)); }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function clamp(n) { n = parseInt(n, 10); return isNaN(n) ? 1 : Math.max(1, Math.min(99, n)); }

  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>',
    cart: '<path d="M3 4h2.2l2.3 11h10.1l2.1-8H6.3"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
    list: '<path d="M4 6h16M4 12h10M4 18h16"/>',
    sort: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    x: '<path d="M7 7l10 10M17 7L7 17"/>'
  };
  function ico(n, extra) {
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"' + (extra || "") + '>' + ICONS[n] + '</svg>';
  }

  var AUTHORS = [];
  TITLES.forEach(function (t) { t.authors.forEach(function (a) { if (a !== "Redactie" && AUTHORS.indexOf(a) < 0) AUTHORS.push(a); }); });
  AUTHORS.sort(function (a, b) { return a.localeCompare(b, "nl"); });

  var SEARCH_LABEL = { aut: "auteur", doel: "doelgroep of functie", mat: "materie" };
  function matName(m) { return m.split(" | ")[0]; }
  function facetItems(f, list) {
    if (f !== "doel") return list.map(function (v) { return { v: v }; });
    var out = [];
    list.forEach(function (d) { out.push({ v: d }); (VB.ROLLEN[d] || []).forEach(function (r) { out.push({ v: r, child: true }); }); });
    return out;
  }
  var PARENT = {};
  Object.keys(VB.ROLLEN).forEach(function (p) { VB.ROLLEN[p].forEach(function (r) { PARENT[r] = p; }); });
  function childSel(p) { return (VB.ROLLEN[p] || []).filter(function (r) { return S.doel.indexOf(r) >= 0; }).length; }
  // "all" = parent chosen with every child; "some" = partial; "none" otherwise
  function doelState(p) {
    var kids = VB.ROLLEN[p] || [], on = S.doel.indexOf(p) >= 0, n = childSel(p);
    if (!kids.length) return on ? "all" : "none";
    if (on && n === kids.length) return "all";
    return on || n ? "some" : "none";
  }
  function toggleDoel(v, checked) {
    var arr = S.doel, add = function (x) { if (arr.indexOf(x) < 0) arr.push(x); }, del = function (x) { var i = arr.indexOf(x); if (i >= 0) arr.splice(i, 1); };
    if (VB.ROLLEN[v]) { (checked ? add : del)(v); VB.ROLLEN[v].forEach(checked ? add : del); return; }
    (checked ? add : del)(v);
    var p = PARENT[v];
    if (p) { if (childSel(p) === VB.ROLLEN[p].length) add(p); else del(p); }
  }
  function selCount(f) {
    if (f !== "doel") return S[f].length;
    return S.doel.filter(function (v) { return !PARENT[v] || S.doel.indexOf(PARENT[v]) < 0; }).length;
  }
  function syncMenu(f) {
    var pop = $("#pop-" + f); if (!pop) return;
    $$("input[data-act='facet']", pop).forEach(function (inp) {
      var v = inp.value;
      if (f === "doel" && VB.ROLLEN[v]) { var st = doelState(v); inp.checked = st === "all"; inp.indeterminate = st === "some"; inp.setAttribute("aria-checked", st === "some" ? "mixed" : String(st === "all")); }
      else inp.checked = S[f].indexOf(v) >= 0;
    });
  }
  function inDoel(t, v) { return t.doelgroepen.indexOf(v) >= 0 || t.rollen.indexOf(v) >= 0; }

  var coverCache = {};
  function cover(t, cls) {
    var src = coverCache[t.id];
    if (!src) {
      var tn = t.tone, words = t.title.split(" "), lines = [], cur = "";
      words.forEach(function (w) { if ((cur + " " + w).trim().length > 15) { lines.push(cur); cur = w; } else { cur = (cur + " " + w).trim(); } });
      if (cur) lines.push(cur);
      lines = lines.slice(0, 5);
      var maxLen = Math.max.apply(null, lines.map(function (l) { return l.length; })), fs = Math.min(10.5, 78 / (maxLen * 0.72));
      var tspans = lines.map(function (l, i) { return '<text x="10" y="' + (46 + i * 12) + '" font-family="Jost,Century Gothic,Arial,sans-serif" font-weight="600" font-size="' + fs.toFixed(1) + '" fill="' + tn.fg + '">' + esc(l) + '</text>'; }).join("");
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140"><rect width="100" height="140" fill="' + tn.bg + '"/>' +
        '<rect x="10" y="12" width="26" height="4" rx="2" fill="' + tn.mark + '"/>' +
        '<path d="M0 118 L100 96 V140 H0Z" fill="' + tn.mark + '" opacity=".18"/>' +
        tspans +
        '<text x="10" y="130" font-family="Jost,Arial,sans-serif" font-weight="600" font-size="6" fill="' + tn.fg + '" opacity=".8">VANDEN BROELE</text></svg>';
      src = coverCache[t.id] = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    }
    return '<img class="cover ' + (cls || "") + '" src="' + src + '" alt="" width="44" height="62" loading="lazy">';
  }

  /* ---------- state ---------- */
  var S = {
    q: "", doel: [], mat: [], vorm: [], aut: [], sortKey: "default", sortDir: 1, shown: 12,
    quickOpen: false, quickText: "", openMenu: null, po: "", kp: "", placed: false
  };
  var cart = [];
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  (function load() {
    try { cart = JSON.parse(store("vb.cart") || "[]").filter(function (l) { return BY_ID[l.id]; }); } catch (e) { cart = []; }
    S.po = store("vb.po") || ""; S.kp = store("vb.kp") || "";
  })();
  function saveCart() { store("vb.cart", JSON.stringify(cart)); }
  function cartCount() { return cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function cartSub() { return cart.reduce(function (n, l) { return n + cents(BY_ID[l.id]) * l.qty; }, 0); }
  function totals() { var sub = cartSub(), vat = Math.round(sub * VB.VAT); return { sub: sub, vat: vat, total: sub + vat }; }
  function qtyOf(id) { var l = cart.filter(function (x) { return x.id === id; })[0]; return l ? l.qty : 0; }

  function addToCart(id, qty) {
    var l = cart.filter(function (x) { return x.id === id; })[0];
    if (l) l.qty = Math.min(99, l.qty + qty); else cart.push({ id: id, qty: Math.min(99, qty) });
    saveCart(); refreshCart(true);
  }
  function setQty(id, qty) {
    var l = cart.filter(function (x) { return x.id === id; })[0];
    if (!l) return;
    if (qty < 1) cart = cart.filter(function (x) { return x.id !== id; }); else l.qty = Math.min(99, qty);
    saveCart(); refreshCart(false);
  }
  function refreshCart(bump) {
    var n = cartCount(), c = $("#cartCount");
    c.textContent = n;
    $("#cartSum").textContent = eur(cartSub());
    $("#cartBtn").setAttribute("aria-label", "Mand, " + n + " stuks, " + eur(cartSub()) + " excl. btw");
    if (bump) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
    if (!$("#drawer").hidden) renderDrawer();
    if (route().name === "mand") renderCartPage(true);
    $$("[data-incart]").forEach(function (el) { var q = qtyOf(el.getAttribute("data-incart")); el.textContent = q ? q + " in mand" : ""; el.hidden = !q; });
  }

  /* ---------- filtering ---------- */
  function tokens(q) { return norm(q).replace(/(\d)-(?=\d)/g, "$1").split(/\s+/).filter(Boolean); }
  function haystack(t) { return norm([t.title, t.sub, t.authors.join(" "), t.isbn, t.materie, t.vorm].join(" ")); }
  var HAY = {}; TITLES.forEach(function (t) { HAY[t.id] = haystack(t); });
  function matches(t, skip) {
    var tk = tokens(S.q);
    for (var i = 0; i < tk.length; i++) if (HAY[t.id].indexOf(tk[i]) < 0) return false;
    if (skip !== "doel" && S.doel.length && !S.doel.some(function (d) { return inDoel(t, d); })) return false;
    if (skip !== "mat" && S.mat.length && S.mat.indexOf(t.materie) < 0) return false;
    if (skip !== "aut" && S.aut.length && !S.aut.some(function (a) { return t.authors.indexOf(a) >= 0; })) return false;
    if (skip !== "vorm" && S.vorm.length && S.vorm.indexOf(t.vorm) < 0) return false;
    return true;
  }
  function results() {
    var list = TITLES.filter(function (t) { return matches(t); }), k = S.sortKey, d = S.sortDir;
    var q = norm(S.q.trim());
    list.sort(function (a, b) {
      if (k === "title") return d * a.title.localeCompare(b.title, "nl");
      if (k === "price") return d * (a.price - b.price) || a.order - b.order;
      if (k === "year") return d * (a.year - b.year) || a.order - b.order;
      if (k === "stock") return d * ((a.stock === "b" ? 1 : 0) - (b.stock === "b" ? 1 : 0)) || a.order - b.order;
      if (q) { var sa = norm(a.title).indexOf(q) >= 0 ? 0 : 1, sb = norm(b.title).indexOf(q) >= 0 ? 0 : 1; if (sa !== sb) return sa - sb; }
      return a.order - b.order;
    });
    return list;
  }
  function facetCount(facet, value) {
    return TITLES.filter(function (t) {
      if (!matches(t, facet)) return false;
      if (facet === "aut") return t.authors.indexOf(value) >= 0;
      if (facet === "doel") return inDoel(t, value);
      if (facet === "mat") return t.materie === value;
      return t.vorm === value;
    }).length;
  }

  /* ---------- routing ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, "");
    if (h.indexOf("titel/") === 0 && BY_ID[h.slice(6)]) return { name: "titel", id: h.slice(6) };
    if (h === "mand") return { name: "mand" };
    return { name: "lijst" };
  }
  var main = $("#main");
  function render(focus) {
    closeSheets(true);
    $("#toast").classList.remove("is-on");
    var r = route();
    $$(".top__nav a").forEach(function (a, i) { if (i === 0) a.setAttribute("aria-current", "page"); });
    if (r.name === "lijst") renderList();
    else if (r.name === "titel") renderPdpPage(BY_ID[r.id]);
    else renderCartPage(false);
    if (focus !== false) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
    refreshCart(false);
  }
  window.addEventListener("hashchange", function () { render(); });

  /* ---------- list ---------- */
  function renderList() {
    document.title = "Webshop Vanden Broele";
    main.innerHTML =
      '<section class="band on-navy" aria-label="Zoeken">' +
        '<div class="band__in">' +
          '<h1>Zoek een titel, of plak uw bestellijst</h1>' +
          '<form class="search" role="search" id="searchForm">' +
            '<div class="search__field">' + ico("search") +
              '<label class="sr" for="q">Zoek op titel, auteur of ISBN</label>' +
              '<input id="q" name="q" type="search" autocomplete="off" placeholder="Titel, auteur of ISBN. Of plak een lijst met ISBN\'s" value="' + esc(S.q) + '">' +
            '</div>' +
            '<button class="btn btn--mint btn--lg" type="submit">Zoeken</button>' +
          '</form>' +
          '<div class="filters" id="filters"></div>' +
        '</div>' +
      '</section>' +
      '<section class="quick on-navy" id="quick" aria-label="Snelbestelling"' + (S.quickOpen ? "" : " hidden") + '></section>' +
      '<div class="wrap" id="results"></div>';
    renderFilters();
    renderQuick();
    renderResults();
    var q = $("#q");
    if (window.matchMedia("(max-width: 760px)").matches) q.placeholder = "Titel, auteur of ISBN";
    q.addEventListener("input", function () { S.q = q.value; S.shown = 12; renderResults(); renderFilters(true); });
    q.addEventListener("paste", function (e) {
      var text = (e.clipboardData || window.clipboardData).getData("text");
      if (parseQuick(text).length >= 2) {
        e.preventDefault();
        S.quickOpen = true; S.quickText = text; renderQuick(); renderFilters(true);
        $("#quick").hidden = false;
        $("#quickText").focus();
      }
    });
    $("#searchForm").addEventListener("submit", function (e) { e.preventDefault(); $("#results").scrollIntoView({ behavior: "smooth", block: "start" }); });
  }

  function renderFilters(keepOpen) {
    var el = $("#filters"); if (!el) return;
    var defs = [["aut", "Auteur", AUTHORS], ["doel", "Doelgroep", VB.DOELGROEPEN], ["mat", "Materie", VB.MATERIES], ["vorm", "Vorm", VB.VORMEN]];
    el.innerHTML = defs.map(function (d) {
      var sel = selCount(d[0]), open = S.openMenu === d[0];
      return '<div class="fmenu"><button class="fbtn" type="button" data-act="menu" data-facet="' + d[0] + '" aria-expanded="' + open + '" aria-controls="pop-' + d[0] + '">' +
        d[1] + (sel ? ' <span class="fbtn__n">' + sel + '</span>' : '') + ico("chev") + '</button>' +
        (open ? '<div class="fscrim" data-act="menu-close"></div><div class="fpop" id="pop-' + d[0] + '" role="group" aria-label="' + d[1] + '"><div class="fpop__title">' + d[1] + '</div>' + (d[0] !== "vorm" ? '<input class="fpop__search" type="search" data-fsearch placeholder="Zoek ' + SEARCH_LABEL[d[0]] + '" aria-label="Zoek ' + SEARCH_LABEL[d[0]] + '" autocomplete="off">' : "") + facetItems(d[0], d[2]).map(function (it) {
          var v = it.v, c = facetCount(d[0], v), on = S[d[0]].indexOf(v) >= 0, lab = d[0] === "mat" ? matName(v) : v, sub = d[0] === "mat" && v.indexOf(" | ") > 0 ? v.split(" | ")[1] : "";
          return '<label class="' + (it.child ? 'is-child ' : '') + (!c && !on ? 'is-off' : '') + '"><input type="checkbox" data-act="facet" data-facet="' + d[0] + '" value="' + esc(v) + '"' + (on ? " checked" : "") + (!c && !on ? " disabled" : "") + '><span>' + esc(lab) + (sub ? ' <em class="fpop__tag">' + esc(sub) + '</em>' : '') + '</span><span class="fpop__ct">' + c + '</span></label>';
        }).join("") + '<div class="fpop__foot"><button class="linkbtn" type="button" data-act="facet-clear" data-facet="' + d[0] + '">Wissen</button><button class="btn btn--mint fpop__done" type="button" data-act="menu-close">Toon <span id="fpopN">' + results().length + '</span> titels</button></div></div>' : '') +
        '</div>';
    }).join("") +
      '<button class="fbtn quickbtn" type="button" data-act="quick-toggle" aria-expanded="' + S.quickOpen + '" aria-controls="quick">' + ico("list") + ' Snelbestelling</button>';
    if (S.openMenu) syncMenu(S.openMenu);
    if (keepOpen && S.openMenu) { var open = $("#pop-" + S.openMenu); if (open) open.scrollTop = 0; }
  }

  function renderResults() {
    var el = $("#results"); if (!el) return;
    var list = results(), shown = list.slice(0, S.shown);
    var chips = [];
    ["doel", "mat", "vorm", "aut"].forEach(function (f) { S[f].forEach(function (v) { if (f === "doel" && PARENT[v] && S.doel.indexOf(PARENT[v]) >= 0) return; chips.push('<span class="chip">' + esc(f === "mat" ? matName(v) : v) + '<button type="button" data-act="chip" data-facet="' + f + '" data-val="' + esc(v) + '" aria-label="Filter ' + esc(f === "mat" ? matName(v) : v) + ' verwijderen">' + ico("x") + '</button></span>'); }); });
    var sortVal = S.sortKey === "default" ? "default" : S.sortKey + ":" + S.sortDir;
    var opts = [["default", S.q ? "Relevantie" : "Aanbevolen"], ["title:1", "Titel A–Z"], ["title:-1", "Titel Z–A"], ["price:1", "Prijs laag–hoog"], ["price:-1", "Prijs hoog–laag"], ["year:-1", "Nieuwste eerst"], ["stock:1", "Op voorraad eerst"]];
    var html = '<div class="listhead"><h2>Boeken en kalenders</h2><span class="listhead__count" aria-live="polite">' + list.length + (list.length === 1 ? " titel" : " titels") + '</span>' +
      '<label class="listhead__sort"><span>Sorteer</span><span class="selwrap"><select data-act="sort-select">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === sortVal ? " selected" : "") + '>' + o[1] + '</option>'; }).join("") + '</select>' + ico("chev") + '</span></label></div>';
    if (chips.length) html += '<div class="chips">' + chips.join("") + '<button class="linkbtn" type="button" data-act="clear-all">Alles wissen</button></div>';
    if (!list.length) {
      html += '<div class="empty"><h3>Geen titels gevonden</h3><p>' + (S.q ? 'Niets voor "' + esc(S.q) + '"' : 'Geen titels met deze filters') + '. Controleer de spelling, zoek op een ISBN of wis een filter.</p><button class="btn btn--navy" type="button" data-act="clear-all">Filters en zoekopdracht wissen</button></div>';
    } else {
      html += '<div class="sheetwrap"><table class="plp"><caption class="sr">Titels met prijs, voorraad en bestelknop</caption><thead><tr>' +
        '<th scope="col" class="c-cover"><span class="sr">Omslag</span></th>' +
        th("title", "Titel") +
        '<th scope="col" class="c-fmt"><span class="th">Vorm</span></th>' +
        '<th scope="col" class="num c-ex c-hide-md"><span class="th" style="justify-content:flex-end">Excl. btw</span></th>' +
        th("price", "Incl. btw 6%", "num") +
        th("stock", "Voorraad") +
        '<th scope="col" class="c-act"><span class="sr">Bestellen</span></th></tr></thead><tbody>' +
        shown.map(row).join("") + '</tbody></table></div>';
      if (list.length > shown.length) html += '<div class="more"><span>' + shown.length + ' van ' + list.length + ' titels getoond</span><button class="btn btn--ghost" type="button" data-act="more">Toon meer titels</button></div>';
      else html += '<div class="more"><span>Alle ' + list.length + ' titels getoond</span></div>';
    }
    el.innerHTML = html;
  }
  function th(key, label, cls) {
    var active = S.sortKey === key, dir = active ? (S.sortDir === 1 ? "ascending" : "descending") : null;
    return '<th scope="col" class="' + (cls || "") + '"' + (dir ? ' aria-sort="' + dir + '"' : "") + '><button class="th" type="button" data-act="sort" data-key="' + key + '" style="' + (cls === "num" ? "justify-content:flex-end" : "") + '">' + label +
      '<span class="sortmark" style="' + (active && S.sortDir === -1 ? "transform:rotate(180deg)" : "") + '">' + ico("sort", ' style="width:14px;height:14px"') + '</span></button></th>';
  }
  function stockHTML(t) { return t.stock === "d" ? '<span class="stock">Direct beschikbaar</span>' : t.stock === "v" ? '<span class="stock">Op voorraad</span>' : '<span class="stock stock--b">Op bestelling</span>'; }
  function addControls(t, compact) {
    return '<div class="addcell" data-wrap="' + t.id + '">' + qtyWidget(1, t.title) +
      '<button class="btn btn--mint add" type="button" data-act="add" data-id="' + t.id + '" aria-label="' + esc(t.title) + ' toevoegen aan mand">' + ico("plus") + '<span>Toevoegen</span></button></div>' +
      '<div class="meta" data-incart="' + t.id + '"' + (qtyOf(t.id) ? "" : " hidden") + '>' + (qtyOf(t.id) ? qtyOf(t.id) + " in mand" : "") + '</div>';
  }
  function qtyWidget(v, label) {
    return '<div class="qty" role="group" aria-label="Aantal"><button type="button" data-act="q" data-d="-1" aria-label="Minder">' + ico("minus") + '</button>' +
      '<input type="text" inputmode="numeric" pattern="[0-9]*" value="' + v + '" aria-label="Aantal ' + esc(label || "") + '" data-qtyinput>' +
      '<button type="button" data-act="q" data-d="1" aria-label="Meer">' + ico("plus") + '</button></div>';
  }
  function row(t) {
    var c = cents(t);
    return '<tr data-id="' + t.id + '">' +
      '<td class="c-cover">' + cover(t) + '</td>' +
      '<td class="c-title"><button class="titlebtn" type="button" data-act="pdp" data-id="' + t.id + '">' + esc(t.title) + '</button>' +
        '<div class="meta">' + esc(t.authors.join(", ")) + ' · ISBN ' + t.isbn + ' · ' + t.year + '</div>' +
        '<div class="tags"><span class="tag tag--fmt">' + t.vorm + '</span><span class="tag">' + esc(matName(t.materie)) + '</span></div></td>' +
      '<td class="c-fmt">' + t.vorm + '</td>' +
      '<td class="num c-ex c-hide-md">' + eur(c) + '</td>' +
      '<td class="num price">' + eur(inclCents(c)) + '<small>incl. btw</small><small class="only-sm">' + eur(c) + ' excl. btw</small></td>' +
      '<td class="c-stock">' + stockHTML(t) + '</td>' +
      '<td class="c-act">' + addControls(t) + '</td></tr>';
  }

  /* ---------- quick order ---------- */
  function parseQuick(text) {
    var lines = [], parts = String(text).split(/[\s,;|]+/).filter(Boolean), cur = null;
    parts.forEach(function (p) {
      var d = p.replace(/[-.]/g, "");
      if (/^\d{9}[\dXx]$|^\d{13}$/.test(d) && d.length >= 10) { cur = { raw: p, isbn: d, qty: 1, qtySet: false }; lines.push(cur); }
      else if (/^[x×]?\d{1,3}[x×]?$/i.test(p) && cur && !cur.qtySet) { cur.qty = clamp(p.replace(/[x×]/gi, "")); cur.qtySet = true; }
    });
    var merged = [];
    lines.forEach(function (l) {
      var m = merged.filter(function (x) { return x.isbn === l.isbn; })[0];
      if (m) m.qty = Math.min(99, m.qty + l.qty); else merged.push(l);
    });
    return merged;
  }
  function renderQuick() {
    var el = $("#quick"); if (!el) return;
    el.innerHTML = '<div class="quick__in"><div><h2>Snelbestelling</h2><p class="hint">Eén ISBN per regel, eventueel gevolgd door het aantal. Plak een lijst uit Excel of een e-mail. Zodra u een ISBN invoert, ziet u rechts de titel, het aantal en de prijs.</p>' +
      '<label class="sr" for="quickText">ISBN-lijst</label>' +
      '<textarea id="quickText" spellcheck="false" placeholder="9789012345678 3&#10;9789012345685 1">' + esc(S.quickText) + '</textarea>' +
      '<div class="quick__act"><button class="btn btn--ghost-navy" type="button" data-act="quick-fill">Voorbeeld invullen</button>' +
      '<button class="linkbtn" type="button" data-act="quick-clear">Leegmaken</button></div></div>' +
      '<div id="resolved" aria-live="polite"></div></div>';
    renderResolved();
    $("#quickText").addEventListener("input", function (e) { S.quickText = e.target.value; renderResolved(); });
  }
  function renderResolved() {
    var el = $("#resolved"); if (!el) return;
    var lines = parseQuick(S.quickText);
    if (!lines.length) { el.innerHTML = ""; return; }
    var found = 0, qty = 0, sum = 0;
    var rows = lines.map(function (l) {
      var t = l.isbn.length === 13 ? BY_ISBN[l.isbn] : null;
      if (t) { found++; qty += l.qty; sum += cents(t) * l.qty; }
      return t ?
        '<div class="rrow"><span class="mark">' + ico("check", ' style="width:13px;height:13px"') + '</span><div class="rrow__t"><b>' + esc(t.title) + '</b><span>' + l.isbn + ' · ' + t.vorm + '</span></div><span>× ' + l.qty + '</span><span><b>' + eur(cents(t) * l.qty) + '</b></span></div>' :
        '<div class="rrow is-miss"><span class="mark">' + ico("x", ' style="width:13px;height:13px"') + '</span><div class="rrow__t"><b>' + esc(l.raw) + '</b><span>' + (l.isbn.length === 13 ? "Niet in de catalogus" : "Geen geldig ISBN-13") + '</span></div><span>× ' + l.qty + '</span><span></span></div>';
    }).join("");
    el.innerHTML = '<div class="resolved"><div class="resolved__head"><strong>' + found + ' van ' + lines.length + ' regels gevonden</strong>' +
      '<button class="btn btn--mint" type="button" data-act="quick-add"' + (found ? "" : " disabled") + '>' + (found ? qty + ' stuks toevoegen · ' + eur(sum) : "Niets om toe te voegen") + '</button></div>' + rows + '</div>';
  }

  /* ---------- PDP ---------- */
  function pdpMain(t) {
    var c = cents(t);
    return '<div><h2 class="pt" id="pdpPanelTitle">' + esc(t.title) + '</h2><p class="sub">' + esc(t.sub) + '</p><p class="by">' + esc(t.authors.join(", ")) + '</p>' +
      '<div class="tags"><span class="tag tag--fmt">' + t.vorm + '</span><span class="tag">' + esc(matName(t.materie)) + '</span>' + t.doelgroepen.map(function (d) { return '<span class="tag">' + esc(d) + '</span>'; }).join("") + '</div></div>';
  }
  function buybox(t) {
    var c = cents(t);
    return '<div class="buybox"><div class="pricebig">' + eur(inclCents(c)) + '<small>incl. 6% btw · ' + eur(c) + ' excl. btw</small></div>' + '<div>' + stockHTML(t) + '</div>' +
      '<div class="row" data-wrap="' + t.id + '">' + qtyWidget(1, t.title) + '<button class="btn btn--mint add" type="button" data-act="add" data-id="' + t.id + '">' + ico("plus") + '<span>Toevoegen aan mand</span></button></div>' +
      '<div class="meta" data-incart="' + t.id + '"' + (qtyOf(t.id) ? "" : " hidden") + '>' + (qtyOf(t.id) ? qtyOf(t.id) + " in mand" : "") + '</div>' +
      '<p class="meta" style="margin-top:12px">U ontvangt een factuur. Online betalen is niet nodig.</p></div>';
  }
  function specs(t) {
    return '<dl class="spec"><dt>ISBN</dt><dd>' + t.isbn + '</dd><dt>Vorm</dt><dd>' + t.vorm + '</dd><dt>Uitgave</dt><dd>' + t.year + '</dd>' + (t.pages ? '<dt>Pagina\'s</dt><dd>' + t.pages + '</dd>' : '') + '<dt>Taal</dt><dd>Nederlands</dd><dt>Voor</dt><dd>' + esc(t.doelgroepen.join(", ")) + '</dd></dl>';
  }
  function connectBox(t) {
    if (!t.connect) return "";
    return '<div class="connect">' + ico("info") + '<div><b>Ook online beschikbaar</b>Dit onderwerp vindt u ook in ' + esc(t.connect) + ', het digitale platform van Vanden Broele. <a href="https://www.vandenbroele.be/nl-be/digitale-oplossingen/" rel="noopener">Meer over ' + esc(t.connect) + '</a> ' + ico("ext", ' style="width:14px;height:14px"') + '</div></div>';
  }
  function relatedList(t, n) {
    return TITLES.filter(function (o) { return o.id !== t.id && (o.materie === t.materie || o.doelgroepen.some(function (d) { return t.doelgroepen.indexOf(d) >= 0; })); })
      .sort(function (a, b) { return (b.materie === t.materie) - (a.materie === t.materie) || a.order - b.order; }).slice(0, n);
  }
  function relatedHTML(t, mode) {
    var rel = relatedList(t, 3);
    return '<section class="related"><h3>Andere titels voor ' + esc(t.doelgroepen[0].toLowerCase()) + '</h3>' + rel.map(function (o) {
      return '<div class="relrow">' + cover(o) + '<div style="flex:1;min-width:0"><button class="titlebtn" type="button" data-act="' + (mode === "panel" ? "pdp" : "goto") + '" data-id="' + o.id + '" style="font-size:15px">' + esc(o.title) + '</button><div class="meta">' + o.vorm + ' · ' + eur(inclCents(cents(o))) + ' incl. btw</div></div></div>';
    }).join("") + '</section>';
  }
  var lastFocus = null;
  function openPdp(id) {
    var t = BY_ID[id], el = $("#pdpPanel");
    el.innerHTML = '<div class="sheet__head"><h2 style="font-size:14px;font-weight:500;color:var(--ink-2)">Titeldetails</h2><a class="btn btn--ghost" href="#/titel/' + t.id + '" style="height:38px">Volledige pagina</a>' +
      '<button class="iconbtn" type="button" data-act="close-sheet" aria-label="Sluiten">' + ico("close") + '</button></div>' +
      '<div class="sheet__body"><div class="pdp">' + cover(t, "cover--lg") + pdpMain(t) + '<div style="grid-column:1/-1">' + buybox(t) + '</div></div>' +
      '<p class="prose">' + esc(t.desc) + '</p>' + specs(t) + connectBox(t) + relatedHTML(t, "panel") + '</div>';
    openSheet(el);
  }
  function renderPdpPage(t) {
    document.title = t.title + " · Webshop Vanden Broele";
    main.innerHTML = '<div class="wrap"><nav class="crumbs" aria-label="Kruimelpad"><a href="#/">Webshop</a> / ' + esc(matName(t.materie)) + ' / <span>' + esc(t.title) + '</span></nav>' +
      '<div class="pdp pdp--page"><div>' + cover(t, "cover--lg") + '</div><div>' + pdpMain(t).replace('<h2 class="pt" id="pdpPanelTitle">', '<h1>').replace("</h2>", "</h1>") +
      '<p class="prose">' + esc(t.desc) + '</p>' + specs(t) + connectBox(t) + '</div><div>' + buybox(t) + '</div></div>' +
      '<div class="wrap" style="padding:0 0 24px;max-width:760px;margin:0">' + relatedHTML(t, "page") + '</div></div>';
  }

  /* ---------- basket ---------- */
  function lineHTML(l, ctl) {
    var t = BY_ID[l.id], c = cents(t) * l.qty;
    return '<div class="line">' + cover(t) + '<div class="line__t"><b>' + esc(t.title) + '</b><span class="meta">' + t.vorm + ' · ' + eur(cents(t)) + ' excl. per stuk</span></div>' +
      '<div class="line__p">' + eur(c) + '<small>excl. btw</small></div>' +
      '<div class="line__ctl"><div class="qty" role="group" aria-label="Aantal ' + esc(t.title) + '"><button type="button" data-act="cq" data-id="' + t.id + '" data-d="-1" aria-label="Minder">' + ico("minus") + '</button>' +
      '<input type="text" inputmode="numeric" value="' + l.qty + '" aria-label="Aantal ' + esc(t.title) + '" data-cartqty="' + t.id + '"><button type="button" data-act="cq" data-id="' + t.id + '" data-d="1" aria-label="Meer">' + ico("plus") + '</button></div>' +
      '<button class="linkbtn rm" type="button" data-act="rm" data-id="' + t.id + '">' + ico("trash", ' style="width:16px;height:16px"') + ' Verwijderen<span class="sr"> ' + esc(t.title) + '</span></button></div></div>';
  }
  function clearBtn() {
    return '<button class="linkbtn rm clearcart" type="button" data-act="clear-cart">' + ico("trash", ' style="width:16px;height:16px"') + ' Mand leegmaken</button>';
  }
  var clearedCart = null;
  function totalsHTML() {
    var x = totals();
    return '<div class="totals"><div><span>Subtotaal excl. btw</span><span>' + eur(x.sub) + '</span></div><div><span>Btw 6%</span><span>' + eur(x.vat) + '</span></div><div class="grand"><span>Totaal incl. btw</span><span>' + eur(x.total) + '</span></div></div>';
  }
  function renderDrawer() {
    var el = $("#drawer");
    el.innerHTML = '<div class="sheet__head"><h2 id="drawerTitle">Uw mand (' + cartCount() + ')</h2><button class="iconbtn" type="button" data-act="close-sheet" aria-label="Sluiten">' + ico("close") + '</button></div>' +
      '<div class="sheet__body">' + (cart.length ? cart.map(function (l) { return lineHTML(l); }).join("") :
        '<div class="emptybasket"><h3>Uw mand is leeg</h3><p>Voeg titels toe vanuit de lijst of gebruik de snelbestelling.</p></div>') + '</div>' +
      (cart.length ? '<div class="sheet__foot">' + totalsHTML() + '<a class="btn btn--mint btn--lg" href="#/mand">Naar uw bestelling</a>' + clearBtn() + '</div>' : "");
  }
  function renderCartPage(keepFocus) {
    document.title = "Uw bestelling · Webshop Vanden Broele";
    var active = document.activeElement && document.activeElement.id;
    if (!cart.length) {
      main.innerHTML = '<div class="wrap"><div class="cartpage" style="grid-template-columns:1fr"><div><h1>Uw bestelling</h1><div class="empty"><h3>Uw mand is leeg</h3><p>Zoek een titel of plak een lijst met ISBN\'s in de snelbestelling.</p><a class="btn btn--navy" href="#/">Naar de titels</a></div></div></div></div>';
      return;
    }
    var n = cartCount();
    main.innerHTML = '<div class="wrap"><div class="cartpage"><div><h1>Uw bestelling</h1><div class="panel">' + cart.map(function (l) { return lineHTML(l); }).join("") + '</div>' +
      '<p class="cartlinks"><a href="#/">← Verder zoeken</a>' + clearBtn() + '</p></div>' +
      '<aside class="summary" aria-label="Overzicht"><h2>Overzicht</h2>' + totalsHTML() +
      '<div class="field"><label for="po">Bestelreferentie of PO-nummer <span class="opt">(optioneel)</span></label><input type="text" id="po" value="' + esc(S.po) + '" maxlength="40" autocomplete="off" data-field="po"><p class="help">Komt op de factuur te staan.</p></div>' +
      '<div class="field"><label for="kp">Kostenplaats of dienst <span class="opt">(optioneel)</span></label><input type="text" id="kp" value="' + esc(S.kp) + '" maxlength="40" autocomplete="off" data-field="kp"></div>' +
      '<div class="notice">' + ico("info") + '<div>U ontvangt een factuur, u betaalt niet online. Verzendkosten zijn in dit prototype nog niet opgenomen.</div></div>' +
      '<button class="btn btn--mint btn--lg" type="button" data-act="place" style="width:100%">Bestelling plaatsen · ' + n + (n === 1 ? " stuk" : " stuks") + '</button>' +
      '<div id="placed" aria-live="polite">' + (S.placed ? placedHTML() : "") + '</div></aside></div></div>';
    if (keepFocus && active) { var f = document.getElementById(active); if (f) { f.focus(); try { f.setSelectionRange(f.value.length, f.value.length); } catch (e) {} } }
  }
  function placedHTML() {
    return '<div class="placed"><b>Dit is een prototype.</b><br>In de echte webshop zou deze bestelling nu worden verzonden' + (S.po ? ' met referentie <b>' + esc(S.po) + '</b>' : '') + '. Er is niets verstuurd.</div>';
  }

  /* ---------- sheets ---------- */
  var openEl = null;
  function openSheet(el) {
    closeSheets(true);
    lastFocus = document.activeElement;
    var scrim = $("#scrim");
    scrim.hidden = false; el.hidden = false; void el.offsetWidth;
    scrim.classList.add("is-on"); el.classList.add("is-on");
    openEl = el; document.body.style.overflow = "hidden";
    var f = $("[data-act='close-sheet']", el); if (f) f.focus();
  }
  function closeSheets(instant) {
    if (!openEl) return;
    var el = openEl, scrim = $("#scrim");
    openEl = null; document.body.style.overflow = "";
    el.classList.remove("is-on"); scrim.classList.remove("is-on");
    var done = function () { if (!openEl) { el.hidden = true; scrim.hidden = true; } };
    if (instant) { el.hidden = true; scrim.hidden = true; } else setTimeout(done, 330);
    if (lastFocus && document.contains(lastFocus)) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  }
  function openDrawer() { renderDrawer(); openSheet($("#drawer")); }

  var toastT;
  function toast(msg, withBtn) {
    var el = $("#toast");
    var b = withBtn === true ? { label: "Bekijk mand", act: "open-cart" } : withBtn;
    el.innerHTML = '<span>' + msg + '</span>' + (b ? '<button type="button" data-act="' + b.act + '">' + b.label + '</button>' : "");
    el.classList.add("is-on"); clearTimeout(toastT);
    toastT = setTimeout(function () { el.classList.remove("is-on"); }, 4500);
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-act]");
    if (!a) {
      if (S.openMenu && !e.target.closest(".fmenu")) { S.openMenu = null; renderFilters(); }
      if (e.target.id === "scrim") closeSheets();
      return;
    }
    var act = a.getAttribute("data-act"), id = a.getAttribute("data-id");
    switch (act) {
      case "menu": var f = a.getAttribute("data-facet"); S.openMenu = S.openMenu === f ? null : f; renderFilters(); if (S.openMenu) { var cb = $("#pop-" + f + " input"); if (cb) cb.focus(); } else { var b = $("[data-act='menu'][data-facet='" + f + "']"); if (b) b.focus(); } break;
      case "menu-close": var ff = S.openMenu; S.openMenu = null; renderFilters(); var bb = $("[data-act='menu'][data-facet='" + ff + "']"); if (bb) bb.focus(); break;
      case "facet-clear": S[a.getAttribute("data-facet")] = []; S.shown = 12; renderFilters(); renderResults(); break;
      case "chip": var fc = a.getAttribute("data-facet"), v = a.getAttribute("data-val"); S[fc] = S[fc].filter(function (x) { return x !== v && !(fc === "doel" && PARENT[x] === v); }); S.shown = 12; renderFilters(); renderResults(); break;
      case "clear-all": S.q = ""; S.doel = []; S.mat = []; S.vorm = []; S.aut = []; S.shown = 12; renderList(); break;
      case "more": S.shown += 12; renderResults(); break;
      case "sort": var k = a.getAttribute("data-key"); if (S.sortKey === k) S.sortDir = -S.sortDir; else { S.sortKey = k; S.sortDir = 1; } renderResults(); var nb = $("[data-act='sort'][data-key='" + k + "']"); if (nb) nb.focus(); break;
      case "quick-toggle": S.quickOpen = !S.quickOpen; $("#quick").hidden = !S.quickOpen; a.setAttribute("aria-expanded", S.quickOpen); if (S.quickOpen) { if (!$("#quickText")) renderQuick(); $("#quickText").focus(); } break;
      case "quick-fill": S.quickText = [TITLES[0].isbn + " 5", TITLES[3].isbn + " 2", TITLES[8].isbn, "9789000000000 1", TITLES[2].isbn + " 10"].join("\n"); renderQuick(); break;
      case "quick-clear": S.quickText = ""; renderQuick(); $("#quickText").focus(); break;
      case "quick-add":
        var ls = parseQuick(S.quickText), n = 0;
        ls.forEach(function (l) { var t = l.isbn.length === 13 ? BY_ISBN[l.isbn] : null; if (t) { addToCart(t.id, l.qty); n += l.qty; } });
        if (n) toast(n + " stuks uit uw lijst toegevoegd", true);
        break;
      case "q": var inp = $("[data-qtyinput]", a.parentNode); inp.value = clamp(parseInt(inp.value, 10) + parseInt(a.getAttribute("data-d"), 10)); break;
      case "add":
        var wrap = a.closest("[data-wrap]"), qn = clamp($("[data-qtyinput]", wrap).value), t2 = BY_ID[id];
        addToCart(id, qn); $("[data-qtyinput]", wrap).value = 1;
        toast(qn + "× " + esc(t2.title) + " toegevoegd", true);
        var lab = $("span", a); if (lab) { var old = lab.textContent; a.classList.add("is-added"); lab.textContent = "Toegevoegd"; setTimeout(function () { a.classList.remove("is-added"); lab.textContent = old; }, 1600); }
        break;
      case "pdp": openPdp(id); break;
      case "goto": location.hash = "#/titel/" + id; break;
      case "close-sheet": closeSheets(); break;
      case "open-cart": $("#toast").classList.remove("is-on"); openDrawer(); break;
      case "cq": setQty(id, qtyOf(id) + parseInt(a.getAttribute("data-d"), 10)); break;
      case "rm": setQty(id, 0); break;
      case "clear-cart":
        if (!cart.length) break;
        clearedCart = cart.slice(); cart = []; S.placed = false; saveCart(); refreshCart(false);
        toast("Mand geleegd (" + clearedCart.reduce(function (n, l) { return n + l.qty; }, 0) + " stuks)", { label: "Ongedaan maken", act: "undo-clear" });
        break;
      case "undo-clear":
        if (clearedCart && !cart.length) { cart = clearedCart; clearedCart = null; saveCart(); refreshCart(false); $("#toast").classList.remove("is-on"); toast("Mand hersteld"); }
        break;
      case "place": S.placed = true; $("#placed").innerHTML = placedHTML(); break;
    }
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.matches("[data-act='facet']")) {
      var f = t.getAttribute("data-facet"), v = t.value, arr = S[f], i = arr.indexOf(v);
      if (f === "doel") toggleDoel(v, t.checked);
      else if (t.checked && i < 0) arr.push(v); else if (!t.checked && i >= 0) arr.splice(i, 1);
      syncMenu(f);
      S.shown = 12; renderResults();
      var fn = $("#fpopN"); if (fn) fn.textContent = results().length;
      // keep menu open, refresh counts without losing focus
      var pop = $("#pop-" + f); if (pop) { $$("label", pop).forEach(function (lb) { var inp = $("input", lb), c = facetCount(f, inp.value); $(".fpop__ct", lb).textContent = c; }); }
      var btn = $("[data-act='menu'][data-facet='" + f + "']"); if (btn) { var n = selCount(f); var badge = $(".fbtn__n", btn); if (n) { if (!badge) { badge = document.createElement("span"); badge.className = "fbtn__n"; btn.insertBefore(badge, btn.querySelector("svg")); btn.insertBefore(document.createTextNode(" "), badge); } badge.textContent = n; } else if (badge) badge.remove(); }
    } else if (t.matches("[data-act='sort-select']")) {
      if (t.value === "default") { S.sortKey = "default"; S.sortDir = 1; } else { var p = t.value.split(":"); S.sortKey = p[0]; S.sortDir = parseInt(p[1], 10); }
      renderResults();
    } else if (t.matches("[data-cartqty]")) {
      setQty(t.getAttribute("data-cartqty"), clamp(t.value));
    } else if (t.matches("[data-qtyinput]")) { t.value = clamp(t.value); }
  });
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.matches("[data-fsearch]")) { var qq = norm(t.value); $$("label", t.closest(".fpop")).forEach(function (lb) { lb.hidden = qq && norm(lb.textContent).indexOf(qq) < 0; }); return; }
    if (t.matches("[data-field]")) { var k = t.getAttribute("data-field"); S[k] = t.value; store("vb." + k, t.value); S.placed = false; var p = $("#placed"); if (p) p.innerHTML = ""; }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (S.openMenu) { var f = S.openMenu; S.openMenu = null; renderFilters(); var b = $("[data-act='menu'][data-facet='" + f + "']"); if (b) b.focus(); return; }
      if (openEl) { closeSheets(); return; }
    }
    if (e.key === "Tab" && openEl) {
      var foc = $$("a[href], button:not([disabled]), input, select, textarea", openEl).filter(function (x) { return x.offsetParent !== null; });
      if (!foc.length) return;
      var first = foc[0], last = foc[foc.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (e.key === "Enter" && e.target.matches("[data-qtyinput]")) { var wrap = e.target.closest("[data-wrap]"); var ab = $("[data-act='add']", wrap); if (ab) ab.click(); }
  });
  $(".cartbtn__ico").innerHTML = ico("cart");
  $("#cartBtn").addEventListener("click", openDrawer);
  document.addEventListener("click", function (e) { if (openEl && e.target.closest("a[href^='#/']")) closeSheets(true); });

  render(false);
})();

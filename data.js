/* Synthetic catalogue. Titles, authors, prices and stock are invented for this prototype. */
(function () {
  var MATERIES = ["Arbeidsrecht", "Burgerlijk recht", "Gerechtelijk recht", "Lokaal personeelsbeleid | HRMConnect", "Lokale financiën | FinConnect", "Lokale organisatie en werking | MATConnect", "Omgeving | OmgevingConnect", "Overheidsopdrachten", "Welzijn en zorg"];
  var DOELGROEPEN = ["Brandweer", "Gemeente", "HR-manager", "Magistraat", "Notaris", "OCMW", "Politie", "Provincie"];
  // Sub-roles as in the current catalogue (synthetic assignment to titles).
  var ROLLEN = {
    "Gemeente": ["Dienst Financiën", "Dienst Personeel en HR", "Financieel directeur", "Management Team", "Mandataris", "Secretaris"],
    "OCMW": ["Financieel directeur (OCMW)", "Juridische dienst (OCMW)", "Management Team (OCMW)", "Mandataris (OCMW)", "Secretaris (OCMW)"],
    "Politie": ["Bijzonder rekenplichtige"]
  };
  var ROLE_BY_MATERIE = {
    "Lokale financiën | FinConnect": ["Financieel directeur", "Dienst Financiën", "Bijzonder rekenplichtige"],
    "Lokaal personeelsbeleid | HRMConnect": ["Dienst Personeel en HR"],
    "Lokale organisatie en werking | MATConnect": ["Management Team", "Secretaris", "Mandataris"],
    "Overheidsopdrachten": ["Financieel directeur"],
    "Welzijn en zorg": ["Mandataris"]
  };
  var VORMEN = ["Boek", "Cd-rom", "E-boek (ePub)", "Exclusief online in Connect", "Kalender", "Online in Connect", "Tijdschrift"];

  // Tone per subject drives the generated cover.
  var TONES = {
    "Arbeidsrecht": { bg: "#163E65", fg: "#FFFFFF", mark: "#9CC7EE" },
    "Burgerlijk recht": { bg: "#E6DCC3", fg: "#0E2D4B", mark: "#0F7A72" },
    "Gerechtelijk recht": { bg: "#08182A", fg: "#FFFFFF", mark: "#7FB4E6" },
    "Lokaal personeelsbeleid | HRMConnect": { bg: "#2F6FA8", fg: "#FFFFFF", mark: "#BBD8F2" },
    "Lokale financiën | FinConnect": { bg: "#E3ECF4", fg: "#0E2D4B", mark: "#163E65" },
    "Lokale organisatie en werking | MATConnect": { bg: "#3C4F66", fg: "#FFFFFF", mark: "#BBD8F2" },
    "Omgeving | OmgevingConnect": { bg: "#0F7A72", fg: "#FFFFFF", mark: "#BFF7EC" },
    "Overheidsopdrachten": { bg: "#1F5A8A", fg: "#FFFFFF", mark: "#BBD8F2" },
    "Welzijn en zorg": { bg: "#5B4B7A", fg: "#FFFFFF", mark: "#D9CFF0" }
  };

  // id, title, subtitle, authors, materie, doelgroepen, vorm, price excl. VAT (EUR), year, pages, stock, connect
  var RAW = [
    ["t01", "Gemeentedecreet geannoteerd", "Editie 2026 met rechtspraak", ["An Verstraete", "Joris De Smet"], "Lokale organisatie en werking | MATConnect", ["Gemeente", "OCMW", "Provincie"], "Boek", 84.0, 2026, 912, "v"],
    ["t02", "Arbeidsrecht in de lokale besturen", "Statuut, evaluatie en ontslag", ["Dirk Claeys"], "Lokaal personeelsbeleid | HRMConnect", ["Gemeente", "OCMW"], "Boek", 70.28, 2026, 640, "b"],
    ["t03", "Kalender Lokale Besturen 2027", "Wettelijke deadlines per maand", ["Redactie"], "Lokale organisatie en werking | MATConnect", ["Gemeente", "OCMW", "Provincie"], "Kalender", 16.98, 2027, 28, "v"],
    ["t04", "Overheidsopdrachten in de praktijk", "Van raming tot gunning", ["Els Peeters", "Tom Wouters"], "Overheidsopdrachten", ["Gemeente", "Provincie"], "Boek", 96.0, 2025, 780, "v"],
    ["t05", "Politiereglement en GAS-sancties", "Handboek voor handhavers", ["Kris Maertens"], "Gerechtelijk recht", ["Politie", "Gemeente"], "Boek", 58.5, 2025, 410, "v"],
    ["t06", "Vergoedingen voor OCMW-personeel", "Barema's en toelagen", ["Lies Hendrickx"], "Lokaal personeelsbeleid | HRMConnect", ["OCMW"], "Boek", 45.0, 2026, 288, "v"],
    ["t07", "Verkeersmisdrijven voor politiediensten", "Vaststelling en proces-verbaal", ["Pieter Goossens", "Nele Vandamme"], "Gerechtelijk recht", ["Politie"], "Boek", 62.0, 2026, 460, "b"],
    ["t08", "Brandweerzones: organisatie en financiering", "Rechtspositie en dotaties", ["Wim Lauwers"], "Lokale financiën | FinConnect", ["Brandweer", "Gemeente", "Provincie"], "Boek", 52.0, 2025, 336, "v"],
    ["t09", "Gemeentelijke begroting en beleidsplanning", "Beleids- en beheerscyclus uitgelegd", ["Sofie Dhondt"], "Lokale financiën | FinConnect", ["Gemeente", "OCMW", "Politie"], "Boek", 68.0, 2026, 520, "v"],
    ["t10", "Omgevingsvergunning stap voor stap", "Procedure en bezwaren", ["Anke Verhaeghe", "Bart Lemmens"], "Omgeving | OmgevingConnect", ["Gemeente", "Provincie"], "Boek", 79.0, 2026, 604, "v"],
    ["t11", "Maatschappelijke dienstverlening in het OCMW", "Recht op steun en toelagen", ["Griet Michiels"], "Welzijn en zorg", ["OCMW"], "Boek", 54.0, 2025, 372, "v"],
    ["t12", "Akten en aktebeheer voor notarissen", "Hypotheek, schenking en erfenis", ["Luc Baert"], "Burgerlijk recht", ["Notaris"], "Boek", 110.0, 2026, 860, "b"],
    ["t13", "Kalender Politie 2027", "Termijnen, wetgeving, contactlijsten", ["Redactie"], "Gerechtelijk recht", ["Politie"], "Kalender", 14.15, 2027, 28, "v"],
    ["t14", "Jeugdzorg en gemeentelijk beleid", "Preventie en samenwerking", ["Mieke Declercq"], "Welzijn en zorg", ["Gemeente", "OCMW"], "Boek", 49.0, 2024, 300, "v"],
    ["t15", "Handboek gemeentelijke belastingen", "Reglementen en bezwaarprocedure", ["Jan Pauwels", "Ilse Baeten"], "Lokale financiën | FinConnect", ["Gemeente", "OCMW"], "Boek", 72.0, 2026, 548, "v"],
    ["t16", "Pensioenen van lokale mandatarissen", "Regels en simulaties", ["Tine Bogaert"], "Arbeidsrecht", ["Gemeente", "Provincie"], "Boek", 41.0, 2025, 216, "b"],
    ["t17", "Ruimtelijke uitvoeringsplannen", "Opmaak, participatie en vaststelling", ["Hans Willems"], "Omgeving | OmgevingConnect", ["Gemeente", "Provincie"], "Boek", 88.0, 2025, 692, "v"],
    ["t18", "Brandpreventie en veiligheidsrapporten", "Controle en handhaving", ["Frank Aerts"], "Gerechtelijk recht", ["Brandweer", "Gemeente"], "Boek", 57.5, 2026, 344, "v"],
    ["t19", "Raming en prijsherziening bij opdrachten", "Formules en rechtspraak", ["Karolien Smets"], "Overheidsopdrachten", ["Gemeente", "OCMW", "Provincie"], "Boek", 66.0, 2026, 420, "v"],
    ["t20", "Kalender Brandweer 2027", "Oefenplanning en wettelijke termijnen", ["Redactie"], "Welzijn en zorg", ["Brandweer"], "Kalender", 14.15, 2027, 28, "b"],
    ["t21", "Het statuut van de gemeentesecretaris", "Taken, evaluatie, verantwoordelijkheid", ["Veerle Hermans"], "Lokale organisatie en werking | MATConnect", ["Gemeente"], "Boek", 59.0, 2024, 332, "v"],
    ["t22", "Verbouwen en beschermd erfgoed", "Toelating, subsidie en toezicht", ["Maarten Cools"], "Omgeving | OmgevingConnect", ["Gemeente", "Provincie"], "Boek", 64.0, 2025, 380, "v"],
    ["t23", "Vrijwilligerswerk in lokale besturen", "Verzekering en vergoeding", ["Annelies Rombouts"], "Welzijn en zorg", ["Gemeente", "OCMW"], "Boek", 36.0, 2025, 184, "v"],
    ["t24", "Rechten van de verdediging: de basisgids", "Voor gemeentelijke sanctieambtenaren", ["Stijn Robbrecht"], "Gerechtelijk recht", ["Gemeente", "Politie"], "Boek", 47.0, 2026, 262, "v"],
    ["t25", "Boekhouding voor lokale besturen", "BBC, balans en rekening", ["Claudia Mertens", "Rik Hoste"], "Lokale financiën | FinConnect", ["Gemeente", "OCMW", "Provincie", "Politie"], "Boek", 92.0, 2026, 704, "v"],
    ["t26", "Ontslag en schorsing van contractuelen", "Procedure stap voor stap", ["Dirk Claeys", "Eva Lambrecht"], "Arbeidsrecht", ["Gemeente", "OCMW", "Provincie"], "Boek", 53.0, 2026, 298, "v"],
    ["t27", "Zorgvuldig besturen: integriteit en klachten", "Praktijkgids voor lokale besturen", ["Hilde Van den Berghe"], "Welzijn en zorg", ["Gemeente", "OCMW", "Provincie"], "Boek", 39.0, 2024, 208, "v"],
    ["t28", "Overheidsopdrachten: modeldocumenten", "Bestekken, gunningsverslagen, brieven", ["Els Peeters"], "Overheidsopdrachten", ["Gemeente", "OCMW"], "Boek", 74.0, 2026, 520, "b"],
    ["t29", "Plaatsbeschrijvingen en brandweerattesten", "Werkwijze en formulieren", ["Johan Segers"], "Omgeving | OmgevingConnect", ["Brandweer", "Notaris"], "Boek", 43.0, 2025, 232, "v"],
    ["t30", "Het gemeentelijk vastgoed", "Verkoop, erfpacht, opstalrecht", ["Luc Baert", "Sara Naessens"], "Burgerlijk recht", ["Gemeente", "Notaris", "Provincie"], "Boek", 98.0, 2025, 612, "v"],
    ["t31", "Kalender Notariaat 2027", "Termijnen en registratierechten", ["Redactie"], "Burgerlijk recht", ["Notaris"], "Kalender", 15.09, 2027, 28, "v"],
    ["t32", "Opvang en sociale huisvesting", "Hoe lokale besturen samenwerken", ["Fien Van Gucht"], "Welzijn en zorg", ["OCMW", "Gemeente"], "Boek", 44.0, 2026, 276, "v"],
    ["t33", "Handhaving van milieuregels", "Controle, sancties en herstel", ["Peter Denolf"], "Gerechtelijk recht", ["Gemeente", "Provincie", "Politie"], "Boek", 61.0, 2026, 388, "v"],
    ["t34", "Verloning in de lokale besturen", "Bezoldiging, premies en toelagen", ["Lies Hendrickx", "Walter Bossuyt"], "Lokaal personeelsbeleid | HRMConnect", ["Gemeente", "OCMW", "Brandweer"], "Boek", 76.0, 2026, 468, "v"],
    ["t35", "Provinciedecreet in vogelvlucht", "Bevoegdheden en toezicht", ["Marc Dumon"], "Lokale organisatie en werking | MATConnect", ["Provincie"], "Boek", 49.0, 2025, 256, "v"],
    ["t36", "Kalender Gemeente en OCMW 2027", "Planner met jaarkalender", ["Redactie"], "Lokale organisatie en werking | MATConnect", ["Gemeente", "OCMW"], "Kalender", 16.98, 2027, 28, "v"],
    ["t37", "Wetgeving lokale besturen op cd-rom", "Volledige zoekbare uitgave", ["Redactie"], "Lokale organisatie en werking | MATConnect", ["Gemeente", "OCMW", "Provincie"], "Cd-rom", 89.0, 2026, 0, "v"],
    ["t38", "Gemeentedecreet geannoteerd", "Editie 2026 als e-boek", ["An Verstraete", "Joris De Smet"], "Lokale organisatie en werking | MATConnect", ["Gemeente", "OCMW", "Provincie"], "E-boek (ePub)", 67.0, 2026, 912, "d"],
    ["t39", "Arbeidsrecht in de lokale besturen", "Statuut, evaluatie en ontslag als e-boek", ["Dirk Claeys"], "Lokaal personeelsbeleid | HRMConnect", ["Gemeente", "OCMW"], "E-boek (ePub)", 56.0, 2026, 640, "d"],
    ["t40", "Tijdschrift voor lokale financiën", "Actualiteit en rechtspraak", ["Redactie"], "Lokale financiën | FinConnect", ["Gemeente", "OCMW", "Provincie", "Politie"], "Tijdschrift", 142.0, 2026, 0, "v"],
    ["t41", "Omgeving en vergunningen", "Tijdschrift voor lokale besturen", ["Redactie"], "Omgeving | OmgevingConnect", ["Gemeente", "Provincie"], "Tijdschrift", 118.0, 2026, 0, "v"]
  ];

  function isbn13(seed) {
    var base = "9789" + String(seed).padStart(8, "0"); // 12 digits
    var sum = 0;
    for (var i = 0; i < 12; i++) sum += parseInt(base[i], 10) * (i % 2 ? 3 : 1);
    return base + ((10 - (sum % 10)) % 10);
  }

  var DESC = {
    def: "Een praktische en heldere uitleg van de regels die u dagelijks nodig hebt, met voorbeelden uit de lokale praktijk, modellen en verwijzingen naar relevante rechtspraak.",
    "Arbeidsrecht": "Een praktische uitleg van de regels die u dagelijks nodig hebt, met voorbeelden uit de lokale praktijk en verwijzingen naar relevante rechtspraak.",
    "Strafrecht": "Een werkinstrument voor wie sanctioneert, vaststelt en handhaaft: de procedure in duidelijke stappen, met modellen en aandachtspunten.",
    "Overheidsopdrachten": "Een bruikbaar overzicht van de regelgeving en de rechtspraak, gericht op de keuzes die een bestuur effectief moet maken.",
    "Welzijn en zorg": "Een heldere gids over rechten, plichten en samenwerking, geschreven voor medewerkers die de regels elke dag toepassen.",
    "Financiën": "Een toegankelijke uitleg met rekenvoorbeelden, schema's en modellen om besluiten te onderbouwen en correct te verantwoorden.",
    "Ruimtelijke ordening": "Procedures, termijnen en beroepsmogelijkheden overzichtelijk beschreven, aangevuld met checklists voor de behandelende dienst."
  };

  // "Dirk Claeys" -> "Claeys D." (the current catalogue lists surname first)
  function fmtAuthor(a) {
    var p = a.split(" ");
    return p.length < 2 ? a : p.slice(1).join(" ") + " " + p[0][0] + ".";
  }
  // Every title gets exactly one sub-role per parent group it belongs to,
  // so a parent's count always equals the sum of its sub-roles.
  function rollen(materie, doel, i) {
    var out = [], hint = ROLE_BY_MATERIE[materie] || [];
    ["Gemeente", "OCMW", "Politie"].forEach(function (p) {
      if (doel.indexOf(p) < 0) return;
      var list = ROLLEN[p], cand = [];
      hint.forEach(function (r) { var v = p === "OCMW" ? r + " (OCMW)" : r; if (list.indexOf(v) >= 0) cand.push(v); });
      out.push(cand.length ? cand[i % cand.length] : list[i % list.length]);
    });
    return out;
  }

  // Groups without sub-roles that follow from the subject.
  var EXTRA_GROUP = { "Lokaal personeelsbeleid | HRMConnect": "HR-manager", "Gerechtelijk recht": "Magistraat" };
  function withExtra(materie, doel) { return EXTRA_GROUP[materie] && doel.indexOf(EXTRA_GROUP[materie]) < 0 ? doel.concat(EXTRA_GROUP[materie]) : doel; }

  var TITLES = RAW.map(function (r, i) {
    return {
      id: r[0], title: r[1], sub: r[2], authors: r[3].map(fmtAuthor), materie: r[4], doelgroepen: withExtra(r[4], r[5]), rollen: rollen(r[4], r[5], i),
      vorm: r[6], price: r[7], year: r[8], pages: r[9], stock: r[10], connect: (r[4].split(" | ")[1] || null),
      isbn: isbn13(100000 + i * 137), desc: DESC[r[4]] || DESC.def, tone: TONES[r[4]], order: i
    };
  });

  window.VB = { TITLES: TITLES, MATERIES: MATERIES, DOELGROEPEN: DOELGROEPEN, ROLLEN: ROLLEN, VORMEN: VORMEN, VAT: 0.06 };
})();

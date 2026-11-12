const $ = id => document.getElementById(id);
const CAR = 55, FUN = 35;                         // rental car per day, food and fun per person per day
const DOW = [1.1, 1, .88, .85, .95, 1.15, 1.05];  // Sun..Sat: midweek flights are cheaper
const gm = q => "https://www.google.com/maps/search/" + encodeURIComponent(q);

// Airports: code, latitude, longitude
const AP = ("ATL 33.64 -84.43,LAX 33.94 -118.41,ORD 41.98 -87.90,DFW 32.90 -97.04,DEN 39.86 -104.67,JFK 40.64 -73.78,SFO 37.62 -122.38,SEA 47.45 -122.31,LAS 36.08 -115.15,MCO 28.43 -81.31,EWR 40.69 -74.17,CLT 35.21 -80.94,PHX 33.43 -112.01,IAH 29.98 -95.34,MIA 25.79 -80.29,BOS 42.36 -71.01,MSP 44.88 -93.22,DTW 42.21 -83.35,FLL 26.07 -80.15,PHL 39.87 -75.24,LGA 40.78 -73.87,BWI 39.18 -76.67,DCA 38.85 -77.04,SLC 40.79 -111.98,SAN 32.73 -117.19,TPA 27.98 -82.53,PDX 45.59 -122.60,STL 38.75 -90.37,MDW 41.79 -87.75,HNL 21.32 -157.92,AUS 30.19 -97.67,BNA 36.12 -86.68,MSY 29.99 -90.26,RDU 35.88 -78.79,CMH 40.00 -82.89,CLE 41.41 -81.85,CVG 39.05 -84.67,DAY 39.90 -84.22,PIT 40.49 -80.23,IND 39.72 -86.29,MKE 42.95 -87.90,MCI 39.30 -94.71,SJC 37.36 -121.93,OAK 37.72 -122.22,SMF 38.70 -121.59,SAT 29.53 -98.47,OKC 35.39 -97.60,ABQ 35.04 -106.61,BUF 42.94 -78.73,ROC 43.12 -77.67,ALB 42.75 -73.80,BDL 41.94 -72.68,PVD 41.72 -71.43,CHS 32.90 -80.04,JAX 30.49 -81.69,RSW 26.54 -81.76,MEM 35.04 -89.98,BHM 33.56 -86.75,OMA 41.30 -95.89,DSM 41.53 -93.66,BOI 43.56 -116.22,ANC 61.17 -149.99,AVL 35.44 -82.54,ORF 36.90 -76.01,TUL 36.20 -95.89,TUS 32.12 -110.94,MSN 43.14 -89.34,GRR 42.88 -85.52,SDF 38.17 -85.74,LEX 38.04 -84.61,LHR 51.47 -0.45,CDG 49.01 2.55,AMS 52.31 4.76,FRA 50.03 8.57,MAD 40.47 -3.56,BCN 41.30 2.08,FCO 41.80 12.25,LIS 38.77 -9.13,DUB 53.43 -6.27,CUN 21.04 -86.88,MEX 19.44 -99.07,YYZ 43.68 -79.63,YVR 49.19 -123.18,YUL 45.47 -73.74,NRT 35.77 140.39,ICN 37.46 126.44,SYD -33.94 151.18,DXB 25.25 55.37,GRU -23.43 -46.47,BOG 4.70 -74.15,SJU 18.44 -66.00,NAS 25.04 -77.47,MBJ 18.50 -77.91,SJD 23.15 -109.72,KEF 63.99 -22.61,ATH 37.94 23.94,IST 41.26 28.74,HKG 22.31 113.91,SIN 1.36 103.99,BKK 13.69 100.75,DEL 28.56 77.10,JNB -26.14 28.25,LIM -12.02 -77.11,EZE -34.82 -58.54,HND 35.55 139.78,MAN 53.35 -2.27,ZRH 47.46 8.55,PRG 50.10 14.26").split(",").map(s => { const [c, la, lo] = s.split(" "); return {c, la: +la, lo: +lo}; });

// Hand-picked trips for "surprise me". h/a/t = hostel bed, Airbnb (sleeps 4), hotel room (sleeps 2) per night
const DESTS = [
 {n:"Cancún, Mexico",la:21.16,lo:-86.85,v:["relax","party"],h:28,a:190,t:210,act:["Beach days","Chichén Itzá day trip","Isla Mujeres ferry"],r:["Cancún to Tulum",80,"Playa del Carmen, cenotes, Tulum ruins"]},
 {n:"Miami, FL",la:25.76,lo:-80.19,v:["party","relax"],h:45,a:220,t:240,act:["South Beach","Wynwood Walls","Everglades airboat"],r:["Miami to Key West",160,"Key Largo, Islamorada, Seven Mile Bridge"]},
 {n:"Nashville, TN",la:36.16,lo:-86.78,v:["party"],h:38,a:170,t:200,act:["Broadway honky-tonks","Grand Ole Opry","Hot chicken tour"],r:["Nashville to the Smokies",210,"Knoxville, Gatlinburg, Clingmans Dome"]},
 {n:"New Orleans, LA",la:29.95,lo:-90.07,v:["party"],h:32,a:160,t:190,act:["French Quarter","Live jazz on Frenchmen St","Swamp tour"],r:["New Orleans to Mobile",145,"Bay St. Louis, Gulf Shores, Mobile"]},
 {n:"Denver, CO",la:39.74,lo:-104.99,v:["adventure"],h:40,a:180,t:190,act:["Red Rocks","Rocky Mountain hikes","Brewery crawl"],r:["Denver to Rocky Mountain NP",75,"Boulder, Estes Park, Trail Ridge Road"]},
 {n:"Asheville, NC",la:35.60,lo:-82.55,v:["adventure","relax"],h:34,a:150,t:170,act:["Waterfall hikes","River tubing","Mountain overlooks"],r:["Blue Ridge Parkway",90,"Craggy Gardens, Mt Mitchell, Linville Falls"]},
 {n:"Honolulu, HI",la:21.31,lo:-157.86,v:["relax","adventure"],h:48,a:250,t:260,act:["Diamond Head hike","Surf Waikiki","Hanauma Bay snorkel"],r:["North Shore loop",110,"Pali Lookout, Kailua, Waimea Bay"]},
 {n:"San Diego, CA",la:32.72,lo:-117.16,v:["relax"],h:42,a:210,t:230,act:["La Jolla cove","Balboa Park","Tacos in Barrio Logan"],r:["San Diego to Joshua Tree",150,"Julian, Anza-Borrego, Palm Springs"]}
];

const money = x => "$" + Math.round(x);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rnd = s => { let h = 0; for (const c of s) h = (h*31 + c.charCodeAt(0)) % 1000; return h/1000; };
function dist(a, b){                                   // straight-line miles between two points
  const r = x => x*Math.PI/180, h = Math.sin(r(b.la-a.la)/2)**2 + Math.cos(r(a.la))*Math.cos(r(b.la))*Math.sin(r(b.lo-a.lo)/2)**2;
  return 3959*2*Math.asin(Math.sqrt(h));
}
function near(p, max, n){                              // closest airports within max miles (always at least one)
  const s = AP.map(a => ({...a, d: dist(p, a)})).sort((a, b) => a.d - b.d);
  const f = s.filter(a => a.d <= max).slice(0, n);
  return f.length ? f : s.slice(0, 1);
}
function fare(a, b, d){ return Math.round((90 + .16*dist(a, b)) * DOW[d.getDay()] * (.9 + .2*rnd(a.c + b.c + d.toDateString()))); }

// ---- place search (free Open-Meteo geocoder, needs internet) ----
const picked = {};
async function geo(q){
  try {
    const j = await (await fetch("https://geocoding-api.open-meteo.com/v1/search?count=5&language=en&format=json&name=" + encodeURIComponent(q))).json();
    return (j.results || []).map(x => ({name: [x.name, x.admin1, x.country_code].filter(Boolean).join(", "), la: x.latitude, lo: x.longitude}));
  } catch (e) { return []; }
}
function search(id){
  const inp = $(id), ul = $(id + "Sug"); let t;
  inp.addEventListener("input", () => {
    picked[id] = null; clearTimeout(t);
    if (inp.value.trim().length < 2) { ul.innerHTML = ""; return; }
    t = setTimeout(async () => {
      const rs = await geo(inp.value);
      ul.innerHTML = rs.map((p, i) => `<li data-i="${i}">${esc(p.name)}</li>`).join("");
      ul.onclick = e => { const p = rs[e.target.dataset.i]; if (p) { picked[id] = p; inp.value = p.name; ul.innerHTML = ""; } };
    }, 300);
  });
}
search("origin"); search("dest");

// ---- planning ----
let opts = null, results = [], sel = 0, first = true;
function plan(D, o){
  const oAps = near(o.org, 160, 4), dAp = near(D, 1e9, 1)[0], days = [];
  for (let i = 0; i < 7; i++){                         // try 7 departure days x every nearby airport
    const d = new Date(o.start); d.setDate(d.getDate() + i); let b = null;
    for (const ap of oAps){
      const f = fare(ap, dAp, d), dr = ap.d*1.2*.24, tot = f + dr;  // dr: gas to reach a farther airport
      if (!b || tot < b.tot) b = {ap, f, dr, tot, d};
    }
    days.push(b);
  }
  const n = o.people;
  const lodge = [["Hostel",D.h||38],["Airbnb",Math.ceil(n/4)*(D.a||170)/n],["Hotel",Math.ceil(n/2)*(D.t||190)/n]].reduce((a, b) => b[1] < a[1] ? b : a);
  const pick = days.indexOf(days.reduce((a, b) => b.tot < a.tot ? b : a));
  return {D, oAps, dAp, days, pick, lodge, lodgeTotal: lodge[1]*o.nights, carTotal: o.car ? CAR*o.nights/n : 0, fun: FUN*o.nights, xfer: dAp.d*1.2*.24};
}
const total = r => r.days[r.pick].tot + r.xfer + r.lodgeTotal + r.carTotal + r.fun;

// ---- form wiring ----
document.querySelectorAll('input[name="mode"]').forEach(b => b.addEventListener("change", () => {
  const known = $("form").mode.value === "known";
  $("destBox").hidden = !known; $("vibeBox").hidden = known; $("dest").required = known;
  document.body.dataset.vibe = known ? "" : $("form").vibe.value;
}));
document.querySelectorAll('input[name="vibe"]').forEach(b => b.addEventListener("change", () => document.body.dataset.vibe = b.value));
$("minus").onclick = () => $("people").textContent = Math.max(1, +$("people").textContent - 1);
$("plus").onclick = () => $("people").textContent = Math.min(12, +$("people").textContent + 1);
$("budget").oninput = () => $("budgetOut").textContent = "$" + $("budget").value;
$("start").valueAsDate = new Date(Date.now() + 14*864e5);
$("dest").required = true;

$("form").addEventListener("submit", async e => {
  e.preventDefault(); $("err").textContent = "";
  const btn = $("form").querySelector(".go"); btn.textContent = "Searching...";
  const org = picked.origin || (await geo($("origin").value))[0];
  const known = $("form").mode.value === "known";
  const dst = known ? (picked.dest || (await geo($("dest").value))[0]) : null;
  btn.textContent = "Find my trip";
  if (!org) { $("err").textContent = "We couldn't find your starting place. Check your internet and try a city name."; return; }
  if (known && !dst) { $("err").textContent = "We couldn't find that destination. Try a city name."; return; }
  opts = {org, start: new Date($("start").value + "T12:00"), nights: +$("nights").value, people: +$("people").textContent, budget: +$("budget").value, car: $("car").checked};
  const list = known ? [{n: dst.name, la: dst.la, lo: dst.lo, custom: true}] : DESTS.filter(d => d.v.includes($("form").vibe.value));
  results = list.map(D => plan(D, opts)).sort((a, b) => total(a) - total(b));
  sel = 0; first = true; $("results").hidden = false; $("split").hidden = true;
  draw(); $("results").scrollIntoView({behavior: "smooth"});
});

// ---- drawing ----
function card(r, i){
  const D = r.D, x = r.days[r.pick], tot = total(r), over = tot > opts.budget;
  const max = Math.max(...r.days.map(d => d.tot)), cheapest = Math.min(...r.days.map(d => d.tot));
  const f = (d, o) => d.toLocaleDateString("en-US", o);
  const bars = r.days.map((d, j) => `<button type="button" class="bar ${j === r.pick ? "best" : ""}" data-d="${j}" aria-label="Depart ${f(d.d, {weekday:"long"})}, ${money(d.tot)}"><i style="height:${Math.round(d.tot/max*54) + 6}px"></i>${f(d.d, {weekday:"short"})}<br>${money(d.tot)}</button>`).join("");
  const road = dist(opts.org, D)*1.2, gas = road*.28/Math.min(opts.people, 4);
  return `<article class="card ${i === sel ? "sel" : ""}" data-i="${i}"><div class="main">
    <h3>${esc(D.n)}</h3>
    <p>Fly from <b>${x.ap.c}</b> to <b>${r.dAp.c}</b> on <b>${f(x.d, {weekday:"long", month:"short", day:"numeric"})}</b> for ${money(x.f)}${x.ap.d > 5 ? `, plus a ${Math.round(x.ap.d)}-mile drive to the airport` : ""}${r.dAp.d > 40 ? `. Then ${Math.round(r.dAp.d)} miles by road to ${esc(D.n.split(",")[0])}` : ""}.</p>
    <div class="bars">${bars}</div>
    <p class="note">${x.tot === cheapest ? "This is the cheapest day." : `Cheapest day saves ${money(x.tot - cheapest)}.`} Tap a day to compare.</p>
    <p>Stay: <b>${r.lodge[0]}</b>, about ${money(r.lodge[1])} per person per night for ${opts.people} ${opts.people === 1 ? "traveler" : "travelers"}${D.custom ? " (typical price, not specific to this place)" : ""}.</p>
    <p>Do: ${D.act ? D.act.join(", ") : `<a href="${gm("things to do in " + D.n)}" target="_blank" rel="noopener">see things to do</a>`}.</p>
    ${opts.car ? `<p>Road trip: ${D.r ? `<b>${D.r[0]}</b>, ${D.r[1]} miles. Stops: ${D.r[2]}.` : `<a href="${gm("scenic drives near " + D.n)}" target="_blank" rel="noopener">find scenic drives</a>.`}</p>` : ""}
    ${road < 900 ? `<p class="note">Driving instead: about ${Math.round(road)} miles each way, around ${money(gas)} per person in gas${gas < x.f ? ". That's cheaper than flying." : "."}</p>` : ""}
    <button type="button" data-split="${i}">Split this trip</button></div>
    <div class="price"><b data-v="${Math.round(tot)}">${money(tot)}</b>per person<span class="${over ? "bad" : "ok"}">${over ? money(tot - opts.budget) + " over budget" : "Within budget"}</span></div></article>`;
}
function draw(){
  $("cards").innerHTML = results.map(card).join("");
  drawMap(results[sel]);
  if (first) {                                         // count the prices up once, when results first appear
    first = false; const t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0)/700);
      document.querySelectorAll("[data-v]").forEach(el => el.textContent = money(el.dataset.v*k));
      if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
}
function drawMap(r){
  const svg = $("map"), W = 800, H = 320;
  if (!r) { svg.innerHTML = `<text x="400" y="165" fill="#fff" fill-opacity=".6" text-anchor="middle" font-size="18">Your route will appear here</text>`; return; }
  const x = r.days[r.pick], pts = [opts.org, r.D, r.dAp, ...r.oAps];
  const la = pts.map(p => p.la), lo = pts.map(p => p.lo);
  const mLa = (Math.min(...la) + Math.max(...la))/2, mLo = (Math.min(...lo) + Math.max(...lo))/2, c = Math.cos(mLa*Math.PI/180);
  const w = Math.max((Math.max(...lo) - Math.min(...lo))*c, 4), h = Math.max(Math.max(...la) - Math.min(...la), 3);
  const s = Math.min((W - 160)/w, (H - 90)/h);
  const P = p => [W/2 + (p.lo - mLo)*c*s, H/2 - (p.la - mLa)*s];
  const span = Math.max(w, h), g = span > 80 ? 20 : span > 35 ? 10 : span > 12 ? 5 : 2;
  let grid = "";
  for (let v = Math.ceil((mLo - W/2/(s*c))/g)*g; v < mLo + W/2/(s*c); v += g) { const px = P({la: mLa, lo: v})[0]; grid += `<line x1="${px}" y1="0" x2="${px}" y2="${H}"/>`; }
  for (let v = Math.ceil((mLa - H/2/s)/g)*g; v < mLa + H/2/s; v += g) { const py = P({la: v, lo: mLo})[1]; grid += `<line x1="0" y1="${py}" x2="${W}" y2="${py}"/>`; }
  const [ox, oy] = P(opts.org), [ax, ay] = P(x.ap), [bx, by] = P(r.dAp), [dx, dy] = P(r.D);
  const cx = (ax + bx)/2, cy = (ay + by)/2 - Math.hypot(bx - ax, by - ay)*.25, arc = `M${ax},${ay} Q${cx},${cy} ${bx},${by}`;
  const dot = (p, rad, fill, label) => { const [px, py] = P(p); return `<circle cx="${px}" cy="${py}" r="${rad}" fill="${fill}"/><text x="${px + 9}" y="${py - 9}" fill="#fff" font-size="12">${esc(label)}</text>`; };
  svg.innerHTML = `<g stroke="#fff" stroke-opacity=".13">${grid}</g>
    <g stroke="#fff" stroke-opacity=".5" stroke-dasharray="4 4" fill="none"><line x1="${ox}" y1="${oy}" x2="${ax}" y2="${ay}"/><line x1="${bx}" y1="${by}" x2="${dx}" y2="${dy}"/></g>
    <path d="${arc}" fill="none" stroke="#fff" stroke-width="2.5"/>
    ${r.oAps.map(a => dot(a, 4, "#fff", a.c)).join("")}${dot(x.ap, 7, "#ffd166", x.ap.c)}${dot(r.dAp, 4, "#fff", r.dAp.c)}
    <circle cx="${ox}" cy="${oy}" r="7" fill="none" stroke="#fff" stroke-width="2.5"/><text x="${ox + 10}" y="${oy + 18}" fill="#fff" font-size="13">${esc(opts.org.name.split(",")[0])}</text>
    <circle cx="${dx}" cy="${dy}" r="8" fill="#ffd166"/><text x="${dx + 12}" y="${dy + 18}" fill="#fff" font-size="14" font-weight="700">${esc(r.D.n.split(",")[0])}</text>
    <path d="M-9,-6 L10,0 L-9,6 L-5,0Z" fill="#fff"><animateMotion dur="4s" repeatCount="indefinite" rotate="auto" path="${arc}"/></path>`;
}
drawMap(null);

$("cards").addEventListener("click", e => {
  const art = e.target.closest(".card"); if (!art) return;
  const i = +art.dataset.i, bar = e.target.closest(".bar"), sp = e.target.closest("[data-split]");
  sel = i;
  if (bar) results[i].pick = +bar.dataset.d;
  draw();
  if (sp) openSplit(results[i]);
  else window.scrollTo({top: 0, behavior: "smooth"});
});

// ---- cost split ----
function openSplit(r){
  const x = r.days[r.pick], names = Array.from({length: opts.people}, (_, i) => "Friend " + (i + 1));
  $("split").hidden = false;
  $("splitOut").innerHTML = `<p>Trip: <b>${esc(r.D.n)}</b>. The first person books the stay${opts.car ? " and car" : ""} and everyone else pays them back. Everyone buys their own flight.</p>
    <label>Names, one per line<textarea id="names">${names.join("\n")}</textarea></label>
    <label>Payment plan <select id="plan">${[1,2,3,4,6].map(n => `<option value="${n}">${n === 1 ? "Pay all at once" : n + " payments"}</option>`).join("")}</select></label>
    <div id="table"></div><p class="note">Food and fun (${money(r.fun)} per person) isn't part of the split.</p>`;
  const draw2 = () => {
    const list = $("names").value.split("\n").map(s => s.trim()).filter(Boolean), n = +$("plan").value;
    const shared = r.lodgeTotal + r.carTotal, own = x.tot + r.xfer;
    $("table").innerHTML = `<table><tr><th>Name</th><th>Own travel</th><th>Pays ${esc(list[0] || "the booker")}</th><th>Total</th><th>Each payment</th></tr>` +
      list.map((nm, i) => `<tr><td>${esc(nm)}</td><td>${money(own)}</td><td>${i ? money(shared) : "Books it"}</td><td>${money(own + shared)}</td><td>${money((own + shared)/n)}</td></tr>`).join("") + "</table>";
  };
  $("names").oninput = draw2; $("plan").onchange = draw2; draw2();
  $("split").scrollIntoView({behavior: "smooth"});
}

// ---- group ideas ----
let ideas = [];
try { ideas = JSON.parse(localStorage.getItem("ideas") || "[]"); } catch (e) {}
function drawIdeas(){
  ideas.sort((a, b) => b.s - a.s);
  try { localStorage.setItem("ideas", JSON.stringify(ideas)); } catch (e) {}
  $("ideas").innerHTML = ideas.map((x, i) => `<li><button data-i="${i}" data-d="1" aria-label="Upvote">▲</button><b>${x.s}</b><button data-i="${i}" data-d="-1" aria-label="Downvote">▼</button> ${esc(x.t)}</li>`).join("");
}
$("ideaForm").addEventListener("submit", e => { e.preventDefault(); ideas.push({t: $("idea").value, s: 0}); $("idea").value = ""; drawIdeas(); });
$("ideas").addEventListener("click", e => { if (e.target.dataset.d) { ideas[e.target.dataset.i].s += +e.target.dataset.d; drawIdeas(); } });
drawIdeas();

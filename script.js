const $ = id => document.getElementById(id);
const CAR = 55, FUN = 35;                 // rental car per day, food and fun per person per day
const DOW = [1.1, 1, .88, .85, .95, 1.15, 1.05]; // Sun..Sat: midweek is cheapest

// [airport code, price multiplier, miles to drive from home]
const AIRPORTS = {
  columbus: [["CMH",1,0],["CVG",.88,107],["CLE",.9,143],["DAY",.93,72]],
  chicago:  [["ORD",1,0],["MDW",.92,12],["MKE",.89,92]],
  newyork:  [["JFK",1,0],["EWR",.95,15],["LGA",1.02,10],["PHL",.85,95]]
};
// f=base round-trip fare, h=hostel bed/night, a=Airbnb/night (sleeps 4), t=hotel room/night (sleeps 2)
const DESTS = {
  cancun:{n:"Cancún",v:["relax","party"],f:420,h:28,a:190,t:210,act:["Beach days","Chichén Itzá day trip","Isla Mujeres ferry"],r:["Cancún to Tulum",80,"Playa del Carmen, cenotes, Tulum ruins"]},
  miami:{n:"Miami",v:["party","relax"],f:260,h:45,a:220,t:240,act:["South Beach","Wynwood Walls","Everglades airboat"],r:["Miami to Key West",160,"Key Largo, Islamorada, Seven Mile Bridge"]},
  nashville:{n:"Nashville",v:["party"],f:210,h:38,a:170,t:200,act:["Broadway honky-tonks","Grand Ole Opry","Hot chicken tour"],r:["Nashville to the Smokies",210,"Knoxville, Gatlinburg, Clingmans Dome"]},
  denver:{n:"Denver",v:["adventure"],f:290,h:40,a:180,t:190,act:["Red Rocks","Rocky Mountain hikes","Brewery crawl"],r:["Denver to Rocky Mountain NP",75,"Boulder, Estes Park, Trail Ridge Road"]},
  honolulu:{n:"Honolulu",v:["relax","adventure"],f:780,h:48,a:250,t:260,act:["Diamond Head hike","Surf Waikiki","Hanauma Bay snorkel"],r:["North Shore loop",110,"Pali Lookout, Kailua, Waimea Bay"]},
  asheville:{n:"Asheville",v:["adventure","relax"],f:240,h:34,a:150,t:170,act:["Waterfall hikes","River tubing","Mountain overlooks"],r:["Blue Ridge Parkway",90,"Craggy Gardens, Mt Mitchell, Linville Falls"]}
};

const money = x => "$" + Math.round(x);
const esc = s => s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function rnd(s){ let h = 0; for (const c of s) h = (h*31 + c.charCodeAt(0)) % 1000; return h/1000; }
function fare(k, ap, m, d){ return Math.round(DESTS[k].f * m * DOW[d.getDay()] * (.9 + .2*rnd(k+ap+d.toDateString()))); }

// Find the cheapest airport + day, and the cost of the whole trip per person
function plan(k, o){
  const days = []; let best = null;
  for (let i = 0; i < 7; i++){
    const d = new Date(o.start); d.setDate(d.getDate() + i);
    let db = null;
    for (const [ap, m, mi] of AIRPORTS[o.origin]){
      const f = fare(k, ap, m, d), tot = f + mi*.24;   // .24 = round-trip gas per mile
      if (!db || tot < db.tot) db = {ap, f, mi, tot, d};
    }
    days.push(db); if (!best || db.tot < best.tot) best = db;
  }
  const D = DESTS[k], n = o.people;
  const lodge = [["Hostel",D.h],["Airbnb",Math.ceil(n/4)*D.a/n],["Hotel",Math.ceil(n/2)*D.t/n]].reduce((a,b) => b[1] < a[1] ? b : a);
  const lodgeTotal = lodge[1]*o.nights, carTotal = o.car ? CAR*o.nights/n : 0, fun = FUN*o.nights;
  return {k, best, days, lodge, lodgeTotal, carTotal, fun, total: best.tot + lodgeTotal + carTotal + fun};
}

let opts = null, results = [];
Object.keys(DESTS).forEach(k => $("dest").add(new Option(DESTS[k].n, k)));
$("start").valueAsDate = new Date(Date.now() + 14*864e5);

document.querySelectorAll('input[name="mode"]').forEach(b => b.addEventListener("change", () => {
  const known = b.value === "known" && b.checked;
  $("destBox").hidden = !known; $("vibeBox").hidden = known;
  document.body.dataset.vibe = known ? "" : document.querySelector('input[name="vibe"]:checked').value;
}));
document.querySelectorAll('input[name="vibe"]').forEach(b => b.addEventListener("change", () => document.body.dataset.vibe = b.value));

$("form").addEventListener("submit", e => {
  e.preventDefault();
  opts = {origin:$("origin").value, start:new Date($("start").value + "T12:00"), nights:+$("nights").value, people:+$("people").value, budget:+$("budget").value, car:$("car").checked};
  const known = document.querySelector('input[name="mode"]:checked').value === "known";
  const vibe = document.querySelector('input[name="vibe"]:checked').value;
  const keys = known ? [$("dest").value] : Object.keys(DESTS).filter(k => DESTS[k].v.includes(vibe));
  results = keys.map(k => plan(k, opts)).sort((a, b) => a.total - b.total);
  $("cards").innerHTML = results.map((r, i) => card(r, i)).join("");
  $("results").hidden = false; $("split").hidden = true;
});

function card(r, i){
  const D = DESTS[r.k], b = r.best, max = Math.max(...r.days.map(d => d.tot));
  const over = r.total > opts.budget;
  const bars = r.days.map(d => `<div class="bar ${d === b ? "best" : ""}"><i style="height:${Math.round(d.tot/max*60)}px"></i>${d.d.toLocaleDateString("en-US",{weekday:"short"})}<br>${money(d.tot)}</div>`).join("");
  return `<article class="card"><div class="main">
    <h3>${D.n}</h3>
    <p>Fly from <b>${b.ap}</b> on <b>${b.d.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}</b> for ${money(b.f)}${b.mi ? ` (plus a ${b.mi}-mile drive to the airport)` : ""}.</p>
    <div class="bars">${bars}</div>
    <p>Stay: <b>${r.lodge[0]}</b>, about ${money(r.lodge[1])} per person per night for ${opts.people} ${opts.people === 1 ? "traveler" : "travelers"}.</p>
    <p>Do: ${D.act.join(", ")}.</p>
    ${opts.car ? `<p>Road trip: <b>${D.r[0]}</b>, ${D.r[1]} miles. Stops: ${D.r[2]}.</p>` : ""}
    <button data-i="${i}">Split this trip</button></div>
    <div class="price"><b>${money(r.total)}</b>per person<span class="${over ? "bad" : "ok"}">${over ? money(r.total - opts.budget) + " over budget" : "Within budget"}</span></div></article>`;
}

$("cards").addEventListener("click", e => {
  if (e.target.dataset.i === undefined) return;
  const r = results[e.target.dataset.i];
  const names = Array.from({length: opts.people}, (_, i) => "Friend " + (i + 1));
  $("split").hidden = false;
  $("splitOut").innerHTML = `<p>Trip: <b>${DESTS[r.k].n}</b>. One person books the stay${opts.car ? " and car" : ""}, everyone else pays them back. Everyone buys their own flight.</p>
    <label>Names, one per line (the first person books)<textarea id="names">${names.join("\n")}</textarea></label>
    <label>Payment plan <select id="plan">${[1,2,3,4,6].map(n => `<option value="${n}">${n === 1 ? "Pay all at once" : n + " payments"}</option>`).join("")}</select></label>
    <div id="table"></div><p class="note">Food and fun (${money(r.fun)} per person) isn't included in the split.</p>`;
  const draw = () => {
    const list = $("names").value.split("\n").map(s => s.trim()).filter(Boolean), n = +$("plan").value;
    const shared = r.lodgeTotal + r.carTotal, flight = r.best.f;
    $("table").innerHTML = `<table><tr><th>Name</th><th>Own flight</th><th>Pays ${esc(list[0] || "the booker")}</th><th>Total</th><th>Each payment</th></tr>` +
      list.map((nm, i) => `<tr><td>${esc(nm)}</td><td>${money(flight)}</td><td>${i ? money(shared) : "Books it"}</td><td>${money(flight + shared)}</td><td>${money((flight + shared)/n)}</td></tr>`).join("") + "</table>";
  };
  $("names").addEventListener("input", draw); $("plan").addEventListener("change", draw); draw();
  $("split").scrollIntoView({behavior: "smooth"});
});

// Group ideas with up/down votes, saved in this browser
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

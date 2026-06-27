// Camp page renderer. Reads content.json and builds the page.
// The editor (DropPost-style) writes content.json; this script only displays it.

function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>(
  {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function el(tag,cls,html){const n=document.createElement(tag);
  if(cls)n.className=cls; if(html!==undefined)n.innerHTML=html; return n;}

async function loadJSON(path){
  const res=await fetch(path,{cache:"no-store"});
  if(!res.ok)throw new Error("load "+path);
  return res.json();
}

// ---- media (shared by posts + sections) --------------------------------
function videoHTML(item){
  const id=(item.youtubeId||"").trim();
  const embed=id
    ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}" title="${escapeHTML(item.title||"Video")}" allow="encrypted-media; fullscreen" allowfullscreen loading="lazy"></iframe></div>`
    : `<div class="video"><span class="video-ph">Add a YouTube link</span></div>`;
  const watch=id?`<a class="yt" href="https://youtu.be/${encodeURIComponent(id)}" target="_blank" rel="noopener">▶ Watch on YouTube</a>`:"";
  const title=item.title?`<p class="media-title">${escapeHTML(item.title)}</p>`:"";
  return `<div class="vblock">${embed}${title}${watch}</div>`;
}
function audioHTML(item){
  const src=item.url||"";
  const title=item.title?`<p class="media-title">${escapeHTML(item.title)}</p>`:"";
  return `<div class="vblock">${title}<audio controls preload="none"><source src="${escapeHTML(src)}"></audio></div>`;
}
function itemHTML(item){
  switch(item.type){
    case "video": return videoHTML(item);
    case "audio": return audioHTML(item);
    case "note":  return `<div class="note">${escapeHTML(item.text||"")}</div>`;
    case "link":  return `<a class="linkrow" href="${escapeHTML(item.url||"#")}" target="_blank" rel="noopener">${escapeHTML(item.label||item.url||"")}</a>`;
    default: return "";
  }
}

// ---- sections ----------------------------------------------------------
function renderHeader(meta){
  const hero=document.getElementById("hero");
  if(meta.headerImage)hero.style.backgroundImage=`url('${meta.headerImage}')`;
  document.getElementById("hero-title").textContent=meta.title||"";
  document.getElementById("hero-sub").textContent=meta.subtitle||"";
  const w=document.getElementById("welcome");
  if(meta.welcome){w.textContent=meta.welcome;} else {w.style.display="none";}
  if(meta.title)document.title=meta.title;
}

function renderPosts(posts){
  const mount=document.getElementById("posts");
  if(!posts||!posts.length){mount.style.display="none";return;}
  mount.innerHTML=`<h2>Latest</h2>`;
  for(const p of posts){
    const body=(p.body||"").split("\n").filter(Boolean).map(x=>`<p>${escapeHTML(x)}</p>`).join("");
    const media=(p.media||[]).map(itemHTML).join("");
    mount.appendChild(el("div","card",
      `${p.date?`<p class="post-date">${escapeHTML(p.date)}</p>`:""}`+
      `${p.title?`<p class="post-title">${escapeHTML(p.title)}</p>`:""}`+
      `<div class="post-body">${body}</div>${media}`));
  }
}

function renderSections(sections){
  const mount=document.getElementById("sections");
  mount.innerHTML="";
  for(const s of sections||[]){
    mount.appendChild(el("h2",null,escapeHTML(s.title||"")));
    const box=el("div");
    for(const item of s.items||[])box.insertAdjacentHTML("beforeend",itemHTML(item));
    mount.appendChild(box);
  }
}

async function render(){
  const data=await loadJSON("content.json");
  renderHeader(data.meta||{});
  renderPosts(data.posts||[]);
  renderSections(data.sections||[]);
}

// ---- gate (PLACEHOLDER protection — encrypt with StatiCrypt before real content) ----
(function(){
  const PW="nimblefingers26";
  const gate=document.getElementById("gate"),content=document.getElementById("content"),
        pw=document.getElementById("pw"),go=document.getElementById("go"),msg=document.getElementById("msg");
  let rendered=false;
  async function unlock(){
    gate.style.display="none";content.style.display="block";
    try{sessionStorage.setItem("nf","1");}catch(e){}
    if(!rendered){rendered=true; try{await render();}catch(e){msg.textContent="Couldn’t load content.";}}
  }
  function tryit(){
    if((pw.value||"").toLowerCase().replace(/\s/g,"")===PW)unlock();
    else msg.textContent="Hmm, that password didn’t work — check your welcome email.";
  }
  go.addEventListener("click",tryit);
  pw.addEventListener("keydown",e=>{if(e.key==="Enter")tryit();});
  try{if(sessionStorage.getItem("nf")==="1")unlock();}catch(e){}
})();

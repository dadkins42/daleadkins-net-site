// Camp page renderer. Reads content.json and builds the page.
// The editor (DropPost-style) writes content.json; this script only displays it.
// Sections are TYPED — each type has its own render here and its own edit form in the app.

function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>(
  {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

async function loadJSON(path){
  const res=await fetch(path,{cache:"no-store"});
  if(!res.ok)throw new Error("load "+path);
  return res.json();
}

// ---- media (used inside blog posts and where needed) -------------------
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
  const title=item.title?`<p class="media-title">${escapeHTML(item.title)}</p>`:"";
  return `<div class="vblock">${title}<audio controls preload="none"><source src="${escapeHTML(item.url||"")}"></audio></div>`;
}
function playlistHTML(id,title){
  id=(id||"").trim();
  const embed=id
    ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(id)}" title="${escapeHTML(title||"Playlist")}" allow="encrypted-media; fullscreen" allowfullscreen loading="lazy"></iframe></div>`
    : `<div class="video"><span class="video-ph">Add a playlist ID</span></div>`;
  const watch=id?`<a class="yt" href="https://www.youtube.com/playlist?list=${encodeURIComponent(id)}" target="_blank" rel="noopener">▶ View playlist on YouTube</a>`:"";
  return `<div class="vblock">${embed}${watch}</div>`;
}
function mediaHTML(m){
  if(m.type==="video")return videoHTML(m);
  if(m.type==="audio")return audioHTML(m);
  if(m.type==="playlist")return playlistHTML(m.playlistId,m.title);
  return "";
}

// ---- cool-info items (heading / note / link / media) ------------------
function coolItemHTML(item){
  switch(item.type){
    case "heading": return `<p class="cool-h">${escapeHTML(item.text||"")}</p>`;
    case "note":    return `<div class="note">${escapeHTML(item.text||"")}</div>`;
    case "link":    return `<a class="linkrow" href="${escapeHTML(item.url||"#")}" target="_blank" rel="noopener">${escapeHTML(item.label||item.url||"")}</a>`;
    case "video":   return videoHTML(item);
    case "audio":   return audioHTML(item);
    default: return "";
  }
}

// ---- section types ----------------------------------------------------
function sectionAnnouncements(s){
  return (s.items||[]).map(a=>`<div class="announce">${escapeHTML(a.text||"")}</div>`).join("");
}
function sectionBlog(s){
  return (s.posts||[]).map(p=>{
    const body=(p.body||"").split("\n").filter(Boolean).map(x=>`<p>${escapeHTML(x)}</p>`).join("");
    const media=(p.media||[]).map(mediaHTML).join("");
    const head=`${p.date?`<span class="post-date">${escapeHTML(p.date)}</span> · `:""}${escapeHTML(p.title||"")}`;
    return `<details class="post"><summary>${head}</summary><div class="post-body">${body}${media}</div></details>`;
  }).join("");
}
function sectionAudioPlaylist(s){
  return (s.items||[]).map(audioHTML).join("");
}

function sectionHasContent(s){
  switch(s.type){
    case "announcements": return (s.items||[]).length>0;
    case "blog":          return (s.posts||[]).length>0;
    case "videoPlaylist": return !!(s.playlistId&&String(s.playlistId).trim());
    case "audioPlaylist": return (s.items||[]).length>0;
    case "coolInfo":      return (s.items||[]).length>0;
    default: return false;
  }
}

function renderSections(sections){
  const mount=document.getElementById("sections");
  mount.innerHTML="";
  for(const s of sections||[]){
    if(!sectionHasContent(s))continue;
    let inner="";
    switch(s.type){
      case "announcements": inner=sectionAnnouncements(s); break;
      case "blog":          inner=sectionBlog(s); break;
      case "videoPlaylist": inner=playlistHTML(s.playlistId,s.title); break;
      case "audioPlaylist": inner=sectionAudioPlaylist(s); break;
      case "coolInfo":      inner=(s.items||[]).map(coolItemHTML).join(""); break;
      default: inner="";
    }
    if(s.title)mount.insertAdjacentHTML("beforeend",`<h2>${escapeHTML(s.title)}</h2>`);
    mount.insertAdjacentHTML("beforeend",`<div class="section">${inner}</div>`);
  }
}

function renderHeader(meta){
  const hero=document.getElementById("hero");
  if(meta.headerImage)hero.style.backgroundImage=`url('${meta.headerImage}')`;
  document.getElementById("hero-title").textContent=meta.title||"";
  if(meta.title)document.title=meta.title;
}

async function render(){
  const data=await loadJSON("content.json");
  renderHeader(data.meta||{});
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

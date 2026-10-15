// AX/PI 보드 오프라인 실행용 서비스 워커
const CACHE="axpi-board-2026.10.15-1411";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // 네트워크 우선(항상 최신), 오프라인이면 캐시
    e.respondWith(fetch(req,{cache:"no-store"}).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(url.pathname.endsWith("/")||url.search?"./index.html":req,c))}return r}).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match("./index.html"))));
    return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c));return res})));
  }
});

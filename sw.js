const cacheName = "edf409fe-445a-4b84-9a7d-d945785d47b6"

const path = (() => {
    let arr = self.location.pathname.split("/");
    arr.pop();
    return arr.join("/")
})()
const files = (async () => {
    let files = (await (await fetch(path + "/files.json")).json()).map(x => path + "/" + x)
    files.forEach(x => {
        if (x.endsWith("/index.html")) {
            files.push(x.substring(0, x.length - 10))
            console.log(x)
        }
        if (x.endsWith("/")) {
            files.push(x + "index.html")
            console.log(x)
        }
    })
    files = [...new Set(files)]
    return files;
})()


self.addEventListener("install", e => {
    console.log("server worker installed")
    e.waitUntil((async () => {
        const cache = await caches.open(cacheName);
        await Promise.all((await files).map(async x => await cache.put(x, (await fetch(x)))))
    })())
})

self.addEventListener("fetch", e => {
    e.respondWith((async () => {
        const r = await caches.match(e.request);
        let fetchRequest = (async () => {
            const response = await fetch(e.request);
            const cache = await caches.open(cacheName);
            cache.put(e.request, response.clone());
            return response;
        })()
        if (r) {
            return r;
        }
        else {
            return await fetchRequest
        }
    })());
})

const url = "https://loremflickr.com/800/600/house?lock=1";

async function test() {
    try {
        const res = await fetch(url);
        console.log("Status:", res.status);
        console.log("Content-Type:", res.headers.get("content-type"));
        console.log("Redirected URL:", res.url);
    } catch (e) {
        console.log("Error:", e);
    }
}

test();

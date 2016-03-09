Install:

1. `git clone https://github.com/sg6/online-ical-viewer.git`
1. `npm install`
1. Fill the icals.json array with strings of your ical URLs in the following format:
```[
  {
    "url" : "url-to-first.ical",
    "color" : "#F60"
  },
  {
    "url" : "url-to-second.ical",
    "color" : "#909"
  }
]
```
1. Start the app: `node index.js`
1. Watch in browser on http://localhost:4499 - change to your favourite port on the last lines of app.js
1. Default password: user = **john** / pass = **secret**

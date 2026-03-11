# CallMe
Chrome extension that discovers JSONP callback endpoints as you browse.

## What it does

CallMe monitors web requests in the background, tests endpoints for JSONP callback injection, and catalogs confirmed findings for review.

## Features

- **Parameter testing** — checks existing query params first, then common names (`callback`, `jsonp`)
- **Response validation** — confirms reflection in function calls, avoids false positives
- **Searchable popup UI** — filter, copy, and export discovered endpoints
- **Per-host dedup** — one finding per hostname, no redundant probes
- **Export** — copy as JSON or download `callme-endpoints.json`

## Install

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this folder

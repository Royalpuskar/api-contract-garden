# API Contract Garden

Compare simplified endpoint contracts for removals, type changes, and new required fields.

**Status:** implemented browser-local research prototype. Automated tests can be reproduced with the command below. The existing Pages site previously passed smoke checks. The directional comparison update is locally tested; its latest deployment and browser behavior have not been verified.

## Website

Live website: https://royalpuskar.github.io/api-contract-garden/

## Problem and approach

API maintainers need different required-field checks for caller inputs and consumer outputs. This tool makes that direction explicit and reports the affected field with a reason and type evidence. It runs the same pure JavaScript engine in the browser and Node tests. All input is provided by the user or the included synthetic fixture; no external facts are inferred.

## Implemented features

- Editable scenario with a synthetic example and reset control.
- Deterministic analysis, summary metrics, filterable result table, and JSON report export.
- Input validation, explicit errors, and invalidation of outdated reports after edits.
- Keyboard-accessible controls, responsive layout, and large-screen CSS.
- Zero runtime dependencies and no external API calls.

## Install and run

Requirements: Python 3 for a static local server, Node.js 22 or later for tests.

```sh
git clone https://github.com/Royalpuskar/api-contract-garden.git
cd api-contract-garden
python3 -m http.server 8000
```

Open http://localhost:8000. Do not open index.html through a file URL; ES modules require a server.

```sh
node --test test.mjs
```

## Example and schema

The complete example in `sample.mjs` defines the supported input shape:

```json
{
  "before": [
    {
      "route": "GET /notes",
      "fields": {
        "title": "string",
        "id": "number"
      },
      "required": [
        "id"
      ]
    }
  ],
  "after": [
    {
      "route": "GET /notes",
      "fields": {
        "title": "string",
        "id": "string",
        "owner": "string"
      },
      "required": [
        "id",
        "owner"
      ]
    }
  ]
}
```

Edit one value and select **Run analysis**. **Reset example** restores the fixture. **Export report** downloads the current result; it never publishes it.

Input is capped at 200,000 serialized characters, arrays processed by the engine at 500 elements, and numeric magnitudes at 1e12. Domain constraints are checked inside `engine.mjs`; unsupported structures return an error.

## Request and response direction

The optional root `mode` is `request` (default, preserving the previous requiredness rule) or `response`. It applies to all contracts in that comparison. Run separate comparisons for request and response bodies. Route text does not determine the mode.

- Request: newly required fields produce signals because existing callers may omit them.
- Response: previously required fields becoming optional produce signals because consumers may rely on their presence. Newly required response fields do not trigger the request-only signal.
- Both: endpoint removal, declared-field removal, and exact type-label changes remain conservative signals. A removed response field generates one removal signal, not a second optionality signal.

```json
{"mode":"response",
"before":[{"route":"GET /x","fields":{"id":"string"},"required":["id"]}],
"after":[{"route":"GET /x","fields":{"id":"string"},"required":[]}]}
```

Expected result: one “required response field became optional” signal. The same input in request mode produces zero signals.

Type labels must be nonempty strings; object-valued schemas are rejected instead of compared by object identity. Required names are deduplicated. Type-change/removal rows include before and after type labels (null for removal); rows include the selected mode and an explanatory reason where applicable.

These are review signals, not a complete compatibility verdict. A removed request field might still be accepted by a permissive server; additional response fields might break strict consumers. This model has no additional-properties policy, type hierarchy, nullable/union/enum constraints, nested schemas, defaults, status-code modeling, or runtime client evidence. It does not claim that zero signals proves compatibility.

## Architecture and request flow

`index.html` loads `app.mjs`, which parses scenario JSON and calls `run` from `engine.mjs`. The engine returns `metrics` and `rows`; the UI renders values with `textContent`, never user-supplied HTML. Editing invalidates the prior report. Export creates a local Blob download.

There is no application authentication, credential store, session cookie, or token lifecycle. GitHub Pages serves public static files. The app does not collect passwords or API keys, contact third-party APIs, persist inputs, or send scenario data over the network. GitHub hosting can still receive ordinary page request metadata. Reloading discards edits.

## Limitations

Restricted JSON schema, not a full OpenAPI compatibility checker. Paths, methods, field types and required names are exact strings.

The interface shares a portfolio design system, while this repository has its own domain engine, fixture, and tests. No accuracy, novelty, production-readiness, or 4K visual-test claim is made. Large-screen CSS is not a substitute for device testing.

## Validation

Nine local Node tests pass for this update. They cover response presence guarantees, request-only requiredness, nonduplicated removals, repeated required declarations, type validation, unsupported modes, and all eight combinations of old/new requiredness and comparison direction. Original fixture, determinism, preservation, and size checks still pass. Mobile, laptop, and 3840×2160 browser checks have not been performed for this update.

`test.mjs` checks domain outcomes and edge cases, deterministic behavior, input preservation, malformed roots, and size limits. GitHub Actions runs the same suite. Review the tests themselves to see exactly what is covered; passing these checks does not establish security or exhaustive correctness.

## Roadmap

- Add more independently reviewed domain fixtures and explicit schema documentation.
- Add domain-specific form controls alongside the JSON editor.
- Expand accessibility and mobile browser testing.
- Revisit the documented domain limitations before production use.

## Contribution and license

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [LICENSE](LICENSE).

© 2026 Puskar (Royalpuskar). All rights reserved except permissions granted by the MIT license. Preserve applicable third-party notices.


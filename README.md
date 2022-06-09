# LeakInspectorTests 🎇

LeakInspectorTests is an add-on that executes tests against the [LeakInspector](https://github.com/leaky-forms/leak-inspector) add-on.

It has the following features:
 1. It's capable of triggering [LeakInspector](https://github.com/leaky-forms/leak-inspector)'s ***sniff*** and ***leak*** behavior, easily and in a way that's reproducible.
 2. It has no dependencies on Node.js or any Javascript test framework.
 3. Tests are executed by temporarily installing the add-on and then visiting http://example.com

It's primary components include:
- **`test.html`** - *html that replaces example.com*

- **`test.js`** - *script that supports test execution, with methods to set and reset form input values, and trigger sniffs and leaks, etc.*

- **`other_domain.js`** - *script that loads from a different domain (example.org), and is thus able to trigger [LeakInspector](https://github.com/leaky-forms/leak-inspector)'s behavior*

- **`badge_tests.js`** - *a collection of badge tests that run automatically*

- **`background.js`** - *intercepts requests to example.com, example.net and example.org to replace page content, simulate script originating from a different domain, and facilitate POSTs to another domain*



https://user-images.githubusercontent.com/308664/172928188-b54f7b18-ffb1-4de0-a107-49223dfcee11.mp4

- <sub>first example shows automated test results, using a [modified](https://github.com/leaky-forms/leak-inspector/compare/main...grundt:TestSupport) version of [LeakInspector](https://github.com/leaky-forms/leak-inspector)</sub>
- <sub>second example shows manual test completion</sub>

class LeakInspectorTestsBackground {
  static #resources = {
    html: {
      awaiting: true,
      url: browser.runtime.getURL("/web_accessible_resources/test.html"),
      value: "<!DOCTYPE html><html><body>LeakInspectorTestsBackground - MISSING html resource</body></html>" // default
    },
    script: {
      awaiting: true,
      url: browser.runtime.getURL("/web_accessible_resources/other_domain.js"),
      value: "console.debug('LeakInspectorTestsBackground - MISSING script resource')" // default
    }
  };
  static {
    LeakInspectorTestsBackground.#trace("");
    LeakInspectorTestsBackground.#fetchResources();
    browser.pageAction.onClicked.addListener(e => LeakInspectorTestsBackground.#onClickedPageAction(e));
    browser.webRequest.onBeforeRequest.addListener(e => LeakInspectorTestsBackground.#onBeforeRequest(e), {urls:["*://example.com/","*://example.net/","*://example.org/"], types:["main_frame","script"]}, ["blocking"]);
    browser.webRequest.onHeadersReceived.addListener(e => LeakInspectorTestsBackground.#onHeadersReceived(e), {urls:["*://example.com/","*://example.net/","*://example.org/"], types:["xmlhttprequest"]}, ["blocking","responseHeaders"]);
  }
  static #fetchResources() {
    LeakInspectorTestsBackground.#trace(".#fetchResources()");
    for(const resource in LeakInspectorTestsBackground.#resources) {
      LeakInspectorTestsBackground.#fetchResource(resource, LeakInspectorTestsBackground.#resources[resource].url);
    }
  }
  static #fetchResource(resource, url) {
    LeakInspectorTestsBackground.#trace(`.#fetchResource(${resource}, ${url})`);
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => LeakInspectorTestsBackground.#onAwaitedResource(resource, xhr.responseText));
    xhr.open("GET", url);
    xhr.responseType = "text";
    xhr.send();
  }
  static #onAwaitedResource(resource, value) {
    LeakInspectorTestsBackground.#trace(`.#onAwaitedResource(${resource})`);
    LeakInspectorTestsBackground.#resources[resource].value = value;
    LeakInspectorTestsBackground.#resources[resource].awaiting = false;
    let awaiting = false;
    for(const resource in LeakInspectorTestsBackground.#resources) {
      awaiting = awaiting || LeakInspectorTestsBackground.#resources[resource].awaiting;
    }
    if (!awaiting) {
      LeakInspectorTestsBackground.#onDoneAwaitingResources();
    }
  }
  static #onDoneAwaitingResources() {
    LeakInspectorTestsBackground.#trace(`.#onDoneAwaitingResources()`);
    console.log("http://example.com/");
  }
  static #onClickedPageAction(e) {
    LeakInspectorTestsBackground.#trace(`.#onClickedPageAction(${e.url})`);
  }
  static #onBeforeRequest(e) {
    LeakInspectorTestsBackground.#trace(`.#onBeforeRequest(${e.method} ${e.type} ${e.url})`);
    const textEncoder = new TextEncoder();
    const responseContent = textEncoder.encode(LeakInspectorTestsBackground.#content(e.type));
    const responseDataFilter = browser.webRequest.filterResponseData(e.requestId);
    responseDataFilter.onstart = r => {
      responseDataFilter.write(responseContent);
      responseDataFilter.close();
    };
    return {};
  }
  static #onHeadersReceived(e) {
    LeakInspectorTestsBackground.#trace(`.#onHeadersReceived(${e.method} ${e.type} ${e.url})`);
    const responseHeaders = e.responseHeaders
                             .filter(h => h.name!=="Access-Control-Allow-Origin") // remove any existing Access-Control-Allow-Origin
                             .concat([{name:"Access-Control-Allow-Origin", value:"*"}]); // set Access-Control-Allow-Origin: *
    return {responseHeaders: responseHeaders};
  }
  static #content(type) {
    LeakInspectorTestsBackground.#trace(`.#content(${type})`);
    switch(type) {
      case "main_frame": return LeakInspectorTestsBackground.#resources.html.value
                                                                            .replace("./", browser.runtime.getURL("/web_accessible_resources/"))
                                                                            .replace("other_domain.js", "http://example.net/");
      case "script": return LeakInspectorTestsBackground.#resources.script.value;
      default: return type;
    }
  }
  static #trace(source) {
    console.debug(`LeakInspectorTestsBackground${source}`);
  }
}



class Badge {

  static LeakInspectorBadge; // the Badge LeakInspector is currently displaying

  static Green = [0,255,0,255];
  static Yellow = [255,255,0,255];
  static Red = [255,0,0,255];
  static #colors = [Badge.Green, Badge.Yellow, Badge.Red];

  #backgroundColor = Badge.Green;
  #text = "";

  static {
    window.addEventListener("message", e=>Badge.#onMessage(e));
  }

  constructor(backgroundColor, text) {
    if ((typeof(backgroundColor) === "object") && (Badge.#colors.includes(backgroundColor))) {
      this.#backgroundColor = backgroundColor;
    } else {
      this.#error(`.backgroundColor INVALID (${typeof(backgroundColor)} ${backgroundColor.toString()})`);
    }
    if (typeof(text) === "string") {
      this.#text = text;
    } else {
      this.#error(`.text INVALID (${typeof(text)} ${text.toString()})`);
    }
  }

  toString() {
    switch(this.#backgroundColor) {
      case Badge.Green: return `Green [${this.#text}]`;
      case Badge.Yellow: return `Yellow [${this.#text}]`;
      case Badge.Red: return `Red [${this.#text}]`;
      default: return this.#text;
    }
  }

  static #getColorForRgba(rgba) {
    const rgbaString = rgba.toString();
    for(const color of Badge.#colors) {
      if (rgbaString === color.toString()) {
        return color;
      }
    }
    this.#error(`.getColorForRgba(${rgbaString}) INVALID`);
    return rgba;
  }

  static #onMessage(e) {
    this.#trace(`.onMessage()`);
    if ((typeof(e.data.message)==="string") && (e.data.message==="LeakInspectorBadge")) {
      // message sent from LeakInspector via background_utils.js -> test_support.js
      this.LeakInspectorBadge = new Badge(this.#getColorForRgba(e.data.value.BackgroundColor), e.data.value.Text);
      this.#trace(`.onMessage("LeakInspectorBadge"=${this.LeakInspectorBadge})`);
    }
  }

  #error(source) {
    console.error(`Badge${source}`);
  }

  static #trace(source) {
    console.debug(`Badge${source}`);
  }
}

/* ************************************************************************************************************************** */

class BadgeTestCase {

  #testcase = {
    testnumber: 0,
    description: "",
    arrange: _=>{},
    badgeBeforeTest: new Badge(Badge.Green, "0"),
    act: _=>{},
    teardown: _=>{},
    badgeAfterTest: new Badge(Badge.Green, "0")
  };

  constructor(testcase) {
    if (typeof(testcase) === "object") {
      Object.assign(this.#testcase, testcase);
      if (typeof(this.#testcase.testnumber) !== "number") {
        this.error(`.number INVALID (${typeof(this.#testcase.number)})`);
      }
      if (typeof(this.#testcase.description) !== "string") {
        this.error(`.description INVALID (${typeof(this.#testcase.description)})`);
      }
      if (typeof(this.#testcase.arrange) !== "function") {
        this.error(`.arrange INVALID (${typeof(this.#testcase.arrange)})`);
      }
      if (!(this.#testcase.badgeBeforeTest instanceof Badge)) {
        this.error(`.badgeBeforeTest INVALID (${typeof(this.#testcase.badgeBeforeTest)})`);
      }
      if (typeof(this.#testcase.act) !== "function") {
        this.error(`.act INVALID (${typeof(this.#testcase.act)})`);
      }
      if (!(this.#testcase.badgeAfterTest instanceof Badge)) {
        this.error(`.badgeAfterTest INVALID (${typeof(this.#testcase.badgeAfterTest)})`);
      }
      if (typeof(this.#testcase.teardown) !== "function") {
        this.error(`.teardown INVALID (${typeof(this.#testcase.teardown)})`);
      }
    }
  }

  async runAsync() {

    this.#describe();

    if (Badge.LeakInspectorBadge instanceof Badge) {
      const leakInspectorBadge = Badge.LeakInspectorBadge.toString();
      const expectedBadge = this.#testcase.badgeBeforeTest.toString();
      if (leakInspectorBadge !== expectedBadge) {
        this.#describe(` - badgeBeforeTest - EXPECTED (${expectedBadge}) WAS (${leakInspectorBadge})`);
      }
    }

    this.#testcase.arrange();

    this.#testcase.act();

    this.#testcase.teardown();

    if (Badge.LeakInspectorBadge instanceof Badge) {
      await this.#wait(1234);
      const leakInspectorBadge = Badge.LeakInspectorBadge.toString();
      const expectedBadge = this.#testcase.badgeAfterTest.toString();
      if (leakInspectorBadge === expectedBadge) {
        this.#describe(" - PASS");
      } else {
        this.#describe(` - EXPECTED (${expectedBadge}) WAS (${leakInspectorBadge}) - FAIL`);
      }
    } else {
      switch(await LeakInspectorTest.promptForTestResult())
      {
         case "pass": 
           this.#describe(" - PASS");
           break;
         case "fail":
           this.#describe(" - FAIL");
           break;
      }
    }
  }

  #wait(ms) {
    return new Promise(resolve => setTimeout(resolve.bind(null), ms));
  }

  #describe(extendedDescription) {
    LeakInspectorTest.describe(`BadgeTests #${this.#testcase.testnumber}: ${this.#testcase.description}${extendedDescription || ""}`);
  }

  #error(source) {
    console.error(`BadgeTestCase${source}`);
  }
}

/* ************************************************************************************************************************** */

class BadgeTests {
  
  static #testCases = [{
    description: "Before tests, badge should be GREEN, count should be ZERO",
    badgeBeforeTest: new Badge(Badge.Green, "0"),
    badgeAfterTest: new Badge(Badge.Green, "0")
  },{
    description: "When email input is sniffed, badge should become YELLOW, count should become ONE",
    badgeBeforeTest: new Badge(Badge.Green, "0"),
    act: ()=>LeakInspectorTest.sniff("email"),
    badgeAfterTest: new Badge(Badge.Yellow, "1")
  },{
    description: "When already sniffed email input is modified, badge should remain YELLOW, count should remain ONE",
    badgeBeforeTest: new Badge(Badge.Yellow, "1"),
    act: ()=>LeakInspectorTest.setInputValue("email", "email@example.com"),
    badgeAfterTest: new Badge(Badge.Yellow, "1")
  },{
    description: "When already sniffed email input is sniffed (again), badge should remain YELLOW, count should remain ONE",
    badgeBeforeTest: new Badge(Badge.Yellow, "1"),
    act: ()=>LeakInspectorTest.sniff("email"),
    badgeAfterTest: new Badge(Badge.Yellow, "1")
  },{
    description: "When password input has no listener, and password value is input, badge should remain YELLOW, count remain ONE",
    badgeBeforeTest: new Badge(Badge.Yellow, "1"),
    act: ()=>LeakInspectorTest.setInputValue("password", "PaSs", true),
    badgeAfterTest: new Badge(Badge.Yellow, "1"),
  },{
    description: "When password input has listener that sniffs, and password value is input, badge should remain YELLOW, count should increment to TWO",
    arrange: ()=>LeakInspectorTest.setInputListener("password"),
    badgeBeforeTest: new Badge(Badge.Yellow, "1"),
    act: ()=>LeakInspectorTest.setInputValue("password", "PaSsWoRd", true),
    teardown: ()=>LeakInspectorTest.removeInputListener("password"),
    badgeAfterTest: new Badge(Badge.Yellow, "2")
  },{
    description: "When form is leaked, badge should become RED, count should be TWO",
    badgeBeforeTest: new Badge(Badge.Yellow, "2"),
    act: ()=>LeakInspectorTest.leak("form"),
    badgeAfterTest: new Badge(Badge.Red, "2")
  }].map((testcase,i) => new BadgeTestCase({testnumber: i+1,...testcase}));

  static run() {
    LeakInspectorTest.reset();

    // execute testcases in sequence, then reset
    this.#testCases.reduce(
      (promise,testcase) => promise.then(() => 
        new Promise(resolve => 
          setTimeout(() => resolve(testcase.runAsync()), 123)
        )
      ), 
      Promise.resolve()
    ).then(() => LeakInspectorTest.reset());

  }

}

window.addEventListener("DOMContentLoaded", ()=>setTimeout(()=>BadgeTests.run(), 1234));

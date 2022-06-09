customElements.define(

  "test-result-list-element", 

  class extends HTMLDListElement {

    constructor() {
      super();
    }

    appendTestResult(testResult) {
      this.#applyTestResult(testResult);
    }

    prependTestResult(testResult) {
      this.#applyTestResult(testResult, /* reverseOrder */ true);
    }

    #applyTestResult(testResult, reverseOrder) {
      // parsed ex. "Test #1: Blah blah blah - PASS" -> { testnumber:"Test #1", description:"Blah blah blah", result:"PASS" }
      const parsedTestResult = this.constructor.#parseTestResult(testResult);
      const priorTestResultDt = this.#priorTestResultDt(reverseOrder);
      if (priorTestResultDt !== null && priorTestResultDt.innerText === parsedTestResult.testnumber) {
        // the prior list item has the same test number, update the item (update dt with result + insert dd, if needed)
        this.constructor.#updateTestResultElement(
          priorTestResultDt.parentElement,
          priorTestResultDt,
          parsedTestResult.result,
          parsedTestResult.description
        );
      } else {
        // insert a new item (dt + dd)
        const testResultElement = this.constructor.#createTestResultElement(
          parsedTestResult.testnumber, 
          parsedTestResult.result, 
          parsedTestResult.description
        );
        if (reverseOrder) {
          this.prepend(testResultElement);
        } else {
          this.append(testResultElement);
        }
      }
    }

    #priorTestResultDt(reverseOrder) {
      const priorTestResultElement = (reverseOrder) ? this.firstElementChild : this.lastElementChild; 
      if (priorTestResultElement === null) { // list is empty
        return null;
      } else {
        if (priorTestResultElement.tagName === "DT") {
          return priorTestResultElement;
        } else {
          return priorTestResultElement.getElementsByTagName("DT").item(0);
        }
      }
    }

    static #updateTestResultElement(testResultElement, dt, result, description) {
      this.#insertResult(dt, result);
      this.#insertDescription(testResultElement, description);
    }

    static #createTestResultElement(testnumber, result, description) {
      const testResultElement = document.createElement("div");
      const dt = testResultElement.appendChild(document.createElement("dt"));
      this.#insertTestNumber(dt, testnumber);
      this.#insertResult(dt, result);
      this.#insertDescription(testResultElement, description);
      return testResultElement;
    }

    static #insertTestNumber(dt, testnumber) {
      if (testnumber !== "") {
        dt.appendChild(document.createElement("span")).innerText = testnumber;
      }
    }

    static #insertResult(dt, result) {
      if (result !== "") {
        const span = document.createElement("span");
        span.classList.add(result.toLowerCase());
        span.innerText = result;
        dt.appendChild(span);
      }
    }

    static #insertDescription(testResultElement, description) {
      if (description !== "") {
        if (!Array.from(testResultElement.getElementsByTagName("DD")).find(dd => dd.innerText===description)) {
          testResultElement.appendChild(document.createElement("dd")).innerText = description;
        }
      }
    }

    static #parseTestResult(testResult) {

      // ex. "Test #1: Blah blah blah - PASS" -> { testnumber:"Test #1", description:"Blah blah blah", result:"PASS" }
      const parsedTestResult = {
        testnumber: "",
        description: testResult.toString(),
        result: ""
      };

      // if testResult begins with a test number (ex. "Test #1:"), separate the "testnumber" from the "description"
      const matchTestnumberDescription = parsedTestResult.description.match(/^((?<testnumber>(.*\s+|)#\d+)\s*:\s*)(?<description>.*)$/);
      if (matchTestnumberDescription) {
        parsedTestResult.testnumber = matchTestnumberDescription.groups.testnumber;
        parsedTestResult.description = matchTestnumberDescription.groups.description;
      }

      // if testResult ends with " - PASS" or " - FAIL", separate the "result" from the "description"
      const matchDescriptionResult = parsedTestResult.description.match(/^(?<description>.*[^\s^-])(\s*-\s*(?<result>PASS|FAIL))$/);
      if (matchDescriptionResult) {
        parsedTestResult.description = matchDescriptionResult.groups.description;
        parsedTestResult.result = matchDescriptionResult.groups.result;
      }

      return parsedTestResult;
    }
 
  }, 

  {extends: "dl"}

);
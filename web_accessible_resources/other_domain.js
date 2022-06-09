class LeakInspectorOtherDomain {

  static sniff(inputElement) {
    this.#trace(`.sniff(${inputElement.id})==${inputElement.value}`);
  }

  static leak(xhr, formData) {
    this.#trace(`.leak()`);
    xhr.send(formData);
  }

  static #trace(source) {
    console.debug(`LeakInspectorOtherDomain${source}`);
  }
}
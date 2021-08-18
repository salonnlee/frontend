import React from "react";

import "./quilleditor.css";

const OBSERVER_CONFIG = {
  attributes: true,
  characterData: true,
  characterDataOldValue: true,
  childList: true,
  subtree: true
};

class QuillEditor extends React.Component {
  componentDidMount() {
    this.domNode = document.getElementsByClassName("editor")[0];
    this.observer = new MutationObserver((mutations) => {
      console.warn("observed domNode mutated!", [mutations[0]]);
    });
    this.observer.observe(this.domNode, OBSERVER_CONFIG);
  }
  render() {
    return <div className="editor" contentEditable="true"></div>;
  }
}

export default QuillEditor;

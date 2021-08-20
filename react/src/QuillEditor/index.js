import React from "react";
import Iterator from "./delta/Iterator";
import Op from "./delta/Op";

window.Iterator = Iterator;
window.Op = Op;

class QuillEditor extends React.Component {
  render() {
    return <div className="editor" contentEditable="true"></div>;
  }
}

export default QuillEditor;

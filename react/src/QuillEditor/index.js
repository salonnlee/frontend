import React from "react";
import Delta from "./delta/Delta";

window.Delta = Delta;

class QuillEditor extends React.Component {
  render() {
    return <div className="editor" contentEditable="true"></div>;
  }
}

export default QuillEditor;

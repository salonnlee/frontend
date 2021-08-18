import React from "react";

import "./quilleditor.css";

class QuillEditor extends React.Component {
  render() {
    return <div className="editor" contentEditable="true"></div>;
  }
}

export default QuillEditor;

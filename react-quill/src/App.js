import React from "react";
import "./app.css";

import "./quill";

function App(props) {
  return (
    <div className="App">
      <div className="editor" contentEditable="true"></div>
    </div>
  );
}

export default App;

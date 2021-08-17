import "./app.css";
import "./quill/index";
import "./rxjs/index";

function App() {
  return (
    <div className="App">
      <div className="editor" contentEditable="true"></div>
    </div>
  );
}

export default App;

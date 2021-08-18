import React from "react";
import { connect } from "react-redux";

// import "./quill/index";
// import "./rxjs/index";

import "./app.css";

const mapStateToProps = (state, ownProps) => {
  console.warn("mapStateToProps args", state, ownProps);
  return { ...state };
};
const mapDispatchToProps = (dispatch, ownProps) => {
  console.warn("mapDispatchToProps args", dispatch, ownProps);
  return {
    fetch: () => {
      dispatch({ type: "FETCH_TEST" });
    }
  };
};

const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(function App(props) {
  console.log("App", props);
  const { fetch } = props;
  return (
    <div className="App">
      <button onClick={() => fetch('hahhahha')}>Click me!</button>
      {/* <div className="editor" contentEditable="true"></div> */}
    </div>
  );
});

export default App;

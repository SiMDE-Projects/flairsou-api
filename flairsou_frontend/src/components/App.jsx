import React from "react";
import { render } from "react-dom";

function App(props) {
    return (
        <>
            <h1>Hello world !</h1>
            <p>Petit bonjour de React / django</p>
        </>
    );
}

export default App;

const container = document.getElementById("app");
render(<App />, container);

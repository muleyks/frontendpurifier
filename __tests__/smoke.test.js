import React from "react";
import { render } from "@testing-library/react-native";
import App from "../App";

describe("App smoke", () => {
  it("mounts the navigator and renders the initial screen without crashing", () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});

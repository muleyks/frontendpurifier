import React from "react";
import { render } from "@testing-library/react-native";
import { WatchPreview } from "../App";

describe("Watch prototype", () => {
  it("mounts the watch faces (shared state) without crashing", () => {
    const { toJSON } = render(<WatchPreview />);
    expect(toJSON()).toBeTruthy();
  });
});

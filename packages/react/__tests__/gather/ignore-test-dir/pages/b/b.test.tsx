// @ts-nocheck
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./b2";

test("props is avaliable", () => {
  const value = "123";
  // 为了多写点测试用例，我给App组件加了个prop
  render(<App value={value} />);
  expect(screen.getByRole("props")).toHaveTextContent(value);
});

test("click of button is avaliable", () => {
  render(<App value="123" />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button")).toHaveTextContent(`count is: 1`);
});

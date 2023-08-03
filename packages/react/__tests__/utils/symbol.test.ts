import { EVAL_STRING_SYMBOL } from "@/utils/symbol";

const aStr = `${EVAL_STRING_SYMBOL}async() => {
    let { Layout } = await import("./pages/Dashboard");
    return { Component: Layout };
}`;
const bStr = `${EVAL_STRING_SYMBOL}async()=>{let{Layout}=awaitimport("./pages/Dashboard");return{Component:Layout};}`;

test("detect areEvalStringEqual in addEqualityTesters", () => {
  expect(aStr).toEqual(bStr);
});

test("try nested property with areEvalStringEqual", () => {
  expect({
    str: aStr,
  }).toStrictEqual({ str: bStr });
});

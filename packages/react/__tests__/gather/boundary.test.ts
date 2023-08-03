import gather from "@/gather";

test("gather in no exist file", () => {
  const message = 'Cannot find folder with path "xxx"';
  expect(() => {
    gather({ dirpath: "xxx" });
  }).toThrow(message);
});

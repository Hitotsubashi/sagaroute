import isReactComponent from "@/utils/isReactComponent";
import parseToAst from "@/utils/parseToAst";

test("detect component in jsx", () => {
  const content = `
    const profile = (
        <div>
          <img src="avatar.png" className="profile" />
          <h3>{[user.firstName, user.lastName].join(" ")}</h3>
        </div>
      );
    `;
  const ast = parseToAst(content);
  expect(isReactComponent(ast)).toBe(true);
});

test("detect component in tsx", () => {
  const content = `
    const profile:React.FC<Props> = (
        <div>
          <img src="avatar.png" className="profile" />
          <h3>{[user.firstName, user.lastName].join(" ")}</h3>
        </div>
      );
      `;
  const ast = parseToAst(content, true);
  expect(isReactComponent(ast)).toBe(true);
});

test("detect component in normal ts script", () => {
  const content = `
    var a: string = "";
      `;
  const ast = parseToAst(content, true);
  expect(isReactComponent(ast)).toBe(false);
});

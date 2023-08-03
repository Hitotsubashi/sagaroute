// @ts-nocheck
import ErrorBoundary from "./components/ErrorBoundary.tsx";

const list = () => {
  return (
    <ul>
      <li>1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  );
};

list.routeProps = {
  ErrorBoundary,
};

export default list;

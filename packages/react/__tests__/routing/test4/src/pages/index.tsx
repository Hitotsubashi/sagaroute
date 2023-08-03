// @ts-nocheck
import React from "react";

const Comp: React.FC = () => {
  return <content>123</content>;
};

Comp.routeProps = {
  errorElement: (
    <React.Fragement>
      <div>error...</div>
      <button>back</button>
    </React.Fragement>
  ),
};

export default Comp;

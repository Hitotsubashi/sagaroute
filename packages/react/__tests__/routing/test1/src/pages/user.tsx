// @ts-nocheck
import ErrorBoundary from '../components/ErrorBoundary';

const Comp: React.FC = ({ children }) => {
  return <content>user-{children}</content>;
};

Comp.routeProps = {
  errorElement: <ErrorBoundary />,
};

export default Comp;

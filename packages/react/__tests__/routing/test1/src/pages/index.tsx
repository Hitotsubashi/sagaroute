// @ts-nocheck
import ErrorBoundary from '../components/ErrorBoundary';

const Comp: React.FC = ({ children }) => {
  return <content>{children}</content>;
};

Comp.routeProps = {
  ErrorBoundary,
};

export default Comp;

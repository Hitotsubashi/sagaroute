// @ts-nocheck
interface Props {
  show: boolean;
  children: React.ReactNode;
}

const ErrorBoundary1: React.FC<Props> = ({ children, show }) => {
  <div>{children}</div>;
};

export default ErrorBoundary1;

// @ts-nocheck

interface Props {
  children: React.ReactNode;
}

const ErrorBoundary2: React.FC<Props> = ({ children }) => {
  <div>{children}</div>;
};

export const Header = ({ text }) => <h3>{text}</h3>;

const Context = ({ text }) => <p>{text}</p>;

export { Context };

export default ErrorBoundary2;

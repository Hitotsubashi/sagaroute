// @ts-nocheck
import ErrorBoundary2, { Header, Context } from './components/ErrorBoundary2.tsx';

export const routeProps = {
  errorElement: (
    <ErrorBoundary2>
      <Header text="header" />
      <Context text="context" />
    </ErrorBoundary2>
  ),
};

// @ts-nocheck
import ErrorBoundary1 from './components/ErrorBoundary1.tsx';
import Text from './components/Text.tsx';
import { Input } from 'antd';

export const routeProps = {
  errorElement: (
    <ErrorBoundary1 show>
      <Text />
      <Input />
    </ErrorBoundary1>
  ),
};


// @ts-nocheck
import { loader1 as loader } from '@/utils/loader';
import { action } from '@/utils/action';
import ErrorBoundary from '@/pages/comp/ErrorBoundary';

export const routeProps = {
  loader,
  action,
  errorElement: <ErrorBoundary />,
};


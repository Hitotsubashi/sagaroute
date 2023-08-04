// @ts-nocheck
import { loader1 as loader } from '@/utils/loader';
import { action } from '@/utils/action';
import ErrorBoundary from '@/pages/comp/ErrorBoundary';

const A = <div>123</div>;

const B = <div>456</div>;

const BB = (
  <>
    <A />
    <B />
  </>
);

BB.routeProps = {
  loader,
  action,
  errorElement: <ErrorBoundary />,
};

export default BB;

// @ts-nocheck
import ErrorBoundary from '../components/ErrorBoundary';

type Props = Record<string, never>;

const App: React.FC<Props> = () => {
  const request = useCallback(() => {}, []);

  useEffect(() => {
    request();
  }, []);

  return (
    <div>
      <span>App</span>
    </div>
  );
};

App.routeProps = {
  errorElement: <ErrorBoundary />,
};

export default App;

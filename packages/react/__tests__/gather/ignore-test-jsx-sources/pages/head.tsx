// @ts-nocheck
import ErrorBoundary2, {
  Header,
  Context,
} from "./components/ErrorBoundary2.tsx";

type Props = Record<string, never>;

const Head: React.FC<Props> = () => {
  const request = useCallback(() => {}, []);

  useEffect(() => {
    request();
  }, []);

  return <header>header....</header>;
};

Head.routeProps = {
  errorElement: (
    <ErrorBoundary2>
      <Header text="header" />
      <Context text="context" />
    </ErrorBoundary2>
  ),
};

export default Head;

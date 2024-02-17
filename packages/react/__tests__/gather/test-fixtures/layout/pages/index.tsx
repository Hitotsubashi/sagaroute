// @ts-nocheck

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

export default App;

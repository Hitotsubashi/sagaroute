// @ts-nocheck
type Props = Record<string, never>;

const Head: React.FC<Props> = () => {
  const request = useCallback(() => {}, []);

  useEffect(() => {
    request();
  }, []);

  return <header>header....</header>;
};

export default Head;

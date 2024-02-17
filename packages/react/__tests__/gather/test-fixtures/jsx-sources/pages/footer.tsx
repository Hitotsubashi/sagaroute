// @ts-nocheck

const Footer: React.FC<Props> = () => {
  const request = useCallback(() => {}, []);

  useEffect(() => {
    request();
  }, []);

  return <footer>footer...</footer>;
};

export default Footer;

// @ts-nocheck
import * as Text from "./components/Text.tsx";
import Title from "./components/Title.tsx";

const Footer: React.FC<Props> = () => {
  const request = useCallback(() => {}, []);

  useEffect(() => {
    request();
  }, []);

  return <footer>footer...</footer>;
};

Footer.routeProps = {
  errorElement: (
    <div>
      <Title title="title" />
      <Text />
    </div>
  ),
};

export default Footer;

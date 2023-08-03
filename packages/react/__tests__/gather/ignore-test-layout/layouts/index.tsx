// @ts-nocheck
import { Layout } from "antd";
const { Header, Footer, Content } = Layout;

type Props = {
  children: React.ReactNode;
};

const App: React.FC<Props> = ({ children }) => {
  return (
    <Layout>
      <Header>Header</Header>
      <Content>{children}</Content>
      <Footer>Footer</Footer>
    </Layout>
  );
};

export default App;

// @ts-nocheck
import ErrorBoundary1 from "./components/ErrorBoundary1.tsx";
import Text from "./components/Text.tsx";
import { Input } from "antd";

type Props = Record<string, never>;

const Table: React.FC<Props> = () => {
  const request = useCallback(() => {}, []);

  useEffect(() => {
    request();
  }, []);

  return (
    <table>
      <th>Table</th>
      <tr>123</tr>
    </table>
  );
};

Table.routeProps = {
  errorElement: (
    <ErrorBoundary1 show>
      <Text />
      <Input />
    </ErrorBoundary1>
  ),
};

export default Table;

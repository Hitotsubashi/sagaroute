// @ts-nocheck

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

export default Table;

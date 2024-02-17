// @ts-nocheck

const Comp: React.FC = () => {
  const [temp, setTemp] = useState(0);
  return <button onClick={() => setTemp(1)}>check</button>;
};

export default Comp;

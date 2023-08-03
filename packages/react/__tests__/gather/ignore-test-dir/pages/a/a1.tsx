// @ts-nocheck
import ErrorEle from '@/components/ErrorEle.tsx';

const Comp: React.FC = () => {
  const [temp, setTemp] = useState(0);
  return <button onClick={() => setTemp(1)}>check</button>;
};

Comp.routeProps = {
  role: ['amdin'],
  errorElement: <ErrorEle />,
};

export default Comp;

import Errorboundary from '../../components/ErrorBoundary'

const User = () => {
    // @ts-ignore
    return <div>User</div>;
};

User.routeProps = {
    errorElement: <Errorboundary/>
}

export default User;

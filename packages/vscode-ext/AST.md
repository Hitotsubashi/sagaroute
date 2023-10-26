逐步对各种类去支持

1.  `useNavigate`

    ```js
    import { useNavigate } from 'react-router-dom';

    const navigate = useNavigate();
    navigate('');
    ```

2.  `Link`、`NavLink`

    ```jsx
    <Link to=".." relative="path">
      Cancel
    </Link>
    ```

    ```jsx
    <NavLink to=".." relative="path">
      Cancel
    </NavLink>
    ```

3.  `Navigate`

        ```jsx
        <Navigate to="/dashboard" replace={true} />
        ```

4.  `redirect`

        ```jsx
        import { redirect} from "react-router-dom";

        export async function action({ request }) {
            return redirect("/dashboard");
        }
        ```

5.  `Form`

        ```jsx
        import { Form } from "react-router-dom";

        function NewEvent() {
            return (
                <Form method="post" action="/events">
                <input type="text" name="title" />
                <input type="text" name="description" />
                <button type="submit">Create</button>
                </Form>
            );
        }
        ```

6.  `useFetcher`

        ```jsx
        fetcher.load(href);
        fetcher.submit(
            { idle: true },
            { method: "post", action: "/logout" }
        );

        return (
            <fetcher.Form method="post" action="/some/route">
            <input type="text" />
            </fetcher.Form>
        );
        ```

7.  useFetchers有难度 https://reactrouter.com/en/main/hooks/use-fetchers
8.  useHref

        ```tsx
        declare function useHref(
            to: To,
            options?: { relative?: RelativeRoutingType }
        ): string;
        ```

9.  useLinkClickHandler、useLinkPressHandler

        ```tsx
        function(){
            let handleClick = useLinkClickHandler(to, {
                replace,
                state,
                target,
            });

            return (
                <StyledLink
                    {...rest}
                    href={href}
                    onClick={(event) => {
                        onClick?.(event);
                        if (!event.defaultPrevented) {
                            handleClick(event);
                        }
                    }}
                    ref={ref}
                    target={target}
                />
            );
        }
        ```

10. useSubmit

---

注意：

1.  注意`import as`的情况

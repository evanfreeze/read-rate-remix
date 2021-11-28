import { User } from ".prisma/client";
import { useLocation } from "react-router";
import {
    Link,
    Links,
    LinksFunction,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useCatch,
    LoaderFunction,
    useLoaderData,
} from "remix";
import { LogoutIcon } from "@heroicons/react/solid";

import globalStylesUrl from "./styles/global.css";
import tailwindUrl from "./styles/tailwind.css";
import { getUser, getUserId } from "./utils/session.server";

export const links: LinksFunction = () => {
    return [
        {
            rel: "stylesheet",
            href: globalStylesUrl,
        },
        {
            rel: "stylesheet",
            href: tailwindUrl,
        },
    ];
};

type LoaderData = {
    user: User | null;
};

export const loader: LoaderFunction = async ({ request }): Promise<LoaderData> => {
    const userId = await getUserId(request);
    let user: User | null = null;

    if (userId) {
        user = await getUser(request);
    }

    return { user };
};

export default function App() {
    return (
        <Document>
            <Layout>
                <Outlet />
            </Layout>
        </Document>
    );
}

// https://remix.run/docs/en/v1/api/conventions#errorboundary
export function ErrorBoundary({ error }: { error: Error }) {
    console.error(error);
    return (
        <Document title="Error!">
            <Layout>
                <div>
                    <h1>There was an error</h1>
                    <p>{error.message}</p>
                    <hr />
                    <p>Hey, developer, you should replace this with what you want your users to see.</p>
                </div>
            </Layout>
        </Document>
    );
}

// https://remix.run/docs/en/v1/api/conventions#catchboundary
export function CatchBoundary() {
    let caught = useCatch();

    let message;
    switch (caught.status) {
        case 401:
            message = <p>Oops! Looks like you tried to visit a page that you do not have access to.</p>;
            break;
        case 404:
            message = <p>Oops! Looks like you tried to visit a page that does not exist.</p>;
            break;

        default:
            throw new Error(caught.data || caught.statusText);
    }

    return (
        <Document title={`${caught.status} ${caught.statusText}`}>
            <Layout>
                <h1>
                    {caught.status}: {caught.statusText}
                </h1>
                {message}
            </Layout>
        </Document>
    );
}

function Document({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                {title ? <title>{title}</title> : null}
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
                {process.env.NODE_ENV === "development" && <LiveReload />}
            </body>
        </html>
    );
}

function Layout({ children }: { children: React.ReactNode }) {
    const data = useLoaderData<LoaderData>();
    const location = useLocation();

    return (
        <div id="remix-app" className="max-w-screen-lg mx-auto px-6 py-10 h-full">
            {location.pathname == "/" ? null : (
                <header className="sticky top-0 z-10 bg-white dark:bg-gray-900">
                    <div className="flex flex-col items-start gap-3 md:flex-row md:justify-between md:items-center pt-5">
                        <div className="flex gap-3 items-center">
                            <img className="rounded-lg" src="/images/icon.png" width="48" height="48" />
                            <Link to="/" title="Read Rate">
                                <h1 className="text-5xl font-bold dark:text-gray-100">Read Rate</h1>
                            </Link>
                        </div>
                        {data?.user ? (
                            <div className="flex gap-6 items-center justify-between w-full md:w-auto">
                                <span className="text-gray-600 dark:text-gray-400 font-bold">{data?.user.email}</span>
                                <form action="/logout" method="post">
                                    <button
                                        type="submit"
                                        aria-label="Logout Button"
                                        className="bg-gray-100 dark:bg-gray-800 p-3 flex items-center justify-center rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-150 text-blue-500"
                                    >
                                        <LogoutIcon className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <Link className="dark:text-gray-300" to="/login">
                                Login
                            </Link>
                        )}
                    </div>
                    <hr className="border-gray-300 dark:border-gray-700 my-6" />
                </header>
            )}
            <div className="mb-10">{children}</div>
            <footer className="text-center fixed bottom-0 pb-4 pt-2 left-0 right-0 text-xs bg-white dark:bg-gray-900">
                <p className="text-gray-400 dark:text-gray-500">
                    &copy; 2020–{new Date().getFullYear()} •{" "}
                    <a className="hover:underline hover:text-blue-500" href="https://www.evanfreeze.com">
                        Evan Freeze
                    </a>
                </p>
            </footer>
        </div>
    );
}

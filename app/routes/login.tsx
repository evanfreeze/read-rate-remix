import { ActionFunction, useActionData, useSearchParams, LinksFunction } from "remix";
import { createUserSession, login, signUp } from "~/utils/session.server";

import formStylesUrl from "../styles/forms.css";

export const links: LinksFunction = () => {
    return [
        {
            rel: "stylesheet",
            href: formStylesUrl,
        },
    ];
};

function validateEmail(email: unknown) {
    if (typeof email !== "string" || email.trim().length < 4) {
        return "Invalid email address (must be at least 4 characters)";
    }
}

function validatePassword(password: unknown) {
    if (typeof password !== "string" || password.length < 8) {
        return "Invalid password (must be at least 8 characters)";
    }
}

type ActionData = {
    formError?: string;
    fieldErrors?: {
        email: string | undefined;
        password: string | undefined;
    };
    fields?: {
        loginType: string;
        email: string;
        password: string;
    };
};

export const action: ActionFunction = async ({ request }): Promise<Response | ActionData> => {
    const form = await request.formData();
    const loginType = form.get("loginType");
    const email = form.get("email");
    const password = form.get("password");
    const redirectTo = form.get("redirectTo");

    console.log(form.get("loginType"));

    if (
        typeof loginType !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof redirectTo !== "string"
    ) {
        return { formError: "Form submitted incorrectly. All values must be strings" };
    }

    const fields = { loginType, email, password, redirectTo };

    const fieldErrors = {
        email: validateEmail(email),
        password: validatePassword(password),
    };

    if (Object.values(fieldErrors).some(Boolean)) {
        return { fields, fieldErrors };
    }

    switch (loginType) {
        case "login": {
            const user = await login({ email, password });
            if (!user) {
                return {
                    fields,
                    formError: "Email/Password combination is incorrect",
                };
            }
            return createUserSession(user.id, redirectTo);
        }
        case "signUp": {
            const user = await signUp({ email, password });
            if (!user) {
                return {
                    fields,
                    formError: "Something went wrong try to create a new user",
                };
            }
            return createUserSession(user.id, redirectTo);
        }
        default: {
            return { fields, formError: "Invalid login type" };
        }
    }
};

export default function LoginPage() {
    const actionData = useActionData<ActionData | undefined>();
    const [searchParams] = useSearchParams();

    return (
        <div className="max-w-lg mx-auto form-container my-12">
            <h2 className="text-2xl text-gray-900 font-bold text-center">Login or Sign Up</h2>
            <hr className="my-5" />
            <form
                method="post"
                className="login-form"
                aria-describedby={actionData?.formError ? "form-error-message" : undefined}
            >
                <input type="hidden" name="redirectTo" value={searchParams.get("redirectTo") ?? "/now-reading"} />
                <fieldset className="flex gap-8 justify-center my-3">
                    <legend className="sr-only">Login or Sign Up?</legend>
                    <label className="form-label">
                        <input
                            type="radio"
                            name="loginType"
                            value="login"
                            defaultChecked={!actionData?.fields?.loginType || actionData.fields.loginType === "login"}
                        />{" "}
                        Login
                    </label>
                    <label className="form-label">
                        <input
                            type="radio"
                            name="loginType"
                            value="signUp"
                            defaultChecked={actionData?.fields?.loginType === "signUp"}
                        />{" "}
                        Sign Up
                    </label>
                </fieldset>
                <div className="form-input">
                    <label className="font-semibold" htmlFor="email-input">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email-input"
                        defaultValue={actionData?.fields?.email}
                        aria-invalid={Boolean(actionData?.fieldErrors?.email)}
                        aria-describedby={actionData?.fieldErrors?.email ? "email-error" : undefined}
                    />
                    {actionData?.fieldErrors?.email ? (
                        <p className="text-red-600 font-semibold" role="alert" id="email-error">
                            {actionData?.fieldErrors?.email}
                        </p>
                    ) : null}
                </div>
                <div className="form-input">
                    <label htmlFor="password-input">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password-input"
                        defaultValue={actionData?.fields?.password}
                        aria-invalid={Boolean(actionData?.fieldErrors?.password)}
                        aria-describedby={actionData?.fieldErrors?.password ? "password-error" : undefined}
                    />
                    {actionData?.fieldErrors?.password ? (
                        <p className="text-red-600 font-semibold" role="alert" id="password-error">
                            {actionData?.fieldErrors?.password}
                        </p>
                    ) : null}
                </div>
                <div id="form-error-message">
                    {actionData?.formError ? (
                        <p className="text-red-600 font-semibold" role="alert">
                            {actionData?.formError}
                        </p>
                    ) : null}
                </div>
                <button
                    type="submit"
                    className="border w-full py-2 bg-gray-200 text-lg font-bold text-gray-700 mt-3 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-150"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}

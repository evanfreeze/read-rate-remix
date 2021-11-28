import { useState } from "react";
import { ActionFunction, useActionData, useSearchParams, LinksFunction } from "remix";
import { createUserSession, login, signUp } from "~/utils/session.server";

import loginStylesUrl from "../styles/login.css";

export const links: LinksFunction = () => {
    return [
        {
            rel: "stylesheet",
            href: loginStylesUrl,
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

function validateFirstName(firstName: unknown) {
    if (typeof firstName !== "string" || firstName.trim().length <= 0) {
        return "First name can't be empty";
    }
}

type ActionData = {
    formError?: string;
    fieldErrors?: {
        firstName?: string | undefined;
        email: string | undefined;
        password: string | undefined;
    };
    fields?: {
        loginType: string;
        email: string;
        password: string;
        firstName?: string;
    };
};

export const action: ActionFunction = async ({ request }): Promise<Response | ActionData> => {
    const form = await request.formData();
    const loginType = form.get("loginType") === "1" ? "login" : "signUp";
    const firstName = form.get("firstName") ?? "";
    const email = form.get("email");
    const password = form.get("password");
    const redirectTo = form.get("redirectTo");

    if (
        typeof loginType !== "string" ||
        typeof firstName !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof redirectTo !== "string"
    ) {
        return { formError: "Form submitted incorrectly. All values must be strings" };
    }

    const fields = { loginType, email, password, firstName, redirectTo };

    const fieldErrors = {
        email: validateEmail(email),
        password: validatePassword(password),
        firstName: loginType === "signUp" ? validateFirstName(firstName) : undefined,
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
            const user = await signUp({ email, password, firstName });
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
    const [signUpSelected, setSignUpSelected] = useState(actionData?.fields?.loginType === "signUp");

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form
                method="post"
                className="login-form"
                aria-describedby={actionData?.formError ? "form-error-message" : undefined}
            >
                <input type="hidden" name="redirectTo" value={searchParams.get("redirectTo") ?? "/now-reading"} />
                <fieldset className="login-type">
                    <label>
                        <input type="radio" name="loginType" value="login" defaultChecked={!signUpSelected} /> Login
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="loginType"
                            value="signUp"
                            defaultChecked={signUpSelected}
                            onChange={() => setSignUpSelected(true)}
                        />{" "}
                        Sign Up
                    </label>
                </fieldset>
                {signUpSelected ? (
                    <div className="form-input">
                        <label htmlFor="firstName-input">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            id="firstName-input"
                            defaultValue={actionData?.fields?.firstName ?? ""}
                            aria-invalid={Boolean(actionData?.fieldErrors?.firstName)}
                            aria-describedby={actionData?.fieldErrors?.firstName ? "firstName-error" : undefined}
                        />
                        {actionData?.fieldErrors?.firstName ? (
                            <p className="error-message" role="alert" id="firstName-error">
                                {actionData?.fieldErrors?.firstName}
                            </p>
                        ) : null}
                    </div>
                ) : null}
                <div className="form-input">
                    <label htmlFor="email-input">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email-input"
                        defaultValue={actionData?.fields?.email}
                        aria-invalid={Boolean(actionData?.fieldErrors?.email)}
                        aria-describedby={actionData?.fieldErrors?.email ? "email-error" : undefined}
                    />
                    {actionData?.fieldErrors?.email ? (
                        <p className="error-message" role="alert" id="email-error">
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
                        <p className="error-message" role="alert" id="password-error">
                            {actionData?.fieldErrors?.password}
                        </p>
                    ) : null}
                </div>
                <div id="form-error-message">
                    {actionData?.formError ? (
                        <p className="error-message" role="alert">
                            {actionData?.formError}
                        </p>
                    ) : null}
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

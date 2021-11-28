import { ActionFunction, useActionData, useSearchParams, LinksFunction } from "remix";
import FormContainer from "~/components/FormContainer";
import FormErrorMessage from "~/components/FormErrorMessage";
import { FormInput } from "~/components/FormInput";
import FormLabel from "~/components/FormLabel";
import FormLabeledInput from "~/components/FormLabeledInput";
import FormSubmitButton from "~/components/FormSubmitButton";
import { createUserSession, login, signUp } from "~/utils/session.server";

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
        <FormContainer className="max-w-lg mx-auto my-12">
            <h2 className="text-2xl font-bold text-center">Login or Sign Up</h2>
            <hr className="my-5 dark:border-gray-600" />
            <form
                method="post"
                className="login-form"
                aria-describedby={actionData?.formError ? "form-error-message" : undefined}
            >
                <input type="hidden" name="redirectTo" value={searchParams.get("redirectTo") ?? "/now-reading"} />
                <fieldset className="flex gap-8 justify-center my-3">
                    <legend className="sr-only">Login or Sign Up?</legend>
                    <FormLabel>
                        <input
                            type="radio"
                            name="loginType"
                            value="login"
                            defaultChecked={!actionData?.fields?.loginType || actionData.fields.loginType === "login"}
                        />{" "}
                        Login
                    </FormLabel>
                    <FormLabel>
                        <input
                            type="radio"
                            name="loginType"
                            value="signUp"
                            defaultChecked={actionData?.fields?.loginType === "signUp"}
                        />{" "}
                        Sign Up
                    </FormLabel>
                </fieldset>
                <FormLabeledInput>
                    <FormLabel htmlFor="email-input">Email</FormLabel>
                    <FormInput
                        type="email"
                        name="email"
                        id="email-input"
                        defaultValue={actionData?.fields?.email}
                        aria-invalid={Boolean(actionData?.fieldErrors?.email)}
                        aria-describedby={actionData?.fieldErrors?.email ? "email-error" : undefined}
                    />
                    {actionData?.fieldErrors?.email ? (
                        <FormErrorMessage role="alert" id="email-error">
                            {actionData?.fieldErrors?.email}
                        </FormErrorMessage>
                    ) : null}
                </FormLabeledInput>
                <FormLabeledInput>
                    <FormLabel htmlFor="password-input">Password</FormLabel>
                    <FormInput
                        type="password"
                        name="password"
                        id="password-input"
                        defaultValue={actionData?.fields?.password}
                        aria-invalid={Boolean(actionData?.fieldErrors?.password)}
                        aria-describedby={actionData?.fieldErrors?.password ? "password-error" : undefined}
                    />
                    {actionData?.fieldErrors?.password ? (
                        <FormErrorMessage role="alert" id="password-error">
                            {actionData?.fieldErrors?.password}
                        </FormErrorMessage>
                    ) : null}
                </FormLabeledInput>
                <div id="form-error-message">
                    {actionData?.formError ? (
                        <FormErrorMessage role="alert">{actionData?.formError}</FormErrorMessage>
                    ) : null}
                </div>
                <FormSubmitButton className="mt-3">Submit</FormSubmitButton>
            </form>
        </FormContainer>
    );
}

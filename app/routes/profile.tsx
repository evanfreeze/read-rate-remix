import { User } from ".prisma/client";
import { useLoaderData, LoaderFunction } from "remix";
import { getUser, requireUserId } from "~/utils/session.server";
import { formatDistance } from "date-fns";

type LoaderData = {
    user: User | null;
};

export const loader: LoaderFunction = async ({ request }): Promise<LoaderData> => {
    await requireUserId(request, "/profile");
    const user = await getUser(request);
    return { user };
};

export default function Profile() {
    const data = useLoaderData<LoaderData>();

    return (
        <div>
            <h1>Profile</h1>
            {data.user ? (
                <div>
                    <p>{data.user.email}</p>
                    <p>Joined {formatDistance(new Date(data.user.createdAt), new Date(), { addSuffix: true })}</p>
                    <form action="/logout" method="post">
                        <button type="submit">Logout</button>
                    </form>
                </div>
            ) : null}
        </div>
    );
}

import { useSearchParams } from "react-router-dom";

export default function Login() {
    const [searchParams, ] = useSearchParams();

    return (
        <div>
            <a href="/oauth2/authorization/keycloak">Login with keycloak</a>

            {searchParams.has("error") && 
                <div>Login error</div>
            }
        </div>
    )
}
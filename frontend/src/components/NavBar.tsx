import { CSRF_TOKEN_HEADER_NAME, GATEWAY_BASE_URL } from "@/utils/constants";
import { retrieveCsrfTokenCookieValue } from "@/utils/utils";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const componentName = "NavBar";

    const navigate = useNavigate();

    async function logout(): Promise<void> {
        const csrfToken = await retrieveCsrfTokenCookieValue() ?? ""; 
        
        const response = await fetch(`${GATEWAY_BASE_URL}/logout`, {
            method: "post",
            credentials: 'include',
            headers: {
                [CSRF_TOKEN_HEADER_NAME]: csrfToken
            }  
        });

        console.log("logout: ", response);
        // make spring redirect user to login page
        // window.location.reload();
        // navigate("/login");
    }
    
    return (
        <div className={`${componentName} d-flex`}>
            <div className="col-4 d-flex justify-content-start">left</div>

            <div className="col-4 d-flex justify-content-center">
                <Link className="me-2" to={"/"} >Home</Link>
                <Link className="me-2" to={"/map"} >Map</Link>
                <Link className="me-2" to={"/login"} >Login</Link>
            </div>

            <div className="col-4 d-flex justify-content-end">
                <button
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}
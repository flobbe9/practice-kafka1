import { CSRF_TOKEN_HEADER_NAME } from "@/utils/constants";
import { retrieveCsrfTokenCookieValue } from "@/utils/utils";

export default function Navbar() {
    const componentName = "NavBar";

    async function logout(): Promise<void> {
        const csrfToken = await retrieveCsrfTokenCookieValue() ?? ""; 
        
        const response = await fetch("http://localhost/logout", {
            method: "post",
            credentials: 'include',
            headers: {
                [CSRF_TOKEN_HEADER_NAME]: csrfToken
            }  
        });

        console.log("logout: ", response);
        // make spring redirect user to login page
        // window.location.reload();
    }
    
    return (
        <div className={`${componentName} d-flex`}>
            <div className="col-6 d-flex justify-content-start">left</div>
            <div className="col-6 d-flex justify-content-end">
                <button
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}
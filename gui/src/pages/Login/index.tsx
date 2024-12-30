import { useContext } from "react";
import { IdeMessenger, IdeMessengerContext } from "../../context/IdeMessenger"
import { setLocalStorage } from "../../util/localStorage";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../util/navigation";

const Login = () => {
    const ideMessenger = useContext(IdeMessengerContext);
    const navigate = useNavigate()
    const login = async () => {
        const res = await ideMessenger.request('hipilot/login', undefined)
        console.log(res)
        setLocalStorage('hipilotProfile', res as any)
        navigate(ROUTES.HOME)
    }
    return <div className='flex flex-col items-center justify-center px-2 py-4 text-center sm:px-8'>
        <div className="cursor-pointer" onClick={login}>登陆</div>
    </div>
}

export default Login
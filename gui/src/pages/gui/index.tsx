import { useNavigate } from "react-router-dom";
import { History } from "../../components/History";
import { Chat } from "./Chat";
import { getLocalStorage, setLocalStorage } from "../../util/localStorage";
import { useContext, useEffect } from "react";
import { IdeMessengerContext } from "../../context/IdeMessenger";

export default function GUI() {
  const ideMessenger = useContext(IdeMessengerContext);
  const login = async () => {
    const res = await ideMessenger.request('hipilot/login', undefined)
    if (res.status === 'success') {
      setLocalStorage('hipilotProfile', res.content)
    }
  }
  useEffect(() => {
    login()
  }, [])
  return (
    <div className="flex overflow-hidden">
      <aside className="4xl:block border-vsc-input-border no-scrollbar hidden w-96 overflow-y-auto border-0 border-r border-solid">
        <History />
      </aside>
      <main className="no-scrollbar flex flex-1 flex-col overflow-y-auto">
        <Chat />
      </main>
    </div>
  );
}

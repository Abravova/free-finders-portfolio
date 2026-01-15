import { useAtom } from "jotai";
import { expirationAtom, INVALID_TOKEN, tokenAtom } from "./api";

export function useIsLoggedIn() {
  const [token] = useAtom(tokenAtom);
  const [expiration] = useAtom(expirationAtom);
  return token !== INVALID_TOKEN && expiration > Date.now();
}

export function useLogout() {
  const [, setToken] = useAtom(tokenAtom);
  const [, setExpiration] = useAtom(expirationAtom);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    setToken(INVALID_TOKEN);
    setExpiration(0);
  };

  return logout;
}

/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useReducer } from "react";
import { useCities } from "./citiesContext";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "login":
      return { user: action.payload, isAuthenticated: true };

    case "logout":
      return initialState;

    default:
      throw new Error("Unknown Action");
  }
}

const FAKE_USER = {
  name: "Jack",
  email: "jack@example.com",
  password: "qwerty",
  avatar: "https://i.pravatar.cc/100?u=zz",
};

const AuthProvider = ({ children }) => {
  const [{ user, isAuthenticated }, dispatch] = useReducer(
    reducer,
    initialState
  );
  const { createAlert } = useCities();

  function login(email, password) {
    if (FAKE_USER.email !== email || FAKE_USER.password !== password) {
      createAlert("worng email or Password", "error");
      return false;
    }
    dispatch({ type: "login", payload: FAKE_USER });
    createAlert("Login successfully", "success");
    return true;
  }
  function logout() {
    dispatch({ type: "logout" });
    createAlert("see you soon ❤️");
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("Auth Context was used outside the provider");

  return context;
}

export { AuthProvider, useAuth };

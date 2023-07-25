import "bootstrap/dist/css/bootstrap.min.css";
import jwt_decode from "jwt-decode";
import { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TaxRiseAPI from "./Api";
import "./App.css";
import Context from "./UserContext.js";
import AlertMessage from "./components/AlertMessage";
import NavigationBar from "./components/NavigationBar.js";
import useLocalStorage from "./hooks/useLocalStorageHook";
import CreateTaskPage from "./pages/CreateTaskPage";
import LoginPage from "./pages/LoginPage.js";
import NotFoundPage from "./pages/NotFoundPage";
import SignupPage from "./pages/SignupPage.js";
import TasksPage from "./pages/TasksPage";
import PrivateRoutes from "./utils/PrivateRoutes";

function App() {
  const [token, setToken] = useLocalStorage("token");
  console.log("🚀 ~ file: App.js:21 ~ App ~ token:", token);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [infoLoaded, setInfoLoaded] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(
    function loadUserInfo() {
      console.debug("App useEffect loadUserInfo", "token=", token);

      async function getLoggedInUser() {
        console.log("token 31", token);
        if (token) {
          try {
            let { username } = jwt_decode(token);

            // put the token on the Api class so it can use it to call the API.
            TaxRiseAPI.token = token;

            let currentUser = await TaxRiseAPI.getLoggedInUser(username);
            console.log(
              "🚀 ~ file: App.js:40 ~ getLoggedInUser ~ currentUser:",
              currentUser
            );

            setLoggedInUser(currentUser);
          } catch (err) {
            console.error("App loadUserInfo: problem loading", err);
            setLoggedInUser(null);
          }
        }
        setInfoLoaded(true);
      }

      // set infoLoaded to false while async getLoggedInUser runs; once the
      // data is fetched (or even if an error happens!), this will be set back
      // to false to control the spinner.
      setInfoLoaded(false);
      getLoggedInUser();
    },
    [token]
  );

  // Handles site-wide login
  async function login(enteredUsername, enteredPassword) {
    try {

      setBtnLoading(true);
      setAlert(null);

      console.log("asdfasdfasd");

      let loginToken = await TaxRiseAPI.login({
        username: enteredUsername,
        password: enteredPassword,
      });
      console.log("🚀 ~ file: App.js:69 ~ login ~ loginToken:", loginToken);
      setBtnLoading(false);

      setToken(loginToken);

      localStorage.setItem("token", JSON.stringify(loginToken));
    } catch (error) {
      console.log("🚀 ~ file: App.js:93 ~ login ~ error:", error)
      setBtnLoading(false);

      setAlert({
        alertType: "danger",
        message: error.message || "Error Logging in",
      });
    }
  }

  // Handles site-wide logout
  function logout() {
    setLoggedInUser(null);
    setToken(null);
  }

  async function signup(username, password, isClient, selectedClients) {
    try {
      console.log(
        "🚀 ~ file: App.js:80 ~ signup ~ username, password, isClient:",
        username,
        password,
        isClient
      );
      setBtnLoading(true);

      setAlert(null);
      let token = await TaxRiseAPI.signup({ username, password, isClient });
      console.log("🚀 ~ file: App.js:85 ~ signup ~ token:", token);
      setBtnLoading(false);

      setToken(token);
    } catch (error) {
      console.log("🚀 ~ file: App.js:126 ~ signup ~ error:", error)
      setBtnLoading(false);

      setAlert({
        alertType: "danger",
        message: error.message || "Error Signing up",
      });
    }
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Context.Provider
          value={{
            loggedInUser,
            login,
            logout,
            token,
            setAlert,
            signup,
            btnLoading,
            setBtnLoading,
          }}
        >
          <NavigationBar />
          <header className="App-header">
            {alert ? <AlertMessage alert={alert} /> : null}
            {!infoLoaded ? (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            ) : (
              <Routes>
                <Route exact path="/login" element={<LoginPage />}></Route>
                <Route exact path="/signup" element={<SignupPage />}></Route>

                <Route element={<PrivateRoutes />}>
                  {/* <Route element={<TaskDetailsPage />}></Route> */}
                  <Route path="/tasks" element={<TasksPage />}></Route>
                  <Route
                    path="/create-task"
                    element={<CreateTaskPage />}
                  ></Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            )}
          </header>
        </Context.Provider>
      </div>
    </BrowserRouter>
  );
}

export default App;

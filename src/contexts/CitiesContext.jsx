/* eslint-disable react/prop-types */
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useState,
} from "react";
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

const CitiesContext = createContext();

const BASE_URL = "http://localhost:8000/cities";

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CitiesProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");

  function createAlert(message, type = "info") {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await fetch(BASE_URL);
        const data = await res.json();
        setData(data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  async function getCity(id) {
    if (+id === currentCity.id) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/${id}`);
      const data = await res.json();
      setCurrentCity(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createCity(city) {
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}`, {
        method: "POST",
        body: JSON.stringify(city),
        headers: {
          "Content-type": "application/json",
        },
      });
      const data = await res.json();
      setData((cities) => [...cities, data]);
      setCurrentCity(data);
      createAlert("Added successfully", "success");
    } catch (error) {
      console.error(error.message);
      createAlert("Something went wrong..", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCity(id) {
    try {
      setIsLoading(true);
      await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
      });
      setData((cities) => cities.filter((city) => city.id !== id));
      createAlert("Deleted Successfully");
    } catch (error) {
      console.error(error.message);
      createAlert("Something went wrong..", "error");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <CitiesContext.Provider
      value={{
        cities: data,
        isLoading,
        currentCity,
        getCity,
        createCity,
        createAlert,
        deleteCity,
      }}
    >
      {children}
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity={alertType}
          sx={{ width: "400px", fontSize: "2rem" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </CitiesContext.Provider>
  );
};

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("can't use Context outside thir provider");

  return context;
}

export { CitiesProvider, useCities };

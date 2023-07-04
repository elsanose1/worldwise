// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { forwardRef, useEffect, useState } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Message from "./Message";
import Spinner from "./Spinner";
import { useCities } from "../contexts/citiesContext";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  const { createCity, isLoading, createAlert } = useCities();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [date, setDate] = useState();
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState("");
  const [lat, lng] = useUrlPosition();
  const [geoLocationError, setGeoLocationError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!lng || !lat) return;
    async function fetchCityData() {
      try {
        setIsFetchLoading(true);
        setGeoLocationError("");
        const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`);
        const data = await res.json();
        if (!data.countryCode)
          throw new Error(
            "That dosen't seem to be a city. Click   somewhere else 😥"
          );
        setCityName(data.city || data.locality || "");
        setCountry(data.countryName);
        setEmoji(data.countryCode);
      } catch (error) {
        console.log(error);
        setGeoLocationError(error.message);
      } finally {
        setIsFetchLoading(false);
      }
    }
    fetchCityData();
  }, [lat, lng]);

  function submitHandler(e) {
    e.preventDefault();
    if (!date || !cityName) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };

    createCity(newCity).then(() => navigate("/app"));
  }

  if (geoLocationError) return <Message message={geoLocationError} />;
  if (!lng || !lat)
    return <Message message={"Start by clicking somewhere on the map"} />;
  if (isFetchLoading) return <Spinner />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={submitHandler}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <input
          id="date"
          type="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;

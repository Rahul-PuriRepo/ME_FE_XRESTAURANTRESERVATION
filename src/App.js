import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const API_BASE = "https://restaurantdata.onrender.com";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="brand" onClick={() => navigate("/")}>
        <span className="brand-icon">🍽️</span>
        <span>Restaurant Reservation</span>
      </div>

      <button className="bookings-link" onClick={() => navigate("/my-bookings")}>
        My Bookings
      </button>
    </nav>
  );
}

function LocationSearch({ onSearch }) {
  const [states, setStates] = useState(["Texas", "California", "New York"]);
  const [cities, setCities] = useState(["Austin"]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE}/states`)
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          const values = response.data.map((item) =>
            typeof item === "string"
              ? item
              : item.state || item.name || item.stateName
          ).filter(Boolean);

          if (values.length > 0) {
            setStates(values);
          }
        }
      })
      .catch(() => {
        // Fallback values keep the search usable if the API is sleeping.
      });
  }, []);

  useEffect(() => {
    if (!selectedState) return;

    setLoadingCities(true);

    axios
      .get(`${API_BASE}/cities/${encodeURIComponent(selectedState)}`)
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          const values = response.data.map((item) =>
            typeof item === "string"
              ? item
              : item.city || item.name || item.cityName
          ).filter(Boolean);

          if (values.length > 0) {
            setCities(values);
          }
        }
      })
      .catch(() => {
        if (selectedState === "Texas") {
          setCities(["Austin"]);
        } else {
          setCities([]);
        }
      })
      .finally(() => setLoadingCities(false));
  }, [selectedState]);

  const chooseState = (state) => {
    setSelectedState(state);
    setSelectedCity("");
    setStateOpen(false);

    if (state === "Texas") {
      setCities(["Austin"]);
    } else {
      setCities([]);
    }
  };

  const chooseCity = (city) => {
    setSelectedCity(city);
    setCityOpen(false);
  };

  const submitSearch = (event) => {
    event.preventDefault();

    if (selectedState && selectedCity) {
      onSearch(selectedState, selectedCity);
    }
  };

  return (
    <form className="location-search" onSubmit={submitSearch}>
      <div
        id="state"
        className="select-container"
        onClick={() => {
          setStateOpen(!stateOpen);
          setCityOpen(false);
        }}
      >
        <span className={selectedState ? "selected" : "placeholder"}>
          {selectedState || "Select State"}
        </span>
        <span>⌄</span>

        {stateOpen && (
          <ul className="dropdown">
            {states.map((state) => (
              <li
                key={state}
                onClick={(event) => {
                  event.stopPropagation();
                  chooseState(state);
                }}
              >
                {state}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        id="city"
        className={`select-container ${!selectedState ? "disabled" : ""}`}
        onClick={() => {
          if (selectedState) {
            setCityOpen(!cityOpen);
            setStateOpen(false);
          }
        }}
      >
        <span className={selectedCity ? "selected" : "placeholder"}>
          {loadingCities ? "Loading cities..." : selectedCity || "Select City"}
        </span>
        <span>⌄</span>

        {cityOpen && selectedState && (
          <ul className="dropdown">
            {cities.map((city) => (
              <li
                key={city}
                onClick={(event) => {
                  event.stopPropagation();
                  chooseCity(city);
                }}
              >
                {city}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button id="searchBtn" type="submit" className="search-button">
        Search
      </button>
    </form>
  );
}

function Home({ onSearch }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">DISCOVER • DINE • RESERVE</p>
          <h1>Find your perfect restaurant</h1>
          <p className="hero-text">
            Discover great restaurants around you and reserve your table in
            just a few clicks.
          </p>

          <LocationSearch onSearch={onSearch} />
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">📍</div>
          <h2>Find nearby restaurants</h2>
          <p>Search restaurants by state and city.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">📅</div>
          <h2>Reserve your table</h2>
          <p>Choose your preferred date and time.</p>
        </div>

        <div className="feature">
          <div className="feature-icon">✓</div>
          <h2>Easy reservations</h2>
          <p>Keep all your reservations in one place.</p>
        </div>
      </section>
    </main>
  );
}

function BookingPanel({ restaurant, onClose }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const saveBooking = () => {
    if (!selectedDate || !selectedTime || !email) {
      alert("Please select a date, time and enter your email.");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("bookings") || "[]");

    const booking = {
      ...restaurant,
      bookingDate: selectedDate,
      bookingTime: selectedTime,
      bookingEmail: email,
    };

    localStorage.setItem("bookings", JSON.stringify([...existing, booking]));

    alert("Reservation confirmed!");
    onClose();
    navigate("/my-bookings");
  };

  return (
    <div className="modal-backdrop">
      <div className="booking-panel">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <h2>Reserve your table</h2>
        <h3>{restaurant.restaurantName}</h3>
        <p>{restaurant.address}</p>

        <div className="booking-section">
          <h4>Select a date</h4>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>

        <div className="booking-section">
          <h4>Select a time</h4>

          <div className="time-periods">
            <p>Today</p>
            <p>Morning</p>
            <p>Afternoon</p>
            <p>Evening</p>
          </div>

          <div className="time-buttons">
            {["10:00 AM", "12:30 PM", "6:00 PM", "8:00 PM"].map((time) => (
              <button
                key={time}
                className={selectedTime === time ? "time selected-time" : "time"}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="booking-section">
          <h4>Email</h4>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <button className="confirm-button" onClick={saveBooking}>
          Confirm Reservation
        </button>
      </div>
    </div>
  );
}

function SearchResults({ state, city }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingRestaurant, setBookingRestaurant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    axios
      .get(
        `${API_BASE}/restaurants?state=${encodeURIComponent(
          state
        )}&city=${encodeURIComponent(city)}`
      )
      .then((response) => {
        setRestaurants(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        setRestaurants([]);
      })
      .finally(() => setLoading(false));
  }, [state, city]);

  return (
    <main className="results-page">
      <div className="results-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back
        </button>

        <h1>
          {restaurants.length} restaurants available in {city}
        </h1>
        <p>
          Showing restaurants available for reservation in {city}, {state}.
        </p>
      </div>

      {loading ? (
        <div className="loading">Finding restaurants...</div>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((restaurant, index) => (
            <article className="restaurant-card" key={`${restaurant.restaurantName}-${index}`}>
              <div className="restaurant-image">
                <span>🍴</span>
              </div>

              <div className="restaurant-content">
                <h3>{restaurant.restaurantName}</h3>

                <div className="rating">
                  ★ {restaurant.rating}
                </div>

                <p className="address">{restaurant.address}</p>

                <p className="location">
                  {restaurant.city}, {restaurant.state}
                </p>

                <button
                  className="reservation-button"
                  onClick={() => setBookingRestaurant(restaurant)}
                >
                  Book FREE Reservation
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && restaurants.length === 0 && (
        <div className="empty-state">
          No restaurants found for this location.
        </div>
      )}

      {bookingRestaurant && (
        <BookingPanel
          restaurant={bookingRestaurant}
          onClose={() => setBookingRestaurant(null)}
        />
      )}
    </main>
  );
}

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(stored);
  }, []);

  return (
    <main className="bookings-page">
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="empty-bookings">
          <div className="empty-icon">📅</div>
          <h2>No bookings yet</h2>
          <p>Your restaurant reservations will appear here.</p>
        </div>
      ) : (
        <div className="booking-list">
          {bookings.map((booking, index) => (
            <article className="booking-card" key={`${booking.restaurantName}-${index}`}>
              <div>
                <h3>{booking.restaurantName}</h3>
                <p>★ {booking.rating}</p>
                <p>{booking.address}</p>
                <p>
                  {booking.city}, {booking.state}
                </p>
              </div>

              <div className="booking-info">
                <strong>Reservation</strong>
                <p>
                  {booking.bookingDate
                    ? new Date(booking.bookingDate).toLocaleDateString()
                    : ""}
                </p>
                <p>{booking.bookingTime}</p>
                <p>{booking.bookingEmail}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function AppContent() {
  const [search, setSearch] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (state, city) => {
    setSearch({ state, city });
    navigate(`/search?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`);
  };

  const params = new URLSearchParams(window.location.search);

  useEffect(() => {
    const state = params.get("state");
    const city = params.get("city");

    if (window.location.pathname === "/search" && state && city) {
      setSearch({ state, city });
    }
  }, []);

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home onSearch={handleSearch} />} />

        <Route
          path="/search"
          element={
            search ? (
              <SearchResults state={search.state} city={search.city} />
            ) : (
              <Home onSearch={handleSearch} />
            )
          }
        />

        <Route path="/my-bookings" element={<MyBookings />} />

        <Route path="*" element={<Home onSearch={handleSearch} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

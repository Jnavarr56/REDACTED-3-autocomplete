import React, { useEffect, useState } from "react";
import { useTrail, animated, config } from "react-spring";
import ParticleEffectButton from "react-particle-effect-button";
import Ripples from "react-ripples";
import Loader from "react-spinners/RingLoader";

import axios from "axios";
import "./App.css";

const DEBOUNCE_MS = 100;
const API_URL = "https://www.teepublic.com";

axios.defaults.method = "get";
axios.defaults.headers = { Accept: "application/json" };
axios.defaults.baseURL = API_URL;

const App = () => {
  const [query, setQuery] = useState("");
  const [touched, setTouched] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!touched) return;
    clearTimeout(window.scheduledRequest);

    if (query === "") {
      setSuggestions([]);
      setFetching(false);
    } else {
      setFetching(true);
      const params = { limit: 6, prefix: query };
      window.scheduledRequest = setTimeout(() => {
        axios({ url: "/search/autocomplete", params })
          .then(({ data }) => {
            setSuggestions(data.suggestions);
            setFetching(false);
          })
          .catch((error) => alert(error.toString()));
      }, DEBOUNCE_MS);
    }
    // eslint-disable-next-line
  }, [query]);

  const renderedSuggestions = (
    <div className={"suggestions"}>
      {(() => {
        if (query === "") {
          return null;
        } else if (fetching) {
          return <Loader size={250} color="#00caff" />;
        } else if (suggestions.length === 0) {
          return <h1>no suggestions!</h1>;
        } else {
          return <Suggestions suggestions={suggestions} />;
        }
      })()}
    </div>
  );

  return (
    <div className="App">
      {query === "" && <h1>TeePublic AutoComplete</h1>}
      <input
        value={query}
        onChange={(e) => {
          const { value } = e.target;
          if (Boolean(value) && !value.match(/^[0-9a-zA-Z ]+$/)) return;
          setTouched(true);
          setQuery(value);
        }}
      />
      {renderedSuggestions}
    </div>
  );
};

const Suggestions = ({ suggestions }) => {
  const [clicked, setClicked] = useState(null);
  const trailAnimationProps = useTrail(suggestions.length, {
    from: { opacity: 0, transform: "translateY(100%)", filter: "blur(5px)" },
    to: { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
    config: config.stiff,
  });
  return (
    <ul>
      {suggestions.map((s, i) => (
        <animated.li key={s.suggestion} style={trailAnimationProps[i]}>
          <ParticleEffectButton
            type="rectangle"
            color="#43E8D8"
            speed={4}
            hidden={clicked === null ? false : clicked !== i}
          >
            <Ripples
              onClick={() => {
                setClicked(i);
                setTimeout(() => {
                  window
                    .open(
                      `${API_URL}/t-shirts?${s.type}=${s.suggestion.replace(
                        / /g,
                        "-"
                      )}`,
                      "_blank"
                    )
                    .focus();
                }, 1250);
              }}
            >
              <button className={"cool-button"}>{s.suggestion}</button>
            </Ripples>
          </ParticleEffectButton>
        </animated.li>
      ))}
    </ul>
  );
};

export default App;

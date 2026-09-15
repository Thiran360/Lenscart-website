import { useRef } from "react";
import ReactPhoneInputRaw from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./CustomPhoneInput.css";

const PhoneInput = ReactPhoneInputRaw?.default || ReactPhoneInputRaw;

function CustomPhoneInput({ value, onChange, defaultCountry = "in" }) {
  const previousCountryRef = useRef(defaultCountry);

  const handleChange = (phoneVal, countryData = {}) => {
    const currentCountry = countryData?.countryCode || defaultCountry;

    // Clear typed number when user switches country
    if (previousCountryRef.current && previousCountryRef.current !== currentCountry) {
      previousCountryRef.current = currentCountry;
      onChange("", countryData);
    } else {
      previousCountryRef.current = currentCountry;
      onChange(phoneVal, countryData);
    }
  };

  return (
    <div className="react-phone-input-wrapper">
      <PhoneInput
        country={defaultCountry}
        value={value}
        onChange={handleChange}
        enableSearch={true}
        searchPlaceholder="Search country..."
        searchNotFound="No country found"
        countryCodeEditable={false}
        containerClass="react-phone-input-container"
        inputClass="react-phone-input-field"
        buttonClass="react-phone-input-button"
        dropdownClass="react-phone-input-dropdown"
        searchClass="react-phone-input-search"
      />
    </div>
  );
}

export default CustomPhoneInput;

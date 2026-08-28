import axios from "axios";
import { BASE_API_URL } from "./api";

export const getToken = () => localStorage.getItem("user_token");

export const updateProfileApi = async (profileData) => {
  const token = getToken();

  const response = await axios.put(
    `${BASE_API_URL}/profile/`,
    profileData,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "user-token": token
      }
    }
  );
  return response.data;
};

export const saveAddressApi = async (addressData) => {
  const token = getToken();

  const response = await axios.post(
    `${BASE_API_URL}/address/save/`,
    addressData,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "user-token": token
      }
    }
  );
  return response.data;
};

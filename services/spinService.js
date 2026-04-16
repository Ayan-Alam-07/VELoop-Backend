import axios from "axios";

export const getSpinDetails = async () => {
  const { data } = await axios.get("/api/spin/details");
  return data;
};

export const watchSpinAd = async () => {
  const { data } = await axios.post("/api/spin/watch-ad");
  return data;
};

export const playSpin = async () => {
  const { data } = await axios.post("/api/spin/play");
  return data;
};

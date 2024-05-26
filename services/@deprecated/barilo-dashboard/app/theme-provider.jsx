"use client"
import store from "../store";
import { Provider } from "react-redux";
const ThemeProvider = ({ children }) => {
  return (
    <>
      <Provider store={store}>
        {children}
      </Provider>
    </>
  );
};

export default ThemeProvider;
import { createContext, useContext, useEffect, useState } from "react";
import z from "zod";

// import cookies
import { parseCookies } from "nookies";

type CartContext = {
  items: string[];
};

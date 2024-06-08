"use server";

import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies } from "nookies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    console.log("GET request received", parseCookies({ req }));
    res.status(200).json({ message: "Hello from API route" });
  }

  if (req.method === "POST") {
    console.log("POST request received", req.body, parseCookies({ req }));
    res.status(201).json({ message: "created" });
  }
}

import { Request, Response } from "express";
import fetch from "node-fetch";

const sendSmsInternal = async (numbers: string, message: string) => {
  try {
    //   created this method separetly to use this function internally in backend server
    //   construct api for with required query params
    const api = `https://www.fast2sms.com/dev/bulkV2?authorization=${
      process.env.API_KEY_FAST2SMS
    }&route=q&message=${encodeURIComponent(
      message as string
    )}&language=english&flash=0&numbers=${encodeURIComponent(
      numbers as string
    )}`;

    const response = await fetch(api, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });
    const messageResponse = await response.json();
    return Promise.resolve(messageResponse);
  } catch (error) {
    return Promise.reject(error);
  }
};

const sendSms = async (req: Request, res: Response) => {
  try {
    // numbers can have multiple numbers like ex : "9876544210,9876552311"
    const { numbers, message } = req.query;
    const response = await sendSmsInternal(
      numbers as string,
      message as string
    );
    console.log(response);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);

    res.status(500).json(error.message);
  }
};

export { sendSms,sendSmsInternal };

import axios from "axios";

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (payload: SendEmailPayload): Promise<void> => {
  try {
    await axios.post("/api/send-email", {
      from: "no-reply@yourdomain.com",
      to: payload.to,
      subject: payload.subject,
      body: payload.body,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

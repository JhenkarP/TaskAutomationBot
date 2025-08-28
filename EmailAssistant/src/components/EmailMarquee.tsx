// TaskAutomationBots/EmailAssistant/src/components/EmailMarquee.tsx
import React, { useState } from "react";
import { cn } from "../lib/utils";
import EmailModal from "./EmailModal";
import "../styles/Marquee.css";

export interface EmailType {
  id: string;
  subject?: string;
  summary?: string;
  company?: string;
  deadline?: string | null;
  sender_name?: string;
  sender_email?: string;
}

interface EmailCardProps {
  email: EmailType;
  onClick?: (email: EmailType) => void;
}

const EmailCard = ({ email, onClick }: EmailCardProps) => (
  <figure
    onClick={() => onClick?.(email)}
    className={cn(
      "flex-none cursor-pointer rounded-md p-4 min-w-[220px] transition-transform duration-200 hover:scale-105",
      "bg-white shadow-sm text-gray-800"
    )}
  >
    <strong className="block text-sm font-semibold mb-1">{email.subject || "-"}</strong>
    <p className="text-xs text-gray-600">{email.sender_name || "-"} ({email.sender_email || "-"})</p>
    {email.company && <p className="text-xs text-gray-500">{email.company}</p>}
    {email.deadline && <p className="text-xs text-red-500 mt-1">Deadline: {new Date(email.deadline).toLocaleDateString()}</p>}
  </figure>
);

interface EmailMarqueeProps {
  emails: EmailType[];
  height?: string;
}

export const EmailMarquee: React.FC<EmailMarqueeProps> = ({ emails, height = "h-68" }) => {
  const [modalEmail, setModalEmail] = useState<EmailType | null>(null);

  const firstRow = emails.slice(0, Math.ceil(emails.length / 2));
  const secondRow = emails.slice(Math.ceil(emails.length / 2));

  return (
    <>
      <div className={cn("flex flex-col gap-4 overflow-hidden", height)}>
        <div className="relative w-full rounded-md bg-gray-50 overflow-hidden h-34">
          <div className="inline-flex gap-4 animate-marquee hover:pause-scroll px-3 py-3">
            {firstRow.concat(firstRow).map((email, idx) => (
              <EmailCard key={email.id + "-" + idx} email={email} onClick={setModalEmail} />
            ))}
          </div>
        </div>

        <div className="relative w-full rounded-md bg-gray-50 overflow-hidden h-34">
          <div className="inline-flex gap-4 animate-marquee-reverse hover:pause-scroll px-3 py-3">
            {secondRow.concat(secondRow).map((email, idx) => (
              <EmailCard key={email.id + "-" + idx} email={email} onClick={setModalEmail} />
            ))}
          </div>
        </div>
      </div>

      {modalEmail && <EmailModal email={modalEmail} onClose={() => setModalEmail(null)} />}
    </>
  );
};

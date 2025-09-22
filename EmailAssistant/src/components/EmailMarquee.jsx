// TaskAutomationBots/EmailAssistant/src/components/EmailMarquee.jsx
import React, { useState } from "react";
import EmailModal from "./EmailModal";
import { cn } from "../lib/utils";
import "../styles/Marquee.css";

// Enhanced score color helper
const getScoreColor = (score) => {
  if (!score) return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
  if (score >= 80) return { bg: "bg-red-50", text: "text-red-800", border: "border-red-300" };
  if (score >= 60) return { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-300" };
  if (score >= 40) return { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-300" };
  return { bg: "bg-green-50", text: "text-green-800", border: "border-green-300" };
};

const EmailCard = ({ email, onClick }) => {
  const color = getScoreColor(email.score || 0);

  return (
    <figure
      onClick={() => onClick?.(email)}
      className={cn(
        "flex-none cursor-pointer rounded-2xl p-4 min-w-[220px] transition-transform duration-200 hover:scale-105 border shadow-sm hover:shadow-lg",
        color.bg,
        color.border
      )}
    >
      {/* Header: Subject + Score */}
      <div className="flex items-start justify-between mb-2">
        <strong className={cn("text-sm md:text-base font-semibold leading-snug", color.text)}>
          {email.subject || "-"}
        </strong>
        {email.score !== undefined && (
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-bold shadow-sm",
              color.text,
              "bg-white/40 backdrop-blur-sm"
            )}
          >
            {email.score}
          </span>
        )}
      </div>

      {/* Sender Info */}
      <div className="text-xs md:text-sm text-gray-600 mb-1">
        <span className="font-medium">{email.sender_name || "-"}</span> ({email.sender_email || "-"})
      </div>

      {/* Company */}
      {email.company && (
        <div className="text-xs md:text-sm text-gray-500 mb-1 font-medium truncate">
          🏢 {email.company}
        </div>
      )}

      {/* Deadline */}
      {email.deadline && (
        <div className="mt-1 text-xs md:text-sm text-red-600 font-semibold flex items-center gap-1">
          ⏰ Deadline: {new Date(email.deadline).toLocaleDateString()}
        </div>
      )}
    </figure>
  );
};

export const EmailMarquee = ({ emails, height = "h-68" }) => {
  const [modalEmail, setModalEmail] = useState(null);

  const firstRow = emails.slice(0, Math.ceil(emails.length / 2));
  const secondRow = emails.slice(Math.ceil(emails.length / 2));

  return (
    <>
      <div className={cn("flex flex-col gap-4 overflow-hidden", height)}>
        {/* First Row */}
        <div className="relative w-full rounded-2xl bg-gray-50 overflow-hidden h-34 shadow-inner hover:shadow-lg transition-shadow duration-200">
          <div className="inline-flex gap-4 animate-marquee hover:pause-scroll px-3 py-3">
            {firstRow.concat(firstRow).map((email, idx) => (
              <EmailCard key={email.id + "-" + idx} email={email} onClick={setModalEmail} />
            ))}
          </div>
        </div>

        {/* Second Row */}
        <div className="relative w-full rounded-2xl bg-gray-50 overflow-hidden h-34 shadow-inner hover:shadow-lg transition-shadow duration-200">
          <div className="inline-flex gap-4 animate-marquee-reverse hover:pause-scroll px-3 py-3">
            {secondRow.concat(secondRow).map((email, idx) => (
              <EmailCard key={email.id + "-" + idx} email={email} onClick={setModalEmail} />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalEmail && (
        <EmailModal
          email={modalEmail}
          onClose={() => setModalEmail(null)}
          // Optional: pass save, pin, or deadline handlers here
        />
      )}
    </>
  );
};

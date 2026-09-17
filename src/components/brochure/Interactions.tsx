"use client";


import { useState, type Dispatch, type SetStateAction } from "react";

import type { MemorialInteractions } from "@/types/interactions";
import { useSearchParams } from "next/navigation";

type MessageType = "condolence" | "tribute";

type Props = {
  interactions: MemorialInteractions;
  name: string;
  message: string;
  messageType: MessageType;
  setName: Dispatch<SetStateAction<string>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setMessageType: Dispatch<SetStateAction<MessageType>>;
  onLightCandle: () => void;
  onSubmitMessage: () => void;
  onShare: () => void;
};

export default function Interactions({
  interactions,
  name,
  message,
  messageType,
  setName,
  setMessage,
  setMessageType,
  onLightCandle,
  onSubmitMessage,
  onShare,
}: Props) {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  const [composerOpen, setComposerOpen] = useState(
    action === "tribute" || action === "condolence",
  );
  
  const approvedMessages = interactions.messages.filter(
    (item) => item.approved,
  );

      

  function openComposer(type: MessageType) {
    setMessageType(type);
    setComposerOpen(true);
  }

  function closeComposer() {
    setComposerOpen(false);
    setMessage("");
  }

  function submitMessage() {
    onSubmitMessage();
    setComposerOpen(false);
  }

  return (
    <section className="space-y-6">
      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-sm">
        <div className="flex min-w-max items-center justify-center gap-1">
          <ActionButton
            label="Tribute"
            icon="tribute"
            iconOnly
            onClick={() => openComposer("tribute")}
          />

          <ActionButton
            label="Candle"
            icon="candle"
            onClick={onLightCandle}
            count={interactions.candles.length}
          />

          <ActionButton
            label="Condolence"
            icon="condolence"
            iconOnly
            onClick={() => openComposer("condolence")}
          />

          <ActionButton label="Share" icon="share" iconOnly onClick={onShare} />
        </div>
      </div>

      {composerOpen && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A7A53]">
                {messageType === "tribute" ? "Tribute" : "Condolence"}
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#2F2F2F]">
                {messageType === "tribute"
                  ? "Share a Tribute"
                  : "Leave a Condolence"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/55">
                {messageType === "tribute"
                  ? "Share a memory, reflection or tribute in honour of this life."
                  : "Leave a message of sympathy and support for the family."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeComposer}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/45 hover:bg-black/[0.05] hover:text-black/70"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="contributor-name"
                className="mb-2 block text-sm font-medium"
              >
                Your name
              </label>

              <input
                id="contributor-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#7A9B8E]"
              />
            </div>

            <div>
              <label
                htmlFor="memorial-message"
                className="mb-2 block text-sm font-medium"
              >
                Message
              </label>

              <textarea
                id="memorial-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                placeholder={
                  messageType === "tribute"
                    ? "Share your tribute..."
                    : "Write your condolence..."
                }
                className="w-full resize-y rounded-xl border border-black/15 px-4 py-3 leading-7 outline-none focus:border-[#7A9B8E]"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeComposer}
                className="rounded-xl border border-black/15 px-4 py-2.5 text-sm font-medium text-black/60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitMessage}
                disabled={!name.trim() || !message.trim()}
                className="rounded-xl bg-[#2F2F2F] px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {approvedMessages.length > 0 && (
        <div className="space-y-4">
          {approvedMessages.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[#2F2F2F]">
                  {item.name}
                </p>

                <span className="text-black/25">·</span>

                <p className="text-xs font-medium capitalize text-[#9A7A53]">
                  {item.type}
                </p>
              </div>

              <p className="mt-3 whitespace-pre-wrap leading-7 text-black/70">
                {item.message}
              </p>

              <p className="mt-3 text-xs text-black/40">
                {formatDate(item.createdAt)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

type ActionButtonProps = {
  label: string;
  icon: "tribute" | "candle" | "condolence" | "share";
  onClick: () => void;
  count?: number;
  iconOnly?: boolean;
};

function ActionButton({
  label,
  icon,
  onClick,
  count,
  iconOnly = false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        iconOnly
          ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#625B53] transition hover:bg-[#EEE8DE] hover:text-[#211F1B]"
          : "flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm text-[#625B53] transition hover:bg-[#EEE8DE] hover:text-[#211F1B]"
      }
    >
      <ActionIcon
        name={icon}
        className={iconOnly ? "h-5 w-5" : "h-[17px] w-[17px]"}
      />

      {!iconOnly && <span>{label}</span>}

      {typeof count === "number" && count > 0 && (
        <span className="rounded-full bg-black/[0.05] px-1.5 py-0.5 text-[10px] text-black/45">
          {count}
        </span>
      )}
    </button>
  );
}

function ActionIcon({
  name,
  className,
}: {
  name: "tribute" | "candle" | "condolence" | "share";
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "tribute") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          {...common}
          d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
        />
      </svg>
    );
  }

  if (name === "candle") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          {...common}
          d="M12 3c1.6 2 2.4 3.4 2.4 4.7A2.4 2.4 0 0 1 12 10.1a2.4 2.4 0 0 1-2.4-2.4C9.6 6.4 10.4 5 12 3Z"
        />

        <path {...common} d="M8.5 11.5h7v8h-7zM7 21h10" />
      </svg>
    );
  }

  if (name === "condolence") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path {...common} d="M4 5.5h16v11H9l-5 4v-15Z" />

        <path {...common} d="M8 10h8M8 13h5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...common} d="M12 16V4" />

      <path {...common} d="m8 8 4-4 4 4" />

      <path {...common} d="M5 12v7h14v-7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type Step = "person" | "relationship" | "memory" | "preserved";
type MemoryType = "story" | "photo" | "voice";

const relationshipOptions: Record<string, string[]> = {
  Parent: [
    "Mother",
    "Father",
    "Stepmother",
    "Stepfather",
    "Adoptive mother",
    "Adoptive father",
    "Guardian",
  ],

  Sibling: [
    "Sister",
    "Brother",
    "Stepsister",
    "Stepbrother",
    "Half-sister",
    "Half-brother",
    "Adoptive sister",
    "Adoptive brother",
  ],

  Grandparent: [
    "Grandmother",
    "Grandfather",
    "Step-grandmother",
    "Step-grandfather",
  ],

  Partner: [
    "Wife",
    "Husband",
    "Partner",
    "Former wife",
    "Former husband",
    "Former partner",
  ],

  Child: [
    "Daughter",
    "Son",
    "Stepdaughter",
    "Stepson",
    "Adoptive daughter",
    "Adoptive son",
  ],

  Relative: [
    "Aunt",
    "Uncle",
    "Cousin",
    "Niece",
    "Nephew",
    "Other relative",
  ],

  Friend: ["Friend"],
  Mentor: ["Mentor"],
  Myself: ["Myself"],
  "Another relationship": [],
};

export default function PreservePage() {
  const [step, setStep] = useState<Step>("person");

  const [name, setName] = useState("");

  const [relationshipCategory, setRelationshipCategory] = useState("");
  const [relationship, setRelationship] = useState("");
  const [customRelationship, setCustomRelationship] = useState("");

  const [memoryType, setMemoryType] = useState<MemoryType>("story");
  const [memory, setMemory] = useState("");

  function handlePersonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) return;

    setStep("relationship");
  }

  function handleRelationshipSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!relationship.trim()) return;

    setStep("memory");
  }

  function chooseRelationshipCategory(category: string) {
    const options = relationshipOptions[category];

    setRelationshipCategory(category);
    setRelationship("");
    setCustomRelationship("");

    if (options.length === 1) {
      setRelationship(options[0]);
    }
  }

  function resetRelationshipCategory() {
    setRelationshipCategory("");
    setRelationship("");
    setCustomRelationship("");
  }

  return (
    <main className="min-h-screen bg-[#f5f1ea] text-[#211f1b]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-10 lg:px-14">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.22em] text-[#6f6253]"
          >
            EULOGES
          </Link>

          <span className="text-xs text-[#91887e]">
            {step === "person" && "1 of 3"}
            {step === "relationship" && "2 of 3"}
            {step === "memory" && "3 of 3"}
            {step === "preserved" && "Preserved"}
          </span>
        </header>

        {/* Progress */}
        <div className="mt-8 h-px w-full bg-[#ddd5ca]">
          <div
            className="h-px bg-[#7f684c] transition-all duration-500"
            style={{
              width:
                step === "person"
                  ? "33.333%"
                  : step === "relationship"
                    ? "66.666%"
                    : "100%",
            }}
          />
        </div>

        {/* Main journey */}
        <section className="flex flex-1 items-center py-14 sm:py-20">
          <div className="w-full max-w-2xl">
            {/* =========================================================
                STEP 1 — PERSON
            ========================================================== */}

            {step === "person" && (
              <form onSubmit={handlePersonSubmit}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7a53]">
                  Preserve someone
                </p>

                <h1 className="mt-5 text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">
                  Who would you like
                  <br />
                  to preserve?
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-[#6d655c]">
                  Begin with their name. You do not need to complete their whole
                  life story today.
                </p>

                <div className="mt-10">
                  <label
                    htmlFor="person-name"
                    className="text-sm font-medium text-[#514b44]"
                  >
                    Their name
                  </label>

                  <input
                    id="person-name"
                    type="text"
                    autoComplete="name"
                    autoFocus
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Ama Mensah"
                    className="mt-3 w-full border-0 border-b border-[#bdb3a6] bg-transparent px-0 py-4 text-2xl outline-none transition placeholder:text-[#b3aaa0] focus:border-[#544838]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="mt-10 rounded-full bg-[#26231f] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Continue
                </button>
              </form>
            )}

            {/* =========================================================
                STEP 2 — RELATIONSHIP
            ========================================================== */}

            {step === "relationship" && (
              <form onSubmit={handleRelationshipSubmit}>
                <button
                  type="button"
                  onClick={() => setStep("person")}
                  className="mb-8 text-sm text-[#766e65] transition hover:text-[#211f1b]"
                >
                  ← Back
                </button>

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7a53]">
                  {name}
                </p>

                <h1 className="mt-5 text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">
                  Who is {firstName(name)}
                  <br />
                  to you?
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-[#6d655c]">
                  This gives the Memory context. It does not determine ownership
                  or access.
                </p>

                <div className="mt-10">
                  {!relationshipCategory ? (
                    <>
                      <p className="mb-4 text-sm font-medium text-[#514b44]">
                        Choose the closest relationship
                      </p>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {Object.keys(relationshipOptions).map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => chooseRelationshipCategory(category)}
                            className="rounded-2xl border border-[#d8d0c5] bg-[#fffdf9] px-4 py-4 text-left text-sm text-[#625b53] transition hover:border-[#a99d8e]"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={resetRelationshipCategory}
                        className="mb-5 text-sm text-[#766e65] transition hover:text-[#211f1b]"
                      >
                        ← Change relationship group
                      </button>

                      {relationshipCategory === "Another relationship" ? (
                        <div>
                          <p className="mb-5 text-sm font-medium text-[#514b44]">
                            Tell us how you are connected
                          </p>

                          <label
                            htmlFor="custom-relationship"
                            className="text-sm font-medium text-[#514b44]"
                          >
                            How would you describe your relationship to{" "}
                            {firstName(name)}?
                          </label>

                          <input
                            id="custom-relationship"
                            type="text"
                            autoFocus
                            value={customRelationship}
                            onChange={(event) => {
                              const value = event.target.value;

                              setCustomRelationship(value);
                              setRelationship(value);
                            }}
                            placeholder="e.g. Godmother, family friend, neighbour"
                            className="mt-3 w-full border-0 border-b border-[#bdb3a6] bg-transparent px-0 py-4 text-xl outline-none transition placeholder:text-[#b3aaa0] focus:border-[#544838]"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="mb-4 text-sm font-medium text-[#514b44]">
                            Be a little more specific
                          </p>

                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {relationshipOptions[relationshipCategory].map(
                              (option) => {
                                const selected = relationship === option;

                                return (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => setRelationship(option)}
                                    className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
                                      selected
                                        ? "border-[#756149] bg-[#ede5d9] text-[#211f1b]"
                                        : "border-[#d8d0c5] bg-[#fffdf9] text-[#625b53] hover:border-[#a99d8e]"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!relationship.trim()}
                  className="mt-10 rounded-full bg-[#26231f] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Continue
                </button>
              </form>
            )}

            {/* =========================================================
                STEP 3 — FIRST MEMORY
            ========================================================== */}

            {step === "memory" && (
              <div>
                <button
                  type="button"
                  onClick={() => setStep("relationship")}
                  className="mb-8 text-sm text-[#766e65] transition hover:text-[#211f1b]"
                >
                  ← Back
                </button>

                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7a53]">
                  Your first Memory of {firstName(name)}
                </p>

                <h1 className="mt-5 text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">
                  What is something
                  <br />
                  worth remembering?
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-[#6d655c]">
                  It does not need to be a complete biography. Begin with one
                  moment, story, photograph, voice, habit or lesson you would
                  not want future generations to lose.
                </p>

                {/* Memory type selector */}
                <div className="mt-10">
                  <p className="text-sm font-medium text-[#514b44]">
                    How would you like to begin?
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {/* Story */}
                    <button
                      type="button"
                      onClick={() => setMemoryType("story")}
                      aria-pressed={memoryType === "story"}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        memoryType === "story"
                          ? "border-[#756149] bg-[#ede5d9]"
                          : "border-[#d8d0c5] bg-[#fffdf9] hover:border-[#a99d8e]"
                      }`}
                    >
                      <span className="block text-lg">✎</span>

                      <span className="mt-3 block text-sm font-semibold">
                        Story
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#81786e]">
                        Write a memory
                      </span>
                    </button>

                    {/* Photo */}
                    <button
                      type="button"
                      onClick={() => setMemoryType("photo")}
                      aria-pressed={memoryType === "photo"}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        memoryType === "photo"
                          ? "border-[#756149] bg-[#ede5d9]"
                          : "border-[#d8d0c5] bg-[#fffdf9] hover:border-[#a99d8e]"
                      }`}
                    >
                      <span className="block text-lg">▣</span>

                      <span className="mt-3 block text-sm font-semibold">
                        Photo
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#81786e]">
                        Preserve a photograph
                      </span>
                    </button>

                    {/* Voice */}
                    <button
                      type="button"
                      onClick={() => setMemoryType("voice")}
                      aria-pressed={memoryType === "voice"}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        memoryType === "voice"
                          ? "border-[#756149] bg-[#ede5d9]"
                          : "border-[#d8d0c5] bg-[#fffdf9] hover:border-[#a99d8e]"
                      }`}
                    >
                      <span className="block text-lg">◉</span>

                      <span className="mt-3 block text-sm font-semibold">
                        Voice
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#81786e]">
                        Tell it in your own voice
                      </span>
                    </button>
                  </div>
                </div>

                {/* =====================================================
                    STORY MEMORY
                ====================================================== */}

                {memoryType === "story" && (
                  <div className="mt-8">
                    <label htmlFor="first-memory" className="sr-only">
                      Your first Memory
                    </label>

                    <textarea
                      id="first-memory"
                      value={memory}
                      onChange={(event) => setMemory(event.target.value)}
                      placeholder={`I remember ${firstName(name)}...`}
                      rows={7}
                      className="w-full resize-none rounded-[1.75rem] border border-[#d8d0c5] bg-[#fffdf9] p-6 text-lg leading-8 outline-none transition placeholder:text-[#aaa096] focus:border-[#8c7559]"
                    />

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#857d73]">
                      <span>Tell a story</span>
                      <span>•</span>
                      <span>Describe a moment</span>
                      <span>•</span>
                      <span>Preserve a lesson</span>
                    </div>

                    <button
                      type="button"
                      disabled={!memory.trim()}
                      onClick={() => setStep("preserved")}
                      className="mt-10 rounded-full bg-[#26231f] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Preserve this Memory
                    </button>
                  </div>
                )}

                {/* =====================================================
                    PHOTO MEMORY
                ====================================================== */}

                {memoryType === "photo" && (
                  <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#bdb3a6] bg-[#fffdf9] p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eee6da] text-xl">
                      ▣
                    </div>

                    <h3 className="mt-5 text-lg font-medium">
                      Preserve a photograph
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#777067]">
                      Choose a photograph of {firstName(name)}. We will also ask
                      what is happening in it so the photograph keeps its
                      meaning.
                    </p>

                    <button
                      type="button"
                      className="mt-6 rounded-full border border-[#b8aa97] px-6 py-3 text-sm font-semibold text-[#574a3a] transition hover:bg-[#f2ece3]"
                    >
                      Choose photograph
                    </button>

                    <p className="mt-4 text-xs text-[#999087]">
                      Uploading will be enabled when media storage is connected.
                    </p>
                  </div>
                )}

                {/* =====================================================
                    VOICE MEMORY
                ====================================================== */}

                {memoryType === "voice" && (
                  <div className="mt-8 rounded-[1.75rem] border border-[#d8d0c5] bg-[#fffdf9] p-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#292621] text-white">
                      <span className="text-xl">●</span>
                    </div>

                    <h3 className="mt-5 text-lg font-medium">
                      Tell a Memory of {firstName(name)}
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#777067]">
                      Speak naturally. It can be a story, a lesson, a habit you
                      remember, or simply something you never want the family to
                      forget.
                    </p>

                    <button
                      type="button"
                      className="mt-6 rounded-full bg-[#26231f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      Start recording
                    </button>

                    <p className="mt-4 text-xs text-[#999087]">
                      Voice recording will be activated after we validate this
                      experience.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* =========================================================
                PRESERVED CONFIRMATION
            ========================================================== */}

            {step === "preserved" && (
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#b8aa97] bg-[#eee6da]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12.5l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7a53]">
                  Your first Memory
                </p>

                <h1 className="mt-5 text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">
                  {firstName(name)}&apos;s Legacy
                  <br />
                  has begun.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-[#6d655c]">
                  You have taken the first step in preserving {firstName(name)}
                  &apos;s story. Your details are shown below for review, but
                  they have not yet been saved to a Legacy record.
                </p>

                <div className="mt-10 rounded-[1.75rem] border border-[#d8d0c5] bg-[#fffdf9] p-6 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94836d]">
                    Your first Memory
                  </p>

                  <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-[#403a34]">
                    {memory}
                  </p>

                  <div className="mt-6 border-t border-[#e7e0d7] pt-4">
                    <p className="text-sm text-[#82796f]">
                      Your relationship · {relationship}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    className="rounded-full border border-[#b8aa97] px-7 py-3.5 text-sm font-semibold text-[#574a3a] transition hover:bg-[#eee7dc]"
                  >
                    Invite someone to remember
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMemory("");
                    setMemoryType("story");
                    setStep("memory");
                  }}
                  className="mt-6 text-sm font-medium text-[#766e65] transition hover:text-[#211f1b]"
                >
                  + Preserve another Memory
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#ddd5ca] py-6 text-sm text-[#887f75]">
          {step === "preserved"
            ? "A Legacy begins with one Memory and grows through many voices."
            : step === "memory"
              ? "One Memory is enough to begin a Legacy."
              : "You can add dates, places and other details later."}
        </footer>
      </div>
    </main>
  );
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "them";
}

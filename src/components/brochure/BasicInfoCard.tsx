"use client";

type Props = {
  name: string;
  dob: string;
  dod: string;
  bio: string;
  portraitUrl: string;
  setName: (value: string) => void;
  setDob: (value: string) => void;
  setDod: (value: string) => void;
  setBio: (value: string) => void;
  setPortraitUrl: (value: string) => void;
};

export default function BasicInfoCard({
  name,
  dob,
  dod,
  bio,
  portraitUrl,
  setName,
  setDob,
  setDod,
  setBio,
  setPortraitUrl,
}: Props) {
  function handlePortraitChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please upload an image smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPortraitUrl(reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  function removePortrait() {
    setPortraitUrl("");
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A9B8E]">
          In Memory Of...
        </p>

        <h2 className="mt-2 text-xl font-semibold text-[#2F2F2F]">
          Basic Information
        </h2>

        <p className="mt-1 text-sm text-black/60">
          Begin with the essential details of the person whose life you are
          preserving.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-3 block text-sm font-medium">
            Memorial Portrait
          </label>

          <div className="flex flex-col gap-5 rounded-2xl border border-dashed border-black/15 bg-[#FAF9F7] p-5 sm:flex-row sm:items-center">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white">
              {portraitUrl ? (
                <img
                  src={portraitUrl}
                  alt={name ? `${name} memorial portrait` : "Memorial portrait"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="px-4 text-center">
                  <p className="text-3xl text-black/25">◯</p>
                  <p className="mt-2 text-xs text-black/40">No portrait</p>
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-[#2F2F2F]">
                Add a photograph
              </p>

              <p className="mt-1 max-w-md text-xs leading-5 text-black/50">
                Use a clear photograph of the person. Square images work best.
                JPG, PNG or WebP, up to 5 MB.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-xl bg-[#2F2F2F] px-4 py-2.5 text-sm font-medium text-white">
                  {portraitUrl ? "Change Photograph" : "Choose Photograph"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePortraitChange}
                    className="hidden"
                  />
                </label>

                {portraitUrl && (
                  <button
                    type="button"
                    onClick={removePortrait}
                    className="rounded-xl border border-black/10 px-4 py-2.5 text-sm text-black/60 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Full name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Ama Mensah"
            className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#7A9B8E]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dob" className="mb-2 block text-sm font-medium">
              Date of birth
            </label>

            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
              className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#7A9B8E]"
            />
          </div>

          <div>
            <label htmlFor="dod" className="mb-2 block text-sm font-medium">
              Date of death
            </label>

            <input
              id="dod"
              type="date"
              value={dod}
              onChange={(event) => setDod(event.target.value)}
              className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-[#7A9B8E]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="mb-2 block text-sm font-medium">
            Biography
          </label>

          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Tell their story..."
            rows={8}
            className="w-full resize-y rounded-xl border border-black/15 px-4 py-3 leading-7 outline-none focus:border-[#7A9B8E]"
          />
        </div>
      </div>
    </section>
  );
}

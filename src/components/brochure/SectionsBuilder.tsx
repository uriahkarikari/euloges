
"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import type { BrochureSection } from "@/types/brochure";

type Props = {
  sections: BrochureSection[];
  setSections: (sections: BrochureSection[]) => void;
};

type SectionProps = {
  section: BrochureSection;
  updateSection: (
    id: string,
    field: "title" | "content",
    value: string,
  ) => void;
  removeSection: (id: string) => void;
};

function DraggableSection({
  section,
  updateSection,
  removeSection,
}: SectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded-xl p-4 bg-white space-y-3"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-xs text-gray-400 cursor-grab active:cursor-grabbing"
        >
          ☰ Drag to reorder
        </button>

        <button
          type="button"
          onClick={() => removeSection(section.id)}
          className="text-xs text-gray-400 hover:text-red-600"
        >
          Remove
        </button>
      </div>

      <input
        type="text"
        value={section.title}
        onChange={(event) =>
          updateSection(section.id, "title", event.target.value)
        }
        placeholder="Section title, e.g. Order of Service"
        className="w-full border border-gray-200 rounded-lg p-2.5 font-medium"
      />

      <textarea
        value={section.content}
        onChange={(event) =>
          updateSection(section.id, "content", event.target.value)
        }
        rows={5}
        placeholder="Add the content for this section..."
        className="w-full border border-gray-200 rounded-lg p-3 resize-y"
      />
    </div>
  );
}

export default function SectionsBuilder({ sections = [], setSections }: Props) {
  function addSection() {
    setSections([
      ...sections,
      {
        id: crypto.randomUUID(),
        title: "",
        content: "",
      },
    ]);
  }

  function updateSection(
    id: string,
    field: "title" | "content",
    value: string,
  ) {
    setSections(
      sections.map((section) =>
        section.id === id
          ? {
              ...section,
              [field]: value,
            }
          : section,
      ),
    );
  }

  function removeSection(id: string) {
    setSections(sections.filter((section) => section.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sections.findIndex((section) => section.id === active.id);

    const newIndex = sections.findIndex((section) => section.id === over.id);

    setSections(arrayMove(sections, oldIndex, newIndex));
  }

  return (
    <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold">Memorial Sections</h2>

          <p className="text-sm text-gray-500 mt-1">
            Add any sections your family needs, then arrange them in the order
            they should appear.
          </p>
        </div>

        <button
          type="button"
          onClick={addSection}
          className="shrink-0 bg-[#2F2F2F] text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add Section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-500">No custom sections yet.</p>

          <p className="text-xs text-gray-400 mt-1">
            Examples: Order of Service, Tributes, Family, Acknowledgements or
            Life Timeline.
          </p>
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((section) => section.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sections.map((section) => (
                <DraggableSection
                  key={section.id}
                  section={section}
                  updateSection={updateSection}
                  removeSection={removeSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

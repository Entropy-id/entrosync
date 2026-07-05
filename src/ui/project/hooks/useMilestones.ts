import { useState } from "react";
import { formatDisplayDate, computeMilestoneCompletion } from "../utils";

export type MilestoneDraft = {
  title: string;
  description: string;
  date: string;
  tasks: number;
  completion: string;
};

export type InitialMilestone = {
  title: string;
  dueDate: string | null;
  tasks: { status: string }[];
};

export function useMilestones(initialMilestones: InitialMilestone[]) {
  const [milestones, setMilestones] = useState<MilestoneDraft[]>(
    initialMilestones.map((m) => ({
      title: m.title,
      description: "",
      date: formatDisplayDate(m.dueDate),
      tasks: m.tasks.length,
      completion: computeMilestoneCompletion(m.tasks),
    })),
  );

  const [editingMilestoneId, setEditingMilestoneId] = useState<
    number | "new" | null
  >(null);

  const [draftMilestone, setDraftMilestone] = useState<MilestoneDraft>({
    title: "",
    description: "",
    date: "",
    tasks: 0,
    completion: "0%",
  });

  function handleCreate() {
    setDraftMilestone({
      title: "",
      description: "",
      date: "",
      tasks: 0,
      completion: "0%",
    });
    setEditingMilestoneId("new");
  }

  function handleEdit(index: number) {
    setDraftMilestone({ ...milestones[index] });
    setEditingMilestoneId(index);
  }

  function handleSave() {
    if (!draftMilestone.title.trim()) return;
    if (editingMilestoneId === "new") {
      setMilestones((prev) => [...prev, draftMilestone]);
    } else if (editingMilestoneId !== null) {
      setMilestones((prev) =>
        prev.map((m, i) => (i === editingMilestoneId ? draftMilestone : m)),
      );
    }
    setEditingMilestoneId(null);
    // TODO: call API to persist change
  }

  function handleDelete(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
    if (editingMilestoneId === index) setEditingMilestoneId(null);
    // TODO: call API to persist change
  }

  function handleCancel() {
    setEditingMilestoneId(null);
  }

  return {
    milestones,
    editingMilestoneId,
    draftMilestone,
    setDraftMilestone,
    handleCreate,
    handleEdit,
    handleSave,
    handleDelete,
    handleCancel,
  };
}

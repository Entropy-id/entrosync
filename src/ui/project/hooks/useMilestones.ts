import { useState } from "react";
import { formatDisplayDate, computeMilestoneCompletion } from "../utils";
import { useServerFn } from "@tanstack/react-start";
import {
  createMilestone,
  deleteMilestone,
  updateMilestone,
} from "#/modules/project/project.api";

export type MilestoneDraft = {
  id: string;
  title: string;
  projectId: string;
  description: string;
  date: string;
  tasks: number;
  completion: string;
};

export type InitialMilestone = {
  id: string;
  title: string;
  projectId: string;
  description: string | null;
  dueDate: string | null;
  tasks: { status: string }[];
};

export function useMilestones(initialMilestones: InitialMilestone[]) {
  const [milestones, setMilestones] = useState<MilestoneDraft[]>(
    initialMilestones.map((m) => ({
      id: m.id,
      title: m.title,
      projectId: m.projectId,
      description: m.description ?? "",
      date: formatDisplayDate(m.dueDate),
      tasks: m.tasks.length,
      completion: computeMilestoneCompletion(m.tasks),
    })),
  );

  const updateMilestoneFn = useServerFn(updateMilestone);
  const createMilestoneFn = useServerFn(createMilestone);
  const deleteMilestoneFn = useServerFn(deleteMilestone);

  const [editingMilestoneId, setEditingMilestoneId] = useState<
    number | "new" | null
  >(null);

  const [draftMilestone, setDraftMilestone] = useState<MilestoneDraft>({
    id: "",
    title: "",
    projectId: "",
    description: "",
    date: "",
    tasks: 0,
    completion: "0%",
  });

  function handleCreate() {
    setDraftMilestone({
      id: "",
      title: "",
      projectId: "",
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

  async function handleSave(
    data: Record<string, unknown>,
    rollback: () => void,
  ) {
    try {
      if (editingMilestoneId === "new") {
        setMilestones((prev) => [...prev, draftMilestone]);
        console.log(data);
        await createMilestoneFn({
          data: { ...data },
        });
      } else if (editingMilestoneId !== null) {
        setMilestones((prev) =>
          prev.map((m, i) => (i === editingMilestoneId ? draftMilestone : m)),
        );
        console.log(editingMilestoneId);
        await updateMilestoneFn({
          data: { id: draftMilestone.id, ...data },
        });
      }
    } catch (error) {
      if (editingMilestoneId === "new") {
        console.error("Failed to create milestone", error);
      } else if (editingMilestoneId !== null) {
        console.error("Failed to update milestone", error);
      }
      rollback();
    } finally {
      setEditingMilestoneId(null);
    }
  }

  async function handleDelete(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
    if (editingMilestoneId === index) setEditingMilestoneId(null);
    await deleteMilestoneFn({ data: { id: milestones[index].id } });
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

import React, { useState, useEffect } from "react";
import { Input, Button } from "../../components/ui.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { listSkills, addSkill, deleteSkill } from "../../api/students.js";

export default function SkillsManager() {
  const { profile } = useAuth();
  const toast = useToast();
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (!profile) return;
    listSkills(profile.stud_id)
      .then(setSkills)
      .catch((err) => toast.error(err.message));
  }, [profile?.stud_id]);

  async function handleAddSkill(e) {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      const row = await addSkill(profile.stud_id, newSkill.trim());
      setSkills((s) => [...s, row]);
      setNewSkill("");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteSkill(mapId) {
    try {
      await deleteSkill(mapId);
      setSkills((s) => s.filter((row) => row.map_id !== mapId));
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <form onSubmit={handleAddSkill} className="mb-4 flex gap-2">
        <Input
          placeholder="e.g. React, SQL, Figma"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Add</Button>
      </form>
      {skills.length === 0 ? (
        <p className="text-sm text-white/40">No skills added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s.map_id}
              className="flex items-center gap-2 rounded-full border border-tut-line bg-tut-black px-3 py-1 text-xs text-white/80"
            >
              {s.skill_name}
              <button
                onClick={() => handleDeleteSkill(s.map_id)}
                className="text-white/30 hover:text-tut-red"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

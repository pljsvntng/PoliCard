import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import { Trash2, RotateCcw } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

export default function Settings() {
  const { openMenu } = useOutletContext();
  const { settings, setSettings, wipeAllData, resetAllData } = useApp();
  const { notify } = useToast();
  const [confirmWipe, setConfirmWipe] = useState(false);

  return (
    <div>
      <Topbar title="Settings" subtitle="Your preferences" onMenu={openMenu} />

      <div className="p-6 sm:p-8 max-w-lg mx-auto space-y-6">
        <Card className="p-5 space-y-4">
          <h2 className="font-display text-base text-ink">Profile</h2>
          <div>
            <label className="text-xs text-slate mb-1.5 block">Display name</label>
            <input
              value={settings.name}
              onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))}
              className="w-full rounded-md border border-line px-3 py-2 text-sm bg-paper focus:border-teal"
            />
          </div>
          <div>
            <label className="text-xs text-slate mb-1.5 block">Daily study goal (minutes)</label>
            <input
              type="number"
              min={5}
              max={180}
              value={settings.dailyGoalMinutes}
              onChange={(e) => setSettings((s) => ({ ...s, dailyGoalMinutes: Number(e.target.value) }))}
              className="w-full rounded-md border border-line px-3 py-2 text-sm bg-paper focus:border-teal"
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
            <input
              type="checkbox"
              className="accent-teal"
              checked={settings.timerDefault}
              onChange={(e) => setSettings((s) => ({ ...s, timerDefault: e.target.checked }))}
            />
            Default new quizzes to timed mode
          </label>
          <Button size="sm" onClick={() => notify("Preferences saved.", "success")}>
            Save preferences
          </Button>
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="font-display text-base text-ink">Data</h2>
          <p className="text-sm text-slate">
            Everything you upload and generate is stored only in this browser — nothing is sent to a server
            beyond the study-material generation step.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" icon={RotateCcw} onClick={() => { resetAllData(); notify("Reset to the demo starter set.", "info"); }}>
              Reset to demo data
            </Button>
            <Button variant="danger" icon={Trash2} onClick={() => setConfirmWipe(true)}>
              Delete everything
            </Button>
          </div>
        </Card>
      </div>

      <Modal open={confirmWipe} onClose={() => setConfirmWipe(false)} title="Delete all data?" width="max-w-sm">
        <p className="text-sm text-slate mb-5">
          This permanently removes every document, quiz, flashcard set, and history entry from this browser. This can't be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => { wipeAllData(); setConfirmWipe(false); notify("All data deleted.", "info"); }}>
            Delete everything
          </Button>
          <Button variant="ghost" onClick={() => setConfirmWipe(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}

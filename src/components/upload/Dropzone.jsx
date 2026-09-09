import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { SUPPORTED_TYPES } from "../../services/documentService";

export default function Dropzone({ onFile }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (files) => {
      if (files && files[0]) onFile(files[0]);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      className={`cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-200 p-10 sm:p-14 text-center ${
        dragOver ? "border-teal bg-teal/[0.06] scale-[1.01] shadow-[var(--shadow-lift)]" : "border-line-strong hover:border-teal/50 hover:bg-teal/[0.02]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-teal/15 to-[#7d79ff]/15 flex items-center justify-center text-teal-deep mb-4 transition-transform duration-200 ${dragOver ? "scale-110" : ""}`}>
        <UploadCloud size={24} />
      </div>
      <p className="text-ink font-semibold mb-1">Drag and drop a file, or click to browse</p>
      <p className="text-sm text-slate">
        Supports {SUPPORTED_TYPES.join(", ")} — up to 25 MB
      </p>
      <p className="text-xs text-slate/70 mt-3 flex items-center justify-center gap-1.5">
        <FileText size={12} /> Nothing leaves this device except to generate questions
      </p>
    </div>
  );
}

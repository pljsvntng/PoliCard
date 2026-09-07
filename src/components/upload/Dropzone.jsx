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
      className={`cursor-pointer rounded-lg border-2 border-dashed transition-colors p-10 text-center ${
        dragOver ? "border-teal bg-teal/[0.05]" : "border-line-strong hover:border-teal/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="w-12 h-12 mx-auto rounded-full bg-teal/[0.08] flex items-center justify-center text-teal mb-4">
        <UploadCloud size={22} />
      </div>
      <p className="text-ink font-medium mb-1">Drag and drop a file, or click to browse</p>
      <p className="text-sm text-slate">
        Supports {SUPPORTED_TYPES.join(", ")} — up to 25 MB
      </p>
      <p className="text-xs text-slate/70 mt-3 flex items-center justify-center gap-1.5">
        <FileText size={12} /> Nothing leaves this device except to generate questions
      </p>
    </div>
  );
}

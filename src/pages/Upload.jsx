import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FileText, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Dropzone from "../components/upload/Dropzone";
import { extractText, isSupported, formatFileSize } from "../services/documentService";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

const MAX_BYTES = 25 * 1024 * 1024;

export default function Upload() {
  const { openMenu } = useOutletContext();
  const { addDocument } = useApp();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | reading | ready | error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedChunks, setSelectedChunks] = useState(new Set());

  const handleFile = async (f) => {
    setFile(f);
    setError("");
    setResult(null);

    if (!isSupported(f)) {
      setStatus("error");
      setError(`"${f.name}" isn't a supported file type. Try a PDF, Word document, or plain text file.`);
      return;
    }
    if (f.size > MAX_BYTES) {
      setStatus("error");
      setError(`That file is ${formatFileSize(f.size)}, which is over the 25 MB limit.`);
      return;
    }

    setStatus("reading");
    try {
      const extracted = await extractText(f);
      setResult(extracted);
      setSelectedChunks(new Set(extracted.chunks.map((c) => c.id)));
      setStatus("ready");
    } catch (e) {
      setStatus("error");
      setError(e.message || "Something went wrong reading that file.");
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setStatus("idle");
    setError("");
  };

  const toggleChunk = (id) => {
    setSelectedChunks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = () => {
    const chosenChunks = result.chunks.filter((c) => selectedChunks.has(c.id));
    const doc = addDocument({
      name: file.name,
      sizeBytes: file.size,
      pageCount: result.pageCount,
      text: chosenChunks.map((c) => c.text).join("\n\n"),
      chunks: chosenChunks.length ? chosenChunks : result.chunks,
      status: "ready",
    });
    notify(`"${file.name}" is ready to study.`, "success");
    navigate(`/documents/${doc.id}`);
  };

  return (
    <div>
      <Topbar title="Upload a document" subtitle="PDF, Word, or plain text" onMenu={openMenu} />

      <div className="p-6 sm:p-8 max-w-2xl mx-auto space-y-5">
        {status === "idle" && <Dropzone onFile={handleFile} />}

        {status !== "idle" && (
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-teal shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink font-medium truncate">{file.name}</p>
                <p className="text-xs text-slate">{formatFileSize(file.size)}</p>
              </div>
              <button onClick={reset} aria-label="Remove file" className="text-slate hover:text-ink">
                <X size={16} />
              </button>
            </div>

            {status === "reading" && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate">
                <Loader2 size={15} className="animate-spin text-teal" />
                Reading and extracting text…
              </div>
            )}

            {status === "error" && (
              <div className="mt-4 flex items-start gap-2 text-sm text-rose bg-rose/[0.06] border border-rose/20 rounded-md p-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {status === "ready" && result && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-moss">
                  <CheckCircle2 size={16} />
                  Extracted {result.text.length.toLocaleString()} characters
                  {result.pageCount ? ` across ${result.pageCount} pages` : ""}.
                </div>

                <div>
                  <p className="text-xs text-slate mb-1.5">Text preview</p>
                  <div className="text-sm text-ink/80 bg-ink/[0.03] rounded-md p-3 max-h-28 overflow-y-auto thin-scroll leading-relaxed">
                    {result.text.slice(0, 400)}…
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate mb-2">
                    Detected sections — uncheck any you don't want study materials from
                  </p>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto thin-scroll">
                    {result.chunks.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-start gap-2.5 text-sm p-2 rounded-md hover:bg-ink/[0.03] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 accent-teal"
                          checked={selectedChunks.has(c.id)}
                          onChange={() => toggleChunk(c.id)}
                        />
                        <span className="text-ink/85">{c.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={save} disabled={selectedChunks.size === 0}>
                    Save document
                  </Button>
                  <Button variant="ghost" onClick={reset}>
                    Choose a different file
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

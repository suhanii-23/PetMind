import { useRef } from "react";
import styles from "../Onboarding.module.css";

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  label?: string;
}

export default function FileUpload({ files, onChange, accept = "*", label = "Click to upload files" }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) onChange([...files, ...Array.from(e.target.files)]);
  }

  function remove(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div style={{ width: "100%" }}>
      <div className={styles.fileZone} onClick={() => ref.current?.click()}>
        📎 {label}
        <br />
        <span style={{ fontSize: 12, marginTop: 4, display: "block" }}>PDF, images, documents</span>
      </div>
      <input ref={ref} type="file" multiple accept={accept} style={{ display: "none" }} onChange={handleChange} />
      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((f, i) => (
            <div key={i} className={styles.fileItem}>
              <span>📄 {f.name}</span>
              <button className={styles.removeBtn} onClick={() => remove(i)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

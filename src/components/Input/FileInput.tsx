import { Button } from "@mui/material"

type FileInputProps = {
  id: string,
  label: string,
  onFileChange: (file: File | null) => void
}

export default function FileInput({
  id,
  label,
  onFileChange
}: FileInputProps) {

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    onFileChange(file)
  }

  return (
    <div>
      <input
        id={`file-input-${id}`}
        type="file"
        accept="application/json"
        placeholder="Upload a file"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <label htmlFor={`file-input-${id}`}>
        <Button variant="contained" component="span">
          {label}
        </Button>
      </label>
    </div>
  )
}
import { Editor } from '@tinymce/tinymce-react';

export default function RichTextEditor({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <div className="mb-4" role="group" aria-label={label}>
    <p className="mb-1 text-sm font-semibold text-gray-700">{label}</p>
    <Editor
      apiKey={import.meta.env.VITE_TINY_MCE_KEY}
      value={value}
      disabled={disabled}
      onEditorChange={onChange}
      onInput={(_event, editor) => onChange(editor.getContent())}
      init={{
        height: 260, menubar: false, branding: false,
        plugins: ['lists', 'link'],
        toolbar: 'undo redo | bold italic underline | bullist numlist | link unlink',
        valid_elements: 'p,br,strong,b,em,i,u,ul,ol,li,a[href|target|rel]',
        link_default_target: '_blank',
        content_style: 'body { font-family: Georgia, serif; font-size: 16px; line-height: 1.6; } a { color: #AF272F; }',
      }}
    />
  </div>;
}

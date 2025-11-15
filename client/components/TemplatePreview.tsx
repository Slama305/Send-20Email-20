import { EmailTemplate } from "@shared/api";

interface TemplatePreviewProps {
  template: EmailTemplate;
}

export default function TemplatePreview({ template }: TemplatePreviewProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h3 className="font-semibold text-gray-900">Preview</h3>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <iframe
          srcDoc={template.content}
          title={`${template.name} Preview`}
          className="w-full h-full rounded border border-gray-200"
          style={{
            minHeight: "600px",
            backgroundColor: "white",
          }}
        />
      </div>
    </div>
  );
}

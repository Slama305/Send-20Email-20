import { EmailTemplate } from "@shared/api";
import { Card } from "@/components/ui/card";

interface TemplateCardProps {
  template: EmailTemplate;
  isSelected: boolean;
  onClick: () => void;
}

export default function TemplateCard({
  template,
  isSelected,
  onClick,
}: TemplateCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`
        cursor-pointer transition-all duration-300 p-6 rounded-lg border-2
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-lg"
            : "border-transparent bg-white hover:border-blue-200 hover:shadow-lg hover:bg-blue-50/50"
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{template.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {template.name}
          </h3>
          <p className="text-xs font-medium text-blue-600 mb-3">
            {template.category}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {template.preview}
          </p>
        </div>
      </div>
    </Card>
  );
}

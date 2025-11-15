import { useState, useMemo } from "react";
import { EMAIL_TEMPLATES, EmailTemplate, SendEmailRequest } from "@shared/api";
import TemplateCard from "@/components/TemplateCard";
import TemplatePreview from "@/components/TemplatePreview";
import EmailEditor from "@/components/EmailEditor";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(
    EMAIL_TEMPLATES[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isSending, setIsSending] = useState(false);
  const [editedSubject, setEditedSubject] = useState(selectedTemplate.subject);
  const [editedContent, setEditedContent] = useState(selectedTemplate.content);
  const { toast } = useToast();

  const categories = useMemo(() => {
    const cats = new Set(EMAIL_TEMPLATES.map((t) => t.category));
    return ["All", ...Array.from(cats).sort()];
  }, []);

  const filteredTemplates = useMemo(() => {
    return EMAIL_TEMPLATES.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.preview.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditedSubject(template.subject);
    setEditedContent(template.content);
  };

  const handleSendEmail = async (
    recipientEmail: string,
    recipientName: string
  ) => {
    setIsSending(true);
    try {
      const payload: SendEmailRequest = {
        recipientEmail,
        recipientName,
        subject: editedSubject,
        content: editedContent,
        templateId: selectedTemplate.id,
      };

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send email");
      }

      toast({
        title: "Success",
        description: "Email sent successfully!",
      });

      setEditedSubject(selectedTemplate.subject);
      setEditedContent(selectedTemplate.content);
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📧</span>
            <h1 className="text-3xl font-bold text-slate-900">
              Email Templates
            </h1>
          </div>
          <p className="text-slate-600">
            Choose a template, customize it, and send professional emails
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Template Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">
                Categories
              </p>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Template List */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">
                {filteredTemplates.length} Templates
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate.id === template.id}
                    onClick={() => handleSelectTemplate(template)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Preview and Editor */}
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Preview */}
              <TemplatePreview template={selectedTemplate} />

              {/* Editor */}
              <EmailEditor
                template={selectedTemplate}
                onSubjectChange={setEditedSubject}
                onContentChange={setEditedContent}
                onSend={handleSendEmail}
                isSending={isSending}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-600 text-sm">
          <p>Professional Email Template Manager • Powered by React & Tailwind</p>
        </div>
      </footer>
    </div>
  );
}

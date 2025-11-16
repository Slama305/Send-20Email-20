// src/pages/Dashboard.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { EMAIL_TEMPLATES, EmailTemplate, BulkEmailRequest } from "@shared/api";
import TemplateCard from "@/components/TemplateCard";
import TemplatePreview from "@/components/TemplatePreview";
import EmailEditor from "@/components/EmailEditor";
import ExcelUploader from "@/components/ExcelUploader";
import ProgressTracker from "@/components/ProgressTracker";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, LogOut } from "lucide-react";

interface Recipient {
  name: string;
  email: string;
}

interface SendResult {
  email: string;
  name: string;
  success: boolean;
  error?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(
    EMAIL_TEMPLATES[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [editedSubject, setEditedSubject] = useState(selectedTemplate.subject);
  const [editedContent, setEditedContent] = useState(selectedTemplate.content);

  // Sync edited fields when template changes
  useEffect(() => {
    setEditedSubject(selectedTemplate.subject);
    setEditedContent(selectedTemplate.content);
  }, [selectedTemplate]);

  // Check authentication
  useEffect(() => {
    const credentials = sessionStorage.getItem("gmailCredentials");
    if (!credentials) {
      navigate("/");
    }
  }, [navigate]);

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
  };

  // Send single email (from EmailEditor)
  const handleSendSingle = async (recipientEmail: string, recipientName: string) => {
    if (!recipientEmail || !recipientName) {
      toast({
        title: "Error",
        description: "Please provide recipient name and email",
        variant: "destructive",
      });
      return;
    }

    const credentialsStr = sessionStorage.getItem("gmailCredentials");
    if (!credentialsStr) {
      toast({
        title: "Error",
        description: "Gmail credentials not found, please log in again",
        variant: "destructive",
      });
      return;
    }
    const credentials = JSON.parse(credentialsStr);

    setIsSending(true);
    try {
      const payload = {
        recipientEmail,
        recipientName,
        subject: editedSubject,
        content: editedContent,
        templateId: selectedTemplate.id,
        gmailEmail: credentials.email,
        appPassword: credentials.password,
      };

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send email");
      }

      const singleResult: SendResult = {
        email: recipientEmail,
        name: recipientName,
        success: true,
      };
      setSendResults((prev) => [...prev, singleResult]);
      setShowProgress(true);

      toast({
        title: "Sent",
        description: `Email sent to ${recipientName} (${recipientEmail})`,
      });
    } catch (error) {
      console.error("Send single email error:", error);
      const failResult: SendResult = {
        email: recipientEmail,
        name: recipientName,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
      setSendResults((prev) => [...prev, failResult]);
      setShowProgress(true);

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Send bulk emails
  const handleSendBulkEmails = async () => {
    if (recipients.length === 0) {
      toast({
        title: "Error",
        description: "Please upload recipients first",
        variant: "destructive",
      });
      return;
    }

    const credentialsStr = sessionStorage.getItem("gmailCredentials");
    if (!credentialsStr) {
      toast({
        title: "Error",
        description: "Gmail credentials not found, please log in again",
        variant: "destructive",
      });
      return;
    }
    const credentials = JSON.parse(credentialsStr);

    setShowProgress(true);
    setSendResults([]);
    setIsSending(true);

    try {
      const payload: BulkEmailRequest = {
        recipients,
        subject: editedSubject,
        content: editedContent,
        templateId: selectedTemplate.id,
        gmailEmail: credentials.email,
        appPassword: credentials.password,
      };

      const response = await fetch("/api/bulk-send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send emails");
      }

      if (Array.isArray(data.results)) {
        setSendResults((prev) => [...prev, ...data.results]);
      } else {
        const fallbackResults: SendResult[] = recipients.map((r) => ({
          email: r.email,
          name: r.name,
          success: true,
        }));
        setSendResults((prev) => [...prev, ...fallbackResults]);
      }

      toast({
        title: "Complete",
        description: `Sent ${data.totalSent ?? recipients.length} emails, ${data.totalFailed ?? 0} failed`,
      });
    } catch (error) {
      console.error("Error sending bulk emails:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send emails",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("gmailCredentials");
    setRecipients([]);
    setSendResults([]);
    setShowProgress(false);
    setIsSending(false);
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">📧</span>
              <h1 className="text-3xl font-bold text-slate-900">Email Templates</h1>
            </div>
            <p className="text-slate-600">
              Choose a template, customize it, and send to multiple recipients
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Excel Upload Section */}
        {recipients.length === 0 && !showProgress && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">📤 Upload Recipients from Excel</h3>
              <p className="text-sm text-blue-800 mt-1">
                Upload a CSV or XLSX file with Name and Email columns to send to multiple recipients
              </p>
            </div>
            <Button
              onClick={() => setShowUploader(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 flex gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </Button>
          </div>
        )}

        {/* Progress View */}
        {showProgress && (
          <div className="mb-8">
            <ProgressTracker
              results={sendResults}
              totalToSend={recipients.length}
              isComplete={!isSending}
            />
            {!isSending && (
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => {
                    setShowProgress(false);
                    setRecipients([]);
                    setSendResults([]);
                  }}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Send to More Recipients
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSendBulkEmails}
                  disabled={isSending || recipients.length === 0}
                >
                  Resend Same Template
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Templates Section */}
        {!showProgress && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Template Selection */}
            <div className="lg:col-span-1 space-y-6">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Categories</p>
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
                <TemplatePreview
                  template={{
                    ...selectedTemplate,
                    subject: editedSubject,
                    content: editedContent,
                  }}
                />
                <div>
                  <EmailEditor
                    template={{
                      ...selectedTemplate,
                      subject: editedSubject,
                      content: editedContent,
                    }}
                    onSubjectChange={setEditedSubject}
                    onContentChange={setEditedContent}
                    onSend={handleSendSingle}
                    isSending={isSending}
                  />
                  {recipients.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-semibold text-green-900 mb-3">
                        ✓ {recipients.length} recipient
                        {recipients.length !== 1 ? "s" : ""} ready to send
                      </p>
                      <Button
                        onClick={handleSendBulkEmails}
                        disabled={isSending}
                        className="w-full h-11 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {isSending ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Sending...
                          </div>
                        ) : (
                          "Send to All Recipients"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-600 text-sm">
          <p>Professional Email Template Manager • </p>
        </div>
      </footer>

      {showUploader && (
        <ExcelUploader
          onRecipientsLoaded={(recs) => {
            setRecipients(recs);
            setShowUploader(false);
          }}
          onClose={() => setShowUploader(false)}
        />
      )}
    </div>
  );
}

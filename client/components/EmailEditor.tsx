import { useState, useEffect } from "react";
import { EmailTemplate } from "@shared/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailEditorProps {
  template: EmailTemplate;
  onSubjectChange: (subject: string) => void;
  onContentChange: (content: string) => void;
  onSend: (recipientEmail: string, recipientName: string, gmailCredentials?: string) => void;
  isSending: boolean;
}

export default function EmailEditor({
  template,
  onSubjectChange,
  onContentChange,
  onSend,
  isSending,
}: EmailEditorProps) {
  // Local state
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [subject, setSubject] = useState(template.subject);
  const [content, setContent] = useState(template.content);

  // Sync with parent template changes
  useEffect(() => {
    setSubject(template.subject);
    setContent(template.content);
  }, [template]);

  const handleSend = () => {
    if (!recipientEmail || !recipientName) {
      alert("Please enter both recipient email and name");
      return;
    }

    // Get Gmail credentials from sessionStorage (same as Dashboard)
    const credentials = sessionStorage.getItem("gmailCredentials");
    if (!credentials) {
      alert("Gmail credentials not found. Please login again.");
      return;
    }

    onSend(recipientEmail, recipientName, credentials);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit & Send Email</h3>

         <div className="space-y-4">
          {/*<div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
            <Input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full"
            />
          </div> */}

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g., john@example.com"
              className="w-full"
            />
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                onSubjectChange(e.target.value);
              }}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Email Content</label>
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {editMode ? "Hide HTML" : "Edit HTML"}
              </button>
            </div>

            {editMode ? (
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  onContentChange(e.target.value);
                }}
                className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Edit HTML content here..."
              />
            ) : (
              <div
                className="p-3 bg-white border border-gray-300 rounded-md text-sm text-gray-500 h-32 overflow-auto"
                dangerouslySetInnerHTML={{
                  __html: content.substring(0, 300) + (content.length > 300 ? "..." : ""),
                }}
              />
            )}
          </div>

          {/* <Button
            onClick={handleSend}
            disabled={isSending || !recipientEmail || !recipientName}
            className="w-full h-11 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Sending...
              </div>
            ) : (
              "Send Email"
            )}
          </Button> */}
        </div>
      </Card>
    </div>
  );
}

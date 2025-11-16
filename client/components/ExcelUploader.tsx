import { useRef, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, CheckCircle } from "lucide-react";

interface Recipient {
  [key: string]: any; // كل الأعمدة ممكن تتحط هنا
  name: string;
  email: string;
}

interface ExcelUploaderProps {
  onRecipientsLoaded: (recipients: Recipient[]) => void;
  onClose: () => void;
}

export default function ExcelUploader({ onRecipientsLoaded, onClose }: ExcelUploaderProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        try {
          const parsed = results.data
            .map((row: any) => ({
              ...row, // ناخد كل الأعمدة
              name: row.Name || row.name || row.NAME || "",
              email: row.Email || row.email || row.EMAIL || "",
            }))
            .filter((row: Recipient) => row.email && row.name);

          if (parsed.length === 0) throw new Error('No valid rows found. Make sure your CSV has "Name" and "Email" columns.');

          setRecipients(parsed);
          setFileName(file.name);

          toast({ title: "Success", description: `Loaded ${parsed.length} recipients from CSV` });
        } catch (error) {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to parse CSV",
            variant: "destructive",
          });
        }
      },
      error: (error: any) => {
        toast({ title: "Error", description: `CSV parse error: ${error.message}`, variant: "destructive" });
      },
    });
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        if (!worksheet) throw new Error("No worksheet found");

        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const parsed = jsonData
          .map((row: any) => ({
            ...row, // ناخد كل الأعمدة
            name: row.Name || row.name || row.NAME || "",
            email: row.Email || row.email || row.EMAIL || "",
          }))
          .filter((row: Recipient) => row.email && row.name);

        if (parsed.length === 0) throw new Error('No valid rows found. Make sure your Excel has "Name" and "Email" columns.');

        setRecipients(parsed);
        setFileName(file.name);

        toast({ title: "Success", description: `Loaded ${parsed.length} recipients from Excel` });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to parse Excel",
          variant: "destructive",
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/csv") parseCSV(file);
    else if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") parseExcel(file);
    else toast({ title: "Error", description: "Please upload a CSV or XLSX file", variant: "destructive" });
  };

  const handleContinue = () => {
    if (recipients.length === 0) {
      toast({ title: "Error", description: "Please upload and load a file first", variant: "destructive" });
      return;
    }
    onRecipientsLoaded(recipients);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upload Recipients</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          {recipients.length === 0 ? (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">CSV or XLSX file</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={handleFileSelect} className="hidden" />
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">{fileName}</p>
                  <p className="text-xs text-green-800">{recipients.length} recipient{recipients.length !== 1 ? "s" : ""} loaded</p>
                </div>
              </div>
              <button onClick={() => { setRecipients([]); setFileName(""); fileInputRef.current?.click(); }} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Change file</button>
            </>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-10">Cancel</Button>
            <Button onClick={handleContinue} disabled={recipients.length === 0} className="flex-1 h-10 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Continue</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

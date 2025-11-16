import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface SendResult {
  email: string;
  name: string;
  success: boolean;
  error?: string;
}

interface ProgressTrackerProps {
  results: SendResult[];
  totalToSend: number;
  isComplete: boolean;
}

export default function ProgressTracker({
  results,
  totalToSend,
  isComplete,
}: ProgressTrackerProps) {
  const safeTotal = Math.max(totalToSend, 1);

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;
  const pendingCount = Math.max(totalToSend - results.length, 0);

  const progressPercent = Math.min((results.length / safeTotal) * 100, 100);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sending Progress
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 font-medium">Sent</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {successCount}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-xs text-red-700 font-medium">Failed</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {failureCount}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-700 font-medium">Pending</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {results.length} of {totalToSend}
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {Math.round(progressPercent)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {results.length > 0 && (
          <p className="text-xs font-semibold text-gray-700 mb-3">
            Delivery Details
          </p>
        )}

        {results.map((result) => (
          <div key={result.email} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mt-0.5">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{result.name}</p>
              <p className="text-xs text-gray-500 truncate">{result.email}</p>

              {result.error && (
                <p className="text-xs text-red-600 mt-1">{result.error}</p>
              )}
            </div>

            <div className="flex-shrink-0">
              {!result.success && !isComplete && (
                <Clock className="w-4 h-4 text-gray-400 animate-spin" />
              )}

              {result.success && (
                <span className="text-xs font-medium text-green-700">
                  Sent
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Pending Items */}
        {pendingCount > 0 && (
          <div className="text-center py-4 text-gray-500">
            <div className="inline-block animate-spin">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm mt-2">
              Sending {pendingCount} more email
              {pendingCount !== 1 ? "s" : ""}...
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {isComplete && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900">
            ✓ All emails processed
          </p>
          <p className="text-xs text-blue-800 mt-1">
            {successCount} sent successfully
            {failureCount > 0 && `, ${failureCount} failed`}
          </p>
        </div>
      )}
    </Card>
  );
}

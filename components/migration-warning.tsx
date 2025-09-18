import { Alert, AlertDescription } from "@/components/ui/alert";

export function MigrationWarning() {
  return (
    <div className="flex justify-center items-center fixed top-0 left-0 right-0 z-[60] bg-red-50 border-b border-red-200">
      <Alert className="flex justify-center items-center max-w-7xl mx-auto border-0 bg-transparent shadow-none py-2">
        <div className="flex items-center justify-center w-full">
          <AlertDescription className="text-red-700 text-sm font-medium">
            Backend maintenance in progress - site hosting temporarily
            unavailable. All other features remain fully functional.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}

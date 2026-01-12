import { FormWizard } from "@/components/forms/FormWizard";

export default function DashboardPage() {
  return (
    <div className="p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Comments</h1>
          <p className="text-muted-foreground">
            Generate and post AI-powered comments to YouTube videos
          </p>
        </div>
        <FormWizard />
      </div>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import CustomProgressBar from "@/components/ui/progressbar";
import { createClient } from "@/api/serverClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // redirect to login if user is not logged in
  if (!user) {
    redirect("/Login");
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">UI Testing Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sample Card 1
            </h3>
            <p className="text-3xl font-bold text-blue-600">$12,450</p>
            <p className="text-sm text-gray-500 mt-1">Sample metric</p>
            {/* TODO: code the bar with customer's data */}
            <CustomProgressBar
              current={45}
              goal={100}
              label="Progress towards goal"
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sample Card 2
            </h3>
            <p className="text-3xl font-bold text-green-600">$3,220</p>
            <p className="text-sm text-gray-500 mt-1">Another metric</p>
            {/* TODO: code the bar with customer's data */}
            <CustomProgressBar
              current={75}
              goal={100}
              label="Progress towards goal"
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sample Card 3
            </h3>
            <p className="text-3xl font-bold text-purple-600">85%</p>
            <p className="text-sm text-gray-500 mt-1">Progress indicator</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

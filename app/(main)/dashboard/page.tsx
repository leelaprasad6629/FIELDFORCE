import PageHero from "@/components/PageHero";
import StatCards from "@/components/dashboard/StatCards";
import GoalBanner from "@/components/dashboard/GoalBanner";
import TechnicianFlow from "@/components/dashboard/TechnicianFlow";
import AlertFeed from "@/components/dashboard/AlertFeed";

export default function DashboardPage() {
  return (
    <div>
      <PageHero
        title="Operational insights in one control pane"
        subtitle="FieldForce 360 combines service intelligence, live tracking, and analytics for executive-grade planning."
      />

      <div className="space-y-6">
        <StatCards />
        <GoalBanner />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <TechnicianFlow />
          <AlertFeed />
        </div>
      </div>
    </div>
  );
}

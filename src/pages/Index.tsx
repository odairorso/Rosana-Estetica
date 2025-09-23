import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { WelcomeHeader } from "@/components/welcome-header";
import { DashboardStats } from "@/components/dashboard-stats";
import { UpcomingAppointments } from "@/components/upcoming-appointments";
import { MonthlyGoals } from "@/components/monthly-goals";
import { QuickActions } from "@/components/quick-actions";
import { AlertsSection } from "@/components/alerts-section";
import { FinancialSummary } from "@/components/financial-summary";
import { RecentActivities } from "@/components/recent-activities";
const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900/50">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Header with Sidebar Trigger */}
          <header className="h-14 md:h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-2 md:mr-4" />
            <div className="flex items-center space-x-2">
              <h2 className="text-base md:text-lg font-semibold text-foreground truncate">Dashboard</h2>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-auto">
            <WelcomeHeader />
            
            <DashboardStats />

            <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
              <UpcomingAppointments />
              <RecentActivities />
            </div>

            <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
              <MonthlyGoals />
              <FinancialSummary />
            </div>

            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
              <QuickActions />
              <AlertsSection />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { WelcomeHeader } from "@/components/welcome-header";
import { DashboardStats } from "@/components/dashboard-stats";
import { UpcomingAppointments } from "@/components/upcoming-appointments";
import { MonthlyGoals } from "@/components/monthly-goals";
import { QuickActions } from "@/components/quick-actions";
import { AlertsSection } from "@/components/alerts-section";
import { FinancialSummary } from "@/components/financial-summary";
const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SalonSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Top Header with Sidebar Trigger */}
          <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            <WelcomeHeader />
            
            <DashboardStats />

            <div className="grid gap-6 lg:grid-cols-2">
              <UpcomingAppointments />
              <MonthlyGoals />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <QuickActions />
              <AlertsSection />
              <FinancialSummary />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
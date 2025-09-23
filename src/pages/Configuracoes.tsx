import { useState, ChangeEvent } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SalonSidebar } from "@/components/salon-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Save,
  Building,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Configuracoes() {
  const { toast } = useToast();
  const [salonInfo, setSalonInfo] = useState({
    name: "Rosana Estética",
    phone: "(11) 99999-9999",
    email: "contato@rosanaestetica.com",
    address: "Rua das Flores, 123 - Centro",
    city: "São Paulo",
    state: "SP",
    cep: "01234-567"
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    marketingEmails: false
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90"
  });

  const [logoPreview, setLogoPreview] = useState<string | null>("/logo.png");

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Logo selecionado",
        description: "Clique em 'Salvar Alterações' para confirmar.",
      });
    }
  };

  const handleSalonInfoChange = (field: string, value: string) => {
    setSalonInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field: string, value: string | boolean) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Aqui seria a lógica para salvar o logo no backend
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso.",
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <SalonSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Configurações
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie as configurações do sistema e do salão
                </p>
              </div>
              <Button onClick={handleSave} className="bg-pink-500 hover:bg-pink-600">
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>

            {/* Informações do Salão */}
            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-pink-500" />
                  Informações do Salão
                </CardTitle>
                <CardDescription>
                  Configure as informações básicas do seu salão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={logoPreview || "/placeholder.svg"} 
                    alt="Logo do Salão" 
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="logo-upload">Logo do Salão</Label>
                    <Input 
                      id="logo-upload" 
                      type="file" 
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                      onChange={handleLogoChange}
                      accept="image/png, image/jpeg, image/svg+xml"
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salon-name">Nome do Salão</Label>
                    <Input
                      id="salon-name"
                      value={salonInfo.name}
                      onChange={(e) => handleSalonInfoChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salon-phone">Telefone</Label>
                    <Input
                      id="salon-phone"
                      value={salonInfo.phone}
                      onChange={(e) => handleSalonInfoChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salon-email">E-mail</Label>
                    <Input
                      id="salon-email"
                      type="email"
                      value={salonInfo.email}
                      onChange={(e) => handleSalonInfoChange('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salon-cep">CEP</Label>
                    <Input
                      id="salon-cep"
                      value={salonInfo.cep}
                      onChange={(e) => handleSalonInfoChange('cep', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-address">Endereço</Label>
                  <Input
                    id="salon-address"
                    value={salonInfo.address}
                    onChange={(e) => handleSalonInfoChange('address', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salon-city">Cidade</Label>
                    <Input
                      id="salon-city"
                      value={salonInfo.city}
                      onChange={(e) => handleSalonInfoChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salon-state">Estado</Label>
                    <Input
                      id="salon-state"
                      value={salonInfo.state}
                      onChange={(e) => handleSalonInfoChange('state', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aparência */}
            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-500" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tema</Label>
                    <p className="text-sm text-muted-foreground">
                      Escolha entre tema claro ou escuro
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-pink-500" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure como você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações importantes por e-mail
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações por mensagem de texto
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembretes de Agendamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Envie lembretes automáticos para clientes
                    </p>
                  </div>
                  <Switch
                    checked={notifications.appointmentReminders}
                    onCheckedChange={(checked) => handleNotificationChange('appointmentReminders', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-mails de Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba dicas e novidades sobre o sistema
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Segurança */}
            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-pink-500" />
                  Segurança
                </CardTitle>
                <CardDescription>
                  Configure as opções de segurança do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança
                    </p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Timeout da Sessão (minutos)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={security.sessionTimeout}
                      onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Expiração da Senha (dias)</Label>
                    <Input
                      id="password-expiry"
                      type="number"
                      value={security.passwordExpiry}
                      onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backup e Dados */}
            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-pink-500" />
                  Backup e Dados
                </CardTitle>
                <CardDescription>
                  Gerencie backups e exportação de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Último backup: Hoje às 03:00
                    </p>
                  </div>
                  <Button variant="outline">
                    Fazer Backup Agora
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Exportar Dados</Label>
                    <p className="text-sm text-muted-foreground">
                      Baixe uma cópia dos seus dados
                    </p>
                  </div>
                  <Button variant="outline">
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
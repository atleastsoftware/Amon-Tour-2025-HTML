import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Users, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/contexts/TranslationContext";

interface NewsletterSubscription {
  id: number;
  email: string;
  subscribedAt: string;
  confirmed: boolean;
  unsubscribed: boolean;
  language: string;
}

export default function AdminNewsletterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { translations } = useTranslation();
  const t = translations?.admin?.newsletter || {};
  const common = translations?.admin?.common || {};

  const { data: subscriptions = [], isLoading } = useQuery<NewsletterSubscription[]>({
    queryKey: ["/api/admin/newsletter/subscriptions", { 
      confirmed: statusFilter === "confirmed" ? true : statusFilter === "unconfirmed" ? false : undefined,
      unsubscribed: statusFilter === "unsubscribed" ? true : false
    }],
  });

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/newsletter/export", {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to export subscriptions");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'newsletter-subscribers.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: common?.success || "Export Successful",
        description: t?.exportSuccess || "Newsletter subscribers exported successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: common?.error || "Export Failed",
        description: t?.exportFailed || "Failed to export newsletter subscribers",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (subscription: NewsletterSubscription) => {
    if (subscription.unsubscribed) {
      return <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> {t?.unsubscribed || "Unsubscribed"}</Badge>;
    }
    if (subscription.confirmed) {
      return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="w-3 h-3" /> {t?.confirmed || "Confirmed"}</Badge>;
    }
    return <Badge variant="outline" className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t?.pending || "Pending"}</Badge>;
  };

  const confirmedCount = subscriptions.filter(s => s.confirmed && !s.unsubscribed).length;
  const pendingCount = subscriptions.filter(s => !s.confirmed && !s.unsubscribed).length;
  const unsubscribedCount = subscriptions.filter(s => s.unsubscribed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin')}
                className="flex items-center gap-2 w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                {common?.backToAdmin || "Back to Admin"}
              </Button>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">{t?.title || "Newsletter Management"}</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">{t?.description || "Manage newsletter subscriptions and export subscriber lists"}</p>
              </div>
            </div>
            <Button onClick={handleExport} className="flex items-center gap-2 w-full sm:w-auto">
              <Download className="w-4 h-4" />
              {t?.exportCsv || "Export CSV"}
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t?.totalSubscribers || "Total Subscribers"}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptions.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t?.confirmed || "Confirmed"}</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t?.pendingConfirmation || "Pending Confirmation"}</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t?.unsubscribed || "Unsubscribed"}</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{unsubscribedCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t?.filters || "Filters"}</CardTitle>
              <CardDescription>{t?.filtersDescription || "Search and filter newsletter subscriptions"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t?.searchPlaceholder || "Search by email address..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder={common?.status || "Filter by status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t?.allSubscribers || "All Subscribers"}</SelectItem>
                    <SelectItem value="confirmed">{t?.confirmedOnly || "Confirmed Only"}</SelectItem>
                    <SelectItem value="unconfirmed">{t?.pendingConfirmation || "Pending Confirmation"}</SelectItem>
                    <SelectItem value="unsubscribed">{t?.unsubscribed || "Unsubscribed"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t?.subscriptionsList || "Newsletter Subscriptions"} ({filteredSubscriptions.length})</CardTitle>
              <CardDescription>
                {t?.subscriptionsDescription || "Complete list of newsletter subscribers with their status and subscription details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
              ) : filteredSubscriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? (t?.noMatchingResults || "No subscriptions found matching your search.") : (t?.noSubscriptions || "No newsletter subscriptions yet.")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t?.emailAddress || "Email Address"}</TableHead>
                        <TableHead>{common?.status || "Status"}</TableHead>
                        <TableHead>{t?.subscribedDate || "Subscribed Date"}</TableHead>
                        <TableHead>{t?.language || "Language"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-medium">{subscription.email}</TableCell>
                          <TableCell>{getStatusBadge(subscription)}</TableCell>
                          <TableCell>
                            {new Date(subscription.subscribedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{subscription.language?.toUpperCase() || 'EN'}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
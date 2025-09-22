import { useTranslation } from 'react-i18next';
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
interface NewsletterSubscription {
  id: number;
  email: string;
  subscribedAt: string;
  confirmed: boolean;
  unsubscribed: boolean;
  language: string;
}
export default function AdminNewsletterPage() {
  const {
    t
  } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const {
    data: subscriptions = [],
    isLoading
  } = useQuery<NewsletterSubscription[]>({
    queryKey: ["/api/admin/newsletter/subscriptions", {
      confirmed: statusFilter === "confirmed" ? true : statusFilter === "unconfirmed" ? false : undefined,
      unsubscribed: statusFilter === "unsubscribed" ? true : false
    }]
  });
  const filteredSubscriptions = subscriptions.filter(sub => sub.email.toLowerCase().includes(searchQuery.toLowerCase()));
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
        title: t("Exportsuccessful", {
          defaultValue: "Exportsuccessful"
        }),
        description: t("Newslettersubscriber", {
          defaultValue: "Newslettersubscriber"
        }),
        variant: "default"
      });
    } catch (error) {
      toast({
        title: t("Exportfailed", {
          defaultValue: "Exportfailed"
        }),
        description: t("Failedtoexportnewsle", {
          defaultValue: "Failedtoexportnewsle"
        }),
        variant: "destructive"
      });
    }
  };
  const getStatusBadge = (subscription: NewsletterSubscription) => {
    if (subscription.unsubscribed) {
      return <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="w-3 h-3" />{t("Unsubscribed", {
          defaultValue: "Unsubscribed"
        })}</Badge>;
    }
    if (subscription.confirmed) {
      return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />{t("Confirmed", {
          defaultValue: "Confirmed"
        })}</Badge>;
    }
    return <Badge variant="outline" className="flex items-center gap-1"><Clock className="w-3 h-3" />{t("Pending", {
        defaultValue: "Pending"
      })}</Badge>;
  };
  const confirmedCount = subscriptions.filter(s => s.confirmed && !s.unsubscribed).length;
  const pendingCount = subscriptions.filter(s => !s.confirmed && !s.unsubscribed).length;
  const unsubscribedCount = subscriptions.filter(s => s.unsubscribed).length;
  return <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setLocation('/admin')} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t("Backtoadmin", {
                defaultValue: "Backtoadmin"
              })}</Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("Newslettermanagement", {
                  defaultValue: "Newslettermanagement"
                })}</h1>
                <p className="text-gray-600 mt-2">{t("Managenewslettersubs", {
                  defaultValue: "Managenewslettersubs"
                })}</p>
              </div>
            </div>
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />{t("Exportcsv", {
              defaultValue: "Exportcsv"
            })}</Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Totalsubscribers", {
                  defaultValue: "Totalsubscribers"
                })}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptions.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Confirmed", {
                  defaultValue: "Confirmed"
                })}</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Pendingconfirmation", {
                  defaultValue: "Pendingconfirmation"
                })}</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Unsubscribed", {
                  defaultValue: "Unsubscribed"
                })}</CardTitle>
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
              <CardTitle>{t("Filters", {
                defaultValue: "Filters"
              })}</CardTitle>
              <CardDescription>{t("Searchandfilternewsl", {
                defaultValue: "Searchandfilternewsl"
              })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder={t("Searchbyemailaddress", {
                  defaultValue: "Searchbyemailaddress"
                })} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder={t("Filterbystatus", {
                    defaultValue: "Filterbystatus"
                  })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("Allsubscribers", {
                      defaultValue: "Allsubscribers"
                    })}</SelectItem>
                    <SelectItem value="confirmed">{t("Confirmedonly", {
                      defaultValue: "Confirmedonly"
                    })}</SelectItem>
                    <SelectItem value="unconfirmed">{t("Pendingconfirmation", {
                      defaultValue: "Pendingconfirmation"
                    })}</SelectItem>
                    <SelectItem value="unsubscribed">{t("Unsubscribed", {
                      defaultValue: "Unsubscribed"
                    })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Newslettersubscripti", {
                defaultValue: "Newslettersubscripti"
              })}{filteredSubscriptions.length})</CardTitle>
              <CardDescription>{t("Completelistofnewsle", {
                defaultValue: "Completelistofnewsle"
              })}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div> : filteredSubscriptions.length === 0 ? <div className="text-center py-8 text-gray-500">
                  {searchQuery ? "No subscriptions found matching your search." : "No newsletter subscriptions yet."}
                </div> : <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("Emailaddress", {
                        defaultValue: "Emailaddress"
                      })}</TableHead>
                        <TableHead>{t("Status", {
                        defaultValue: "Status"
                      })}</TableHead>
                        <TableHead>{t("Subscribeddate", {
                        defaultValue: "Subscribeddate"
                      })}</TableHead>
                        <TableHead>{t("Language", {
                        defaultValue: "Language"
                      })}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map(subscription => <TableRow key={subscription.id}>
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
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </div>}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>;
}
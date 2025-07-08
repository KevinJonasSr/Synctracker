import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import AddCalendarEventForm from "@/components/forms/add-calendar-event-form";
import { Calendar as CalendarIcon, Clock, Plus, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarEvent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Calendar() {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editDate, setEditDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("list");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar-events"],
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["/api/deals"],
  });

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getEntityTypeColor = (entityType: string) => {
    const colors = {
      deal: "bg-purple-100 text-purple-800",
      pitch: "bg-orange-100 text-orange-800",
      payment: "bg-green-100 text-green-800",
      song: "bg-blue-100 text-blue-800",
      contact: "bg-yellow-100 text-yellow-800",
    };
    return colors[entityType as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEntityType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Combine calendar events with air dates from deals
  const airDateEvents = deals
    .filter((deal: any) => deal.airDate)
    .map((deal: any) => ({
      id: `deal-${deal.id}`,
      title: `Air Date: ${deal.projectName}`,
      description: `Project "${deal.projectName}" (${deal.projectType}) is scheduled to air.`,
      startDate: deal.airDate,
      endDate: deal.airDate,
      allDay: true,
      entityType: 'deal',
      entityId: deal.id,
      status: 'scheduled',
      reminderMinutes: 1440
    }));

  const allEvents = [...events, ...airDateEvents];

  const filteredEvents = allEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.entityType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingEvents = allEvents.filter(event => 
    new Date(event.startDate) > new Date() && event.status === 'scheduled'
  ).slice(0, 5);

  const overdueEvents = allEvents.filter(event => 
    new Date(event.startDate) < new Date() && event.status === 'scheduled'
  );

  // Monthly view helpers
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  
  const getEventsForMonth = (month: Date) => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    return allEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= start && eventDate <= end;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  const currentMonthEvents = getEventsForMonth(currentMonth);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Edit air date mutation
  const editAirDateMutation = useMutation({
    mutationFn: async ({ eventId, newDate }: { eventId: number; newDate: string }) => {
      const response = await apiRequest(`/api/calendar-events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: newDate,
          endDate: newDate,
        })
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      toast({
        title: "Air date updated successfully",
        description: "The air date has been updated in the calendar.",
      });
      setEditingEvent(null);
      setEditDate("");
    },
    onError: (error) => {
      toast({
        title: "Error updating air date",
        description: "Failed to update the air date. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEditAirDate = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEditDate(new Date(event.startDate).toISOString().split('T')[0]);
  };

  const handleSaveEdit = () => {
    if (editingEvent && editDate) {
      editAirDateMutation.mutate({
        eventId: editingEvent.id,
        newDate: new Date(editDate).toISOString(),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header
          title="Calendar"
          description="Manage important dates and deadlines for your sync licensing deals"
        />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        title="Calendar"
        description="Manage important dates and deadlines for your sync licensing deals"
        searchPlaceholder="Search events..."
        onSearch={setSearchQuery}
        onNewItem={() => setIsAddFormOpen(true)}
        newItemLabel="New Event"
        showSearch={activeTab === "list"}
        showNewButton={true}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allEvents.filter(event => {
                const eventDate = new Date(event.startDate);
                const now = new Date();
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return eventDate >= now && eventDate <= weekFromNow;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your next 5 scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{event.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(event.startDate)}</span>
                      <Badge className={getEntityTypeColor(event.entityType)}>
                        {formatEntityType(event.entityType)}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            Complete list of calendar events and deadlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reminder</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {allEvents.length === 0 
                        ? "No calendar events yet. Create your first event or add a deal with an air date!"
                        : "No events match your search."
                      }
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{formatDate(event.startDate)}</p>
                        {event.allDay && (
                          <Badge variant="outline" className="text-xs">All Day</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEntityTypeColor(event.entityType)}>
                        {formatEntityType(event.entityType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.reminderMinutes > 0 ? (
                        `${event.reminderMinutes} min before`
                      ) : (
                        "No reminder"
                      )}
                    </TableCell>
                    <TableCell>
                      {event.entityType === 'deal' ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditAirDate(event)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Date
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="monthly" className="space-y-6">
        {/* Monthly View Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Monthly Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Air Dates for {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</CardTitle>
            <CardDescription>
              {currentMonthEvents.length} event{currentMonthEvents.length !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentMonthEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No events scheduled for this month</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentMonthEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{event.title}</p>
                        <Badge className={getEntityTypeColor(event.entityType)}>
                          {formatEntityType(event.entityType)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      {event.entityType === 'deal' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditAirDate(event)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Date
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>

      {/* Edit Air Date Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Air Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Air Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingEvent(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={!editDate || editAirDateMutation.isPending}
              >
                {editAirDateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddCalendarEventForm
        open={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
      />
    </div>
  );
}
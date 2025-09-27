import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import AddContactForm from "@/components/forms/add-contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Building, Edit, Trash2 } from "lucide-react";
import type { Contact } from "@shared/schema";

export default function Contacts() {
  const [showAddContact, setShowAddContact] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: contacts = [], isLoading, error } = useQuery<Contact[]>({
    queryKey: ["/api/contacts", searchQuery],
    queryFn: async () => {
      const url = new URL("/api/contacts", window.location.origin);
      if (searchQuery) {
        url.searchParams.set("search", searchQuery);
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div>
        <Header
          title="Contacts"
          description="Manage your music industry contacts and relationships"
          searchPlaceholder="Search contacts, companies..."
          newItemLabel="Add Contact"
        />
        <div className="p-6">
          <div className="grid gap-6" role="status" aria-live="polite" aria-label="Loading contacts">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <span className="sr-only">Loading contacts, please wait...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-2">Failed to load contacts</div>
          <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-brand-primary hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Contacts"
        description="Manage your music industry contacts and relationships"
        searchPlaceholder="Search contacts, companies..."
        newItemLabel="Add Contact"
        onSearch={setSearchQuery}
        onNewItem={() => setShowAddContact(true)}
      />
      
      <div className="p-6">
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600 text-center mb-6">
                {searchQuery 
                  ? "No contacts match your search criteria. Try adjusting your search terms."
                  : "Start building your network by adding your first contact."
                }
              </p>
              <Button onClick={() => setShowAddContact(true)} className="bg-brand-primary hover:bg-blue-700">
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="h-8 w-8 text-brand-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                          {contact.role && (
                            <span className="text-sm text-gray-600">• {contact.role}</span>
                          )}
                        </div>
                        
                        {contact.company && (
                          <div className="flex items-center space-x-2 mb-3">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{contact.company}</span>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <a 
                              href={`mailto:${contact.email}`}
                              className="text-brand-primary hover:underline"
                            >
                              {contact.email}
                            </a>
                          </div>
                          
                          {contact.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <a 
                                href={`tel:${contact.phone}`}
                                className="text-brand-primary hover:underline"
                              >
                                {contact.phone}
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {contact.notes && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                            <p className="text-sm text-gray-600">{contact.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setEditingContact(contact);
                          setShowEditContact(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2 sm:mr-0" />
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2 sm:mr-0" />
                        <span className="sm:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddContactForm open={showAddContact} onClose={() => setShowAddContact(false)} />
      
      <AddContactForm 
        open={showEditContact} 
        onClose={() => {
          setShowEditContact(false);
          setEditingContact(undefined);
        }}
        contact={editingContact}
      />
    </div>
  );
}

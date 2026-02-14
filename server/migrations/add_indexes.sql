-- Performance Optimization Indexes
-- Add indexes to frequently queried columns for better performance

-- Songs table indexes
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at DESC);

-- Contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);

-- Deals table indexes
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_project_name ON deals(project_name);
CREATE INDEX IF NOT EXISTS idx_deals_project_type ON deals(project_type);
CREATE INDEX IF NOT EXISTS idx_deals_song_id ON deals(song_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_air_date ON deals(air_date);
CREATE INDEX IF NOT EXISTS idx_deals_payment_date ON deals(payment_date);
CREATE INDEX IF NOT EXISTS idx_deals_completion_date ON deals(completion_date);

-- Pitches table indexes
CREATE INDEX IF NOT EXISTS idx_pitches_deal_id ON pitches(deal_id);
CREATE INDEX IF NOT EXISTS idx_pitches_status ON pitches(status);
CREATE INDEX IF NOT EXISTS idx_pitches_submission_date ON pitches(submission_date DESC);
CREATE INDEX IF NOT EXISTS idx_pitches_follow_up_date ON pitches(follow_up_date);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_deal_id ON payments(deal_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_paid_date ON payments(paid_date);

-- Email sends table indexes
CREATE INDEX IF NOT EXISTS idx_email_sends_deal_id ON email_sends(deal_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_contact_id ON email_sends(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON email_sends(sent_at DESC);

-- Attachments table indexes
CREATE INDEX IF NOT EXISTS idx_attachments_entity_type_id ON attachments(entity_type, entity_id);

-- Calendar events table indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_entity_type_id ON calendar_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);

-- Playlists table indexes
CREATE INDEX IF NOT EXISTS idx_playlists_type ON playlists(type);
CREATE INDEX IF NOT EXISTS idx_playlists_client_id ON playlists(client_id);

-- Playlist songs table indexes
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON playlist_songs(song_id);

-- Bulk pitches table indexes
CREATE INDEX IF NOT EXISTS idx_bulk_pitches_contact_id ON bulk_pitches(contact_id);
CREATE INDEX IF NOT EXISTS idx_bulk_pitches_status ON bulk_pitches(status);
CREATE INDEX IF NOT EXISTS idx_bulk_pitches_sent_date ON bulk_pitches(sent_date DESC);

-- Analytics events table indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity_type_id ON analytics_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);

-- Smart pitch matches table indexes
CREATE INDEX IF NOT EXISTS idx_smart_pitch_matches_song_id ON smart_pitch_matches(song_id);
CREATE INDEX IF NOT EXISTS idx_smart_pitch_matches_deal_id ON smart_pitch_matches(deal_id);
CREATE INDEX IF NOT EXISTS idx_smart_pitch_matches_match_score ON smart_pitch_matches(match_score DESC);

-- Invoices table indexes
CREATE INDEX IF NOT EXISTS idx_invoices_deal_id ON invoices(deal_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Expenses table indexes
CREATE INDEX IF NOT EXISTS idx_expenses_song_id ON expenses(song_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_deals_status_created ON deals(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_contact_status ON deals(contact_id, status);
CREATE INDEX IF NOT EXISTS idx_deals_song_status ON deals(song_id, status);

-- Full-text search indexes (PostgreSQL specific)
-- These enable faster text searches across multiple fields
CREATE INDEX IF NOT EXISTS idx_songs_search ON songs USING gin(to_tsvector('english',
  coalesce(title, '') || ' ' ||
  coalesce(artist, '') || ' ' ||
  coalesce(album, '') || ' ' ||
  coalesce(genre, '')
));

CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts USING gin(to_tsvector('english',
  coalesce(name, '') || ' ' ||
  coalesce(email, '') || ' ' ||
  coalesce(company, '')
));

CREATE INDEX IF NOT EXISTS idx_deals_search ON deals USING gin(to_tsvector('english',
  coalesce(project_name, '') || ' ' ||
  coalesce(project_description, '')
));

-- Add comments for documentation
COMMENT ON INDEX idx_songs_title IS 'Speeds up song title searches';
COMMENT ON INDEX idx_deals_status IS 'Optimizes deal filtering by status';
COMMENT ON INDEX idx_deals_status_created IS 'Composite index for status-based sorted lists';
COMMENT ON INDEX idx_songs_search IS 'Full-text search index for songs';
COMMENT ON INDEX idx_contacts_search IS 'Full-text search index for contacts';
COMMENT ON INDEX idx_deals_search IS 'Full-text search index for deals';

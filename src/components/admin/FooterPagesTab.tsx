import React, { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

interface FooterPage {
  id: string;
  title: string;
  content: string;
}

export function FooterPagesTab() {
  const [pages, setPages] = useState<Record<string, FooterPage>>({
    footer_about: { id: 'footer_about', title: 'About LocalFelo', content: '' },
    footer_terms: { id: 'footer_terms', title: 'Terms & Conditions', content: '' },
    footer_privacy: { id: 'footer_privacy', title: 'Privacy Policy', content: '' },
    footer_contact: { id: 'footer_contact', title: 'Contact Information', content: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('id, title, content')
        .in('id', ['footer_about', 'footer_terms', 'footer_privacy', 'footer_contact']);

      if (error) throw error;

      if (data) {
        const loadedPages = { ...pages };
        data.forEach((page: any) => {
          loadedPages[page.id] = {
            id: page.id,
            title: page.title || loadedPages[page.id].title,
            content: page.content || '',
          };
        });
        setPages(loadedPages);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load pages');
    }
    setLoading(false);
  };

  const handleSave = async (pageId: string) => {
    setSaving(pageId);
    try {
      const page = pages[pageId];
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: pageId,
          setting_type: 'footer_page',
          enabled: true,
          title: page.title,
          content: page.content,
          priority: 1,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success(`${page.title} updated successfully!`);
    } catch (error: any) {
      console.error('Error saving page:', error);
      toast.error(`Failed to save: ${error.message}`);
    }
    setSaving(null);
  };

  const updatePage = (pageId: string, field: 'title' | 'content', value: string) => {
    setPages(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-heading m-0">Footer Pages Content</h2>
        <p className="text-sm text-muted m-0 mt-1">
          Edit the content for About, Terms, Privacy, and Contact pages
        </p>
      </div>

      {/* About Page */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-heading m-0">About Page</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Page Title
          </label>
          <input
            type="text"
            value={pages.footer_about.title}
            onChange={(e) => updatePage('footer_about', 'title', e.target.value)}
            className="input w-full"
            placeholder="About LocalFelo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Page Content (Markdown supported)
          </label>
          <textarea
            value={pages.footer_about.content}
            onChange={(e) => updatePage('footer_about', 'content', e.target.value)}
            className="textarea-field w-full"
            rows={8}
            placeholder="Enter the about page content..."
          />
          <p className="text-xs text-muted mt-1.5">
            {pages.footer_about.content.length} characters
          </p>
        </div>

        <button
          onClick={() => handleSave('footer_about')}
          disabled={saving === 'footer_about'}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving === 'footer_about' ? 'Saving...' : 'Save About Page'}</span>
        </button>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-heading m-0">Terms & Conditions</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Page Title
          </label>
          <input
            type="text"
            value={pages.footer_terms.title}
            onChange={(e) => updatePage('footer_terms', 'title', e.target.value)}
            className="input w-full"
            placeholder="Terms & Conditions"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Page Content (Markdown supported)
          </label>
          <textarea
            value={pages.footer_terms.content}
            onChange={(e) => updatePage('footer_terms', 'content', e.target.value)}
            className="textarea-field w-full"
            rows={12}
            placeholder="Enter the terms and conditions..."
          />
          <p className="text-xs text-muted mt-1.5">
            {pages.footer_terms.content.length} characters
          </p>
        </div>

        <button
          onClick={() => handleSave('footer_terms')}
          disabled={saving === 'footer_terms'}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving === 'footer_terms' ? 'Saving...' : 'Save Terms & Conditions'}</span>
        </button>
      </div>

      {/* Privacy Policy */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-heading m-0">Privacy Policy</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Page Title
          </label>
          <input
            type="text"
            value={pages.footer_privacy.title}
            onChange={(e) => updatePage('footer_privacy', 'title', e.target.value)}
            className="input w-full"
            placeholder="Privacy Policy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Page Content (Markdown supported)
          </label>
          <textarea
            value={pages.footer_privacy.content}
            onChange={(e) => updatePage('footer_privacy', 'content', e.target.value)}
            className="textarea-field w-full"
            rows={12}
            placeholder="Enter the privacy policy..."
          />
          <p className="text-xs text-muted mt-1.5">
            {pages.footer_privacy.content.length} characters
          </p>
        </div>

        <button
          onClick={() => handleSave('footer_privacy')}
          disabled={saving === 'footer_privacy'}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving === 'footer_privacy' ? 'Saving...' : 'Save Privacy Policy'}</span>
        </button>
      </div>

      {/* Contact Information */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-heading m-0">Contact Information</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Page Title
          </label>
          <input
            type="text"
            value={pages.footer_contact.title}
            onChange={(e) => updatePage('footer_contact', 'title', e.target.value)}
            className="input w-full"
            placeholder="Contact Information"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Page Content (Markdown supported)
          </label>
          <textarea
            value={pages.footer_contact.content}
            onChange={(e) => updatePage('footer_contact', 'content', e.target.value)}
            className="textarea-field w-full"
            rows={10}
            placeholder="Enter contact information..."
          />
          <p className="text-xs text-muted mt-1.5">
            {pages.footer_contact.content.length} characters
          </p>
        </div>

        <button
          onClick={() => handleSave('footer_contact')}
          disabled={saving === 'footer_contact'}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving === 'footer_contact' ? 'Saving...' : 'Save Contact Information'}</span>
        </button>
      </div>
    </div>
  );
}

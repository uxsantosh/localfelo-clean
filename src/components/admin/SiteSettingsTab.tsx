import React, { useState, useEffect } from 'react';
import { Save, Palette, Smartphone, Briefcase, Image as ImageIcon, Instagram, Facebook, Linkedin } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

export function SiteSettingsTab() {
  // Home Banner State
  const [bannerText, setBannerText] = useState('');
  const [bannerIcon, setBannerIcon] = useState('📢');
  const [gradientColor1, setGradientColor1] = useState('#CDFF00');
  const [gradientColor2, setGradientColor2] = useState('#CDFF00');
  const [textColor, setTextColor] = useState('#000000');
  const [opacity, setOpacity] = useState(8);
  
  // App Download State
  const [appDownloadEnabled, setAppDownloadEnabled] = useState(false);
  const [appDownloadUrl, setAppDownloadUrl] = useState('');
  const [appDownloadMessage, setAppDownloadMessage] = useState('Download our app from Google Play Store');
  
  // Active Task Banner State
  const [taskBannerTitle, setTaskBannerTitle] = useState('Active Tasks');
  const [taskBannerMessage, setTaskBannerMessage] = useState('Tap to view details');
  const [taskBannerImageUrl, setTaskBannerImageUrl] = useState('');
  
  // Social Media Links State
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setIsLoading(true);
    try {
      // Load home banner settings
      const { data: bannerData } = await supabase
        .from('site_settings')
        .select('message, emoji, gradient_color_1, gradient_color_2, text_color, opacity')
        .eq('id', 'home_banner')
        .single();

      if (bannerData) {
        setBannerText(bannerData.message || '');
        setBannerIcon(bannerData.emoji || '📢');
        setGradientColor1(bannerData.gradient_color_1 || '#CDFF00');
        setGradientColor2(bannerData.gradient_color_2 || '#CDFF00');
        setTextColor(bannerData.text_color || '#000000');
        setOpacity(bannerData.opacity || 8);
      }
      
      // Load app download settings
      const { data: appData } = await supabase
        .from('site_settings')
        .select('enabled, app_download_url, message')
        .eq('id', 'app_download')
        .single();

      if (appData) {
        setAppDownloadEnabled(appData.enabled || false);
        setAppDownloadUrl(appData.app_download_url || '');
        setAppDownloadMessage(appData.message || 'Download our app from Google Play Store');
      }
      
      // Load active task banner settings
      const { data: taskData } = await supabase
        .from('site_settings')
        .select('title, message, image_url')
        .eq('id', 'active_task_banner')
        .single();

      if (taskData) {
        setTaskBannerTitle(taskData.title || 'Active Tasks');
        setTaskBannerMessage(taskData.message || 'Tap to view details');
        setTaskBannerImageUrl(taskData.image_url || '');
      }
      
      // Load social media links
      const { data: socialData } = await supabase
        .from('site_settings')
        .select('instagram_url, facebook_url, linkedin_url')
        .eq('id', 'social_links')
        .single();

      if (socialData) {
        setInstagramUrl(socialData.instagram_url || '');
        setFacebookUrl(socialData.facebook_url || '');
        setLinkedinUrl(socialData.linkedin_url || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    setIsLoading(false);
  };

  const handleSaveBanner = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 'home_banner',
          setting_type: 'banner',
          enabled: true,
          message: bannerText,
          emoji: bannerIcon,
          gradient_color_1: gradientColor1,
          gradient_color_2: gradientColor2,
          text_color: textColor,
          opacity: opacity,
          icon: 'megaphone',
          style_type: 'info',
          storage_key: 'home-banner-v1',
          priority: 1,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success('Banner saved successfully!');
    } catch (error: any) {
      console.error('Error saving banner:', error);
      toast.error(`Failed to save: ${error.message}`);
    }
    setIsSaving(false);
  };

  const handleSaveAppDownload = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 'app_download',
          setting_type: 'app_download',
          enabled: appDownloadEnabled,
          message: appDownloadMessage,
          app_download_url: appDownloadUrl,
          priority: 1,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success('App download settings saved!');
    } catch (error: any) {
      console.error('Error saving app download:', error);
      toast.error(`Failed to save: ${error.message}`);
    }
    setIsSaving(false);
  };

  const handleSaveTaskBanner = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 'active_task_banner',
          setting_type: 'active_task_banner',
          enabled: true,
          title: taskBannerTitle,
          message: taskBannerMessage,
          image_url: taskBannerImageUrl,
          icon: 'briefcase',
          priority: 1,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success('Active task banner settings saved!');
    } catch (error: any) {
      console.error('Error saving task banner:', error);
      toast.error(`Failed to save: ${error.message}`);
    }
    setIsSaving(false);
  };

  const handleSaveSocialLinks = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 'social_links',
          setting_type: 'social_links',
          enabled: true,
          instagram_url: instagramUrl,
          facebook_url: facebookUrl,
          linkedin_url: linkedinUrl,
          priority: 1,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success('Social links saved successfully!');
    } catch (error: any) {
      console.error('Error saving social links:', error);
      toast.error(`Failed to save: ${error.message}`);
    }
    setIsSaving(false);
  };

  if (isLoading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-heading m-0">Home Page Banner</h2>
        <p className="text-sm text-muted m-0 mt-1">
          Customize the banner message and styling that appears at the top of the home page
        </p>
      </div>

      {/* Settings */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {/* Banner Message */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Banner Message
          </label>
          <input
            type="text"
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            className="input w-full"
            placeholder="Enter banner text (e.g., 'Welcome to LocalFelo!')"
            maxLength={200}
          />
          <p className="text-xs text-muted mt-1.5">
            {bannerText.length}/200 characters
          </p>
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Icon/Emoji
          </label>
          <input
            type="text"
            value={bannerIcon}
            onChange={(e) => setBannerIcon(e.target.value)}
            className="input w-full"
            placeholder="📢"
            maxLength={10}
          />
          <p className="text-xs text-muted mt-1.5">
            Use any emoji or icon (e.g., 📢, 🎉, 🔥, ⚡, 🎯)
          </p>
        </div>

        {/* Gradient Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-body mb-2">
              Gradient Color 1
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={gradientColor1}
                onChange={(e) => setGradientColor1(e.target.value)}
                className="h-10 w-16 rounded cursor-pointer border border-border"
              />
              <input
                type="text"
                value={gradientColor1}
                onChange={(e) => setGradientColor1(e.target.value)}
                className="input flex-1"
                placeholder="#CDFF00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-2">
              Gradient Color 2
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={gradientColor2}
                onChange={(e) => setGradientColor2(e.target.value)}
                className="h-10 w-16 rounded cursor-pointer border border-border"
              />
              <input
                type="text"
                value={gradientColor2}
                onChange={(e) => setGradientColor2(e.target.value)}
                className="input flex-1"
                placeholder="#CDFF00"
              />
            </div>
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Text Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="h-10 w-16 rounded cursor-pointer border border-border"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="input flex-1"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Background Opacity: {opacity}%
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${gradientColor1} 0%, ${gradientColor2} 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>Subtle (0%)</span>
            <span>Strong (30%)</span>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveBanner}
          disabled={isSaving || !bannerText.trim()}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Banner Settings'}</span>
        </button>
      </div>

      {/* Live Preview */}
      {bannerText && (
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm font-medium text-body mb-3">Live Preview:</p>
          
          {/* Match the actual banner design */}
          <div className="relative w-full overflow-hidden -mx-6">
            {/* Dynamic gradient background */}
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${gradientColor1}, ${gradientColor2})`,
                opacity: opacity / 100
              }}
            ></div>
            
            {/* Content */}
            <div 
              className="relative px-4 py-3.5 flex items-center justify-center gap-3 border-y"
              style={{ borderColor: `${textColor}15` }}
            >
              {/* Animated icon */}
              <span className="text-xl animate-bounce">{bannerIcon}</span>
              
              {/* Text with custom color */}
              <p className="m-0 font-medium" style={{ color: textColor }}>
                {bannerText}
              </p>
              
              {/* Decorative pulse dot */}
              <div 
                className="flex-shrink-0 w-1.5 h-1.5 rounded-full animate-ping"
                style={{ backgroundColor: textColor }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* App Download Settings */}
      <div>
        <h2 className="text-heading m-0">App Download Settings</h2>
        <p className="text-sm text-muted m-0 mt-1">
          Configure the app download link and message
        </p>
      </div>

      {/* Settings */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {/* Enable App Download */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Enable App Download
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={appDownloadEnabled}
              onChange={(e) => setAppDownloadEnabled(e.target.checked)}
              className="h-4 w-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <span className="ml-2 text-sm text-body">Enable</span>
          </div>
        </div>

        {/* App Download URL */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            App Download URL
          </label>
          <input
            type="text"
            value={appDownloadUrl}
            onChange={(e) => setAppDownloadUrl(e.target.value)}
            className="input w-full"
            placeholder="Enter app download URL (e.g., 'https://play.google.com/store/apps/details?id=com.localfelo')"
            maxLength={200}
          />
          <p className="text-xs text-muted mt-1.5">
            {appDownloadUrl.length}/200 characters
          </p>
        </div>

        {/* App Download Message */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            App Download Message
          </label>
          <input
            type="text"
            value={appDownloadMessage}
            onChange={(e) => setAppDownloadMessage(e.target.value)}
            className="input w-full"
            placeholder="Enter app download message (e.g., 'Download our app from Google Play Store')"
            maxLength={200}
          />
          <p className="text-xs text-muted mt-1.5">
            {appDownloadMessage.length}/200 characters
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveAppDownload}
          disabled={isSaving || !appDownloadUrl.trim()}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save App Download Settings'}</span>
        </button>
      </div>

      {/* Active Task Banner Settings */}
      <div>
        <h2 className="text-heading m-0">Active Task Banner Settings</h2>
        <p className="text-sm text-muted m-0 mt-1">
          Configure the active task banner message and image
        </p>
      </div>

      {/* Settings */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Title
          </label>
          <input
            type="text"
            value={taskBannerTitle}
            onChange={(e) => setTaskBannerTitle(e.target.value)}
            className="input w-full"
            placeholder="Enter title (e.g., 'Active Tasks')"
            maxLength={200}
          />
          <p className="text-xs text-muted mt-1.5">
            {taskBannerTitle.length}/200 characters
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Message
          </label>
          <input
            type="text"
            value={taskBannerMessage}
            onChange={(e) => setTaskBannerMessage(e.target.value)}
            className="input w-full"
            placeholder="Enter message (e.g., 'Tap to view details')"
            maxLength={200}
          />
          <p className="text-xs text-muted mt-1.5">
            {taskBannerMessage.length}/200 characters
          </p>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Image URL
          </label>
          <input
            type="text"
            value={taskBannerImageUrl}
            onChange={(e) => setTaskBannerImageUrl(e.target.value)}
            className="input w-full"
            placeholder="Enter image URL (e.g., 'https://example.com/image.png')"
            maxLength={200}
          />
          <p className="text-xs text-muted mt-1.5">
            {taskBannerImageUrl.length}/200 characters
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveTaskBanner}
          disabled={isSaving || !taskBannerTitle.trim()}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Active Task Banner Settings'}</span>
        </button>
      </div>

      {/* Social Media Links Settings */}
      <div>
        <h2 className="text-heading m-0">Social Media Links Settings</h2>
        <p className="text-sm text-muted m-0 mt-1">
          Configure the social media links
        </p>
      </div>

      {/* Settings */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {/* Instagram URL */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Instagram URL
          </label>
          <input
            type="text"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="input w-full"
            placeholder="Enter Instagram URL (e.g., 'https://www.instagram.com/localfelo/')"
            maxLength={200}
          />
          <p className="text-xs text-muted mt-1.5">
            {instagramUrl.length}/200 characters
          </p>
        </div>

        {/* Facebook URL */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Facebook URL
          </label>
          <input
            type="text"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            className="input w-full"
            placeholder="Enter Facebook URL (e.g., 'https://www.facebook.com/localfelo/')"
            maxLength={200}
          />
          <p className="text-xs text-muted mt-1.5">
            {facebookUrl.length}/200 characters
          </p>
        </div>

        {/* LinkedIn URL */}
        <div>
          <label className="block text-sm font-medium text-body mb-2">
            LinkedIn URL
          </label>
          <input
            type="text"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="input w-full"
            placeholder="Enter LinkedIn URL (e.g., 'https://www.linkedin.com/company/localfelo/')"
            maxLength={200}
          />
          <p className="text-xs text-muted mt-1.5">
            {linkedinUrl.length}/200 characters
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSocialLinks}
          disabled={isSaving || !instagramUrl.trim()}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Social Links Settings'}</span>
        </button>
      </div>
    </div>
  );
}
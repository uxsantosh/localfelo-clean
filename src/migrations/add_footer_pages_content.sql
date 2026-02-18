-- Add column for footer page content storage
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS content TEXT;

-- Insert default footer pages
INSERT INTO site_settings (id, setting_type, enabled, title, message, content, priority)
VALUES (
  'footer_about',
  'footer_page',
  true,
  'About LocalFelo',
  'Learn more about LocalFelo',
  'LocalFelo is a hyperlocal marketplace platform that connects buyers and sellers in your area. We facilitate local commerce without handling payments or deliveries - users connect directly.',
  1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO site_settings (id, setting_type, enabled, title, message, content, priority)
VALUES (
  'footer_terms',
  'footer_page',
  true,
  'Terms & Conditions',
  'Terms and conditions of use',
  '# Terms & Conditions

## 1. Acceptance of Terms
By accessing and using LocalFelo, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use of Service
LocalFelo is a connector platform only. We do not handle payments, deliveries, or transactions between users.

## 3. User Responsibilities
Users are responsible for their own transactions, payments, and deliveries arranged through our platform.

## 4. Prohibited Content
Users must not post illegal items, offensive content, or violate our community guidelines.

## 5. Limitation of Liability
LocalFelo is not responsible for transactions between users.',
  1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO site_settings (id, setting_type, enabled, title, message, content, priority)
VALUES (
  'footer_privacy',
  'footer_page',
  true,
  'Privacy Policy',
  'How we handle your data',
  '# Privacy Policy

## Information We Collect
- Account information (phone number, name)
- Location data for local matching
- Listing and communication data

## How We Use Your Information
- To provide and improve our services
- To connect you with local buyers/sellers
- To send important notifications

## Data Security
We implement security measures to protect your personal information.

## Your Rights
You can access, modify, or delete your data at any time.',
  1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO site_settings (id, setting_type, enabled, title, message, content, priority)
VALUES (
  'footer_contact',
  'footer_page',
  true,
  'Contact Information',
  'Get in touch with us',
  '# Contact Us

## Email
support@localfelo.com

## Response Time
We typically respond within 24-48 hours.

## Support Hours
Monday - Friday: 9:00 AM - 6:00 PM IST
Saturday - Sunday: Closed

## Address
LocalFelo Technologies
[Your Address Here]',
  1
) ON CONFLICT (id) DO NOTHING;

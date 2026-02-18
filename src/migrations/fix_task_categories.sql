-- =====================================================
-- FIX: Ensure Task Categories Exist in Database
-- Run this if you're getting foreign key errors when creating tasks
-- =====================================================

-- Insert task categories if they don't exist (using TEXT IDs)
INSERT INTO categories (id, name, slug, emoji, type, sort_order) VALUES
('301', 'Delivery / Pickup', 'delivery-pickup', '📦', 'task', 1),
('302', 'Moving / Lifting', 'moving-lifting', '🏋️', 'task', 2),
('303', 'Repairs & Maintenance', 'repairs-maintenance', '🔧', 'task', 3),
('304', 'Cleaning', 'cleaning', '🧹', 'task', 4),
('305', 'Tech Help', 'tech-help', '💻', 'task', 5),
('306', 'Cooking', 'cooking', '🍳', 'task', 6),
('307', 'Office Errands', 'office-errands', '📋', 'task', 7),
('308', 'Personal Help', 'personal-help', '🤝', 'task', 8),
('309', 'Other Task', 'task-other', '📌', 'task', 9)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  slug = EXCLUDED.slug,
  type = EXCLUDED.type,
  sort_order = EXCLUDED.sort_order;

-- Verify categories exist
SELECT id, name, emoji, type FROM categories WHERE type = 'task' ORDER BY sort_order;

-- Insert default notification categories
INSERT INTO notification_categories (id, name, description, icon, color, "displayOrder", "isActive") VALUES
  ('cat_performance', 'Performance Management', 'Performance plans, appraisals, and reviews', 'chart-bar', '#3B82F6', 1, true),
  ('cat_training', 'Training & Development', 'Training assignments and completions', 'academic-cap', '#8B5CF6', 2, true),
  ('cat_deadlines', 'Deadlines & Reminders', 'Important deadlines and time-sensitive tasks', 'clock', '#F59E0B', 3, true),
  ('cat_approvals', 'Approvals Required', 'Items requiring management approval', 'check-circle', '#10B981', 4, true),
  ('cat_escalations', 'Escalations', 'Issues requiring immediate attention', 'exclamation-triangle', '#EF4444', 5, true),
  ('cat_leave', 'Leave Management', 'Leave applications and approvals', 'calendar', '#06B6D4', 6, true),
  ('cat_compliance', 'Compliance & Audit', 'Compliance tracking and audit requirements', 'shield-check', '#7C3AED', 7, true),
  ('cat_system', 'System Notifications', 'Automated system alerts and updates', 'cog', '#6B7280', 8, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  "displayOrder" = EXCLUDED."displayOrder",
  "isActive" = EXCLUDED."isActive";

-- Insert sample routing rules
INSERT INTO notification_routing_rules (
  id, name, "notificationType", conditions, priority, "isActive"
) VALUES
  (
    'rule_perf_plan',
    'Performance Plan Review',
    'PERFORMANCE_PLAN',
    '{"department": null, "position": null}',
    5,
    true
  ),
  (
    'rule_appraisal',
    'Appraisal Processing',
    'APPRAISAL',
    '{"department": null, "position": null}',
    4,
    true
  ),
  (
    'rule_training',
    'Training Assignment',
    'TRAINING',
    '{"department": null, "position": null}',
    3,
    true
  ),
  (
    'rule_deadline',
    'Deadline Escalation',
    'DEADLINE',
    '{"priority": "high"}',
    5,
    true
  ),
  (
    'rule_escalation',
    'Critical Escalation',
    'ESCALATION',
    '{"priority": "critical"}',
    6,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "notificationType" = EXCLUDED."notificationType",
  conditions = EXCLUDED.conditions,
  priority = EXCLUDED.priority,
  "isActive" = EXCLUDED."isActive";
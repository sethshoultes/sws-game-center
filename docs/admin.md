# Game Center Admin Documentation

## Overview

This document provides comprehensive documentation for Game Center administrators. For general system architecture and game implementation details, please refer to [Game Center Documentation](game-center.md) and [System Integration Guide](system-integration.md). Go ahead and recreate this project using [Bolt](https://bolt.new/?rid=ec8szn).

## Admin Panel Access

### Authentication

1. Access the admin panel at `/admin`
2. Sign in with admin credentials:
   - Email: Registered admin email
   - Password: Secure admin password
3. System verifies admin role in `profiles` table
4. Access granted to admin interface

### Security Considerations

- All admin actions are logged
- Session expires after 24 hours
- Failed login attempts are rate-limited
- Admin role required for all privileged operations
- Row Level Security (RLS) enforced at database level

## Admin Interface

### Navigation

- **Games Dropdown**: Select game to manage
- **System Settings**: Global configuration options
- **User Profile**: Access admin profile
- **Sign Out**: End admin session

### Game Management

1. Select game from dropdown
2. View current settings
3. Modify settings:
   - Numeric values with min/max constraints
   - Color selections with preview
   - Text inputs with validation
4. Changes apply in real-time
5. Version tracking maintains history

### System Settings

Global configuration options:

```json
{
  "logoUrl": {
    "type": "text",
    "value": "https://example.com/logo.png"
  },
  "brandName": {
    "type": "text",
    "value": "Game Center"
  },
  "primaryColor": {
    "type": "color",
    "value": "#4f46e5"
  },
  "secondaryColor": {
    "type": "color",
    "value": "#6366f1"
  }
}
```

## Database Management

### Tables Overview

1. `rgc_games`: Game catalog
   - Monitor `active` status
   - Track `last_accessed` timestamps
   - Manage game availability

2. `rgc_game_settings`: Game configuration
   - Version-controlled settings
   - Type-safe values
   - Setting descriptions

3. `rgc_high_scores`: Player achievements
   - Score moderation
   - User verification
   - Leaderboard management

4. `rgc_system_settings`: Global configuration
   - Branding settings
   - System-wide parameters
   - Version control

### Common Operations

1. Activate/Deactivate Games:
```sql
UPDATE rgc_games
SET active = false
WHERE slug = 'game-slug';
```

2. Update Game Settings:
```sql
UPDATE rgc_game_settings
SET 
  value = '{"type": "number", "value": 5, "min": 1, "max": 10}',
  version = version + 1
WHERE game_id = 'game_uuid' AND key = 'setting_key';
```

3. Manage High Scores:
```sql
DELETE FROM rgc_high_scores
WHERE score > 1000000; -- Remove suspicious scores
```

## Monitoring and Maintenance

### Usage Analytics

Monitor game activity through:
- `last_accessed` timestamps
- Setting version changes
- High score submissions
- User engagement metrics

### Performance Monitoring

1. Database Queries:
```sql
SELECT game_id, COUNT(*) as setting_count
FROM rgc_game_settings
GROUP BY game_id;
```

2. Active Games:
```sql
SELECT name, last_accessed
FROM rgc_games
WHERE active = true
ORDER BY last_accessed DESC;
```

### Troubleshooting

1. Settings Not Updating:
```typescript
// Verify admin permissions
const isAdmin = await checkAdminStatus();
if (!isAdmin) {
  console.error('Admin privileges required');
  return;
}

// Check setting update
const { error } = await supabase
  .from('rgc_game_settings')
  .update({ value: newValue })
  .eq('id', settingId);

if (error) {
  console.error('Setting update failed:', error);
}
```

2. User Role Issues:
```typescript
// Verify profile table
const { data: profile, error } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .single();

if (error || profile?.role !== 'admin') {
  console.error('Admin role not found');
}
```

## Backup and Recovery

### Database Backups

1. Automated daily backups
2. Manual backup before major changes:
```sql
-- Export settings
COPY (
  SELECT * FROM rgc_game_settings
) TO '/backup/settings.csv' WITH CSV HEADER;
```

### Recovery Procedures

1. Restore settings from backup:
```sql
-- Restore settings
COPY rgc_game_settings
FROM '/backup/settings.csv'
WITH CSV HEADER;
```

2. Reset corrupted settings:
```sql
-- Reset to defaults
UPDATE rgc_game_settings
SET value = default_value
WHERE game_id = 'game_uuid';
```

## Best Practices

### Setting Management

1. Always provide descriptions:
```sql
UPDATE rgc_game_settings
SET description = 'Detailed setting explanation'
WHERE description IS NULL;
```

2. Use version control:
```sql
-- Track setting changes
UPDATE rgc_game_settings
SET 
  version = version + 1,
  updated_at = NOW()
WHERE id = 'setting_uuid';
```

3. Validate setting values:
```typescript
function validateSetting(setting) {
  if (setting.type === 'number') {
    return setting.value >= setting.min && 
           setting.value <= setting.max;
  }
  return true;
}
```

### Security

1. Regular permission audits:
```sql
SELECT id, role FROM profiles
WHERE role = 'admin';
```

2. Monitor failed login attempts:
```sql
SELECT auth.users.email, count(*)
FROM auth.audit_log_entries
WHERE action = 'login'
AND error IS NOT NULL
GROUP BY auth.users.email;
```

3. Session management:
```typescript
// Force session refresh
await supabase.auth.refreshSession();

// Clear all sessions
await supabase.auth.signOut({ scope: 'global' });
```

## Emergency Procedures

### System Recovery

1. Disable all games:
```sql
UPDATE rgc_games
SET active = false;
```

2. Reset system settings:
```sql
UPDATE rgc_system_settings
SET value = default_value;
```

3. Clear high scores:
```sql
TRUNCATE TABLE rgc_high_scores;
```

### Contact Information

- Technical Support: support@gamecenter.com
- Database Admin: dba@gamecenter.com
- Security Team: security@gamecenter.com

## Additional Resources

1. [Game Center Documentation](game-center.md)
2. [System Integration Guide](system-integration.md)
3. [Supabase Documentation](https://supabase.com/docs)
4. [React TypeScript Guidelines](https://react-typescript-cheatsheet.netlify.app/)
5. [Tailwind CSS Documentation](https://tailwindcss.com/docs)
6. [Bolt](https://bolt.new/?rid=ec8szn)

Remember to always follow security protocols and maintain proper documentation when making administrative changes to the system.
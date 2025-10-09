// Initialize default organization settings in database
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function initializeOrgSettings() {
  try {
    console.log('🚀 Initializing organization settings...');

    const defaultSettings = [
      { 
        key: 'org_name', 
        value: 'SAYWHAT Organization',
        description: 'Organization name',
        category: 'organization'
      },
      { 
        key: 'org_email', 
        value: 'admin@saywhat.org',
        description: 'Primary organization email',
        category: 'organization'
      },
      { 
        key: 'org_phone', 
        value: '+263 803 123 4567',
        description: 'Primary organization phone',
        category: 'organization'
      },
      { 
        key: 'org_address', 
        value: '143 Harare Drive, Wuse 2, Abuja, Nigeria',
        description: 'Organization address',
        category: 'organization'
      },
      { 
        key: 'org_timezone', 
        value: 'Africa/Harare',
        description: 'Default timezone',
        category: 'organization'
      },
      { 
        key: 'org_defaultLanguage', 
        value: 'en',
        description: 'Default language',
        category: 'organization'
      },
      { 
        key: 'org_currency', 
        value: 'USD',
        description: 'Default currency',
        category: 'organization'
      }
    ];

    for (const setting of defaultSettings) {
      await prisma.system_config.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          updatedAt: new Date()
        },
        create: {
          id: randomUUID(),
          key: setting.key,
          value: setting.value,
          description: setting.description,
          category: setting.category,
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ ${setting.key}: ${setting.value}`);
    }

    console.log('🎉 Organization settings initialized successfully!');

  } catch (error) {
    console.error('❌ Error initializing organization settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeOrgSettings();
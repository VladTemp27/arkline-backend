# Arkline HR Database Seeder

This seeder populates both the User Service and Accomplishment Tracker Service databases with sample data that follows the exact JSON format specified for the MongoDB collections.

## 🚀 Quick Start

1. **Make sure Docker services are running:**
   ```bash
   docker-compose up -d
   ```

2. **Run the seeder:**
   ```bash
   npm run seed
   ```

## 📊 What Gets Seeded

### User Service Database (`user_service`)
The seeder creates 5 users with the following structure:
```javascript
{
  _id: ObjectId('...'),
  username: 'mike.wilson',
  firstName: 'Mike',
  lastName: 'Wilson', 
  password: 'mike123',
  role: 'employee',
  createdAt: ISODate('2025-07-30T...'),
  updatedAt: ISODate('2025-07-30T...')
}
```

**Users created:**
- `mike.wilson` (employee)
- `jane.smith` (admin) 
- `bob.anderson` (employee)
- `alice.johnson` (manager)
- `john.doe` (manager)

### Accomplishment Tracker Database (`accomplishment_tracker`)
The seeder creates accomplishment tracking documents with the following structure:
```javascript
{
  _id: ObjectId('...'),
  userId: '6889ddc73a5ac813d3775629',
  dates: {
    '2025-07-30': {
      timeLogs: {
        timeIn: '08:15:00',
        timeOut: '17:15:00', 
        lunchBreakStart: '12:15:00',
        lunchBreakEnd: '13:15:00'
      },
      accomplishmentLog: {
        groupName: 'Frontend Team',
        activityType: 'Development',
        module: 'Dashboard',
        dateAssigned: '2025-07-28',
        activities: [
          'Create admin dashboard layout',
          'Implement time tracking components',
          'Add responsive design'
        ],
        targetEndDate: '2025-07-31',
        actualEndDate: null,
        status: 'In Progress',
        percentageOfActivity: 60,
        projectHeads: [
          'Jane Smith',
          'Bob Anderson'
        ]
      }
    }
  },
  firstName: 'Mike',
  lastName: 'Wilson'
}
```

## 📁 File Structure

- `seeder-simple.js` - Main seeder file (recommended)
- `seeder.js` - Alternative seeder using DAL layers
- `seeder-test.js` - Simple test seeder for validation
- `package.json` - Contains seeder scripts

## 🛠 Available Scripts

```bash
# Run the main seeder
npm run seed

# Run seeder in watch mode (development)
npm run seed:dev

# Run test seeder (creates just one test user)
npm run seed:test
```

## 🔧 Configuration

The seeder automatically:
- Loads environment variables from `user-service/.env`
- Connects to both databases (`user_service` and `accomplishment_tracker`)
- Handles Docker vs localhost hostname resolution
- Provides comprehensive logging and error handling

## 📋 Sample Data Details

### Time Logs
Each user has time logs for multiple dates with realistic:
- Clock in/out times
- Lunch break periods
- Various work patterns (overtime, undertime, on-time)

### Accomplishment Logs
Each user has accomplishment entries with:
- Different team assignments (Frontend, Backend, QA, Management)
- Various activity types (Development, Testing, Code Review, Planning)
- Multiple project modules
- Realistic task lists and progress tracking
- Project heads and target dates

### User Roles
- **Employees**: mike.wilson, bob.anderson
- **Managers**: alice.johnson, john.doe  
- **Admin**: jane.smith

## 🚨 Notes

- The seeder is idempotent - it can be run multiple times safely
- Existing users will be skipped, not duplicated
- Accomplishment data will be updated if users already exist
- All passwords are stored in plain text (TODO: implement hashing for production)
- MongoDB must be running and accessible on localhost:27017

## 🔍 Troubleshooting

If the seeder fails:
1. Ensure Docker services are running: `docker-compose ps`
2. Check MongoDB is accessible: `docker logs mongodb-arkline`
3. Verify environment variables are correct in `user-service/.env`
4. Run the test seeder first: `npm run seed:test`

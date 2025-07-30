import dotenv from 'dotenv';
import { connectMongoDB as connectUserServiceDB, disconnectMongoDB as disconnectUserServiceDB } from '../user-service/util/mongo-util.js';
import { connectMongoDB as connectAccomplishmentTrackerDB, disconnectMongoDB as disconnectAccomplishmentTrackerDB } from '../accomplishment-tracker-service/util/mongo-util.js';
import { createUser } from '../user-service/dal/user-dal.js';
import { saveTimeLog } from '../accomplishment-tracker-service/dal/time-logs-dal.js';
import { saveAccomplishment } from '../accomplishment-tracker-service/dal/accomplishment-logs-dal.js';

// Load environment variables for user service
dotenv.config({ path: './user-service/.env' });

const seedData = {
    users: [
        {
            username: 'mike.wilson',
            firstName: 'Mike',
            lastName: 'Wilson',
            password: 'mike123',
            role: 'employee'
        },
        {
            username: 'jane.smith',
            firstName: 'Jane',
            lastName: 'Smith',
            password: 'jane123',
            role: 'admin'
        },
        {
            username: 'bob.anderson',
            firstName: 'Bob',
            lastName: 'Anderson',
            password: 'bob123',
            role: 'employee'
        },
        {
            username: 'alice.johnson',
            firstName: 'Alice',
            lastName: 'Johnson',
            password: 'alice123',
            role: 'manager'
        },
        {
            username: 'john.doe',
            firstName: 'John',
            lastName: 'Doe',
            password: 'john123',
            role: 'manager'
        }
    ],
    accomplishmentData: {
        'mike.wilson': {
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
            },
            '2025-07-29': {
                timeLogs: {
                    timeIn: '08:00:00',
                    timeOut: '17:00:00',
                    lunchBreakStart: '12:00:00',
                    lunchBreakEnd: '13:00:00'
                },
                accomplishmentLog: {
                    groupName: 'Frontend Team',
                    activityType: 'Development',
                    module: 'Components',
                    dateAssigned: '2025-07-26',
                    activities: [
                        'Create reusable UI components',
                        'Setup component library',
                        'Add TypeScript definitions'
                    ],
                    targetEndDate: '2025-07-29',
                    actualEndDate: '2025-07-29',
                    status: 'Done',
                    percentageOfActivity: 100,
                    projectHeads: [
                        'Jane Smith'
                    ]
                }
            },
            '2025-07-26': {
                timeLogs: {
                    timeIn: '10:00:00',
                    timeOut: '16:30:00',
                    lunchBreakStart: '12:30:00',
                    lunchBreakEnd: '13:30:00'
                },
                accomplishmentLog: {
                    groupName: 'Frontend Team',
                    activityType: 'Development',
                    module: 'Styling Framework',
                    dateAssigned: '2025-07-25',
                    activities: [
                        'Setup CSS framework',
                        'Create design system tokens'
                    ],
                    targetEndDate: '2025-07-26',
                    actualEndDate: null,
                    status: 'In Progress',
                    percentageOfActivity: 70,
                    projectHeads: [
                        'Alice Johnson'
                    ]
                }
            },
            '2025-07-25': {
                timeLogs: {
                    timeIn: '07:30:00',
                    timeOut: '18:45:00',
                    lunchBreakStart: '12:00:00',
                    lunchBreakEnd: '13:00:00'
                },
                accomplishmentLog: {
                    groupName: 'Frontend Team',
                    activityType: 'Development',
                    module: 'Application Setup',
                    dateAssigned: '2025-07-24',
                    activities: [
                        'Initialize React application',
                        'Configure build tools',
                        'Setup routing system',
                        'Implement authentication guards'
                    ],
                    targetEndDate: '2025-07-25',
                    actualEndDate: '2025-07-25',
                    status: 'Done',
                    percentageOfActivity: 100,
                    projectHeads: [
                        'John Doe',
                        'Jane Smith'
                    ]
                }
            }
        },
        'jane.smith': {
            '2025-07-30': {
                timeLogs: {
                    timeIn: '08:00:00',
                    timeOut: '17:00:00',
                    lunchBreakStart: '12:00:00',
                    lunchBreakEnd: '13:00:00'
                },
                accomplishmentLog: {
                    groupName: 'Backend Team',
                    activityType: 'Code Review',
                    module: 'API Gateway',
                    dateAssigned: '2025-07-29',
                    activities: [
                        'Review authentication endpoints',
                        'Validate API documentation',
                        'Check security implementations'
                    ],
                    targetEndDate: '2025-07-30',
                    actualEndDate: '2025-07-30',
                    status: 'Done',
                    percentageOfActivity: 100,
                    projectHeads: [
                        'John Doe'
                    ]
                }
            },
            '2025-07-29': {
                timeLogs: {
                    timeIn: '07:45:00',
                    timeOut: '16:45:00',
                    lunchBreakStart: '12:00:00',
                    lunchBreakEnd: '13:00:00'
                },
                accomplishmentLog: {
                    groupName: 'Backend Team',
                    activityType: 'Development',
                    module: 'User Management',
                    dateAssigned: '2025-07-27',
                    activities: [
                        'Implement user authentication',
                        'Create role-based access control',
                        'Setup JWT middleware'
                    ],
                    targetEndDate: '2025-07-29',
                    actualEndDate: '2025-07-29',
                    status: 'Done',
                    percentageOfActivity: 100,
                    projectHeads: [
                        'Alice Johnson'
                    ]
                }
            }
        },
        'bob.anderson': {
            '2025-07-30': {
                timeLogs: {
                    timeIn: '09:00:00',
                    timeOut: '18:00:00',
                    lunchBreakStart: '13:00:00',
                    lunchBreakEnd: '14:00:00'
                },
                accomplishmentLog: {
                    groupName: 'QA Team',
                    activityType: 'Testing',
                    module: 'User Interface',
                    dateAssigned: '2025-07-28',
                    activities: [
                        'Execute manual test cases',
                        'Report UI/UX bugs',
                        'Verify responsive design'
                    ],
                    targetEndDate: '2025-07-31',
                    actualEndDate: null,
                    status: 'In Progress',
                    percentageOfActivity: 40,
                    projectHeads: [
                        'Alice Johnson'
                    ]
                }
            }
        },
        'alice.johnson': {
            '2025-07-30': {
                timeLogs: {
                    timeIn: '08:30:00',
                    timeOut: '17:30:00',
                    lunchBreakStart: '12:30:00',
                    lunchBreakEnd: '13:30:00'
                },
                accomplishmentLog: {
                    groupName: 'Management Team',
                    activityType: 'Planning',
                    module: 'Project Coordination',
                    dateAssigned: '2025-07-29',
                    activities: [
                        'Review team progress reports',
                        'Coordinate sprint planning',
                        'Conduct team meetings'
                    ],
                    targetEndDate: '2025-07-30',
                    actualEndDate: '2025-07-30',
                    status: 'Done',
                    percentageOfActivity: 100,
                    projectHeads: [
                        'John Doe'
                    ]
                }
            },
            '2025-07-29': {
                timeLogs: {
                    timeIn: '08:00:00',
                    timeOut: '17:00:00',
                    lunchBreakStart: '12:00:00',
                    lunchBreakEnd: '13:00:00'
                },
                accomplishmentLog: {
                    groupName: 'Management Team',
                    activityType: 'Review',
                    module: 'Code Quality',
                    dateAssigned: '2025-07-27',
                    activities: [
                        'Review code standards',
                        'Evaluate team performance',
                        'Create improvement plans'
                    ],
                    targetEndDate: '2025-07-29',
                    actualEndDate: '2025-07-29',
                    status: 'Done',
                    percentageOfActivity: 100,
                    projectHeads: [
                        'Alice Johnson'
                    ]
                }
            }
        },
        'john.doe': {
            '2025-07-30': {
                timeLogs: {
                    timeIn: '07:45:00',
                    timeOut: '18:15:00',
                    lunchBreakStart: '12:15:00',
                    lunchBreakEnd: '13:15:00'
                },
                accomplishmentLog: {
                    groupName: 'Management Team',
                    activityType: 'Architecture',
                    module: 'System Design',
                    dateAssigned: '2025-07-28',
                    activities: [
                        'Design microservices architecture',
                        'Define API specifications',
                        'Create deployment strategies'
                    ],
                    targetEndDate: '2025-08-01',
                    actualEndDate: null,
                    status: 'In Progress',
                    percentageOfActivity: 75,
                    projectHeads: [
                        'John Doe',
                        'Alice Johnson'
                    ]
                }
            },
            '2025-07-29': {
                timeLogs: {
                    timeIn: '08:00:00',
                    timeOut: '17:30:00',
                    lunchBreakStart: '12:00:00',
                    lunchBreakEnd: '13:00:00'
                },
                accomplishmentLog: {
                    groupName: 'Management Team',
                    activityType: 'Leadership',
                    module: 'Team Development',
                    dateAssigned: '2025-07-26',
                    activities: [
                        'Mentor junior developers',
                        'Conduct technical interviews',
                        'Plan training sessions'
                    ],
                    targetEndDate: '2025-07-29',
                    actualEndDate: '2025-07-29',
                    status: 'Done',
                    percentageOfActivity: 100,
                    projectHeads: [
                        'John Doe'
                    ]
                }
            }
        }
    }
};

async function seedUsers() {
    console.log('🌱 Starting user seeding...');
    const createdUsers = [];
    
    for (const userData of seedData.users) {
        try {
            const user = await createUser(userData);
            createdUsers.push(user);
            console.log(`✅ Created user: ${user.username} (ID: ${user.userId})`);
        } catch (error) {
            if (error.message === 'Username already exists') {
                console.log(`⚠️  User ${userData.username} already exists, skipping...`);
            } else {
                console.error(`❌ Error creating user ${userData.username}:`, error.message);
            }
        }
    }
    
    return createdUsers;
}

async function seedAccomplishments(users) {
    console.log('🌱 Starting accomplishment seeding...');
    
    // Create a mapping of username to userId
    const userMap = {};
    users.forEach(user => {
        userMap[user.username] = user.userId;
    });
    
    for (const [username, dateEntries] of Object.entries(seedData.accomplishmentData)) {
        const userId = userMap[username];
        if (!userId) {
            console.log(`⚠️  User ${username} not found, skipping accomplishment data...`);
            continue;
        }
        
        const user = users.find(u => u.username === username);
        
        for (const [date, data] of Object.entries(dateEntries)) {
            try {
                // Save time log
                if (data.timeLogs) {
                    await saveTimeLog(userId, date, user.firstName, user.lastName, data.timeLogs);
                    console.log(`✅ Saved time log for ${username} on ${date}`);
                }
                
                // Save accomplishment log
                if (data.accomplishmentLog) {
                    await saveAccomplishment(userId, date, data.accomplishmentLog);
                    console.log(`✅ Saved accomplishment log for ${username} on ${date}`);
                }
            } catch (error) {
                console.error(`❌ Error saving data for ${username} on ${date}:`, error.message);
            }
        }
    }
}

async function runSeeder() {
    try {
        console.log('🚀 Starting database seeding process...\n');
        
        // Connect to both databases
        console.log('📡 Connecting to databases...');
        
        // Load user service environment and connect
        process.env.MONGO_DATABASE = 'user_service';
        await connectUserServiceDB();
        
        // Load accomplishment tracker environment and connect  
        process.env.MONGO_DATABASE = 'accomplishment_tracker';
        await connectAccomplishmentTrackerDB();
        
        console.log('✅ Connected to both databases\n');
        
        // Reset to user service for user creation
        process.env.MONGO_DATABASE = 'user_service';
        
        // Seed users first
        const createdUsers = await seedUsers();
        console.log(`\n✅ User seeding completed. Created/verified ${createdUsers.length} users\n`);
        
        // Switch to accomplishment tracker for accomplishments
        process.env.MONGO_DATABASE = 'accomplishment_tracker';
        
        // Seed accomplishments
        await seedAccomplishments(createdUsers);
        console.log('\n✅ Accomplishment seeding completed\n');
        
        console.log('🎉 Database seeding completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during seeding process:', error);
    } finally {
        // Disconnect from databases
        try {
            await disconnectUserServiceDB();
            await disconnectAccomplishmentTrackerDB();
            console.log('📡 Disconnected from databases');
        } catch (error) {
            console.error('Error disconnecting from databases:', error);
        }
        process.exit(0);
    }
}

// Run the seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runSeeder();
}

export { runSeeder, seedData };
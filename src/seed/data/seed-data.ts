import * as bcrypt from 'bcrypt';

interface SeedUser {
    email:    string;
    userName: string;
    password: string;
    roles:    string;
    isActive: boolean;
    balance?: number;
    discount?: number;
}

interface SeedData {
    users: SeedUser[];
}

export const initialData: SeedData = {
    users: [
        {
            email: 'superadmin@gmail.com',
            userName: 'SuperAdmin',
            password: bcrypt.hashSync('123456', 10),
            roles: 'superadmin',
            isActive: true
        },
        {
            email: 'admin@gmail.com',
            userName: 'Admin',
            password: bcrypt.hashSync('123456', 10),
            roles: 'admin',
            isActive: true
        },
        {
            email: 'member@gmail.com',
            userName: 'Member',
            password: bcrypt.hashSync('123456', 10),
            roles: 'member',
            isActive: true,
            balance: 0,
            discount: 0
        },
        {
            email: 'support@gmail.com',
            userName: 'Support Agent',
            password: bcrypt.hashSync('123456', 10),
            roles: 'support',
            isActive: true
        },
        {
            email: 'reseller@gmail.com',
            userName: 'Reseller',
            password: bcrypt.hashSync('123456', 10),
            roles: 'reseller',
            isActive: true,
            balance: 0,
            discount: 10
        }
    ]
}
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const authAdmin = async (userId) => {
    try {
        console.log("authAdmin called with userId:", userId);
        
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        
        console.log("User metadata:", user.publicMetadata);
        console.log("User role:", user.publicMetadata.role);

        if (user.publicMetadata.role === 'admin') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("authAdmin error:", error);
        return false;
    }
}

export default authAdmin;
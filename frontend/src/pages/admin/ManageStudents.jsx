import React from 'react';
import { GraduationCap } from 'lucide-react';
import ManageUsers from '../../components/ManageUsers'; // Reusable component

const ManageStudents = () => {
    return (
        <ManageUsers
            role="student"
            title="Manage Students"
            description="Add, edit, and manage all students"
            icon={GraduationCap}
        />
    );
};

export default ManageStudents;
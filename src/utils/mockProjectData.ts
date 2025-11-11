/**
 * Mock project data for fallback display
 */
export const getMockProjectDisplayData = (projectId?: string) => {
    return {
        id: projectId || "unknown",
        title: "E-Commerce Platform Redesign",
        description: "Complete redesign of the user interface and user experience for our main e-commerce platform to improve conversion rates. We're looking for a talented team to help us create a modern, responsive design that works seamlessly across all devices.\n\nKey Requirements:\n- Responsive design for mobile, tablet, and desktop\n- Improved checkout flow\n- Enhanced product search and filtering\n- Integration with existing payment gateway\n- SEO optimization\n- Performance improvements",
        skills: ["React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "UI/UX Design"],
        status: "in-progress",
        budget: 45000,
        currency: "USD",
        deadline: "2025-12-31",
        capacity: 5,
        university: "Makerere University",
        department: "Computer Science",
        course: "Software Engineering (Year 3)",
        createdAt: "2024-01-15",
        applications: [
            {
                id: "app-1",
                groupName: "Frontend Team Alpha",
                members: [
                    { name: "Sarah Johnson", avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" },
                    { name: "Mike Chen", avatar: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg" }
                ],
                status: "shortlist",
                portfolioScore: 95,
                appliedAt: "2024-01-20"
            },
            {
                id: "app-2",
                groupName: "Tech Solutions Group",
                members: [
                    { name: "Emma Davis", avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg" }
                ],
                status: "consider",
                portfolioScore: 82,
                appliedAt: "2024-01-22"
            }
        ],
        milestones: [
            {
                id: "mil-1",
                title: "Design System & Wireframes",
                status: "completed",
                dueDate: "2024-02-15",
                amount: 15000,
                completedDate: "2024-02-14"
            },
            {
                id: "mil-2",
                title: "Frontend Implementation",
                status: "in-progress",
                dueDate: "2024-04-30",
                amount: 20000,
                progress: 45
            },
            {
                id: "mil-3",
                title: "Backend Integration & Testing",
                status: "scheduled",
                dueDate: "2024-06-30",
                amount: 10000
            }
        ],
        teamMembers: [
            { 
                id: "mock-member-1",
                name: "Sarah Johnson", 
                role: "Lead Developer", 
                avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
                badges: {
                    isLeader: true,
                    isSupervisor: false,
                    isYou: false
                }
            },
            { 
                id: "mock-member-2",
                name: "Mike Chen", 
                role: "UI/UX Designer", 
                avatar: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg",
                badges: {
                    isLeader: false,
                    isSupervisor: false,
                    isYou: false
                }
            },
            { 
                id: "mock-member-3",
                name: "Emma Davis", 
                role: "Backend Developer", 
                avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
                badges: {
                    isLeader: false,
                    isSupervisor: false,
                    isYou: false
                }
            }
        ]
    }
}


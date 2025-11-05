/**
 * Mock Partner Projects Data
 */
import { ProjectI } from "@/src/components/screen/partner/projects/Project";

export const mockPartnerProjects: ProjectI[] = [
  {
    id: 1,
    title: "E-Commerce Platform Redesign",
    description:
      "Complete redesign of the user interface and user experience for our main e-commerce platform to improve conversion rates.",
    skills: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
    status: "in-progress",
    group: {
      name: "Frontend Team",
      members: [
        {
          name: "Sarah Johnson",
          avatar:
            "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        },
        {
          name: "Mike Chen",
          avatar:
            "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg",
        },
        {
          name: "Emma Davis",
          avatar:
            "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        },
      ],
    },
    expiryDate: "2025-12-31",
    cost: "$45,000",
  },
  {
    id: 2,
    title: "Mobile App Development",
    description:
      "Native iOS and Android mobile application for customer engagement and loyalty programs.",
    skills: ["React Native", "Firebase", "Redux", "Swift"],
    status: "in-progress",
    group: {
      name: "Mobile Team",
      members: [
        {
          name: "Alex Rodriguez",
          avatar:
            "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
        },
        {
          name: "Jessica Lee",
          avatar:
            "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg",
        },
      ],
    },
    expiryDate: "2025-11-15",
    cost: "$62,000",
  },
  {
    id: 3,
    title: "API Infrastructure Upgrade",
    description:
      "Migrate from monolithic architecture to microservices and implement containerization with Docker.",
    skills: ["Docker", "Kubernetes", "Node.js", "MongoDB", "GraphQL"],
    status: "on-hold",
    group: {
      name: "Backend Team",
      members: [
        {
          name: "James Wilson",
          avatar:
            "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg",
        },
        {
          name: "Nina Patel",
          avatar:
            "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        },
        {
          name: "David Kim",
          avatar:
            "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
        },
      ],
    },
    expiryDate: "2026-03-30",
    cost: "$85,000",
  },
  {
    id: 4,
    title: "Analytics Dashboard",
    description:
      "Build a comprehensive real-time analytics dashboard for business intelligence and data visualization.",
    skills: ["React", "D3.js", "Python", "PostgreSQL", "WebSocket"],
    status: "completed",
    group: {
      name: "Data Team",
      members: [
        {
          name: "Rachel Green",
          avatar:
            "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        },
        {
          name: "Tom Anderson",
          avatar:
            "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
        },
      ],
    },
    expiryDate: "2025-09-10",
    cost: "$38,000",
  },
  {
    id: 5,
    title: "Security & Compliance Audit",
    description:
      "Comprehensive security audit and implementation of compliance standards including GDPR and SOC 2.",
    skills: ["Security", "GDPR", "Penetration Testing", "DevOps", "Compliance"],
    status: "in-progress",
    group: {
      name: "DevOps Team",
      members: [
        {
          name: "Mark Thompson",
          avatar:
            "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg",
        },
        {
          name: "Lisa Chen",
          avatar:
            "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        },
        {
          name: "Robert Martinez",
          avatar:
            "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
        },
      ],
    },
    expiryDate: "2025-10-20",
    cost: "$55,000",
  },
  {
    id: 6,
    title: "Customer Portal Development",
    description:
      "Create a self-service customer portal for account management, support tickets, and billing information.",
    skills: ["Next.js", "TypeScript", "Stripe API", "PostgreSQL", "Authentication"],
    status: "on-hold",
    group: {
      name: "Full Stack Team",
      members: [
        {
          name: "Sophie Turner",
          avatar:
            "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        },
        {
          name: "Chris Palmer",
          avatar:
            "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg",
        },
      ],
    },
    expiryDate: "2026-01-15",
    cost: "$48,000",
  },
];






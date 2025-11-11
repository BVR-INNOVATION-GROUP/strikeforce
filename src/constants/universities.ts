/**
 * University data constants
 */
export interface DepartmentI {
  id: string | number;
  name: string;
  courses: CourseI[];
}

export interface CourseI {
  id: string | number;
  name: string;
  year?: number; // Optional for backward compatibility with project forms
}

export interface University {
  id: string | number;
  name: string;
  departments: DepartmentI[];
}

export const topUgandanUniversities: University[] = [
  {
    id: 1,
    name: "Makerere University",
    departments: [
      {
        id: 1,
        name: "Computer Science",
        courses: [
          { id: 1, name: "Introduction to Programming", year: 1 },
          { id: 2, name: "Data Structures", year: 2 },
          { id: 3, name: "Software Engineering", year: 3 },
          { id: 4, name: "Final Year Project", year: 4 },
        ],
      },
      {
        id: 2,
        name: "Engineering",
        courses: [
          { id: 5, name: "Engineering Fundamentals", year: 1 },
          { id: 6, name: "Mechanical Design", year: 3 },
          { id: 7, name: "Capstone Project", year: 4 },
        ],
      },
      { id: 3, name: "Medicine", courses: [] },
      { id: 4, name: "Business Administration", courses: [] },
    ],
  },
  {
    id: 2,
    name: "Kyambogo University",
    departments: [
      { id: 1, name: "Engineering", courses: [] },
      { id: 2, name: "Education", courses: [] },
      { id: 3, name: "Management Science", courses: [] },
    ],
  },
  {
    id: 3,
    name: "Uganda Christian University",
    departments: [
      { id: 1, name: "Law", courses: [] },
      { id: 2, name: "Business", courses: [] },
      { id: 3, name: "Social Sciences", courses: [] },
    ],
  },
  {
    id: 4,
    name: "Mbarara University of Science and Technology",
    departments: [
      { id: 1, name: "Medicine", courses: [] },
      { id: 2, name: "Computer Science", courses: [] },
      { id: 3, name: "Engineering", courses: [] },
    ],
  },
  { id: 5, name: "Kampala International University", departments: [] },
  { id: 6, name: "Gulu University", departments: [] },
  { id: 7, name: "Ndejje University", departments: [] },
  { id: 8, name: "Uganda Martyrs University", departments: [] },
  { id: 9, name: "Nkumba University", departments: [] },
  { id: 10, name: "Busitema University", departments: [] },
  { id: 11, name: "Islamic University in Uganda", departments: [] },
  { id: 12, name: "Bishop Stuart University", departments: [] },
  { id: 13, name: "Kabale University", departments: [] },
  {
    id: 14,
    name: "Uganda Technology and Management University",
    departments: [],
  },
];

export const commonSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "PostgreSQL",
  "MongoDB",
  "Firebase",
  "AWS",
  "Docker",
  "Kubernetes",
  "Git",
  "REST API",
  "GraphQL",
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",
  "UI/UX Design",
  "Figma",
  "Photoshop",
  "Machine Learning",
  "Data Analysis",
  "DevOps",
  "CI/CD",
  "Agile",
  "Scrum",
  "Project Management",
  "Technical Writing",
];






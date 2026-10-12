import { Course } from "./course.types";

export const COURSES: Course[] = [
  {
    id: "child-safety-basics",
    title: "Child Safety Basics",
    description: "A foundational program teaching parents how to protect children at home, outdoors, and online.",
    category: "safety",
    duration: 25,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lessons: [
      {
        id: "home-safety",
        title: "Home Safety Essentials",
        content: "Learn how to secure your home environment, prevent accidents, and create safe routines.",
        duration: 10,
      },
      {
        id: "outdoor-awareness",
        title: "Outdoor Awareness",
        content: "Teach children how to stay aware, avoid danger, and respond to unexpected situations.",
        duration: 15,
      }
    ]
  },
  {
    id: "emergency-prep",
    title: "Emergency Preparedness",
    description: "A practical guide to preparing your family for emergencies and unexpected events.",
    category: "emergency",
    duration: 20,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lessons: [
      {
        id: "contacts",
        title: "Emergency Contacts Setup",
        content: "Learn how to build a reliable emergency contact system for your family.",
        duration: 8,
      },
      {
        id: "first-aid",
        title: "First Aid Basics",
        content: "Understand essential first aid steps every parent should know.",
        duration: 12,
      }
    ]
  }
];

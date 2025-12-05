// Script to add sample equipment data to Firestore
// Run with: npx tsx scripts/add-sample-equipment.ts

import { db } from "../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

async function addSampleEquipment() {
    const equipmentRef = collection(db, "equipment");

    const sampleEquipment = [
        {
            name: "Laptop for Teachers",
            description: "Modern laptops to help teachers create engaging digital content and manage online classes effectively.",
            category: "technology",
            targetAmount: 15000000, // 15 million IDR
            currentAmount: 5000000, // 5 million IDR already raised
            priority: "urgent",
            status: "active",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        },
        {
            name: "Classroom Chairs",
            description: "Comfortable ergonomic chairs for students to support better posture and learning environment.",
            category: "furniture",
            targetAmount: 8000000, // 8 million IDR
            currentAmount: 2000000, // 2 million IDR already raised
            priority: "high",
            status: "active",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        },
        {
            name: "Science Lab Equipment",
            description: "Essential laboratory equipment including microscopes, beakers, and safety gear for hands-on science education.",
            category: "supplies",
            targetAmount: 12000000, // 12 million IDR
            currentAmount: 8000000, // 8 million IDR already raised
            priority: "medium",
            status: "active",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        },
        {
            name: "Projector and Screen",
            description: "High-quality projector and screen for multimedia presentations and interactive learning sessions.",
            category: "technology",
            targetAmount: 6000000, // 6 million IDR
            currentAmount: 1500000, // 1.5 million IDR already raised
            priority: "high",
            status: "active",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        },
        {
            name: "Library Books",
            description: "Diverse collection of educational books, novels, and reference materials to enrich our library.",
            category: "supplies",
            targetAmount: 5000000, // 5 million IDR
            currentAmount: 3500000, // 3.5 million IDR already raised
            priority: "medium",
            status: "active",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        },
        {
            name: "Whiteboard and Markers",
            description: "Large whiteboards and quality markers for every classroom to facilitate interactive teaching.",
            category: "supplies",
            targetAmount: 3000000, // 3 million IDR
            currentAmount: 500000, // 500k IDR already raised
            priority: "low",
            status: "active",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        },
    ];

    console.log("Adding sample equipment to Firestore...");

    for (const equipment of sampleEquipment) {
        try {
            const docRef = await addDoc(equipmentRef, equipment);
            console.log(`✓ Added: ${equipment.name} (ID: ${docRef.id})`);
        } catch (error) {
            console.error(`✗ Failed to add ${equipment.name}:`, error);
        }
    }

    console.log("\nSample equipment added successfully!");
    console.log("Visit http://localhost:3000/donate to see the donation portal.");
}

// Run the script
addSampleEquipment()
    .then(() => {
        console.log("\nDone!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });

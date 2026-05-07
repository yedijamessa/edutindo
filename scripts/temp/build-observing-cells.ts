import { saveModuleEditorDocument } from "../../lib/module-editor";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function seed() {
  const nodeId = "cfe6f213-9692-4093-bd5d-a30de3187900"; // 1.1 Observing cells

  const pages = [
    {
      id: randomUUID(),
      title: "1.1 Observing cells",
      description: "Introduction to cells and microscopes.",
      blocks: [
        {
          id: randomUUID(),
          type: "text",
          title: "Key idea",
          body: "Cells are the building blocks of life.\n\n**Key words**: organism, cell, microscope, lens, observation.",
        },
        {
          id: randomUUID(),
          type: "text",
          title: "What are living organisms made of?",
          body: "Look around you. Can you see any dust? Most dust in your home is made of dead cells. These come from anything living in your house. To see the cells, you need to look through a microscope.\n\nAll living things, often called **organisms**, are made of **cells**. Cells are the building blocks of life. They are the smallest units found in an organism. Organisms like bacteria are made up of only one cell. Larger organisms, like you, are made up of millions of cells that are joined together.",
        },
        {
          id: randomUUID(),
          type: "quiz",
          quizType: "multiple-choice-single",
          prompt: "How many cells do you think make up a cat?",
          options: [
            { id: "o1", text: "Hundreds" },
            { id: "o2", text: "Thousands" },
            { id: "o3", text: "Millions" },
          ],
          correctOptionIds: ["o3"],
          acceptableAnswers: [],
          matchingPairs: [],
          orderingItems: [],
          explanation: "Larger organisms like cats or humans are made up of millions of cells joined together.",
        },
      ],
    },
    {
      id: randomUUID(),
      title: "Seeing cells",
      description: "How cells were discovered and how we observe them.",
      blocks: [
        {
          id: randomUUID(),
          type: "text",
          title: "Robert Hooke and the microscope",
          body: "Cells were first seen around 350 years ago. Robert Hooke, a scientist, used a **microscope** to look at a thin slice of cork (a type of tree bark). He saw tiny room-like structures which he called 'cells'. These were plant cells.\n\n*Fun fact: There are many different types of cell in your blood.*",
        },
        {
          id: randomUUID(),
          type: "text",
          title: "Making an observation",
          body: "To see a tiny object in detail, you need to use a microscope. A microscope magnifies images using lenses (singular: **lens**). Looking carefully and in detail at an object is called making an **observation**.\n\nTo make an observation with a microscope, the object needs to be thin. This is so that light can travel through it. Sometimes, you might need to add coloured dye. This is to make the object easier to see.",
        },
        {
          id: randomUUID(),
          type: "quiz",
          quizType: "multiple-choice-single",
          prompt: "What is a microscope used for?",
          options: [
            { id: "q2o1", text: "To make objects appear smaller" },
            { id: "q2o2", text: "To make observations of tiny objects in detail" },
            { id: "q2o3", text: "To slice objects very thinly" },
          ],
          correctOptionIds: ["q2o2"],
          acceptableAnswers: [],
          matchingPairs: [],
          orderingItems: [],
          explanation: "A microscope magnifies images using lenses so you can see tiny objects in detail.",
        },
      ],
    },
    {
      id: randomUUID(),
      title: "Parts of a microscope",
      description: "Learn the parts of a microscope and how to calculate magnification.",
      blocks: [
        {
          id: randomUUID(),
          type: "text",
          title: "Using a microscope",
          body: "Follow these steps to look at an object using a microscope:\n\n1. Move the stage to its lowest position.\n2. Place the object on the stage.\n3. Choose the objective lens with the lowest magnification.\n4. Look through the eyepiece. Turn the coarse-focus wheel slowly until you see the object.\n5. Turn the fine-focus wheel until the object comes into focus.\n6. Repeat Steps 1 to 5. This time, use an objective lens with a higher magnification to see the object in greater detail.",
        },
        {
          id: randomUUID(),
          type: "quiz",
          quizType: "short-answer",
          prompt: "Name the part of a microscope that holds slides.",
          options: [],
          correctOptionIds: [],
          acceptableAnswers: ["stage", "the stage"],
          matchingPairs: [],
          orderingItems: [],
          explanation: "The slide is placed on the **stage** of the microscope.",
        },
        {
          id: randomUUID(),
          type: "text",
          title: "Magnification",
          body: "The eyepiece lens and objective lens in a microscope have different magnifications. Together, they magnify the object.\n\nFor example, if you have an eyepiece lens of ×10 and an objective lens of ×4, the object would be magnified 40 times. This means the object looks 40 times bigger than it actually is.\n\nYou can calculate magnification using this formula:\n\n**Total magnification = eyepiece lens magnification × objective lens magnification**",
        },
        {
          id: randomUUID(),
          type: "quiz",
          quizType: "short-answer",
          prompt: "If the eyepiece lens has a ×10 magnification and the objective lens has a ×40 magnification, what is the total magnification?",
          options: [],
          correctOptionIds: [],
          acceptableAnswers: ["400", "x400", "400x"],
          matchingPairs: [],
          orderingItems: [],
          explanation: "Total magnification = 10 × 40 = 400.",
        },
      ],
    },
    {
      id: randomUUID(),
      title: "Summary Questions",
      description: "Test your understanding of the lesson.",
      blocks: [
        {
          id: randomUUID(),
          type: "quiz",
          quizType: "fill-in-the-blank",
          prompt: "Copy and complete the sentences:\n\nAll living organisms are made of ____. To observe (look at) cells in detail, you need to use a ____. A microscope ____ an object.",
          options: [],
          correctOptionIds: [],
          acceptableAnswers: ["cells, microscope, magnifies"],
          matchingPairs: [],
          orderingItems: [],
          explanation: "All living organisms are made of cells. To observe cells in detail, you need to use a microscope. A microscope magnifies an object.",
        },
        {
          id: randomUUID(),
          type: "quiz",
          quizType: "matching",
          prompt: "Match these parts of the microscope to what they do:",
          options: [],
          correctOptionIds: [],
          acceptableAnswers: [],
          matchingPairs: [
            { id: randomUUID(), prompt: "lens", match: "magnifies the image" },
            { id: randomUUID(), prompt: "stage", match: "holds the slide" },
            { id: randomUUID(), prompt: "focusing wheel", match: "brings the object into focus" },
          ],
          orderingItems: [],
          explanation: "Lenses magnify the image, the stage holds the slide, and the focusing wheel brings it into focus.",
        },
        {
          id: randomUUID(),
          type: "quiz",
          quizType: "short-answer",
          prompt: "A drop of dye is added to a white flower petal before it is looked at under a microscope. State why the dye was added.",
          options: [],
          correctOptionIds: [],
          acceptableAnswers: ["To make the object easier to see", "to make it easier to see", "to add colour", "make it easier to see"],
          matchingPairs: [],
          orderingItems: [],
          explanation: "Sometimes you need to add coloured dye to make the object easier to see.",
        },
      ],
    },
  ];

  await saveModuleEditorDocument({
    nodeId,
    title: "1.1 Observing cells",
    pages,
    actorUserId: "system-auto-build",
  });

  console.log("Module saved successfully!");
}

seed().then(() => process.exit(0)).catch(console.error);

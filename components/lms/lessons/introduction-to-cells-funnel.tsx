"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, cn } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

type QuizOption = {
  value: string;
  label: string;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correct: string;
};

type CellSortGroup = "unicellular" | "multicellular";
type VennZone = "plant-only" | "both" | "animal-only";

const PAGE_TITLES = [
  "What are Cells?",
  "Cell Theory",
  "Checkpoint Quiz 1",
  "One Cell or Many Cells?",
  "Basic Parts of a Cell",
  "Checkpoint Quiz 2",
  "Prokaryotic vs Eukaryotic",
  "Plant vs Animal Cells",
  "Checkpoint Quiz 3",
  "Why Cells Matter",
  "Final Quiz",
  "Exit Ticket",
] as const;

const PAGE_COUNT = PAGE_TITLES.length;

const quiz1Questions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "A cell is...",
    options: [
      { value: "animal", label: "A. A type of animal" },
      { value: "smallest-unit", label: "B. The smallest unit of life" },
      { value: "organ", label: "C. A body organ" },
      { value: "tissue", label: "D. A tissue" },
    ],
    correct: "smallest-unit",
  },
  {
    id: "q2",
    prompt: "Which statement is part of cell theory?",
    options: [
      { value: "all-plants", label: "A. All cells are plants" },
      { value: "from-rocks", label: "B. Cells come from rocks" },
      { value: "existing-cells", label: "C. New cells come from existing cells" },
      { value: "only-humans", label: "D. Only humans have cells" },
    ],
    correct: "existing-cells",
  },
  {
    id: "q3",
    prompt: "True or False: Non-living things are made of cells.",
    options: [
      { value: "true", label: "True" },
      { value: "false", label: "False" },
    ],
    correct: "false",
  },
];

const quiz2Questions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Which part controls what goes in and out of the cell?",
    options: [
      { value: "nucleus", label: "A. Nucleus" },
      { value: "cell-membrane", label: "B. Cell membrane" },
      { value: "cytoplasm", label: "C. Cytoplasm" },
      { value: "chloroplast", label: "D. Chloroplast" },
    ],
    correct: "cell-membrane",
  },
  {
    id: "q2",
    prompt: "The jelly-like material inside the cell is called...",
    options: [
      { value: "cell-wall", label: "A. Cell wall" },
      { value: "cytoplasm", label: "B. Cytoplasm" },
      { value: "dna", label: "C. DNA" },
      { value: "tissue", label: "D. Tissue" },
    ],
    correct: "cytoplasm",
  },
  {
    id: "q3",
    prompt: "The nucleus mainly...",
    options: [
      { value: "green", label: "A. Makes the plant green" },
      { value: "dna-control", label: "B. Stores DNA and helps control the cell" },
      { value: "blood", label: "C. Pumps blood" },
      { value: "rocks", label: "D. Breaks rocks" },
    ],
    correct: "dna-control",
  },
];

const quiz3Questions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Which cell type has chloroplasts?",
    options: [
      { value: "animal", label: "A. Animal cell" },
      { value: "plant", label: "B. Plant cell" },
    ],
    correct: "plant",
  },
  {
    id: "q2",
    prompt: "Bacteria are usually...",
    options: [
      { value: "eukaryotic", label: "A. Eukaryotic" },
      { value: "prokaryotic", label: "B. Prokaryotic" },
    ],
    correct: "prokaryotic",
  },
  {
    id: "q3",
    prompt: "True or False: Plant and animal cells both have cytoplasm.",
    options: [
      { value: "true", label: "True" },
      { value: "false", label: "False" },
    ],
    correct: "true",
  },
];

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

interface ChoiceQuestionCardProps {
  question: QuizQuestion;
  value: string;
  onSelect: (value: string) => void;
  submitted: boolean;
}

function ChoiceQuestionCard({ question, value, onSelect, submitted }: ChoiceQuestionCardProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <p className="font-semibold text-slate-900">{question.prompt}</p>
      <div className="grid gap-2">
        {question.options.map((option) => {
          const isSelected = value === option.value;
          const isCorrect = option.value === question.correct;
          const showCorrect = submitted && isCorrect;
          const showWrongSelected = submitted && isSelected && !isCorrect;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                isSelected
                  ? "border-blue-400 bg-blue-50 text-blue-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                showCorrect && "border-emerald-300 bg-emerald-50 text-emerald-900",
                showWrongSelected && "border-red-300 bg-red-50 text-red-800"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface QuizBlockProps {
  questions: QuizQuestion[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, value: string) => void;
  submitted: boolean;
}

function QuizBlock({ questions, answers, onAnswer, submitted }: QuizBlockProps) {
  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <ChoiceQuestionCard
          key={question.id}
          question={question}
          value={answers[question.id] ?? ""}
          onSelect={(value) => onAnswer(question.id, value)}
          submitted={submitted}
        />
      ))}
    </div>
  );
}

export function IntroductionToCellsFunnel() {
  const [pageIndex, setPageIndex] = useState(0);
  const [showLivingAnswer, setShowLivingAnswer] = useState(false);
  const [livingSelection, setLivingSelection] = useState<Record<string, boolean>>({});

  const [cellTheoryMatches, setCellTheoryMatches] = useState<Record<string, string>>({});
  const [showCellTheoryResults, setShowCellTheoryResults] = useState(false);

  const [quiz1Answers, setQuiz1Answers] = useState<Record<string, string>>({});
  const [quiz1Submitted, setQuiz1Submitted] = useState(false);

  const [cellSortAssignments, setCellSortAssignments] = useState<Record<string, CellSortGroup | "">>({});
  const [cellSortSubmitted, setCellSortSubmitted] = useState(false);

  const [selectedCellPart, setSelectedCellPart] = useState<string>("");

  const [quiz2Answers, setQuiz2Answers] = useState<Record<string, string>>({});
  const [quiz2Submitted, setQuiz2Submitted] = useState(false);

  const [nucleusQuestionAnswer, setNucleusQuestionAnswer] = useState<string>("");
  const [nucleusQuestionSubmitted, setNucleusQuestionSubmitted] = useState(false);

  const [vennAssignments, setVennAssignments] = useState<Record<string, VennZone | "">>({});
  const [vennSubmitted, setVennSubmitted] = useState(false);

  const [quiz3Answers, setQuiz3Answers] = useState<Record<string, string>>({});
  const [quiz3Submitted, setQuiz3Submitted] = useState(false);

  const [thinkMove, setThinkMove] = useState("");
  const [thinkThink, setThinkThink] = useState("");
  const [thinkPlant, setThinkPlant] = useState("");

  const [finalQuiz, setFinalQuiz] = useState({
    smallestUnit: "",
    onePart: "",
    unicellularChoice: "",
    chloroplastChoice: "",
    preExistingCells: "",
  });
  const [finalQuizSubmitted, setFinalQuizSubmitted] = useState(false);

  const [reflectionFact, setReflectionFact] = useState("");
  const [reflectionQuestion, setReflectionQuestion] = useState("");
  const [reflectionImportance, setReflectionImportance] = useState("");

  const cellTheoryPrompts = [
    { id: "living", label: "All living things...", correct: "made-of-cells" },
    { id: "basic-unit", label: "Basic unit of life...", correct: "cell" },
    { id: "new-cells", label: "New cells...", correct: "from-old-cells" },
  ] as const;

  const cellTheoryOptions = [
    { value: "made-of-cells", label: "made of one or more cells" },
    { value: "cell", label: "cell" },
    { value: "from-old-cells", label: "from existing (old) cells" },
    { value: "all-plants", label: "are all plants" },
  ] as const;

  const cellSortItems = [
    { id: "bacteria", label: "Bacteria", correct: "unicellular" as const },
    { id: "yeast", label: "Some protists / yeast", correct: "unicellular" as const },
    { id: "dog", label: "Dog", correct: "multicellular" as const },
    { id: "tree", label: "Tree", correct: "multicellular" as const },
    { id: "human", label: "Human", correct: "multicellular" as const },
  ] as const;

  const cellParts = [
    {
      id: "cell-membrane",
      label: "Cell membrane",
      function: "Controls what enters and exits the cell.",
      analogy: "Door / security gate",
    },
    {
      id: "cytoplasm",
      label: "Cytoplasm",
      function: "Jelly-like workspace where many cell activities happen.",
      analogy: "Workspace",
    },
    {
      id: "nucleus",
      label: "Nucleus",
      function: "Control center that stores DNA in many cells.",
      analogy: "Control room / brain",
    },
  ] as const;

  const vennTerms = [
    { id: "cell-wall", label: "Cell wall", correct: "plant-only" as const },
    { id: "chloroplast", label: "Chloroplast", correct: "plant-only" as const },
    { id: "membrane", label: "Cell membrane", correct: "both" as const },
    { id: "cytoplasm", label: "Cytoplasm", correct: "both" as const },
    { id: "nucleus", label: "Nucleus", correct: "both" as const },
    {
      id: "no-wall-chloro",
      label: "No cell wall / no chloroplast",
      correct: "animal-only" as const,
    },
  ] as const;

  const quiz1Score = useMemo(
    () =>
      quiz1Questions.reduce(
        (total, question) => total + (quiz1Answers[question.id] === question.correct ? 1 : 0),
        0
      ),
    [quiz1Answers]
  );

  const quiz2Score = useMemo(
    () =>
      quiz2Questions.reduce(
        (total, question) => total + (quiz2Answers[question.id] === question.correct ? 1 : 0),
        0
      ),
    [quiz2Answers]
  );

  const quiz3Score = useMemo(
    () =>
      quiz3Questions.reduce(
        (total, question) => total + (quiz3Answers[question.id] === question.correct ? 1 : 0),
        0
      ),
    [quiz3Answers]
  );

  const finalQuizScore = useMemo(() => {
    let score = 0;

    if (normalize(finalQuiz.smallestUnit).includes("cell")) score += 1;

    const partAnswer = normalize(finalQuiz.onePart);
    const acceptedParts = new Set(["cell membrane", "membrane", "cytoplasm", "nucleus"]);
    if (acceptedParts.has(partAnswer)) score += 1;

    if (finalQuiz.unicellularChoice === "bacteria") score += 1;
    if (finalQuiz.chloroplastChoice === "plant-cell") score += 1;
    if (finalQuiz.preExistingCells === "true") score += 1;

    return score;
  }, [finalQuiz]);

  const cellTheoryAllCorrect = cellTheoryPrompts.every(
    (prompt) => cellTheoryMatches[prompt.id] === prompt.correct
  );

  const cellSortAllCorrect = cellSortItems.every(
    (item) => cellSortAssignments[item.id] === item.correct
  );

  const vennAllCorrect = vennTerms.every((term) => vennAssignments[term.id] === term.correct);

  const progressValue = ((pageIndex + 1) / PAGE_COUNT) * 100;

  const renderPageContent = () => {
    if (pageIndex === 0) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">What are Cells?</h3>
            <p className="mt-2 text-slate-600">
              Cells are the smallest units of life. All living things are made of cells. Your body
              has trillions of cells, and each cell does a specific job.
            </p>
          </div>

          <Card className="border-slate-200 bg-slate-50">
            <CardHeader className="items-center text-center">
              <CardTitle className="text-lg">Visual Idea</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border bg-white">
                <Image
                  src="/science-7-chapter-2_1/tree_cat_human_bacteria.png"
                  alt="Tree, cat, human, and bacteria examples"
                  width={1536}
                  height={1024}
                  className="mx-auto h-auto w-full"
                  priority
                />
              </div>

            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/60">
            <CardHeader>
              <CardTitle className="text-lg">Interaction: Which of these are living things?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["Tree", "Cat", "Human", "Bacteria"].map((item) => {
                  const selected = Boolean(livingSelection[item]);
                  return (
                    <Button
                      key={item}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setLivingSelection((prev) => ({
                          ...prev,
                          [item]: !prev[item],
                        }))
                      }
                    >
                      {item}
                    </Button>
                  );
                })}
              </div>

              <Button type="button" onClick={() => setShowLivingAnswer((prev) => !prev)}>
                {showLivingAnswer ? "Hide Answer" : "Reveal Answer"}
              </Button>

              {showLivingAnswer && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  If it is living, it is made of cells.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (pageIndex === 1) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              How do scientists explain cells? (Cell Theory)
            </h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>All living things are made of one or more cells.</li>
              <li>The cell is the basic unit of life.</li>
              <li>New cells come from existing cells.</li>
            </ul>
          </div>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Interaction: Match each statement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cellTheoryPrompts.map((prompt) => (
                <div key={prompt.id} className="grid gap-2 md:grid-cols-[1fr_280px] md:items-center">
                  <p className="text-sm font-medium text-slate-700">{prompt.label}</p>
                  <select
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={cellTheoryMatches[prompt.id] ?? ""}
                    onChange={(event) =>
                      setCellTheoryMatches((prev) => ({
                        ...prev,
                        [prompt.id]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Choose a match</option>
                    {cellTheoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <Button type="button" onClick={() => setShowCellTheoryResults(true)}>
                Check Matching
              </Button>

              {showCellTheoryResults && (
                <div
                  className={cn(
                    "rounded-xl border p-3 text-sm",
                    cellTheoryAllCorrect
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  )}
                >
                  {cellTheoryAllCorrect
                    ? "Great matching. You captured all 3 core cell theory ideas."
                    : "Almost there. Re-check each line and try again."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (pageIndex === 2) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Checkpoint Quiz 1</h3>
          </div>

          <QuizBlock
            questions={quiz1Questions}
            answers={quiz1Answers}
            submitted={quiz1Submitted}
            onAnswer={(questionId, value) =>
              setQuiz1Answers((prev) => ({
                ...prev,
                [questionId]: value,
              }))
            }
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => setQuiz1Submitted(true)}>
              Submit Quiz 1
            </Button>
            {quiz1Submitted && (
              <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                Score: {quiz1Score}/{quiz1Questions.length}
              </Badge>
            )}
          </div>

          {quiz1Submitted && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Great! You now know the big idea about cells.
            </div>
          )}
        </div>
      );
    }

    if (pageIndex === 3) {
      const unicellularItems = cellSortItems
        .filter((item) => cellSortAssignments[item.id] === "unicellular")
        .map((item) => item.label);
      const multicellularItems = cellSortItems
        .filter((item) => cellSortAssignments[item.id] === "multicellular")
        .map((item) => item.label);

      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">One Cell or Many Cells?</h3>
            <p className="mt-2 text-slate-600">
              Some living things have one cell (unicellular), like many bacteria. Others have many
              cells (multicellular), like humans, animals, and plants.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Bacteria can have basic cell parts like DNA, ribosomes, cytoplasm, and a cell
              membrane.
            </p>
          </div>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Sort into 2 groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cellSortItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        cellSortAssignments[item.id] === "unicellular" ? "default" : "outline"
                      }
                      onClick={() =>
                        setCellSortAssignments((prev) => ({
                          ...prev,
                          [item.id]: "unicellular",
                        }))
                      }
                    >
                      Unicellular
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        cellSortAssignments[item.id] === "multicellular" ? "default" : "outline"
                      }
                      onClick={() =>
                        setCellSortAssignments((prev) => ({
                          ...prev,
                          [item.id]: "multicellular",
                        }))
                      }
                    >
                      Multicellular
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" onClick={() => setCellSortSubmitted(true)}>
                Check Sorting
              </Button>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-800">Unicellular</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {unicellularItems.length ? unicellularItems.join(", ") : "No items yet"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-800">Multicellular</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {multicellularItems.length ? multicellularItems.join(", ") : "No items yet"}
                  </p>
                </div>
              </div>

              {cellSortSubmitted && (
                <div
                  className={cn(
                    "rounded-xl border p-3 text-sm",
                    cellSortAllCorrect
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  )}
                >
                  {cellSortAllCorrect
                    ? "Correct. You sorted one-cell and many-cell organisms accurately."
                    : "Some items are in the wrong group. Try again."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (pageIndex === 4) {
      const selectedPart = cellParts.find((item) => item.id === selectedCellPart);

      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">What is inside a cell? (Basic Parts)</h3>
            <p className="mt-2 text-slate-600">
              Most cells have 3 main parts. Tap each part to reveal its function.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {cellParts.map((part) => (
              <button
                key={part.id}
                type="button"
                onClick={() => setSelectedCellPart(part.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors",
                  selectedCellPart === part.id
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <p className="font-semibold text-slate-900">{part.label}</p>
              </button>
            ))}
          </div>

          {selectedPart ? (
            <Card className="border-blue-200 bg-blue-50/60">
              <CardHeader>
                <CardTitle className="text-lg">{selectedPart.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-slate-800">{selectedPart.function}</p>
                <p className="text-slate-700">
                  <span className="font-semibold">Easy analogy:</span> {selectedPart.analogy}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
              Select a part above to reveal its function.
            </div>
          )}
        </div>
      );
    }

    if (pageIndex === 5) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Checkpoint Quiz 2</h3>
          </div>

          <QuizBlock
            questions={quiz2Questions}
            answers={quiz2Answers}
            submitted={quiz2Submitted}
            onAnswer={(questionId, value) =>
              setQuiz2Answers((prev) => ({
                ...prev,
                [questionId]: value,
              }))
            }
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => setQuiz2Submitted(true)}>
              Submit Quiz 2
            </Button>
            {quiz2Submitted && (
              <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                Score: {quiz2Score}/{quiz2Questions.length}
              </Badge>
            )}
          </div>
        </div>
      );
    }

    if (pageIndex === 6) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              Prokaryotic vs Eukaryotic Cells (Simple Intro)
            </h3>
            <p className="mt-2 text-slate-600">
              Prokaryotic cells are simpler and do not have a nucleus (example: bacteria).
              Eukaryotic cells have a nucleus (example: plant and animal cells).
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Teacher note: Keep this simple; avoid overloading organelle detail at this stage.
            </p>
          </div>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Interaction: Which one has a nucleus?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={nucleusQuestionAnswer === "prokaryotic" ? "default" : "outline"}
                  onClick={() => setNucleusQuestionAnswer("prokaryotic")}
                >
                  Prokaryotic
                </Button>
                <Button
                  type="button"
                  variant={nucleusQuestionAnswer === "eukaryotic" ? "default" : "outline"}
                  onClick={() => setNucleusQuestionAnswer("eukaryotic")}
                >
                  Eukaryotic
                </Button>
              </div>

              <Button type="button" onClick={() => setNucleusQuestionSubmitted(true)}>
                Check Answer
              </Button>

              {nucleusQuestionSubmitted && (
                <div
                  className={cn(
                    "rounded-xl border p-3 text-sm",
                    nucleusQuestionAnswer === "eukaryotic"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  )}
                >
                  {nucleusQuestionAnswer === "eukaryotic"
                    ? "Correct. Eukaryotic cells have a nucleus."
                    : "Not quite. Eukaryotic cells have a nucleus."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (pageIndex === 7) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Plant Cell or Animal Cell?</h3>
            <p className="mt-2 text-slate-600">
              Both plant and animal cells have a cell membrane, cytoplasm, and nucleus.
              Plant cells also usually have a cell wall and chloroplasts.
            </p>
          </div>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Interaction: Place each term in the Venn groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vennTerms.map((term) => (
                <div
                  key={term.id}
                  className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_auto]"
                >
                  <p className="text-sm font-medium text-slate-800">{term.label}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={vennAssignments[term.id] === "plant-only" ? "default" : "outline"}
                      onClick={() =>
                        setVennAssignments((prev) => ({
                          ...prev,
                          [term.id]: "plant-only",
                        }))
                      }
                    >
                      Plant only
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={vennAssignments[term.id] === "both" ? "default" : "outline"}
                      onClick={() =>
                        setVennAssignments((prev) => ({
                          ...prev,
                          [term.id]: "both",
                        }))
                      }
                    >
                      Both
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={vennAssignments[term.id] === "animal-only" ? "default" : "outline"}
                      onClick={() =>
                        setVennAssignments((prev) => ({
                          ...prev,
                          [term.id]: "animal-only",
                        }))
                      }
                    >
                      Animal only
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" onClick={() => setVennSubmitted(true)}>
                Check Venn Diagram
              </Button>

              {vennSubmitted && (
                <div
                  className={cn(
                    "rounded-xl border p-3 text-sm",
                    vennAllCorrect
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  )}
                >
                  {vennAllCorrect
                    ? "Great comparison. You sorted plant-only, both, and animal-only features correctly."
                    : "Some placements need adjusting. Try again."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (pageIndex === 8) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Checkpoint Quiz 3</h3>
          </div>

          <QuizBlock
            questions={quiz3Questions}
            answers={quiz3Answers}
            submitted={quiz3Submitted}
            onAnswer={(questionId, value) =>
              setQuiz3Answers((prev) => ({
                ...prev,
                [questionId]: value,
              }))
            }
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => setQuiz3Submitted(true)}>
              Submit Quiz 3
            </Button>
            {quiz3Submitted && (
              <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                Score: {quiz3Score}/{quiz3Questions.length}
              </Badge>
            )}
          </div>
        </div>
      );
    }

    if (pageIndex === 9) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Why Are Cells Important?</h3>
            <p className="mt-2 text-slate-600">Cells do the work of life. They help to:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              <li>Build tissues and organs</li>
              <li>Help us grow</li>
              <li>Help us get energy</li>
              <li>Replace old cells with new cells</li>
            </ul>
          </div>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Think-Pair-Share</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Which cells might help you move?
                </label>
                <Textarea
                  value={thinkMove}
                  onChange={(event) => setThinkMove(event.target.value)}
                  placeholder="Write your idea..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Which cells might help you think?
                </label>
                <Textarea
                  value={thinkThink}
                  onChange={(event) => setThinkThink(event.target.value)}
                  placeholder="Write your idea..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Which cells might help a plant make food?
                </label>
                <Textarea
                  value={thinkPlant}
                  onChange={(event) => setThinkPlant(event.target.value)}
                  placeholder="Write your idea..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (pageIndex === 10) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Final Quiz: Introduction to Cells</h3>
            <p className="mt-2 text-slate-600">Answer all 5 questions.</p>
          </div>

          <Card className="border-slate-200">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">1. What is the smallest unit of life?</label>
                <Input
                  value={finalQuiz.smallestUnit}
                  onChange={(event) =>
                    setFinalQuiz((prev) => ({ ...prev, smallestUnit: event.target.value }))
                  }
                  placeholder="Type your answer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  2. Name one part found in most cells.
                </label>
                <Input
                  value={finalQuiz.onePart}
                  onChange={(event) =>
                    setFinalQuiz((prev) => ({ ...prev, onePart: event.target.value }))
                  }
                  placeholder="Example: cell membrane, cytoplasm, or nucleus"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  3. Which is unicellular: human or bacteria?
                </label>
                <select
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={finalQuiz.unicellularChoice}
                  onChange={(event) =>
                    setFinalQuiz((prev) => ({ ...prev, unicellularChoice: event.target.value }))
                  }
                >
                  <option value="">Choose one</option>
                  <option value="human">Human</option>
                  <option value="bacteria">Bacteria</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">4. Which cell has chloroplasts?</label>
                <select
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={finalQuiz.chloroplastChoice}
                  onChange={(event) =>
                    setFinalQuiz((prev) => ({ ...prev, chloroplastChoice: event.target.value }))
                  }
                >
                  <option value="">Choose one</option>
                  <option value="animal-cell">Animal cell</option>
                  <option value="plant-cell">Plant cell</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  5. True/False: New cells come from pre-existing cells.
                </label>
                <select
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={finalQuiz.preExistingCells}
                  onChange={(event) =>
                    setFinalQuiz((prev) => ({ ...prev, preExistingCells: event.target.value }))
                  }
                >
                  <option value="">Choose one</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>

              <Button type="button" onClick={() => setFinalQuizSubmitted(true)}>
                Submit Final Quiz
              </Button>
            </CardContent>
          </Card>

          {finalQuizSubmitted && (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800">
                <CircleHelp className="h-4 w-4" />
                Final score: {finalQuizScore}/5
              </div>

              {finalQuizScore === 5 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  Cell Explorer *
                </div>
              )}
              {finalQuizScore >= 3 && finalQuizScore <= 4 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Good job. Review 1 page.
                </div>
              )}
              {finalQuizScore <= 2 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  Retry pages 4-8.
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900">What did you learn today?</h3>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Exit Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                One new fact I learned about cells is...
              </label>
              <Textarea
                value={reflectionFact}
                onChange={(event) => setReflectionFact(event.target.value)}
                placeholder="Write your reflection..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">One question I still have is...</label>
              <Textarea
                value={reflectionQuestion}
                onChange={(event) => setReflectionQuestion(event.target.value)}
                placeholder="Write your question..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Cells are important because...</label>
              <Textarea
                value={reflectionImportance}
                onChange={(event) => setReflectionImportance(event.target.value)}
                placeholder="Write your answer..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Bonus challenge</p>
          <p className="mt-1">Draw and label a simple plant cell or animal cell.</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Page {pageIndex + 1} of {PAGE_COUNT}
          </Badge>
          <p className="text-sm font-medium text-slate-600">{PAGE_TITLES[pageIndex]}</p>
        </div>
        <Progress value={progressValue} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-8">
        {renderPageContent()}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
            disabled={pageIndex === 0}
          >
            Previous
          </Button>

          {pageIndex < PAGE_COUNT - 1 ? (
            <Button type="button" onClick={() => setPageIndex((prev) => Math.min(PAGE_COUNT - 1, prev + 1))}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={() => setPageIndex(0)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Restart Lesson
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

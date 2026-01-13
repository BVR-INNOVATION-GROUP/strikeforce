"use client";

import React, { useState } from "react";
import Modal from "@/src/components/base/Modal";
import Button from "@/src/components/core/Button";
import { POST } from "@/base/index";
import { useToast } from "@/src/hooks/useToast";

interface DNASnapshotModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (archetype: DNAArchetype) => void;
}

export interface DNAArchetype {
  name: string;
  description: string;
  traits: string[];
}

interface Question {
  id: string;
  section: string;
  question: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  // SECTION A: Orientation
  {
    id: "q1",
    section: "Orientation",
    question: "When faced with a new opportunity, which best describes you?",
    options: [
      "I jump in and figure things out as I go",
      "I observe first, then act carefully",
      "I prefer structured guidance before acting",
      "I wait until I'm confident I can deliver well",
    ],
  },
  {
    id: "q2",
    section: "Orientation",
    question: "What gives you the most energy right now?",
    options: [
      "Solving real-world problems",
      "Learning new skills",
      "Working with ambitious people",
      "Building something of my own",
    ],
  },
  {
    id: "q3",
    section: "Orientation",
    question: "Which environment do you thrive in most?",
    options: [
      "Fast-moving and unstructured",
      "Clear goals with some flexibility",
      "Well-defined roles and expectations",
      "Independent, self-directed work",
    ],
  },
  // SECTION B: Capability Signals
  {
    id: "q4",
    section: "Capability",
    question: "How would you describe your current level of exposure to real-world work?",
    options: [
      "Mostly academic so far",
      "Small contributions to real projects",
      "Active contributor on real projects",
      "Leading or owning project outcomes",
    ],
  },
  {
    id: "q5",
    section: "Capability",
    question: "When working in a team, you are most often the person who:",
    options: [
      "Organises and coordinates",
      "Builds or executes",
      "Thinks through strategy and direction",
      "Supports and improves what exists",
    ],
  },
  // SECTION C: Agency & Ownership
  {
    id: "q6",
    section: "Agency & Ownership",
    question: "How comfortable are you taking responsibility for outcomes?",
    options: [
      "I prefer shared responsibility",
      "I'm comfortable owning parts of work",
      "I like full ownership and accountability",
    ],
  },
  {
    id: "q7",
    section: "Agency & Ownership",
    question: "When things go wrong, you usually:",
    options: [
      "Reflect quietly and adjust",
      "Ask for feedback and support",
      "Push through independently",
      "Step back and reassess direction",
    ],
  },
  // SECTION D: Direction
  {
    id: "q8",
    section: "Direction",
    question: "In the next 3–5 years, you are most drawn toward:",
    options: [
      "Employment and career growth",
      "Entrepreneurship or venture building",
      "Freelance / independent work",
      "Research, policy, or further study",
      "Still exploring",
    ],
  },
  {
    id: "q9",
    section: "Direction",
    question: "What would make StrikeForce valuable to you right now?",
    options: [
      "Real project experience",
      "Clarity on my strengths",
      "Networks and mentors",
      "Income opportunities",
      "A place to build long-term credibility",
    ],
  },
  // SECTION E: Community & Self-Organisation
  {
    id: "q10",
    section: "Community",
    question: "Which best describes how you engage with communities?",
    options: [
      "I prefer working independently",
      "I join groups when there is clear value",
      "I actively participate in communities",
      "I often initiate or organise groups",
    ],
  },
  {
    id: "q11",
    section: "Community",
    question: "Would you consider joining or forming a purpose-driven association on StrikeForce?",
    options: ["Yes", "Maybe later", "Not at the moment"],
  },
  // SECTION F: Commitment Signal
  {
    id: "q12",
    section: "Commitment",
    question: "How much time can you realistically commit to meaningful work outside class?",
    options: [
      "1–3 hours/week",
      "4–6 hours/week",
      "7–10 hours/week",
      "Depends on the opportunity",
    ],
  },
];

const DNASnapshotModal: React.FC<DNASnapshotModalProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const { showSuccess, showError } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [archetype, setArchetype] = useState<DNAArchetype | null>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const currentResponse = responses[currentQuestion.id];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
  const allQuestionsAnswered = Object.keys(responses).length === QUESTIONS.length;

  const handleAnswer = (answer: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentResponse && !isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (isLastQuestion && allQuestionsAnswered) {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allQuestionsAnswered) {
      showError("Please answer all questions");
      return;
    }

    setLoading(true);
    try {
      const response = await POST<{ archetype: DNAArchetype }>(
        "api/v1/students/dna/snapshot",
        { responses }
      );

      // Response structure: { data: { archetype: DNAArchetype }, msg: string }
      if (response.data?.archetype) {
        setArchetype(response.data.archetype);
        setShowReport(true);
        showSuccess("DNA Snapshot completed!");
      } else {
        showError("Failed to process your responses");
      }
    } catch (error: any) {
      console.error("DNA Snapshot submission failed:", error);
      showError(error?.msg || error?.message || "Failed to submit DNA snapshot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseReport = () => {
    if (archetype) {
      onComplete(archetype);
    }
    // Reset state
    setCurrentQuestionIndex(0);
    setResponses({});
    setShowReport(false);
    setArchetype(null);
    onClose();
  };

  // Group questions by section for display
  const getSectionName = (questionId: string) => {
    const question = QUESTIONS.find((q) => q.id === questionId);
    return question?.section || "";
  };

  if (showReport && archetype) {
    return (
      <Modal
        open={open}
        handleClose={handleCloseReport}
        title="Your StrikeForce DNA"
        actions={[
          <Button key="close" onClick={handleCloseReport} className="bg-primary">
            Continue to StrikeForce
          </Button>,
        ]}
      >
        <div className="py-6 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-primary">{archetype.name}</h2>
            <p className="text-secondary text-lg leading-relaxed">
              {archetype.description}
            </p>
          </div>

          <div className="border-t border-custom pt-6">
            <h3 className="font-semibold mb-4">Your Traits</h3>
            <div className="grid grid-cols-2 gap-3">
              {archetype.traits.map((trait, index) => (
                <div
                  key={index}
                  className="bg-pale rounded-lg px-4 py-2 text-sm text-center"
                >
                  {trait}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-pale rounded-lg p-4 text-sm text-secondary">
            <p className="font-semibold mb-2">What this means:</p>
            <p>
              StrikeForce is designed to help people like you turn potential into
              visible, trusted experience. Your DNA profile will help us match you
              with the right opportunities and communities.
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      handleClose={onClose}
      title="Discover Your StrikeForce DNA"
      actions={[
        currentQuestionIndex > 0 && (
          <Button
            key="previous"
            onClick={handlePrevious}
            className="bg-pale"
            disabled={loading}
          >
            Previous
          </Button>
        ),
        <Button
          key="next"
          onClick={handleNext}
          className="bg-primary"
          disabled={!currentResponse || loading}
          loading={loading && isLastQuestion}
        >
          {isLastQuestion ? "Complete" : "Next"}
        </Button>,
      ]}
    >
      <div className="py-6">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-secondary mb-2">
            <span>
              {getSectionName(currentQuestion.id)} • Question{" "}
              {currentQuestionIndex + 1} of {QUESTIONS.length}
            </span>
            <span>{Math.round(((currentQuestionIndex + 1) / QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-pale rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">{currentQuestion.question}</h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  currentResponse === option
                    ? "border-primary bg-primary/10"
                    : "border-custom hover:border-primary/50 hover:bg-pale"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      currentResponse === option
                        ? "border-primary bg-primary"
                        : "border-custom"
                    }`}
                  >
                    {currentResponse === option && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DNASnapshotModal;


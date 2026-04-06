import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, XCircle, ArrowRight, CheckCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import Markdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import '@google/model-viewer';
import { Lesson, Question } from '../data/mockData';
import { cn } from '../lib/utils';
import { Mermaid } from './Mermaid';
import { DrawingBoard } from './DrawingBoard';

interface LessonPlayerProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: () => void;
}

export function LessonPlayer({ lesson, onClose, onComplete }: LessonPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checkedState, setCheckedState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  
  // Interactive states
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<number, boolean>>>({});

  const steps = [
    ...((lesson.content || lesson.videoUrl || lesson.mindmap || lesson.tutorNotes || (lesson.resources && lesson.resources.length > 0)) ? [{ type: 'content', id: 'content' }] : []),
    ...(lesson.questions || []).map(q => ({ type: 'question', id: q.id, question: q }))
  ];

  const step = steps[currentStep];
  
  if (!step) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">This lesson is empty.</h2>
        <button onClick={onComplete} className="px-8 py-3 bg-bg-inverted text-text-inverted rounded-xl font-bold hover:bg-bg-inverted-hover transition-colors">
          Complete Lesson
        </button>
      </div>
    );
  }

  const isQuestion = step?.type === 'question';
  const q = isQuestion && 'question' in step ? step.question as Question : null;

  const progress = ((currentStep) / steps.length) * 100;

  const isGradable = q && ['multiple-choice', 'text', 'true-false'].includes(q.type);
  const hasAnsweredCurrent = q ? !!answers[q.id] : true;

  const handleCheck = () => {
    if (!q || !isGradable) {
      handleContinue();
      return;
    }

    const userAnswer = answers[q.id];
    if (!userAnswer) return;

    const isCorrect = (userAnswer || "").trim().toLowerCase() === (q.correctAnswer || "").trim().toLowerCase();
    setCheckedState(isCorrect ? 'correct' : 'incorrect');
  };

  const handleContinue = () => {
    if (checkedState === 'incorrect') {
      // Reset to try again
      setCheckedState('idle');
      setAnswers(prev => ({ ...prev, [q!.id]: '' }));
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setCheckedState('idle');
    } else {
      onComplete();
    }
  };

  const toggleChecklistItem = (questionId: string, itemIndex: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [itemIndex]: !prev[questionId]?.[itemIndex]
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-bg-primary flex flex-col font-sans pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Top Bar */}
      <div className="h-16 flex items-center px-4 md:px-8 gap-6 flex-shrink-0 border-b border-border-primary bg-bg-secondary">
        <button 
          onClick={onClose}
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden border border-border-secondary">
            <motion.div 
              className="h-full bg-bg-inverted rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <div className="w-9" /> {/* Spacer for balance */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-32 bg-bg-primary">
        <div className="max-w-2xl mx-auto px-6 py-8 md:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {step.type === 'content' && (
                <div className="space-y-8">
                  {lesson.videoUrl && (
                    <div className="rounded-xl overflow-hidden border border-border-secondary bg-black aspect-video relative shadow-sm">
                      {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
                        <iframe 
                          src={lesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                          className="absolute inset-0 w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <video src={lesson.videoUrl} controls className="absolute inset-0 w-full h-full object-contain" />
                      )}
                    </div>
                  )}
                  
                  {lesson.mindmap && (
                    <div className="bg-bg-secondary p-8 rounded-xl border border-border-primary shadow-sm">
                      <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-bg-tertiary text-text-secondary rounded-lg flex items-center justify-center border border-border-secondary">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        </div>
                        Lesson Mindmap
                      </h3>
                      <div className="bg-bg-primary p-6 rounded-lg border border-border-secondary overflow-hidden">
                        <Mermaid chart={lesson.mindmap} />
                      </div>
                    </div>
                  )}

                  {lesson.content && (
                    <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-p:text-text-secondary prose-p:leading-relaxed bg-bg-secondary p-8 rounded-xl border border-border-primary shadow-sm">
                      <Markdown
                        components={{
                          code: ({ inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            if (!inline && match && match[1] === '3d-model') {
                              return (
                                <div className="w-full h-80 bg-bg-primary rounded-lg relative overflow-hidden my-6 border border-border-secondary">
                                  {/* @ts-ignore */}
                                  <model-viewer src={String(children).trim()} auto-rotate camera-controls style={{ width: '100%', height: '100%' }}></model-viewer>
                                </div>
                              );
                            }
                            if (!inline && match && match[1] === 'math') {
                              return (
                                <div className="p-6 bg-bg-primary rounded-lg overflow-x-auto my-6 border border-border-secondary">
                                  <BlockMath math={String(children).trim()} />
                                </div>
                              );
                            }
                            return <code className={className} {...props}>{children}</code>;
                          }
                        }}
                      >
                        {lesson.content}
                      </Markdown>
                    </div>
                  )}

                  {lesson.interactives && lesson.interactives.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                        <div className="w-8 h-8 bg-bg-tertiary text-text-primary rounded-lg flex items-center justify-center border border-border-secondary">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
                        </div>
                        Interactives & Diagrams
                      </h3>
                      {lesson.interactives.map((interactive) => (
                        <div key={interactive.id} className="bg-bg-secondary p-6 rounded-xl border border-border-primary shadow-sm">
                          <h4 className="text-lg font-medium text-text-primary mb-4">{interactive.title}</h4>
                          {interactive.type === 'drawing' ? (
                            <div className="h-[400px] bg-bg-primary rounded-lg overflow-hidden border border-border-secondary">
                              <DrawingBoard initialData={interactive.data} readOnly={true} />
                            </div>
                          ) : (
                            <div className="aspect-video rounded-lg overflow-hidden border border-border-secondary bg-bg-primary">
                              <iframe src={interactive.url} className="w-full h-full border-0" allowFullScreen />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {lesson.tutorNotes && (
                    <div className="bg-bg-tertiary p-8 rounded-xl border border-border-secondary shadow-sm">
                      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#333] text-text-primary rounded-md flex items-center justify-center border border-border-hover">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        Tutor Notes
                      </h3>
                      <div className="prose prose-invert max-w-none prose-p:text-text-secondary prose-headings:text-text-primary text-sm">
                        <Markdown>{lesson.tutorNotes}</Markdown>
                      </div>
                    </div>
                  )}

                  {lesson.resources && lesson.resources.length > 0 && (
                    <div className="bg-bg-secondary p-8 rounded-xl border border-border-primary shadow-sm">
                      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Downloadable Resources
                      </h3>
                      <div className="grid gap-3">
                        {lesson.resources.map((res, idx) => (
                          <a 
                            key={idx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border-secondary hover:border-border-hover hover:bg-bg-secondary transition-all group"
                          >
                            <span className="font-medium text-text-primary group-hover:text-white text-sm">{res.title}</span>
                            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-transform" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isQuestion && q && (
                <div className="space-y-8">
                  {q.type !== 'flashcard' && (
                    <h2 className="text-2xl md:text-3xl font-semibold text-text-primary leading-tight">
                      {q.question}
                    </h2>
                  )}

                  {/* Multiple Choice & True/False */}
                  {(q.type === 'multiple-choice' || q.type === 'true-false') && (
                    <div className="space-y-3">
                      {(q.type === 'true-false' ? ['True', 'False'] : (q.options || [])).map((option, oIndex) => {
                        const isSelected = answers[q.id] === option;
                        const showCorrect = checkedState === 'correct' && isSelected;
                        const showIncorrect = checkedState === 'incorrect' && isSelected;

                        return (
                          <button
                            key={oIndex}
                            onClick={() => checkedState === 'idle' && setAnswers(prev => ({ ...prev, [q.id]: option }))}
                            disabled={checkedState !== 'idle'}
                            className={cn(
                              "w-full text-left p-4 md:p-5 rounded-xl border transition-all duration-200 relative overflow-hidden group",
                              checkedState === 'idle' ? (
                                isSelected 
                                  ? "border-[#EDEDED] bg-bg-tertiary text-text-primary" 
                                  : "border-border-secondary hover:border-border-hover hover:bg-bg-secondary bg-bg-primary text-text-secondary"
                              ) : (
                                showCorrect ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" :
                                showIncorrect ? "border-red-500 bg-red-500/10 text-red-500" :
                                "border-border-secondary opacity-50 bg-bg-primary text-text-secondary"
                              )
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors",
                                isSelected ? "border-[#EDEDED] bg-bg-tertiary" : "border-border-hover bg-bg-secondary",
                                showCorrect && "border-emerald-500 bg-emerald-500",
                                showIncorrect && "border-red-500 bg-red-500"
                              )}>
                                {showCorrect && <Check className="w-4 h-4 text-white" />}
                                {showIncorrect && <X className="w-4 h-4 text-white" />}
                                {isSelected && checkedState === 'idle' && <div className="w-2.5 h-2.5 rounded-sm bg-bg-inverted" />}
                              </div>
                              <span className="text-lg font-medium">{option}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Input */}
                  {q.type === 'text' && (
                    <div className="space-y-4">
                      <input 
                        type="text"
                        value={answers[q.id] || ''}
                        onChange={(e) => checkedState === 'idle' && setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Type your answer..."
                        disabled={checkedState !== 'idle'}
                        className={cn(
                          "w-full p-5 text-xl font-medium rounded-xl border outline-none transition-all bg-bg-primary text-text-primary",
                          checkedState === 'idle' ? "border-border-secondary focus:border-[#EDEDED] focus:ring-1 focus:ring-[#EDEDED]" :
                          checkedState === 'correct' ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" :
                          "border-red-500 bg-red-500/10 text-red-500"
                        )}
                      />
                    </div>
                  )}

                  {/* Flashcard */}
                  {q.type === 'flashcard' && (
                    <div className="space-y-8">
                      <div 
                        onClick={() => setFlippedCards(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        className="relative w-full h-80 md:h-96 cursor-pointer group"
                        style={{ perspective: "1000px" }}
                      >
                        <motion.div
                          initial={false}
                          animate={{ rotateY: flippedCards[q.id] ? 180 : 0 }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className="w-full h-full relative"
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {/* Front */}
                          <div 
                            className="absolute inset-0 bg-bg-secondary border border-border-primary rounded-2xl flex flex-col items-center justify-center p-8 text-center group-hover:border-border-secondary transition-colors shadow-sm"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            <span className="text-xs font-medium text-text-muted uppercase tracking-wider mb-6">Term</span>
                            <h4 className="text-3xl md:text-4xl font-semibold text-text-primary">{q.front}</h4>
                            <p className="absolute bottom-8 text-xs font-medium text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                              Click to flip <RotateCcw className="w-3.5 h-3.5" />
                            </p>
                          </div>
                          {/* Back */}
                          <div 
                            className="absolute inset-0 bg-bg-primary border border-border-secondary rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-sm"
                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                          >
                            <span className="text-xs font-medium text-text-muted uppercase tracking-wider mb-6">Definition</span>
                            <p className="text-xl md:text-2xl font-medium text-text-primary leading-tight">{q.back}</p>
                          </div>
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {flippedCards[q.id] && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex items-center justify-center gap-4"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAnswers(prev => ({ ...prev, [q.id]: 'incorrect' }));
                              }}
                              className={cn(
                                "flex-1 py-3 flex flex-col items-center gap-1 rounded-lg border transition-all",
                                answers[q.id] === 'incorrect' 
                                  ? "border-red-500 bg-red-500/10 text-red-500" 
                                  : "border-border-secondary bg-bg-secondary text-text-secondary hover:border-border-hover hover:bg-bg-tertiary"
                              )}
                            >
                              <XCircle className="w-5 h-5" />
                              <span className="text-xs font-medium">Still Learning</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAnswers(prev => ({ ...prev, [q.id]: 'correct' }));
                              }}
                              className={cn(
                                "flex-1 py-3 flex flex-col items-center gap-1 rounded-lg border transition-all",
                                answers[q.id] === 'correct' 
                                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" 
                                  : "border-border-secondary bg-bg-secondary text-text-secondary hover:border-border-hover hover:bg-bg-tertiary"
                              )}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="text-xs font-medium">Got It</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Checklist */}
                  {q.type === 'checklist' && q.items && (
                    <div className="space-y-3">
                      {q.items.map((item, iIndex) => {
                        const isChecked = checkedItems[q.id]?.[iIndex] || false;
                        return (
                          <motion.label 
                            key={iIndex}
                            className={cn(
                              "flex items-center gap-4 p-4 md:p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]",
                              isChecked 
                                ? "border-emerald-500 bg-emerald-500/10" 
                                : "border-border-secondary hover:border-border-hover bg-bg-primary"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-md flex items-center justify-center border transition-colors flex-shrink-0",
                              isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-border-hover bg-bg-secondary"
                            )}>
                              {isChecked && <Check className="w-4 h-4" />}
                            </div>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={isChecked}
                              onChange={() => toggleChecklistItem(q.id, iIndex)}
                            />
                            <span className={cn(
                              "text-lg font-medium transition-colors",
                              isChecked ? "text-text-muted line-through" : "text-text-primary"
                            )}>{item}</span>
                          </motion.label>
                        );
                      })}
                    </div>
                  )}

                  {/* Poll */}
                  {q.type === 'poll' && q.options && (
                    <div className="space-y-3">
                      {q.options.map((option, oIndex) => {
                        const isSelected = answers[q.id] === option;
                        const hasVoted = !!answers[q.id];
                        // Mock percentage for visual effect
                        const percentage = isSelected ? 65 : Math.floor(Math.random() * 30);
                        
                        return (
                          <motion.div 
                            key={oIndex}
                            onClick={() => !hasVoted && setAnswers(prev => ({ ...prev, [q.id]: option }))}
                            className={cn(
                              "relative overflow-hidden p-4 md:p-5 rounded-xl border transition-all",
                              hasVoted 
                                ? isSelected ? "border-[#EDEDED] bg-bg-tertiary" : "border-border-secondary bg-bg-secondary opacity-70"
                                : "border-border-secondary hover:border-border-hover bg-bg-primary cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                            )}
                          >
                            {hasVoted && (
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn(
                                  "absolute inset-y-0 left-0 opacity-10",
                                  isSelected ? "bg-bg-inverted" : "bg-[#666]"
                                )}
                              />
                            )}
                            <div className="relative flex items-center justify-between z-10">
                              <span className={cn(
                                "text-lg font-medium",
                                isSelected ? "text-text-primary" : "text-text-secondary"
                              )}>{option}</span>
                              {hasVoted && (
                                <span className={cn(
                                  "text-lg font-semibold",
                                  isSelected ? "text-text-primary" : "text-text-muted"
                                )}>{percentage}%</span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 border-t transition-colors duration-300",
        checkedState === 'idle' ? "bg-bg-secondary border-border-primary" :
        checkedState === 'correct' ? "bg-emerald-900/20 border-emerald-900/50" :
        "bg-red-900/20 border-red-900/50"
      )}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            {checkedState === 'correct' && (
              <div className="flex items-center gap-3 text-emerald-500">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Check className="w-6 h-6" />
                </div>
                <span className="text-xl font-semibold">Excellent!</span>
              </div>
            )}
            {checkedState === 'incorrect' && (
              <div className="flex items-center gap-3 text-red-500">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <X className="w-6 h-6" />
                </div>
                <span className="text-xl font-semibold">Not quite.</span>
              </div>
            )}
          </div>
          
          <button
            onClick={checkedState === 'idle' ? handleCheck : handleContinue}
            disabled={(checkedState === 'idle' && isGradable && !hasAnsweredCurrent) || (q?.type === 'flashcard' && !flippedCards[q.id]) || (q?.type === 'poll' && !answers[q.id])}
            className={cn(
              "px-8 py-3 rounded-lg font-medium text-sm transition-colors",
              checkedState === 'idle' 
                ? "bg-bg-inverted hover:bg-bg-inverted-hover text-text-inverted disabled:bg-[#333] disabled:text-text-muted" 
                : checkedState === 'correct'
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-red-600 hover:bg-red-500 text-white"
            )}
          >
            {checkedState === 'idle' ? (isGradable ? 'Check' : 'Continue') : 
             checkedState === 'correct' ? 'Continue' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
}

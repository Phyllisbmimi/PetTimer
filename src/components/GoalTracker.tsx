import React, { useState } from 'react';
import { Trash2, Plus, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Goal } from '../types';
import { useGoalProgress } from '../hooks';
import { analyzeGoalAndCreatePlan, generateSubtasks, generateDailyPlan } from '../services/qwenService';

interface GoalTrackerProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const { t } = useTranslation();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('work');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [timeframe, setTimeframe] = useState(30); // 默認 30 天
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const handleAddGoal = async () => {
    if (!title.trim()) return;

    setIsGeneratingPlan(true);

    // 創建新目標
    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      description,
      category,
      targetDate: new Date(Date.now() + timeframe * 24 * 60 * 60 * 1000),
      progress: 0,
      subtasks: [],
      shortTermGoals: [],
      createdAt: new Date(),
      status: 'active',
      level,
      desiredOutcome,
      timeframe,
    };

    // 如果用戶填寫了 AI 規劃字段，自動生成每日計劃
    if (desiredOutcome.trim() && timeframe > 0) {
      console.log(`🎯 Generating plan for ${timeframe} days...`);
      const result = await generateDailyPlan(
        title,
        description,
        level,
        desiredOutcome,
        timeframe
      );

      if (result.success && result.dailyPlan) {
        console.log(`✅ Generated ${result.dailyPlan.length} days of plan`);
        newGoal.dailyPlan = result.dailyPlan;
      }
    }

    onAddGoal(newGoal);
    setTitle('');
    setDescription('');
    setLevel('beginner');
    setDesiredOutcome('');
    setTimeframe(30);
    setShowAddGoal(false);
    setIsGeneratingPlan(false);
  };

  const categories = [
    { value: 'work', label: t('goals.categories.work') },
    { value: 'study', label: t('goals.categories.study') },
    { value: 'health', label: t('goals.categories.health') },
    { value: 'hobby', label: t('goals.categories.hobby') },
    { value: 'personal', label: t('goals.categories.personal') },
  ];

  return (
    <div className="card-blur space-y-6">
      {/* 標題 */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">🎯 {t('goals.title')}</h2>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('goals.addGoal')}
        </button>
      </div>

      {/* 新增目標表單 */}
      {showAddGoal && (
        <div className="bg-white/10 rounded-xl p-4 space-y-4 border border-white/20">
          <input
            type="text"
            placeholder={t('goals.goalTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/90 text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <textarea
            placeholder={t('goals.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 rounded-lg bg-white/90 text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/90 text-dark focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* AI 智能規劃字段 */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{t('goals.aiPlanningFields')}</span>
            </div>

            {/* 等級選擇 */}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg bg-white/90 text-dark focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="beginner">{t('goals.levels.beginner')}</option>
              <option value="intermediate">{t('goals.levels.intermediate')}</option>
              <option value="advanced">{t('goals.levels.advanced')}</option>
            </select>

            {/* 期望成果 */}
            <input
              type="text"
              placeholder={t('goals.desiredOutcome')}
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/90 text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* 時間框架 */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={t('goals.timeframe')}
                value={timeframe}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= 365) {
                    setTimeframe(val);
                  } else if (e.target.value === '') {
                    setTimeframe(1);
                  }
                }}
                min="1"
                max="365"
                className="flex-1 px-4 py-2 rounded-lg bg-white/90 text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-white/80 text-sm">{t('goals.days')}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleAddGoal} 
              disabled={isGeneratingPlan}
              className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成計劃中...
                </>
              ) : (
                t('common.add')
              )}
            </button>
            <button
              onClick={() => setShowAddGoal(false)}
              className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-full font-bold hover:bg-gray-500 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* 目標列表 */}
      <div className="space-y-4">
        {goals.filter((g) => g.status === 'active').length === 0 ? (
          <p className="text-white/60 text-center py-8">{t('goals.noGoals')}</p>
        ) : (
          goals
            .filter((g) => g.status === 'active')
            .map((goal) => <GoalItem key={goal.id} goal={goal} onUpdate={onUpdateGoal} onDelete={onDeleteGoal} />)
        )}
      </div>

      {/* 已完成目標 */}
      {goals.filter((g) => g.status === 'completed').length > 0 && (
        <div className="border-t border-white/20 pt-4 space-y-4">
          <h3 className="text-lg font-semibold text-white">{t('goals.completed')}</h3>
          <div className="space-y-2">
            {goals
              .filter((g) => g.status === 'completed')
              .map((goal) => (
                <div key={goal.id} className="text-white/70 text-sm line-through">
                  {goal.title}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface GoalItemProps {
  goal: Goal;
  onUpdate: (goalId: string, updates: Partial<Goal>) => void;
  onDelete: (goalId: string) => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, onUpdate, onDelete }) => {
  const { t } = useTranslation();
  const progress = useGoalProgress(goal);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setShowAIAnalysis(true);
    try {
      const result = await analyzeGoalAndCreatePlan(goal.title, goal.description);
      if (result.success && result.message) {
        setAiAnalysis(result.message);
      } else {
        setAiAnalysis(`錯誤：${result.error || '無法獲取分析'}`);
      }
    } catch (error) {
      setAiAnalysis('抱歉，分析時發生錯誤。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSubtasks = async () => {
    setIsGeneratingSubtasks(true);
    try {
      const subtasks = await generateSubtasks(goal.title, goal.description, goal.timeframe);
      if (subtasks.length > 0) {
        const newSubtasks = subtasks.map((title: string, index: number) => ({
          id: `${goal.id}-subtask-${Date.now()}-${index}`,
          title,
          completed: false,
          weight: 1,
        }));
        onUpdate(goal.id, { subtasks: [...goal.subtasks, ...newSubtasks] });
      } else {
        alert('無法生成子任務，請稍後再試。');
      }
    } catch (error) {
      alert('抱歉，生成子任務時發生錯誤。');
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = goal.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdate(goal.id, { subtasks: updatedSubtasks });
  };

  return (
    <div className="bg-white/10 rounded-xl p-4 border border-white/20 hover:border-white/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{goal.title}</h3>
          <p className="text-white/60 text-sm">{goal.description}</p>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-white/40 hover:text-white/80 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* 進度條 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/80 text-sm">{t('goals.progress')}</span>
          <span className="text-accent font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className="bg-accent h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* AI 功能按鈕 */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={handleAIAnalysis}
          disabled={isAnalyzing}
          className="flex-1 bg-purple-500/80 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('ai.analyzing')}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t('ai.analyzeGoal')}
            </>
          )}
        </button>
        <button
          onClick={handleGenerateSubtasks}
          disabled={isGeneratingSubtasks}
          className="flex-1 bg-blue-500/80 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGeneratingSubtasks ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('ai.analyzing')}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {t('ai.generateSubtasks')}
            </>
          )}
        </button>
      </div>

      {/* AI 分析結果 */}
      {showAIAnalysis && (
        <div className="mb-3 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-white font-semibold text-sm">{t('ai.analyzeGoal')}</span>
          </div>
          <div className="text-white/80 text-sm whitespace-pre-wrap">
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('ai.analyzing')}</span>
              </div>
            ) : (
              aiAnalysis
            )}
          </div>
        </div>
      )}

      {/* 📅 每日計劃 */}
      {goal.dailyPlan && goal.dailyPlan.length > 0 && (
        <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-white font-semibold text-sm">📅 AI 每日計劃</span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {goal.dailyPlan.map((day: any) => (
              <div key={day.day} className="bg-white/5 rounded p-2">
                <div className="text-blue-300 font-semibold text-sm mb-1">
                  第 {day.day} 天
                </div>
                <ul className="space-y-1 text-white/70 text-xs">
                  {day.tasks.map((task: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 子任務 */}
      {goal.subtasks.length > 0 && (
        <div className="space-y-2 mb-3">
          {goal.subtasks.map((subtask) => (
            <label
              key={subtask.id}
              className="flex items-center gap-2 text-white/80 cursor-pointer hover:text-white transition-colors"
            >
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => handleToggleSubtask(subtask.id)}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span className={subtask.completed ? 'line-through text-white/50' : ''}>
                {subtask.title}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* 短期目標 */}
      {goal.shortTermGoals.length > 0 && (
        <div className="text-sm text-white/60">
          <p className="font-semibold mb-1">📌 短期目標:</p>
          <ul className="list-disc list-inside space-y-1">
            {goal.shortTermGoals.map((stg, idx) => (
              <li key={idx}>{stg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;
